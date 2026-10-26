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
  assert.deepEqual(moss.programs.map(p => p.id), ["upper", "core", "lower", "hyrox"], "Moss : ses 4 programmes, sans Pré Haltéro");
  Backend.setWeek("lower", 3);
  Backend.setProfile("souad");
  const souad = await Backend.loadAll();
  assert.deepEqual(souad.programs.map(p => p.id), ["pullup", "prehaltero"], "Souad : Pull-Up Lab + Pré Haltéro uniquement");
  assert.equal(Backend.getWeek("lower"), 1, "semaines de Souad indépendantes");
  Backend.setProfile("moss");
  assert.equal(Backend.getWeek("lower"), 3);
});
t("migration assignations : chaque profil perd les défauts des autres, garde le reste", async () => {
  const { Backend, ls } = boot({
    // Moss pollué par Pré Haltéro, Souad polluée par les programmes de Moss (seed d'avant l'assignation)
    "perflab.p.moss.programs": JSON.stringify([
      { id: "prehaltero", title: "PRÉ", sessions: [{ blocks: [] }] },
      { id: "custom", title: "C", sessions: [{ blocks: [] }] }
    ]),
    "perflab.p.moss.weeks": JSON.stringify({ prehaltero: 2, custom: 3 }),
    "perflab.p.souad.programs": JSON.stringify([
      { id: "upper", title: "U", sessions: [{ blocks: [] }] },
      { id: "core", title: "C", sessions: [{ blocks: [] }] },
      { id: "lower", title: "L", sessions: [{ blocks: [] }] },
      { id: "prehaltero", title: "PRÉ", sessions: [{ blocks: [] }] },
      { id: "souad-perso", title: "SP", sessions: [{ blocks: [] }] }
    ]),
    "perflab.p.souad.progression": JSON.stringify({ upper: { wpu: {} }, prehaltero: {} })
  });
  const moss = await Backend.loadAll();
  assert.ok(!moss.programs.some(p => p.id === "prehaltero"), "Pré Haltéro absent chez Moss");
  assert.ok(moss.programs.some(p => p.id === "custom"), "programme perso de Moss conservé");
  assert.equal(JSON.parse(ls.getItem("perflab.p.moss.weeks")).custom, 3);
  Backend.setProfile("souad");
  const souad = await Backend.loadAll();
  const sids = souad.programs.map(p => p.id);
  ["upper", "core", "lower"].forEach(id => assert.ok(!sids.includes(id), id + " retiré de chez Souad"));
  assert.ok(sids.includes("prehaltero") && sids.includes("souad-perso") && sids.includes("pullup"),
    "Souad garde Pré Haltéro, son programme perso, et reçoit Pull-Up Lab");
  const spr = JSON.parse(ls.getItem("perflab.p.souad.progression"));
  assert.equal(spr.upper, undefined, "progression du programme retiré purgée");
  assert.ok(spr.prehaltero, "progression des programmes légitimes conservée");
  assert.equal(ls.getItem("perflab.mig.assign1"), "1", "migration marquée faite");
});
t("progression RPE isolée par profil", () => {
  const { Backend } = boot();
  Backend.saveProgression({ lower: { rdl: { week: 1, tier: 2, next: 3, hist: [] } } });
  Backend.setProfile("souad");
  assert.deepEqual(Backend.loadProgression(), {});
  Backend.setProfile("moss");
  assert.equal(Backend.loadProgression().lower.rdl.next, 3);
});

