/* Tests Node du moteur d'adaptation (micro.js).
   progression.js est chargé d'abord : il publie PLProgression sur globalThis,
   ce que micro.js résout à l'appel — même ordre que index.html.
   Lancer :  node tests/micro.test.js                                        */
"use strict";
const assert = require("assert");
const path = require("path");
require(path.join(__dirname, "..", "progression.js"));
const M = require(path.join(__dirname, "..", "micro.js"));

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("  ✓ " + name); };

const TODAY = "2026-03-02";
const st = (over) => Object.assign(M.newState("2026-03-02"), over || {});
const gen = (tags, fatigue, minutes, state, todayISO) =>
  M.generate({ tags, fatigue, minutes, state: state || st(), todayISO: todayISO || TODAY });
const skillsOf = r => r.items.map(i => i.skill);

/* =====================================================================
   1. TABLE DE CONFLIT
   ===================================================================== */
t("pénalités : cumul de deux tags, plafonné à 2", () => {
  const p = M.penalties(["grip", "deadlift"]);   // grip:{ttb:1} + deadlift:{ttb:1} = 2
  assert.equal(p.ttb, 2);
  assert.equal(p.grip, 2);                       // grip:2 seul, déjà au plafond
  assert.ok(p.post >= 2);
});
t("pénalités : tag inconnu ignoré, liste vide sans effet", () => {
  assert.deepEqual(M.penalties(["n_importe_quoi"]), {});
  assert.deepEqual(M.penalties([]), {});
  assert.deepEqual(M.penalties(null), {});
});

/* =====================================================================
   2. RÈGLES DE CONFLIT DEMANDÉES (une par règle du cahier des charges)
   ===================================================================== */
t("beaucoup de pulling → BMU supprimé", () => {
  assert.ok(!skillsOf(gen(["heavy_pull"], "green", 10)).includes("bmu"));
  assert.ok(!skillsOf(gen(["pullups"], "green", 10)).includes("bmu"));
});
t("beaucoup de TTB → TTB supprimé", () => {
  assert.ok(!skillsOf(gen(["ttb"], "green", 10)).includes("ttb"));
});
t("beaucoup de grip → BMU / TTB / DU réduits, jamais à dose pleine", () => {
  const r = gen(["grip"], "green", 10);
  r.items.filter(i => ["bmu", "ttb", "du"].includes(i.skill))
    .forEach(i => assert.equal(i.reduced, true, i.skill + " devrait être en dose réduite"));
});
t("beaucoup d'overhead → HSW limité (réduit, pas supprimé)", () => {
  const r = gen(["overhead"], "green", 10);
  const hsw = r.items.find(i => i.skill === "hsw");
  if (hsw) assert.equal(hsw.reduced, true);
  assert.equal(M.penalties(["overhead"]).hsw, 1);
});
t("WYS contient HSPU → HSW retiré", () => {
  assert.ok(!skillsOf(gen(["hspu"], "green", 10)).includes("hsw"));
  assert.ok(!skillsOf(gen(["handstand"], "green", 10)).includes("hsw"));
});
t("beaucoup de DU → aucun volume DU ajouté", () => {
  assert.ok(!skillsOf(gen(["du"], "green", 10)).includes("du"));
});
t("metcon très intense → technique légère uniquement (tout réduit)", () => {
  const r = gen(["metcon", "heavy_pull", "heavy_squat"], "green", 10);
  if (!r.none) r.items.forEach(i => assert.equal(i.reduced, true));
});

/* =====================================================================
   3. FATIGUE
   ===================================================================== */
t("fatigue RED → 5 min maximum, mobilité seule, aucun skill", () => {
  const r = gen(["heavy_squat"], "red", 10);
  assert.ok(!r.none);
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].skill, "mob");
  assert.ok(r.items[0].min <= 5, "RED ne doit jamais dépasser 5 min");
  assert.ok(!M.SKILLS[r.items[0].skill]);
});
t("fatigue RED + 3 min → toujours ≤ 3 min", () => {
  const r = gen(["overhead"], "red", 3);
  assert.ok(r.none || r.items.reduce((a, i) => a + i.min, 0) <= 3);
});
t("fatigue RED après une séance dure → NO ADDITIONAL WORK", () => {
  const r = gen(["metcon", "heavy_pull"], "red", 10);
  assert.equal(r.none, true);
  assert.ok(/récupérer/.test(r.why));
});
t("fatigue YELLOW → dose réduite et budget resserré", () => {
  const y = gen([], "yellow", 10);
  const g = gen([], "green", 10);
  const sum = r => r.items.reduce((a, i) => a + i.min, 0);
  assert.ok(sum(y) <= sum(g), "YELLOW ne doit pas produire plus que GREEN");
  y.items.forEach(i => assert.equal(i.reduced, true));
});
t("mobilité RED choisie selon la séance déclarée", () => {
  assert.equal(gen(["overhead"], "red", 5).items[0].drill, "mob_sho");
  assert.equal(gen(["heavy_squat"], "red", 5).items[0].drill, "mob_hip");
  assert.equal(gen(["pullups"], "red", 5).items[0].drill, "mob_hang");
});

