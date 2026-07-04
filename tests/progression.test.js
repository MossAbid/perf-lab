/* Tests Node de la logique pure (progression.js) + cohérence de programs.js.
   Lancer :  node tests/progression.test.js                                   */
"use strict";
const assert = require("assert");
const path = require("path");
const P = require(path.join(__dirname, "..", "progression.js"));

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("  ✓ " + name); };

/* ---- règle RPE (seuils verrouillés : ≤6 monte, 7-8 maintient, ≥9/douleur descend) ---- */
t("RPE ≤ 6 + toutes séries faites → palier supérieur", () => {
  assert.equal(P.nextTier(2, 5, 6, false, true), 3);
  assert.equal(P.nextTier(2, 5, 0, false, true), 3);
});
t("RPE ≤ 6 mais séries incomplètes → maintien", () => {
  assert.equal(P.nextTier(2, 5, 5, false, false), 2);
});
t("RPE 7-8 → maintien", () => {
  assert.equal(P.nextTier(2, 5, 7, false, true), 2);
  assert.equal(P.nextTier(2, 5, 8, false, true), 2);
});
t("RPE ≥ 9 → palier précédent", () => {
  assert.equal(P.nextTier(2, 5, 9, false, true), 1);
  assert.equal(P.nextTier(2, 5, 10, false, true), 1);
});
t("douleur → palier précédent, quel que soit le RPE", () => {
  assert.equal(P.nextTier(2, 5, 3, true, true), 1);
  assert.equal(P.nextTier(2, 5, null, true, true), 1);
});
t("bornes : pas au-delà du dernier palier ni sous le premier", () => {
  assert.equal(P.nextTier(4, 5, 4, false, true), 4);
  assert.equal(P.nextTier(0, 5, 10, false, true), 0);
});
t("pas de RPE saisi et pas de douleur → maintien", () => {
  assert.equal(P.nextTier(2, 5, null, false, true), 2);
});

/* ---- paliers ---- */
const tiers = { u: "kg", steps: [40, 50, 60, 70], start: 2 };
t("startTier respecte 'start' et le borne", () => {
  assert.equal(P.startTier(tiers), 2);
  assert.equal(P.startTier({ steps: [1, 2], start: 9 }), 1);
  assert.equal(P.startTier(null), 0);
});
t("tierLabel formate kg / s / reps", () => {
  assert.equal(P.tierLabel(tiers, 2), "60 kg");
  assert.equal(P.tierLabel({ u: "s", steps: [30, 45] }, 1), "45″");
  assert.equal(P.tierLabel({ u: "reps", steps: [8, 10] }, 0), "8 reps");
});

/* ---- état de progression : cycle complet sur 3 semaines ---- */
t("recordRpe + effectiveTier : monte, maintient, régresse", () => {
  const pr = {};
  // S1 : palier de départ 2 (60 kg), RPE 5, tout fait → propose 3
  let r = P.recordRpe(pr, "lower", "rdl", 1, tiers, 5, false, true);
  assert.equal(r.tier, 2); assert.equal(r.next, 3);
  assert.equal(P.effectiveTier(pr, "lower", "rdl", 1, tiers), 2); // cette semaine : inchangé
  assert.equal(P.effectiveTier(pr, "lower", "rdl", 2, tiers), 3); // semaine suivante : appliqué
  // S2 : RPE 8 → maintien à 3
  r = P.recordRpe(pr, "lower", "rdl", 2, tiers, 8, false, true);
  assert.equal(r.tier, 3); assert.equal(r.next, 3);
  // S3 : douleur → retour à 2
  r = P.recordRpe(pr, "lower", "rdl", 3, tiers, 4, true, true);
  assert.equal(r.tier, 3); assert.equal(r.next, 2);
  assert.equal(P.effectiveTier(pr, "lower", "rdl", 4, tiers), 2);
  // historique : une entrée par semaine
  assert.equal(pr.lower.rdl.hist.length, 3);
});
t("recordRpe : re-saisie la même semaine remplace l'évaluation", () => {
  const pr = {};
  P.recordRpe(pr, "p", "x", 1, tiers, 5, false, true);
  P.recordRpe(pr, "p", "x", 1, tiers, 9, false, true);
  assert.equal(pr.p.x.hist.length, 1);
  assert.equal(pr.p.x.next, 1);
});
t("exercice jamais évalué → palier de départ", () => {
  assert.equal(P.effectiveTier({}, "p", "x", 5, tiers), 2);
});