t("mergeDefaults : une copie stockée obsolète est rafraîchie par la version v supérieure", async () => {
  const { Backend } = boot({
    "perflab.p.moss.programs": JSON.stringify([
      { id: "core", title: "VIEUX CORE", sessions: [{ id: "s1", blocks: [] }] },
      { id: "perso", title: "PERSO", sessions: [{ id: "s1", blocks: [] }] }
    ])
  });
  const r = await Backend.loadAll();
  const core = r.programs.find(p => p.id === "core");
  assert.ok(core.v >= 2, "copie core remplacée par la v2");
  const ks = core.sessions.flatMap(s => s.blocks.flatMap(b => (b.ex || []).map(e => e.k)));
  assert.ok(ks.includes("plcrunch"), "le correctif sit-up → crunch au sol est propagé");
  assert.equal(r.programs.find(p => p.id === "perso").title, "PERSO", "programme perso intouché");
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
t("exportAll → importProfilesDoc : aller-retour fidèle (journal inclus)", async () => {
  const a = boot();
  await a.Backend.loadAll();
  a.Backend.setWeek("core", 4);
  a.Backend.saveProgression({ core: { situp: { week: 4, tier: 1, next: 2, hist: [{ w: 4, rpe: 5, pain: false, tier: 1 }] } } });
  a.Backend.addLog({ d: "2026-07-02", prog: "core", s: "s1", w: 4 });
  a.Backend.addLog({ d: "2026-07-02", prog: "core", s: "s1", w: 4 }); // doublon même jour → remplacé
  const doc = a.Backend.exportAll();
  assert.equal(doc.profiles.find(p => p.id === "moss").log.length, 1);
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
  assert.equal(b.Backend.getLog().length, 1, "journal de séances restauré");
});

/* ---- micro-programme adaptatif : blob opaque, isolé par profil ---- */
const MICRO_SAMPLE = {
  v: 1, start: "2026-08-01",
  skills: { du: { week: 2, tier: 1, next: 2, hist: [{ w: 2, rpe: 5, pain: false, tier: 1 }] } },
  history: [{ d: "2026-08-10", tags: ["metcon"], fatigue: "yellow", min: 5,
              items: [{ skill: "du", drill: "du_submax" }], res: { du: { ub: 26, total: 78 } }, rpe: 5, pain: false }]
};

t("micro : écrit dans l'espace du profil actif, invisible depuis l'autre", async () => {
  const { Backend, ls } = boot();
  await Backend.loadAll();
  assert.equal(Backend.getMicro(), null, "aucun micro-programme au départ");
  await Backend.saveMicro(MICRO_SAMPLE);
  assert.equal(Backend.getMicro().history.length, 1);
  assert.ok(ls.getItem("perflab.p.moss.micro"), "stocké sous la clé namespacée Moss");
  Backend.setProfile("souad");
  assert.equal(Backend.getMicro(), null, "le micro-programme de Moss ne fuit pas chez Souad");
  Backend.setProfile("moss");
  assert.equal(Backend.getMicro().skills.du.next, 2);
});

t("micro : aller-retour export → import fidèle", async () => {
  const a = boot();
  await a.Backend.loadAll();
  await a.Backend.saveMicro(MICRO_SAMPLE);
  const doc = a.Backend.exportAll();
  require(path.join(__dirname, "..", "progression.js")).validateProfilesDoc(doc);
  const b = boot();
  b.Backend.importProfilesDoc(doc);
  const m = b.Backend.getMicro();
  assert.equal(m.history[0].res.du.ub, 26);
  assert.equal(m.skills.du.next, 2);
  assert.equal(m.start, "2026-08-01");
});

t("micro : une sauvegarde antérieure (sans clé micro) n'efface pas l'existant", async () => {
  const { Backend } = boot();
  await Backend.loadAll();
  await Backend.saveMicro(MICRO_SAMPLE);
  // backup d'avant la fonctionnalité : aucune clé `micro` sur les profils
  const legacyDoc = {
    schema: "perflab-profiles-v1",
    profiles: [{ id: "moss", name: "Moss", programs: [], progress: {}, weeks: { core: 2 }, progression: {}, log: [] }]
  };
  Backend.importProfilesDoc(legacyDoc);
  assert.ok(Backend.getMicro(), "le micro-programme doit survivre à l'import d'un ancien backup");
  assert.equal(Backend.getMicro().history.length, 1);
  assert.equal(Backend.getWeek("core"), 2, "le reste de l'ancien backup est bien appliqué");
});

/* ---- programmation : blob athlète (clé cycle) dans la sauvegarde ---- */
const CYCLE_SAMPLE = { v: 1, maxes: { back_squat: [{ kg: 120, d: "2026-08-15" }] },
  logs: { "cycle-1": { done: { w1s1: "2026-11-24" }, skipped: [], decisions: {}, scores: {}, bonus: {} } } };

t("cycle : aller-retour export → import fidèle", async () => {
  const a = boot({ "perflab.p.moss.cycle": JSON.stringify(CYCLE_SAMPLE) });
  const doc = a.Backend.exportAll();
  assert.deepEqual(doc.profiles.find(p => p.id === "moss").cycle, CYCLE_SAMPLE);
  assert.equal(doc.profiles.find(p => p.id === "souad").cycle, null);
  const b = boot();
  b.Backend.importProfilesDoc(JSON.parse(JSON.stringify(doc)));
  assert.deepEqual(JSON.parse(b.ls.getItem("perflab.p.moss.cycle")), CYCLE_SAMPLE);
  assert.equal(b.ls.getItem("perflab.p.souad.cycle"), null, "rien écrit chez Souad");
});

t("cycle : une sauvegarde sans clé cycle n'efface pas l'existant", async () => {
  const { Backend, ls } = boot({ "perflab.p.moss.cycle": JSON.stringify(CYCLE_SAMPLE) });
  Backend.importProfilesDoc({
    schema: "perflab-profiles-v1",
    profiles: [{ id: "moss", name: "Moss", programs: [], progress: {}, weeks: { core: 2 }, progression: {}, log: [] }]
  });
  assert.deepEqual(JSON.parse(ls.getItem("perflab.p.moss.cycle")), CYCLE_SAMPLE);
  assert.equal(Backend.getWeek("core"), 2);
});

/* ---- mode CLOUD : sync des blobs d'état (progression/weeks/log) ----
   Mock minimal du client Supabase (select/eq/order/upsert/delete, tous
   thenables comme le vrai client) + un stub d'auth avec session fixe. */
function makeMockClient(store, session) {
  function makeChain(execute) {
    const filters = [];
    const chain = {
      eq: (col, val) => { filters.push([col, val]); return chain; },
      order: () => chain,
      then: (resolve, reject) => { try { resolve(execute(filters)); } catch (e) { reject(e); } }
    };
    return chain;
  }
  const PK = { programs: ["user_id", "id"], progress: ["user_id", "program_id", "week"], state: ["user_id", "key"] };
  function from(table) {
    return {
      select: () => makeChain(filters => ({ data: store[table].filter(r => filters.every(([c, v]) => r[c] === v)), error: null })),
      upsert: async rows => {
        const arr = Array.isArray(rows) ? rows : [rows];
        const pk = PK[table];
        arr.forEach(row => {
          const i = store[table].findIndex(r => pk.every(k => r[k] === row[k]));
          if (i >= 0) store[table][i] = row; else store[table].push(row);
        });
        return { error: null };
      },
      delete: () => makeChain(filters => { store[table] = store[table].filter(r => !filters.every(([c, v]) => r[c] === v)); return { error: null }; })
    };
  }
  return {
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
      signOut: async () => {}
    },
    from
  };
}
function bootCloud(store, session, seedLS) {
  const ls = makeLocalStorage(seedLS);
  const onlineHandlers = [];
  const sandbox = {
    window: { addEventListener: (evt, cb) => { if (evt === "online") onlineHandlers.push(cb); } },
    localStorage: ls, navigator: { onLine: true },
    console, JSON, Math, Date, Array, Object, Set, String, Number, Boolean, Promise
  };
  sandbox.window.localStorage = ls;
  sandbox.window.CONFIG = { SUPABASE_URL: "https://x.supabase.co", SUPABASE_ANON_KEY: "anon" };
  sandbox.window.supabase = { createClient: () => makeMockClient(store, session) };
  const code = `
    const window = __sandbox.window;
    const localStorage = __sandbox.localStorage;
    const navigator = __sandbox.navigator;
    ${src("programs.js")}
    ${src("progression.js")}
    ${src("backend.js")}
    return { Backend };
  `;
  const r = new Function("__sandbox", code)(sandbox);
  return { Backend: r.Backend, ls, sandbox, onlineHandlers };
}

t("CLOUD : loadAll hydrate progression/weeks/log depuis les lignes 'state'", async () => {
  const store = {
    programs: [], progress: [], state: [
      { user_id: "u1", key: "progression", value: { lower: { rdl: { week: 2, tier: 1, next: 2, hist: [] } } } },
      { user_id: "u1", key: "weeks", value: { lower: 3 } },
      { user_id: "u1", key: "log", value: [{ d: "2026-07-02", prog: "lower", s: "s1", w: 3 }] }
    ]
  };
  const { Backend } = bootCloud(store, { user: { id: "u1", email: "t@t.com" } });
  await Backend.init();
  await Backend.loadAll();
  assert.equal(Backend.loadProgression().lower.rdl.next, 2);
  assert.equal(Backend.getWeek("lower"), 3);
  assert.equal(Backend.getLog().length, 1);
});

t("CLOUD : saveProgression/setWeek/addLog poussent vers 'state' en ligne", async () => {
  const store = { programs: [], progress: [], state: [] };
  const { Backend } = bootCloud(store, { user: { id: "u1", email: "t@t.com" } });
  await Backend.init();
  await Backend.loadAll();
  await Backend.saveProgression({ core: { situp: { week: 1, tier: 0, next: 1, hist: [] } } });
  await Backend.setWeek("core", 2);
  await Backend.addLog({ d: "2026-07-02", prog: "core", s: "s1", w: 2 });
  const row = k => store.state.find(r => r.user_id === "u1" && r.key === k);
  assert.equal(row("progression").value.core.situp.next, 1);
  assert.equal(row("weeks").value.core, 2);
  assert.equal(row("log").value.length, 1);
});

t("CLOUD : écriture hors-ligne mise en file, poussée au retour du réseau", async () => {
  const store = { programs: [], progress: [], state: [] };
  const { Backend, sandbox, onlineHandlers } = bootCloud(store, { user: { id: "u1", email: "t@t.com" } });
  await Backend.init();
  await Backend.loadAll();
  sandbox.navigator.onLine = false;
  await Backend.addLog({ d: "2026-07-02", prog: "core", s: "s1", w: 1 });
  assert.ok(!store.state.some(r => r.key === "log"), "rien poussé pendant la coupure");
  sandbox.navigator.onLine = true;
  assert.equal(onlineHandlers.length, 1, "flushQueue enregistré sur l'event online");
  await onlineHandlers[0]();
  const row = store.state.find(r => r.user_id === "u1" && r.key === "log");
  assert.ok(row, "journal synchronisé après le flush");
  assert.equal(row.value.length, 1);
});

t("CLOUD : le micro-programme transite par la table 'state' (clé 'micro')", async () => {
  const store = { programs: [], progress: [], state: [] };
  const { Backend } = bootCloud(store, { user: { id: "u1", email: "t@t.com" } });
  await Backend.init();
  await Backend.loadAll();
  await Backend.saveMicro(MICRO_SAMPLE);
  const row = store.state.find(r => r.user_id === "u1" && r.key === "micro");
  assert.ok(row, "aucune ligne 'micro' poussée");
  assert.equal(row.value.history[0].res.du.ub, 26);
  // relecture depuis un appareil vierge
  const b = bootCloud(store, { user: { id: "u1", email: "t@t.com" } });
  await b.Backend.init();
  await b.Backend.loadAll();
  assert.equal(b.Backend.getMicro().skills.du.next, 2);
});

t("CLOUD : micro écrit hors-ligne → file d'attente, poussé au retour du réseau", async () => {
  const store = { programs: [], progress: [], state: [] };
  const { Backend, sandbox, onlineHandlers } = bootCloud(store, { user: { id: "u1", email: "t@t.com" } });
  await Backend.init();
  await Backend.loadAll();
  sandbox.navigator.onLine = false;
  await Backend.saveMicro(MICRO_SAMPLE);
  assert.ok(!store.state.some(r => r.key === "micro"), "rien poussé pendant la coupure");
  assert.ok(Backend.getMicro(), "mais lisible localement — la micro-session reste utilisable hors-ligne");
  sandbox.navigator.onLine = true;
  await onlineHandlers[0]();
  assert.ok(store.state.some(r => r.key === "micro"), "synchronisé après le flush");
});

chain.then(() => console.log(`\n${n} tests OK`)).catch(e => { console.error("  ✗ " + (e && e.stack || e)); process.exit(1); });
