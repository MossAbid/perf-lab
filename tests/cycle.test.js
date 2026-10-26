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
t("objectif : libellé et texte requis", () => bad(c => c.goals = [{ label: "Force" }], /objectif 1 : libellé et texte requis/));
t("fiche : nom requis", () => bad(c => c.movements.wall_ball.name = " ", /wall_ball : nom requis/));
t("fiche : catégorie connue", () => bad(c => c.movements.wall_ball.cat = "cardio", /wall_ball : catégorie 'cardio' inconnue/));
t("fiche : points clés requis", () => bad(c => c.movements.wall_ball.cues = [], /wall_ball : points clés requis/));
t("fiche : vidéo en https", () => bad(c => c.movements.wall_ball.video = "http://x", /wall_ball : vidéo https attendue/));
t("fiche : état de progression connu", () => bad(c => c.movements.bar_muscle_up.progression[0].state = "ok", /bar_muscle_up : état 'ok' inconnu/));
t("fiche : une seule étape en cours", () => bad(c => c.movements.bar_muscle_up.progression[2].state = "current", /bar_muscle_up : une seule étape « current »/));
t("bloc : fiche inconnue", () => bad(c => c.weeks[0].sessions[0].blocks[2].moves = ["wallball"], /w1s1 : fiche 'wallball' inconnue/));
t("force : test 1RM ou 3RM", () => bad(c => c.weeks[0].sessions[0].blocks[1].test = "2RM", /w1s1 : test '2RM' inconnu \(1RM ou 3RM\)/));
t("cycle v1 sans objectifs ni fiches reste valide", () => {
  const c = clone(makeSampleCycle());
  delete c.goals; delete c.movements;
  c.weeks.forEach(w => [...w.sessions, w.bonus].forEach(s => s.blocks.forEach(b => delete b.moves)));
  assert.equal(C.validateCycle(c), true);
});

/* ---- contenu mal formé : jamais de NaN ni de texte brut injecté à l'écran ---- */
t("pct manquant ou non numérique refusé", () => {
  bad(c => delete c.weeks[0].sessions[0].blocks[1].sets[0].pct, /w1s1 : % de série invalide/);
  bad(c => c.weeks[0].sessions[0].blocks[1].sets[0].pct = "85%", /w1s1 : % de série invalide/);
});
t("durée manquante ou non numérique refusée", () => {
  bad(c => delete c.weeks[0].sessions[0].blocks[0].minutes, /w1s1 : durée manquante/);
  bad(c => c.weeks[0].sessions[0].blocks[0].minutes = "<img onerror=x>", /w1s1 : durée manquante/);
});
t("nom de mouvement requis", () => bad(c => delete c.lifts.snatch.name, /snatch : nom requis/));
t("strengthLines : pct non numérique → kg null", () => {
  const c = makeSampleCycle(), blk = clone(c.weeks[0].sessions[0].blocks[1]); blk.sets[0].pct = "lourd";
  assert.equal(C.strengthLines(c, { back_squat: [{ kg: 120, d: "2026-08-15" }] }, blk)[0].kg, null);
});

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