/* =====================================================================
   4. « NO ADDITIONAL WORK TODAY »
   ===================================================================== */
t("séance WYS qui couvre tout → NO ADDITIONAL WORK", () => {
  const all = M.TAGS.map(x => x.id);
  const r = gen(all, "green", 10);
  assert.equal(r.none, true);
  assert.equal(r.items.length, 0);
  assert.ok(typeof r.why === "string" && r.why.length > 0);
});
t("le moteur répond toujours quelque chose d'exploitable", () => {
  [3, 5, 7, 10].forEach(min =>
    ["green", "yellow", "red"].forEach(f =>
      M.TAGS.forEach(tag => {
        const r = gen([tag.id], f, min);
        assert.ok(r.none === true || r.items.length > 0, `vide sans raison : ${tag.id}/${f}/${min}`);
        assert.ok(typeof r.week === "number" && r.week >= 1 && r.week <= 8);
      })));
});

/* =====================================================================
   5. GARDE-FOU : jamais un 2e entraînement
   ===================================================================== */
t("le budget temps n'est jamais dépassé", () => {
  [3, 5, 7, 10].forEach(min =>
    ["green", "yellow", "red"].forEach(f => {
      const r = gen(["core"], f, min);
      if (r.none) return;
      const total = r.items.reduce((a, i) => a + i.min, 0);
      assert.ok(total <= min, `${total} min pour un budget de ${min} min (${f})`);
    }));
});
t("nombre d'items plafonné : 3 min → 1 seule entrée", () => {
  assert.ok(gen([], "green", 3).items.length <= 1);
  assert.ok(gen([], "green", 5).items.length <= 2);
  assert.ok(gen([], "green", 10).items.length <= 3);
});
t("aucun doublon de skill dans une même micro-session", () => {
  const s = skillsOf(gen([], "green", 10));
  assert.equal(new Set(s).size, s.length);
});

/* =====================================================================
   6. RÉCENCE
   ===================================================================== */
t("un skill fait hier est déprioritisé", () => {
  const state = st();
  state.history = [{ d: "2026-03-01", tags: [], fatigue: "green", min: 4,
                     items: [{ skill: "bmu", drill: "bmu_swing" }], res: {} }];
  assert.equal(M.daysSince(state, "bmu", TODAY), 1);
  assert.equal(M.daysSince(state, "du", TODAY), 99);
  const r = M.generate({ tags: [], fatigue: "green", minutes: 3, state, todayISO: TODAY });
  assert.notEqual(r.items[0].skill, "bmu", "BMU fait hier ne devrait pas repasser en tête sur 3 min");
});

/* =====================================================================
   7. PROGRESSION — délègue à la règle RPE de progression.js
   ===================================================================== */
const item = (skill, target) => ({ skill, drill: "x", name: "x", scheme: "x", sets: 3, min: 4, target });

