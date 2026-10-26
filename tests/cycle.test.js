/* Tests Node de la logique pure du module Programmation (cycle.js).
   Lancer :  node tests/cycle.test.js                                        */
"use strict";
const assert = require("assert");
const path = require("path");
const C = require(path.join(__dirname, "..", "cycle.js"));
const { makeSampleCycle } = require(path.join(__dirname, "fixtures", "cycle-sample.js"));

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("  ✓ " + name); };
const clone = o => JSON.parse(JSON.stringify(o));

/* ---- validation du contenu perflab-cycle-v1 ---- */
const bad = (mut, re) => { const c = clone(makeSampleCycle()); mut(c); assert.throws(() => C.validateCycle(c), m => re.test(m)); };

t("fixture valide", () => assert.equal(C.validateCycle(makeSampleCycle()), true));
t("schéma inconnu", () => bad(c => c.schema = "x", /Schéma attendu : perflab-cycle-v1/));
t("début hors lundi", () => bad(c => c.start = "2026-11-24", /doit commencer un lundi/));
t("4 séances par semaine", () => bad(c => c.weeks[0].sessions.pop(), /Semaine 1 : 4 séances attendues/));
t("séance > 60 min", () => bad(c => c.weeks[0].sessions[0].blocks[0].minutes = 40, /w1s1 : \d+ min \(max 60\)/));
t("accessoire facultatif non compté", () => { const c = makeSampleCycle(); c.weeks[0].sessions[0].blocks[3].minutes = 30; assert.equal(C.validateCycle(c), true); });
t("mouvement inconnu", () => bad(c => c.weeks[0].sessions[0].blocks[1].lift = "snatchh", /w1s1 : mouvement 'snatchh' inconnu/));
t("RX et INT requis", () => bad(c => delete c.weeks[0].sessions[0].blocks[2].levels.int, /w1s1 : niveaux RX et INT requis/));
t("type de score inconnu", () => bad(c => c.weeks[0].sessions[0].blocks[2].score = "points", /w1s1 : type de score 'points' inconnu/));
t("identifiant en double", () => bad(c => c.weeks[1].sessions[0].id = "w1s1", /identifiant 'w1s1' en double/));
t("un seul metcon par séance", () => bad(c => { const b = c.weeks[0].sessions[0].blocks; b.push(clone(b[2])); }, /w1s1 : un seul metcon/));
t("vidéo en https", () => bad(c => c.lifts.back_squat.video = "ftp://x", /back_squat : vidéo https attendue/));

/* ---- max et charges ---- */
t("loadKg arrondit au 2,5 kg", () => {
  assert.equal(C.loadKg(120, 75), 90);  assert.equal(C.loadKg(120, 70), 85);
  assert.equal(C.loadKg(55, 70), 37.5); assert.equal(C.loadKg(130, 73), 95);
  assert.equal(C.loadKg(80, 82), 65);
});
t("liftMax : la valeur la plus récente", () => {
  const m = { back_squat: [{ kg: 120, d: "2026-08-15" }, { kg: 115, d: "2026-06-01" }] };
  assert.deepEqual(C.liftMax(makeSampleCycle(), m, "back_squat"), { kg: 120, d: "2026-08-15", derived: false });
});
t("liftMax : dérivé du mouvement voisin", () => {
  const m = { back_squat: [{ kg: 120, d: "2026-08-15" }] };
  assert.deepEqual(C.liftMax(makeSampleCycle(), m, "front_squat"), { kg: 102, d: "2026-08-15", derived: true });
});
t("liftMax : aucun max → null", () => assert.equal(C.liftMax(makeSampleCycle(), {}, "strict_press"), null));
t("strengthLines : kg, ceinture dès 80 %, kg null sans max", () => {
  const c = makeSampleCycle(), blk = c.weeks[0].sessions[0].blocks[1];
  const l = C.strengthLines(c, { back_squat: [{ kg: 120, d: "2026-08-15" }] }, blk);
  assert.deepEqual(l.map(x => [x.kg, x.belt]), [[72.5, false], [85, false], [95, true]]);
  assert.ok(C.strengthLines(c, {}, blk).every(x => x.kg === null));
});
t("setMax ajoute une entrée datée", () => {
  const a = C.setMax(C.newAthlete(), "snatch", 57.5, "2026-11-30");
  assert.deepEqual(a.maxes.snatch, [{ kg: 57.5, d: "2026-11-30" }]);
});

console.log(`\n${n} tests OK`);