/* ---- semaine, file ordonnée, rattraper ou passer (début lundi 2026-11-23) ---- */
const cyc = makeSampleCycle();
t("calendarWeek", () => {
  assert.equal(C.calendarWeek(cyc, "2026-11-22"), -1); assert.equal(C.calendarWeek(cyc, "2026-11-23"), 0);
  assert.equal(C.calendarWeek(cyc, "2026-11-29"), 0);  assert.equal(C.calendarWeek(cyc, "2026-11-30"), 1);
});
t("avant le début : upcoming, rien de faisable", () => {
  const v = C.weekView(cyc, C.newLog(), "2026-11-20");
  assert.equal(v.state, "upcoming"); assert.equal(v.nextId, null);
});
t("première séance mise en avant", () => {
  const v = C.weekView(cyc, C.newLog(), "2026-11-24");
  assert.deepEqual(v.sessions.map(s => s.status), ["next", "todo", "todo", "todo"]);
});
t("séance faite → la suivante passe en tête", () => {
  const v = C.weekView(cyc, C.markDone(C.newLog(), "w1s1", "2026-11-24"), "2026-11-24");
  assert.deepEqual(v.sessions.map(s => s.status), ["done", "next", "todo", "todo"]);
  assert.equal(v.sessions[0].date, "2026-11-24");
});
t("semaine bouclée avant lundi : suivante verrouillée", () => {
  let l = C.newLog(); ["w1s1","w1s2","w1s3","w1s4"].forEach(id => C.markDone(l, id, "2026-11-27"));
  const v = C.weekView(cyc, l, "2026-11-28");
  assert.equal(v.weekIndex, 0); assert.equal(v.nextId, null);
  assert.equal(C.weekView(cyc, l, "2026-11-30").nextId, "w2s1");
});
t("une séance manquée → décision demandée le lundi", () => {
  let l = C.newLog(); ["w1s1","w1s2","w1s3"].forEach(id => C.markDone(l, id, "2026-11-25"));
  assert.deepEqual(C.weekView(cyc, l, "2026-11-30").decision, { cw: 1, missed: ["w1s4"] });
});
t("rattraper : pas de nouvelle demande cette semaine, w1s4 en tête", () => {
  let l = C.newLog(); ["w1s1","w1s2","w1s3"].forEach(id => C.markDone(l, id, "2026-11-25"));
  C.applyDecision(l, cyc, "2026-11-30", "catchup");
  const v = C.weekView(cyc, l, "2026-12-01");
  assert.equal(v.decision, null); assert.equal(v.nextId, "w1s4"); assert.equal(v.weekIndex, 0);
});
t("passer : saute à la semaine du calendrier", () => {
  let l = C.newLog(); ["w1s1","w1s2","w1s3"].forEach(id => C.markDone(l, id, "2026-11-25"));
  C.applyDecision(l, cyc, "2026-11-30", "skip");
  const v = C.weekView(cyc, l, "2026-11-30");
  assert.equal(v.nextId, "w2s1"); assert.equal(v.weekIndex, 1);
});
t("semaine entière manquée : une seule demande, 4 séances", () => {
  assert.deepEqual(C.weekView(cyc, C.newLog(), "2026-12-01").decision.missed, ["w1s1","w1s2","w1s3","w1s4"]);
});
t("bonus fait : daté, hors file", () => {
  const l = C.markBonus(C.newLog(), "w1b", "2026-11-26");
  const v = C.weekView(cyc, l, "2026-11-26");
  assert.equal(v.bonus.date, "2026-11-26"); assert.equal(v.nextId, "w1s1");
});
t("après la fin du cycle : décision puis finished", () => {
  const l = C.newLog(); C.applyDecision(l, cyc, "2026-12-14", "skip");
  assert.equal(C.weekView(cyc, l, "2026-12-14").state, "finished");
});

t("annuler une séance faite : elle redevient la prochaine", () => {
  const l = C.markDone(C.newLog(), "w1s1", "2026-11-24");
  C.unmarkDone(l, "w1s1");
  assert.equal(C.weekView(cyc, l, "2026-11-24").nextId, "w1s1");
  const b = C.unmarkBonus(C.markBonus(C.newLog(), "w1b", "2026-11-26"), "w1b");
  assert.equal(b.bonus.w1b, undefined);
});

/* ---- scores ---- */
t("temps : mm:ss, m'ss, m''ss", () => {
  assert.deepEqual(C.parseScore("time", "12:30"), { value: 750, text: "12:30" });
  assert.equal(C.parseScore("time", "12'30").value, 750);
  assert.throws(() => C.parseScore("time", "7:5"), /mm:ss/);
});
t("temps : guillemets du clavier iPhone acceptés", () => {
  assert.equal(C.parseScore("time", "12’30”").value, 750);
  assert.equal(C.parseScore("time", "12′30″").value, 750);
});
t("tours + reps", () => {
  assert.deepEqual(C.parseScore("rounds_reps", "5+8"), { value: 5008, text: "5 tours + 8" });
  assert.equal(C.parseScore("rounds_reps", "5 tours 8").value, 5008);
  assert.deepEqual(C.parseScore("rounds_reps", "5"), { value: 5000, text: "5 tours" });
});
t("reps et charge", () => {
  assert.deepEqual(C.parseScore("reps", "142"), { value: 142, text: "142 reps" });
  assert.deepEqual(C.parseScore("load", "92,5"), { value: 92.5, text: "92,5 kg" });
  assert.throws(() => C.parseScore("reps", "abc"), /nombre/);
});
t("score précédent sur le même metcon", () => {
  const a = C.newAthlete(); a.logs["cycle-1"] = C.newLog();
  C.recordScore(a.logs["cycle-1"], "w1s1", "rx", C.parseScore("rounds_reps", "5+8"), "2026-11-24", "amrap-a");
  assert.deepEqual(C.previousScore(a, "amrap-a", "2026-12-01"), { text: "5 tours + 8", level: "rx", d: "2026-11-24" });
  assert.equal(C.previousScore(a, "amrap-a", "2026-11-24"), null);
});