t("cible atteinte + RPE ≤ 6 → palier suivant, d'UN seul cran", () => {
  let s = st({ start: "2026-03-02" });
  assert.equal(M.tierValue(s, "du", 1), 20);
  s = M.recordSession(s, { d: TODAY, items: [item("du", 20)], res: { du: { ub: 22, total: 80 } }, rpe: 5 }, TODAY);
  assert.equal(M.tierValue(s, "du", 2), 25);            // 20 → 25, pas 30
});
t("cible non atteinte → maintien du palier", () => {
  let s = M.recordSession(st(), { d: TODAY, items: [item("du", 20)], res: { du: { ub: 14 } }, rpe: 4 }, TODAY);
  assert.equal(M.tierValue(s, "du", 2), 20);
});
t("RPE ≥ 9 → régression, même cible atteinte", () => {
  let s = st();
  s = M.recordSession(s, { d: "2026-03-02", items: [item("ttb", 15)], res: { ttb: { ub: 20 } }, rpe: 5 }, "2026-03-02");
  assert.equal(M.tierValue(s, "ttb", 2), 18);
  s = M.recordSession(s, { d: "2026-03-09", items: [item("ttb", 18)], res: { ttb: { ub: 20 } }, rpe: 9 }, "2026-03-09");
  assert.equal(M.tierValue(s, "ttb", 3), 15);
});
t("douleur → régression quel que soit le RPE", () => {
  let s = M.recordSession(st(), { d: TODAY, items: [item("ttb", 15)], res: { ttb: { ub: 30 } }, rpe: 3, pain: true }, TODAY);
  assert.equal(M.tierValue(s, "ttb", 2), 12);
});
t("BMU : qualité < 3 bloque la montée (technique dégradée)", () => {
  const bad = M.recordSession(st(), { d: TODAY, items: [item("bmu", 1)], res: { bmu: { ub: 3, q: 2 } }, rpe: 4 }, TODAY);
  assert.equal(M.tierValue(bad, "bmu", 2), 1);
  const good = M.recordSession(st(), { d: TODAY, items: [item("bmu", 1)], res: { bmu: { ub: 3, q: 5 } }, rpe: 4 }, TODAY);
  assert.equal(M.tierValue(good, "bmu", 2), 2);
});
t("aucun résultat saisi → aucun jugement, palier inchangé", () => {
  const s = M.recordSession(st(), { d: TODAY, items: [item("du", 20)], res: {}, rpe: 5 }, TODAY);
  assert.equal(M.tierValue(s, "du", 2), 20);
  assert.deepEqual(s.skills, {});
});
t("renfort et mobilité ne créent aucun palier", () => {
  const s = M.recordSession(st(), {
    d: TODAY, items: [{ skill: "strength", drill: "st_sho" }, { skill: "mob", drill: "mob_sho" }],
    res: { strength: { ub: 10 } }, rpe: 3
  }, TODAY);
  assert.deepEqual(s.skills, {});
});
t("le palier atteint modifie bien la dose générée", () => {
  let s = st();
  const before = gen(["hspu", "heavy_pull"], "green", 10, s).items.find(i => i.skill === "du");
  s = M.recordSession(s, { d: TODAY, items: [item("du", 20)], res: { du: { ub: 25 } }, rpe: 5 }, TODAY);
  const after = gen(["hspu", "heavy_pull"], "green", 10, s, "2026-03-10").items.find(i => i.skill === "du");
  if (before && after) assert.notEqual(before.scheme, after.scheme);
});

/* =====================================================================
   8. HISTORIQUE & STATS
   ===================================================================== */
t("une seule entrée par jour : la dernière remplace", () => {
  let s = M.recordSession(st(), { d: TODAY, items: [item("du", 20)], res: { du: { ub: 20 } } }, TODAY);
  s = M.recordSession(s, { d: TODAY, items: [item("du", 20)], res: { du: { ub: 26 } } }, TODAY);
  assert.equal(s.history.length, 1);
  assert.equal(s.history[0].res.du.ub, 26);
});
t("historique plafonné (pas de fuite de localStorage)", () => {
  let s = st();
  for (let i = 0; i < 430; i++) {
    const d = new Date(Date.UTC(2024, 0, 1) + i * 864e5).toISOString().slice(0, 10);
    s = M.recordSession(s, { d, items: [item("du", 20)], res: { du: { ub: 20 } } }, d);
  }
  assert.ok(s.history.length <= 400, "history = " + s.history.length);
});
t("skillStats : current / best / target / volume 7 jours", () => {
  let s = st();
  s = M.recordSession(s, { d: "2026-02-01", items: [item("du", 20)], res: { du: { ub: 30, total: 90 } } }, "2026-02-01");
  s = M.recordSession(s, { d: "2026-03-01", items: [item("du", 20)], res: { du: { ub: 24, total: 60 } } }, "2026-03-01");
  const stats = M.skillStats(s, TODAY);
  assert.equal(stats.du.cur, 24);          // dernier relevé
  assert.equal(stats.du.best, 30);         // record absolu
  assert.equal(stats.du.week7, 60);        // seule la session du 01/03 est dans les 7 jours
  assert.equal(stats.du.final, 100);       // objectif final du skill
  assert.ok(stats.du.target >= 20);
  assert.equal(stats.bmu.cur, null);
});
t("weeklyVolume compte les 7 derniers jours seulement", () => {
  let s = st();
  s = M.recordSession(s, { d: "2026-03-01", items: [item("du", 20)], min: 5, res: {} }, "2026-03-01");
  s = M.recordSession(s, { d: "2026-01-01", items: [item("du", 20)], min: 9, res: {} }, "2026-01-01");
  const v = M.weeklyVolume(s, TODAY);
  assert.equal(v.sessions, 1);
  assert.equal(v.minutes, 5);
});

/* =====================================================================
   9. BLOC DE 8 SEMAINES
   ===================================================================== */