/* ---- sparkline ---- */
t("sparklineSVG : vide sous 2 points, sinon ligne + points + douleur marquée", () => {
  assert.equal(P.sparklineSVG([{ w: 1, tier: 2 }], tiers), "");
  assert.equal(P.sparklineSVG(null, tiers), "");
  const hist = [{ w: 1, rpe: 5, pain: false, tier: 2 }, { w: 2, rpe: 8, pain: false, tier: 3 }, { w: 3, rpe: 4, pain: true, tier: 3 }];
  const svg = P.sparklineSVG(hist, tiers);
  assert.ok(svg.includes("<polyline"));
  assert.equal((svg.match(/<circle/g) || []).length, 3);
  assert.equal((svg.match(/sp-bad/g) || []).length, 1, "le point douleur est marqué");
  assert.ok(svg.includes("RPE 8"));
});

/* ---- jalons / tests ---- */
t("recordTest : trie par date, remplace la saisie du même jour", () => {
  const pr = {};
  P.recordTest(pr, "pullup", "testpu", "2026-07-16", 1);
  P.recordTest(pr, "pullup", "testpu", "2026-07-02", 0);
  P.recordTest(pr, "pullup", "testpu", "2026-07-16", 2); // re-saisie
  const tests = pr.pullup.testpu.tests;
  assert.deepEqual(tests, [{ d: "2026-07-02", reps: 0 }, { d: "2026-07-16", reps: 2 }]);
});

/* ---- schéma : classification des imports ---- */
const oldFmt = { id: "test", title: "TEST", sessions: [{ id: "s1", blocks: [] }] };
t("ancien format (racine id + sessions) → kind program", () => {
  const r = P.classifyImport(oldFmt);
  assert.equal(r.kind, "program");
  assert.equal(r.program.id, "test");
});
t("nouveau format profiles → kind profiles", () => {
  const doc = { schema: "perflab-profiles-v1", profiles: [{ id: "moss", programs: [oldFmt] }] };
  const r = P.classifyImport(doc);
  assert.equal(r.kind, "profiles");
});
t("JSON invalide rejeté avec message clair", () => {
  assert.throws(() => P.classifyImport({}), /'id'/);
  assert.throws(() => P.classifyImport({ id: "a", title: "A" }), /sessions/);
  assert.throws(() => P.classifyImport({ profiles: [{}] }), /'id' requis/);
  assert.throws(() => P.classifyImport({ profiles: [{ id: "moss", programs: [{ id: "x" }] }] }), /'title'/);
});

/* ---- fusion d'un document profiles ---- */
t("mergeProfilesDoc : remplace par id, préserve le reste", () => {
  const state = { moss: { programs: [{ id: "a", v: 1 }, { id: "b" }], progress: { keep: 1 }, weeks: {}, progression: {} } };
  P.mergeProfilesDoc(state, { profiles: [{ id: "moss", programs: [{ id: "a", v: 2 }, { id: "c" }] }] });
  const ids = state.moss.programs.map(p => p.id);
  assert.deepEqual(ids, ["a", "b", "c"]);
  assert.equal(state.moss.programs[0].v, 2);
  assert.deepEqual(state.moss.progress, { keep: 1 }); // non fourni → conservé
  // profil absent de l'état → créé
  P.mergeProfilesDoc(state, { profiles: [{ id: "souad", programs: [{ id: "z" }], progression: { p: {} } }] });
  assert.equal(state.souad.programs[0].id, "z");
});