/* ---- Ton mois / Ton programme ---- */
const MONTHS_LOG = () => ({ ...C.newLog(), done: { w1s2: "2026-11-24", w1s1: "2026-11-24" }, bonus: { w1b: "2026-11-26" } });
const cell = (g, iso) => g.weeks.flat().find(x => x.iso === iso);
t("fin du cycle : dimanche de la dernière semaine", () => assert.equal(C.cycleEnd(makeSampleCycle()), "2026-12-06"));
t("mois : novembre 2026 sur 6 lignes", () => {
  const g = C.monthGrid(makeSampleCycle(), MONTHS_LOG(), 2026, 11, "2026-11-25");
  assert.equal(g.label, "Novembre 2026"); assert.equal(g.weeks.length, 6);
  assert.equal(g.weeks[0][0].iso, "2026-10-26"); assert.equal(g.weeks[0][0].inMonth, false);
  assert.equal(g.weeks[5][6].iso, "2026-12-06");
});
t("mois : deux séances le même jour, dans l'ordre", () => {
  const g = C.monthGrid(makeSampleCycle(), MONTHS_LOG(), 2026, 11, "2026-11-25");
  assert.deepEqual(cell(g, "2026-11-24").items.map(i => i.chip), ["S1", "S2"]);
});
t("mois : bonus et aujourd'hui", () => {
  const g = C.monthGrid(makeSampleCycle(), MONTHS_LOG(), 2026, 11, "2026-11-25");
  assert.deepEqual(cell(g, "2026-11-26").items.map(i => i.type), ["bonus"]);
  assert.equal(cell(g, "2026-11-25").today, true);
});
t("mois : team WOD seulement les dimanches du cycle", () => {
  const g = C.monthGrid(makeSampleCycle(), MONTHS_LOG(), 2026, 11, "2026-11-25");
  assert.deepEqual(cell(g, "2026-11-29").items, [{ type: "wod", chip: "T", past: false }]);
  assert.deepEqual(cell(g, "2026-11-22").items, []);
  const d = C.monthGrid(makeSampleCycle(), MONTHS_LOG(), 2026, 12, "2026-12-20");
  assert.equal(cell(d, "2026-12-06").items[0].past, true);
  assert.deepEqual(cell(d, "2026-12-13").items, []);
});
t("mois : bornes de navigation", () => {
  assert.deepEqual(C.monthBounds(makeSampleCycle(), "2026-10-26"), { min: "2026-10", max: "2026-12" });
  assert.deepEqual(C.monthBounds(makeSampleCycle(), "2027-02-10"), { min: "2026-11", max: "2027-02" });
});
t("programme : semaine 1, dernière série et charge", () => {
  const p = C.programmeWeek(makeSampleCycle(), { back_squat: [{ kg: 120, d: "2026-08-15" }] }, 0);
  assert.equal(p.n, 1); assert.equal(p.start, "2026-11-23"); assert.equal(p.end, "2026-11-29");
  assert.deepEqual(p.sessions[0].lines[0], { kind: "strength", lift: "back_squat", name: "Back squat", scheme: "4 × 3 à 80 %", kg: 95, test: null, maxKg: 120 });
  assert.deepEqual(p.sessions[0].lines[1], { kind: "metcon", title: "AMRAP 12 min" });
  assert.equal(p.sessions[1].lines[0].kg, null);
  assert.deepEqual(p.bonus, { id: "w1b", title: "Bonus · BMU + mobilité" });
});
t("programme : mouvement dérivé et test", () => {
  const c = makeSampleCycle(); c.weeks[1].sessions[0].blocks[1].test = "3RM";
  const p = C.programmeWeek(c, { back_squat: [{ kg: 120, d: "2026-08-15" }] }, 1);
  assert.equal(p.sessions[2].lines[0].kg, 72.5);      // front squat = 102 × 70 %
  assert.equal(p.sessions[0].lines[0].test, "3RM");
});
t("programme : bloc de gymnastique d'une séance", () => {
  const c = makeSampleCycle();
  c.weeks[0].sessions[3].blocks.splice(2, 0, { kind: "skill", title: "Bar muscle-up", minutes: 0, text: "EMOM 8 min :\n2 bar muscle-ups" });
  const p = C.programmeWeek(c, {}, 0);
  assert.deepEqual(p.sessions[3].lines[1], { kind: "skill", title: "Bar muscle-up", text: "EMOM 8 min :" });
});

console.log(`\n${n} tests OK`);