t("microWeek : 1 → 8 puis nouveau cycle", () => {
  const s = st({ start: "2026-01-01" });
  assert.deepEqual(M.microWeek(s, "2026-01-01"), { week: 1, cycle: 1 });
  assert.deepEqual(M.microWeek(s, "2026-01-07"), { week: 1, cycle: 1 });
  assert.deepEqual(M.microWeek(s, "2026-01-08"), { week: 2, cycle: 1 });
  assert.deepEqual(M.microWeek(s, "2026-02-25"), { week: 8, cycle: 1 });   // J+55
  assert.deepEqual(M.microWeek(s, "2026-02-26"), { week: 1, cycle: 2 });   // J+56
});
t("une date antérieure au départ ne casse pas le calcul", () => {
  const s = st({ start: "2026-03-02" });
  const w = M.microWeek(s, "2026-01-01");
  assert.ok(w.week >= 1 && w.week <= 8);
});

/* =====================================================================
   10. INTÉGRITÉ DES DONNÉES
   ===================================================================== */
t("chaque skill : 8 semaines de plan, 8 phases, drills existants", () => {
  M.SKILL_IDS.forEach(id => {
    const sk = M.SKILLS[id];
    assert.equal(sk.plan.length, 8, id + " : plan sur 8 semaines");
    assert.equal(sk.phase.length, 8, id + " : 8 phases");
    sk.plan.forEach(d => assert.ok(M.DRILLS[d], id + " → drill inconnu : " + d));
    assert.ok(Array.isArray(sk.tiers.steps) && sk.tiers.steps.length >= 3);
    for (let i = 1; i < sk.tiers.steps.length; i++)
      assert.ok(sk.tiers.steps[i] > sk.tiers.steps[i - 1], id + " : paliers non croissants");
    assert.ok(sk.tiers.start < sk.tiers.steps.length);
    assert.ok(sk.metrics.length >= 3, id + " : au moins 3 métriques suivies");
  });
});
t("chaque drill produit une dose valide à tous les paliers", () => {
  Object.keys(M.DRILLS).forEach(k => {
    const d = M.DRILLS[k];
    assert.ok(typeof d.n === "string" && d.n.length, k + " : nom manquant");
    assert.ok(typeof d.cue === "string" && d.cue.length, k + " : cue manquant");
    assert.ok(d.min >= 2 && d.min <= 5, k + " : durée hors bornes");
    [0, 1, 20, 100].forEach(v => {
      [true, false].forEach(red => {
        const dose = d.dose(v, red);
        assert.ok(dose.s >= 1, k + " : séries invalides");
        assert.ok(typeof dose.x === "string" && dose.x.length, k + " : schéma vide");
      });
    });
  });
});
t("les familles de renfort référencent des drills existants", () => {
  M.STRENGTH_FAMS.forEach(f => f.drills.forEach(d => {
    assert.ok(M.DRILLS[d], f.fam + " → drill inconnu : " + d);
    assert.equal(M.DRILLS[d].fam, f.fam, d + " : famille incohérente");
  }));
});
t("toutes les cibles de la table de conflit existent", () => {
  const known = new Set([...M.SKILL_IDS, ...M.STRENGTH_FAMS.map(f => f.fam)]);
  Object.keys(M.CONFLICTS).forEach(tag => {
    assert.ok(M.TAGS.some(x => x.id === tag), "tag orphelin dans CONFLICTS : " + tag);
    Object.keys(M.CONFLICTS[tag]).forEach(k =>
      assert.ok(known.has(k), tag + " → cible inconnue : " + k));
  });
});
t("chaque tag du catalogue a une règle de conflit", () => {
  M.TAGS.forEach(x => assert.ok(M.CONFLICTS[x.id], "tag sans règle : " + x.id));
});

/* =====================================================================
   11. ROBUSTESSE
   ===================================================================== */
t("état null / corrompu → normalisé sans planter", () => {
  [null, undefined, {}, { history: "nope", skills: 3 }, "x"].forEach(bad => {
    const s = M.normalizeState(bad, TODAY);
    assert.ok(Array.isArray(s.history));
    assert.equal(typeof s.skills, "object");
    assert.ok(!M.generate({ tags: [], fatigue: "green", minutes: 5, state: bad, todayISO: TODAY }).crash);
  });
});
t("entrées invalides → valeurs par défaut sûres", () => {
  const r = M.generate({ tags: ["bidon"], fatigue: "violet", minutes: 42, todayISO: TODAY, state: st() });
  assert.ok(r.none || r.items.reduce((a, i) => a + i.min, 0) <= 5);   // minutes → 5 par défaut
});

console.log("\n" + n + " tests OK");
