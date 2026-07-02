/* Tests Node de backend.js en mode LOCAL (stubs window/localStorage).
   Lancer :  node tests/backend.test.js                                  */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

let n = 0, chain = Promise.resolve();
const t = (name, fn) => { chain = chain.then(fn).then(() => { n++; console.log("  ✓ " + name); }); };
process.on("unhandledRejection", e => { console.error("  ✗ " + e); process.exit(1); });

/* ---- stubs navigateur ---- */
function makeLocalStorage(seed) {
  const store = Object.assign({}, seed || {});
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    _store: store
  };
}
const src = f => fs.readFileSync(path.join(__dirname, "..", f), "utf8");

/* Charge config → programs → progression → backend dans un contexte isolé,
   comme le fait index.html. Retourne { Backend, ls }. */
function boot(seedLS) {
  const ls = makeLocalStorage(seedLS);
  const sandbox = {
    window: {}, localStorage: ls, navigator: { onLine: true },
    console, JSON, Math, Date, Array, Object, Set, String, Number, Boolean, Promise
  };
  sandbox.window.localStorage = ls;
  const code = `
    const window = __sandbox.window;
    const localStorage = __sandbox.localStorage;
    const navigator = __sandbox.navigator;
    ${src("config.js")}
    ${src("programs.js")}
    ${src("progression.js")}
    ${src("backend.js")}
    return { Backend, DEFAULT_PROGRAMS };
  `;
  const r = new Function("__sandbox", "module", code)({ ...sandbox, __sandbox: sandbox }.__sandbox === undefined ? sandbox : sandbox, undefined);
  return { Backend: r.Backend, DEFAULT_PROGRAMS: r.DEFAULT_PROGRAMS, ls };
}

/* ---- migration legacy → Moss ---- */
t("clés legacy migrées silencieusement vers perflab.p.moss.*", () => {
  const legacyPrograms = JSON.stringify([{ id: "custom", title: "X", sessions: [] }]);
  const { ls } = boot({
    "perflab.programs": legacyPrograms,
    "perflab.progress": JSON.stringify({ custom: { w1: {} } }),
    "perflab.weeks": JSON.stringify({ custom: 2 })
  });
  assert.equal(ls.getItem("perflab.p.moss.programs"), legacyPrograms);
  assert.equal(JSON.parse(ls.getItem("perflab.p.moss.weeks")).custom, 2);
  assert.equal(ls.getItem("perflab.programs"), null, "clé legacy supprimée");
  assert.equal(ls.getItem("perflab.progress"), null);
});
t("pas de migration si l'espace Moss existe déjà", () => {
  const { ls } = boot({
    "perflab.programs": JSON.stringify([{ id: "old" }]),
    "perflab.p.moss.programs": JSON.stringify([{ id: "kept" }])
  });
  assert.equal(JSON.parse(ls.getItem("perflab.p.moss.programs"))[0].id, "kept");
});

/* ---- profils ---- */
t("profil par défaut Moss, bascule persistante vers Souad", () => {
  const { Backend, ls } = boot();
  assert.equal(Backend.activeProfile(), "moss");
  Backend.setProfile("souad");
  assert.equal(Backend.activeProfile(), "souad");
  assert.equal(ls.getItem("perflab.profile"), "souad");
  Backend.setProfile("inconnu"); // refusé
  assert.equal(Backend.activeProfile(), "souad");
});
t("chaque profil a sa propre bibliothèque et ses semaines", async () => {
  const { Backend } = boot();
  const moss = await Backend.loadAll();
  assert.deepEqual(moss.programs.map(p => p.id), ["upper", "core", "lower"], "Moss : ses 3 programmes, sans Pré Haltéro");
  Backend.setWeek("lower", 3);
  Backend.setProfile("souad");
  const souad = await Backend.loadAll();
  assert.deepEqual(souad.programs.map(p => p.id), ["pullup", "prehaltero"], "Souad : Pull-Up Lab + Pré Haltéro uniquement");
  assert.equal(Backend.getWeek("lower"), 1, "semaines de Souad indépendantes");
  Backend.setProfile("moss");
  assert.equal(Backend.getWeek("lower"), 3);
});
t("migration : Pré Haltéro retiré de l'espace Moss existant", async () => {
  const { Backend, ls } = boot({
    "perflab.p.moss.programs": JSON.stringify([
      { id: "prehaltero", title: "PRÉ", sessions: [{ blocks: [] }] },
      { id: "custom", title: "C", sessions: [{ blocks: [] }] }
    ]),
    "perflab.p.moss.progress": JSON.stringify({ prehaltero: { w1: {} }, custom: { w1: {} } }),
    "perflab.p.moss.weeks": JSON.stringify({ prehaltero: 2, custom: 3 })
  });
  const r = await Backend.loadAll();
  const ids = r.programs.map(p => p.id);
  assert.ok(!ids.includes("prehaltero"), "Pré Haltéro absent chez Moss");
  assert.ok(ids.includes("custom"), "programme perso conservé");
  assert.equal(JSON.parse(ls.getItem("perflab.p.moss.weeks")).prehaltero, undefined);
  assert.equal(JSON.parse(ls.getItem("perflab.p.moss.weeks")).custom, 3);
  assert.equal(ls.getItem("perflab.mig.prehaltero"), "1", "migration marquée faite");
});
t("progression RPE isolée par profil", () => {
  const { Backend } = boot();
  Backend.saveProgression({ lower: { rdl: { week: 1, tier: 2, next: 3, hist: [] } } });
  Backend.setProfile("souad");
  assert.deepEqual(Backend.loadProgression(), {});
  Backend.setProfile("moss");
  assert.equal(Backend.loadProgression().lower.rdl.next, 3);
});

/* ---- import ancien format vers Moss depuis Souad ---- */
t("upsertProgramFor('moss') écrit chez Moss même si Souad est actif", async () => {
  const { Backend, ls } = boot();
  Backend.setProfile("souad");
  await Backend.upsertProgramFor("moss", { id: "imported", title: "IMP", sessions: [{ blocks: [] }] });
  const mossProgs = JSON.parse(ls.getItem("perflab.p.moss.programs") || "[]");
  assert.ok(mossProgs.some(p => p.id === "imported"));
  const souadProgs = JSON.parse(ls.getItem("perflab.p.souad.programs") || "[]");
  assert.ok(!souadProgs.some(p => p.id === "imported"));
});

/* ---- export / import global ---- */
t("exportAll → importProfilesDoc : aller-retour fidèle", async () => {
  const a = boot();
  await a.Backend.loadAll();
  a.Backend.setWeek("core", 4);
  a.Backend.saveProgression({ core: { situp: { week: 4, tier: 1, next: 2, hist: [{ w: 4, rpe: 5, pain: false, tier: 1 }] } } });
  const doc = a.Backend.exportAll();
  assert.equal(doc.schema, "perflab-profiles-v1");
  assert.equal(doc.profiles.length, 2);
  // validation croisée avec progression.js
  const P = require(path.join(__dirname, "..", "progression.js"));
  P.validateProfilesDoc(doc);
  assert.equal(P.classifyImport(doc).kind, "profiles");
  // import dans une instance vierge
  const b = boot();
  b.Backend.importProfilesDoc(doc);
  assert.equal(b.Backend.getWeek("core"), 4);
  assert.equal(b.Backend.loadProgression().core.situp.next, 2);
});

chain.then(() => console.log(`\n${n} tests OK`)).catch(e => { console.error("  ✗ " + (e && e.stack || e)); process.exit(1); });
