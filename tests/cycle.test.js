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

console.log(`\n${n} tests OK`);
