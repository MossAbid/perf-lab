/* =====================================================================
   PERF LAB — PROGRAMMATION SUR MESURE (cycles perflab-cycle-v1)
   ---------------------------------------------------------------------
   Logique pure, sans DOM : chargée avant app.js dans le navigateur,
   et requirable telle quelle en Node pour les tests.

   Un cycle = semaines de 4 séances en file ordonnée (+ bonus facultatif).
   Charges = max × % arrondi au 2,5 kg ; metcons en deux niveaux RX / INT.
   Aucune saisie de ressenti : seuls les scores sont enregistrés.
   ===================================================================== */
(function (root) {
  "use strict";

  const SCHEMA = "perflab-cycle-v1";
  const SESSIONS_PER_WEEK = 4;
  const MAX_SESSION_MIN = 60;
  const SCORE_TYPES = ["time", "reps", "rounds_reps", "load"];
  const KINDS = ["warmup", "strength", "metcon", "accessory", "skill"];
  const PHASES = ["base", "montee", "surcharge", "decharge", "test"];

  /* ---- dates AAAA-MM-JJ en jours UTC (jamais de Date locale) ---- */
  const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
  function dayNum(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  }
  const isMonday = iso => (dayNum(iso) + 3) % 7 === 0; // 1970-01-01 = jeudi

  /* ---- validation du contenu ---- */
  function validateSession(s, lifts) {
    const sid = s.id;
    if (!Array.isArray(s.blocks) || !s.blocks.length) throw `${sid} : aucun bloc.`;
    if (s.blocks.filter(b => b.kind === "metcon").length > 1) throw `${sid} : un seul metcon par séance.`;
    const minutes = s.blocks.filter(b => !b.optional).reduce((a, b) => a + (Number(b.minutes) || 0), 0);
    if (minutes > MAX_SESSION_MIN) throw `${sid} : ${minutes} min (max ${MAX_SESSION_MIN}).`;
    s.blocks.forEach(b => {
      if (!KINDS.includes(b.kind)) throw `${sid} : type de bloc '${b.kind}' inconnu.`;
      if (b.kind === "strength") {
        if (!lifts[b.lift]) throw `${sid} : mouvement '${b.lift}' inconnu.`;
        if (!Array.isArray(b.sets) || !b.sets.length) throw `${sid} : séries manquantes.`;
      }
      if (b.kind === "metcon") {
        if (!b.levels || !b.levels.rx || !b.levels.int) throw `${sid} : niveaux RX et INT requis.`;
        if (!SCORE_TYPES.includes(b.score)) throw `${sid} : type de score '${b.score}' inconnu.`;
      }
    });
  }

  function validateCycle(c) {
    if (!c || typeof c !== "object") throw "JSON invalide.";
    if (c.schema !== SCHEMA) throw `Schéma attendu : ${SCHEMA}.`;
    if (!c.id || typeof c.id !== "string") throw "Champ 'id' (texte) requis.";
    if (typeof c.start !== "string" || !ISO_RE.test(c.start) || isNaN(dayNum(c.start))) throw "Champ 'start' (AAAA-MM-JJ) requis.";
    if (!isMonday(c.start)) throw `Le cycle doit commencer un lundi (start : ${c.start}).`;
    const lifts = c.lifts && typeof c.lifts === "object" ? c.lifts : null;
    if (!lifts) throw "Champ 'lifts' requis.";
    Object.keys(lifts).forEach(id => {
      const l = lifts[id] || {};
      if (l.derive && !lifts[l.derive.from]) throw `${id} : dérivé d'un mouvement inconnu '${l.derive.from}'.`;
      if (l.derive && !(l.derive.ratio > 0)) throw `${id} : ratio de dérivation invalide.`;
      if (l.video != null && !/^https:\/\//.test(l.video)) throw `${id} : vidéo https attendue.`;
    });
    if (!Array.isArray(c.weeks) || !c.weeks.length) throw "Au moins une semaine ('weeks').";
    const seen = new Set();
    const useId = id => {
      if (!id || typeof id !== "string") throw "Chaque séance a un 'id' (texte).";
      if (seen.has(id)) throw `identifiant '${id}' en double.`;
      seen.add(id);
    };
    c.weeks.forEach((w, i) => {
      const label = `Semaine ${w.n || i + 1}`;
      if (!PHASES.includes(w.phase)) throw `${label} : phase '${w.phase}' inconnue.`;
      if (!Array.isArray(w.sessions) || w.sessions.length !== SESSIONS_PER_WEEK) throw `${label} : ${SESSIONS_PER_WEEK} séances attendues.`;
      w.sessions.forEach(s => { useId(s.id); validateSession(s, lifts); });
      if (w.bonus) { useId(w.bonus.id); validateSession(w.bonus, lifts); }
    });
    return true;
  }

  const API = {
    SCHEMA, SESSIONS_PER_WEEK, MAX_SESSION_MIN, SCORE_TYPES,
    validateCycle
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.PLCycle = API;
})(typeof window !== "undefined" ? window : globalThis);
