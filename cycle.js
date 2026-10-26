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
      if (!b.optional && !(typeof b.minutes === "number" && b.minutes >= 0)) throw `${sid} : durée manquante sur « ${b.title} ».`;
      if (b.kind === "strength") {
        if (!lifts[b.lift]) throw `${sid} : mouvement '${b.lift}' inconnu.`;
        if (!Array.isArray(b.sets) || !b.sets.length) throw `${sid} : séries manquantes.`;
        if (b.sets.some(x => !(typeof x.pct === "number" && x.pct > 0 && x.pct <= 110))) throw `${sid} : % de série invalide (nombre entre 1 et 110).`;
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
      if (typeof l.name !== "string" || !l.name.trim()) throw `${id} : nom requis.`;
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

  /* ---- max et charges ----
     athlete.maxes = { [liftId]: [{ kg, d:"AAAA-MM-JJ" }] }, plus récent en tête */
  const ROUND_KG = 2.5;
  const BELT_PCT = 80; // ceinture dès 80 % du max (dos à protéger)

  const loadKg = (maxKg, pct) => Math.round(maxKg * pct / 100 / ROUND_KG) * ROUND_KG;

  function latest(entries) {
    if (!Array.isArray(entries) || !entries.length) return null;
    return entries.reduce((a, b) => (b.d > a.d ? b : a));
  }

  function liftMax(cycle, maxes, liftId) {
    const own = latest((maxes || {})[liftId]);
    if (own) return { kg: own.kg, d: own.d, derived: false };
    const lift = (cycle.lifts || {})[liftId];
    if (!lift || !lift.derive) return null;
    const src = latest((maxes || {})[lift.derive.from]);
    if (!src) return null;
    return { kg: Math.round(src.kg * lift.derive.ratio * 10) / 10, d: src.d, derived: true };
  }

  function strengthLines(cycle, maxes, block) {
    const m = liftMax(cycle, maxes, block.lift);
    return (block.sets || []).map(s => ({
      sets: s.sets, reps: s.reps, pct: s.pct,
      kg: m && typeof s.pct === "number" ? loadKg(m.kg, s.pct) : null,
      belt: s.pct >= BELT_PCT
    }));
  }

  const newAthlete = () => ({ v: 1, maxes: {}, logs: {} });

  function setMax(athlete, liftId, kg, dateISO) {
    const list = (athlete.maxes[liftId] || []).filter(e => e.d !== dateISO);
    list.push({ kg, d: dateISO });
    list.sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : 0));
    athlete.maxes[liftId] = list;
    return athlete;
  }

  /* ---- semaine : file ordonnée de 4 séances, calée sur le calendrier ----
     log = journal d'un cycle : séances faites (datées), passées, décisions
     « rattraper » par semaine calendrier, scores, bonus faits.            */
  const newLog = () => ({ done: {}, skipped: [], decisions: {}, scores: {}, bonus: {} });
  function norm(log) {
    const base = newLog();
    Object.keys(base).forEach(k => { if (log[k] == null) log[k] = base[k]; });
    return log;
  }

  const sessionOrder = cycle => cycle.weeks.reduce((a, w) => a.concat(w.sessions.map(s => s.id)), []);
  const calendarWeek = (cycle, todayISO) => Math.floor((dayNum(todayISO) - dayNum(cycle.start)) / 7);

  function weekView(cycle, log, todayISO) {
    norm(log);
    const order = sessionOrder(cycle);
    const nW = cycle.weeks.length;
    const cw = calendarWeek(cycle, todayISO);
    const weekOf = i => Math.floor(i / SESSIONS_PER_WEEK);
    const closed = sid => !!log.done[sid] || log.skipped.includes(sid);
    let pos = order.findIndex(sid => !closed(sid));
    if (pos < 0) pos = order.length;

    const state = cw < 0 ? "upcoming" : pos === order.length ? "finished" : "active";
    // semaine affichée : celle de la file, sans dépasser la semaine calendrier
    // (semaine bouclée en avance → on la montre, la suivante reste verrouillée)
    const weekIndex = Math.max(0, Math.min(weekOf(pos), cw, nW - 1));
    const nextId = state === "active" && weekOf(pos) <= cw ? order[pos] : null;

    let decision = null;
    if (state === "active" && weekOf(pos) < cw && !log.decisions[cw]) {
      const missed = order.filter((sid, i) => weekOf(i) < cw && !closed(sid));
      decision = { cw, missed };
    }

    const week = cycle.weeks[weekIndex];
    const sessions = week.sessions.map(s => {
      const i = order.indexOf(s.id);
      const status = log.done[s.id] ? "done"
        : log.skipped.includes(s.id) ? "skipped"
        : s.id === nextId ? "next"
        : weekOf(i) > cw ? "locked" : "todo";
      return { id: s.id, title: s.title, status, date: log.done[s.id] || null };
    });
    const bonus = week.bonus ? { id: week.bonus.id, title: week.bonus.title, date: log.bonus[week.bonus.id] || null } : null;
    return { state, weekIndex, week, sessions, bonus, nextId, decision };
  }

  function markDone(log, sid, dateISO) {
    norm(log);
    log.done[sid] = dateISO;
    log.skipped = log.skipped.filter(x => x !== sid);
    return log;
  }

  function markBonus(log, bid, dateISO) {
    norm(log).bonus[bid] = dateISO;
    return log;
  }

  /* annuler un « fait » tapé par erreur : la séance reprend sa place dans la file */
  function unmarkDone(log, sid) { delete norm(log).done[sid]; return log; }
  function unmarkBonus(log, bid) { delete norm(log).bonus[bid]; return log; }

  function applyDecision(log, cycle, todayISO, choice) {
    const d = weekView(cycle, log, todayISO).decision;
    if (!d) return log;
    if (choice === "catchup") log.decisions[d.cw] = "catchup";
    if (choice === "skip") d.missed.forEach(sid => { if (!log.skipped.includes(sid)) log.skipped.push(sid); });
    return log;
  }

  /* ---- scores de metcon (repères, pas de ressenti) ----
     value = nombre comparable : secondes, reps, tours×1000 + reps, kg      */
  const NUM_MSG = "Un nombre est attendu.";
  function parseScore(type, text) {
    const s = String(text == null ? "" : text).trim().replace(/\s+/g, " ");
    if (type === "time") {
      const m = s.match(/^(\d{1,3}) ?(?::|'|’|′) ?(\d{2}) ?(?:''|"|″|’’|”)?$/);
      if (!m || +m[2] > 59) throw "Temps attendu au format mm:ss (ex. 12:30).";
      return { value: +m[1] * 60 + +m[2], text: `${+m[1]}:${m[2]}` };
    }
    if (type === "rounds_reps") {
      const m = s.match(/^(\d+) ?(?:tours?|rounds?|rds?|r)? ?(?:\+ ?(\d+)|(\d+))? ?(?:reps?)?$/i);
      if (!m) throw "Tours + reps attendus (ex. 5+8).";
      const rounds = +m[1], reps = +(m[2] || m[3] || 0);
      return { value: rounds * 1000 + reps, text: reps ? `${rounds} tours + ${reps}` : `${rounds} tours` };
    }
    if (type === "reps") {
      const m = s.match(/^(\d+) ?(?:reps?)?$/i);
      if (!m) throw NUM_MSG;
      return { value: +m[1], text: `${+m[1]} reps` };
    }
    if (type === "load") {
      const m = s.match(/^(\d+(?:[.,]\d+)?) ?(?:kg)?$/i);
      if (!m) throw NUM_MSG;
      const v = parseFloat(m[1].replace(",", "."));
      return { value: v, text: `${String(v).replace(".", ",")} kg` };
    }
    throw `Type de score '${type}' inconnu.`;
  }

  function recordScore(log, sid, level, score, dateISO, bench) {
    norm(log).scores[sid] = { level, value: score.value, text: score.text, d: dateISO, bench: bench || null };
    return log;
  }

  function previousScore(athlete, bench, beforeISO) {
    if (!bench) return null;
    let best = null;
    Object.values((athlete && athlete.logs) || {}).forEach(log => {
      Object.values((log && log.scores) || {}).forEach(s => {
        if (s.bench === bench && s.d < beforeISO && (!best || s.d > best.d)) best = s;
      });
    });
    return best ? { text: best.text, level: best.level, d: best.d } : null;
  }

  const API = {
    SCHEMA, SESSIONS_PER_WEEK, MAX_SESSION_MIN, SCORE_TYPES, ROUND_KG, BELT_PCT,
    validateCycle,
    loadKg, liftMax, strengthLines, newAthlete, setMax,
    newLog, sessionOrder, calendarWeek, weekView, markDone, markBonus, unmarkDone, unmarkBonus, applyDecision,
    parseScore, recordScore, previousScore
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.PLCycle = API;
})(typeof window !== "undefined" ? window : globalThis);