/* ---- cohérence de programs.js ---- */
t("programs.js : LOWER LAB présent, paliers bien formés partout", () => {
  global.window = undefined;
  const src = require("fs").readFileSync(path.join(__dirname, "..", "programs.js"), "utf8");
  const DEFAULT_PROGRAMS = new Function(src + "; return DEFAULT_PROGRAMS;")();
  const ids = DEFAULT_PROGRAMS.map(p => p.id);
  assert.deepEqual(ids, ["upper", "core", "lower", "hyrox", "pullup", "prehaltero"]);
  DEFAULT_PROGRAMS.forEach(P.validateProgram);
  const lower = DEFAULT_PROGRAMS.find(p => p.id === "lower");
  assert.equal(lower.sessions.length, 2);
  assert.deepEqual(lower.sessions.map(s => s.id), ["j1", "j2"]);
  let withTiers = 0;
  DEFAULT_PROGRAMS.forEach(p => p.sessions.forEach(s => s.blocks.forEach(b => (b.ex || []).forEach(ex => {
    if (ex.tiers) {
      withTiers++;
      assert.ok(Array.isArray(ex.tiers.steps) && ex.tiers.steps.length >= 2, ex.name);
      assert.ok(["kg", "s", "reps", "min", "m"].includes(ex.tiers.u), ex.name);
      const st = ex.tiers.start | 0;
      assert.ok(st >= 0 && st < ex.tiers.steps.length, ex.name + " : start hors bornes");
      const numeric = ex.tiers.steps.every(v => typeof v === "number");
      assert.ok(numeric, ex.name + " : paliers non numériques");
      for (let i = 1; i < ex.tiers.steps.length; i++)
        assert.ok(ex.tiers.steps[i] > ex.tiers.steps[i - 1], ex.name + " : paliers non croissants");
    }
  }))));
  // tous les exercices de lower et pullup ont des paliers ; prehaltero aucun (zéro RPE)
  lower.sessions.forEach(s => s.blocks.forEach(b => b.ex.forEach(ex => assert.ok(ex.tiers, ex.name))));
  const pu = DEFAULT_PROGRAMS.find(p => p.id === "pullup");
  assert.equal(pu.sessions.length, 4);
  pu.sessions.slice(0, 3).forEach(s => s.blocks.forEach(b => b.ex.forEach(ex => assert.ok(ex.tiers, ex.name))));
  // la séance TEST porte un exercice jalon
  const testEx = pu.sessions[3].blocks.flatMap(b => b.ex).find(ex => ex.test);
  assert.ok(testEx, "exercice test:true dans la séance TEST");
  // Core Lab v2 : le sit-up lesté (douleur de dos) a laissé place au crunch câble
  const core = DEFAULT_PROGRAMS.find(p => p.id === "core");
  assert.ok(core.v >= 2, "core versionné");
  const coreExs = core.sessions.flatMap(s => s.blocks.flatMap(b => b.ex.map(e => e.k)));
  assert.ok(!coreExs.includes("situp"), "sit-up lesté retiré");
  assert.ok(coreExs.includes("plcrunch"), "crunch au sol présent");
  // Hyrox : 3 séances, course post-sled présente
  const hy = DEFAULT_PROGRAMS.find(p => p.id === "hyrox");
  assert.equal(hy.sessions.length, 3);
  assert.ok(hy.sessions[2].blocks.some(b => b.ex.some(e => e.k === "runpost")), "compromised running présent");
  const ph = DEFAULT_PROGRAMS.find(p => p.id === "prehaltero");
  ph.sessions.forEach(s => s.blocks.forEach(b => b.ex.forEach(ex => assert.ok(!ex.tiers, ex.name))));
  assert.ok(withTiers >= 30, "au moins 30 exercices avec paliers (trouvé " + withTiers + ")");
  // assignation par profil : Moss = entraînements, Souad = pull-up + pré-haltéro
  const byProfile = pid => DEFAULT_PROGRAMS.filter(p => !p.assign || p.assign.includes(pid)).map(p => p.id);
  assert.deepEqual(byProfile("moss"), ["upper", "core", "lower", "hyrox"]);
  assert.deepEqual(byProfile("souad"), ["pullup", "prehaltero"]);
});

console.log(`\n${n} tests OK`);
