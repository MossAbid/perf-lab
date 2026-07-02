/* =====================================================================
   PERF LAB — PROGRESSION CONDITIONNELLE (RPE) & SCHÉMA MULTI-PROFILS
   ---------------------------------------------------------------------
   Logique pure, sans DOM : chargée avant app.js dans le navigateur,
   et requirable telle quelle en Node pour les tests.

   Règle de progression (verrouillée) — RPE déclaré 0-10 après l'exercice :
     · toutes les séries prévues faites ET RPE ≤ 6  → palier supérieur
     · RPE 7-8                                      → maintien
     · RPE ≥ 9 OU douleur signalée                  → palier précédent
   ===================================================================== */
(function (root) {
  "use strict";

  const PROFILES = [
    { id: "moss",  name: "Moss"  },
    { id: "souad", name: "Souad" }
  ];
  const DEFAULT_PROFILE = "moss";

  /* ---- règle RPE → palier suivant ----
     tierIdx : indice du palier utilisé cette séance
     nTiers  : nombre de paliers de l'exercice
     rpe     : 0-10 (null/undefined = pas de saisie → maintien)
     pain    : douleur signalée (bool)
     allDone : toutes les séries prévues cochées (bool)               */
  function nextTier(tierIdx, nTiers, rpe, pain, allDone) {
    if (pain || (rpe != null && rpe >= 9)) return Math.max(0, tierIdx - 1);
    if (rpe == null) return tierIdx;
    if (rpe <= 6 && allDone) return Math.min(nTiers - 1, tierIdx + 1);
    return tierIdx; // RPE 7-8, ou séries incomplètes sans douleur
  }

  /* ---- paliers d'un exercice ----
     ex.tiers = { u:"kg"|"s"|"reps", steps:[...], start:<idx> }        */
  function tierLabel(tiers, idx) {
    if (!tiers || !Array.isArray(tiers.steps) || !tiers.steps.length) return "";
    const i = Math.max(0, Math.min(tiers.steps.length - 1, idx));
    const v = tiers.steps[i];
    const u = tiers.u === "s" ? "″" : (tiers.u ? " " + tiers.u : "");
    return v + u;
  }
  function startTier(tiers) {
    if (!tiers || !Array.isArray(tiers.steps)) return 0;
    const s = tiers.start | 0;
    return Math.max(0, Math.min(tiers.steps.length - 1, s));
  }

  /* ---- état de progression par profil ----
     progression = { [progId]: { [exKey]: { week, tier, next, hist:[{w,rpe,pain,tier}] } } }
     Palier effectif à la semaine w : si la dernière évaluation date
     d'une semaine antérieure, on applique le palier proposé (next).   */
  function effectiveTier(progression, progId, exKey, week, tiers) {
    const e = progression && progression[progId] && progression[progId][exKey];
    if (!e) return startTier(tiers);
    return (week > e.week && e.next != null) ? e.next : e.tier;
  }
  function recordRpe(progression, progId, exKey, week, tiers, rpe, pain, allDone) {
    progression[progId] = progression[progId] || {};
    const tier = effectiveTier(progression, progId, exKey, week, tiers);
    const n = tiers && tiers.steps ? tiers.steps.length : 1;
    const next = nextTier(tier, n, rpe, pain, allDone);
    const prev = progression[progId][exKey];
    const hist = (prev && prev.hist) || [];
    // une évaluation par (exercice, semaine) : la dernière saisie remplace
    const h = hist.filter(x => x.w !== week);
    h.push({ w: week, rpe: rpe, pain: !!pain, tier: tier });
    progression[progId][exKey] = { week: week, tier: tier, next: next, hist: h };
    return { tier: tier, next: next };
  }

  /* ---- schéma JSON ----
     ANCIEN (v1, un programme) : { id, title, sessions:[...] }
     NOUVEAU (v2, export/import global) :
       { schema:"perflab-profiles-v1",
         profiles:[ { id, name?, programs:[...], progress:{}, weeks:{}, progression:{} } ] } */
  function isProfilesDoc(o) {
    return !!(o && typeof o === "object" && Array.isArray(o.profiles));
  }
  function validateProgram(p) {
    if (!p || typeof p !== "object") throw "JSON invalide.";
    if (!p.id || typeof p.id !== "string") throw "Champ 'id' (texte) requis.";
    if (!p.title) throw "Champ 'title' requis.";
    if (!Array.isArray(p.sessions) || !p.sessions.length) throw "Au moins une séance ('sessions').";
    p.sessions.forEach((s, i) => { if (!Array.isArray(s.blocks)) throw `Séance ${i + 1} : 'blocks' manquant.`; });
    return true;
  }
  function validateProfilesDoc(doc) {
    if (!isProfilesDoc(doc)) throw "Document 'profiles' invalide.";
    if (!doc.profiles.length) throw "Aucun profil dans le document.";
    doc.profiles.forEach((pr, i) => {
      if (!pr.id || typeof pr.id !== "string") throw `Profil ${i + 1} : 'id' requis.`;
      (pr.programs || []).forEach(validateProgram);
    });
    return true;
  }

  /* ---- classification d'un JSON importé ----
     → { kind:"program", program }            (ancien format → profil Moss)
     → { kind:"profiles", doc }               (nouveau format)             */
  function classifyImport(o) {
    if (isProfilesDoc(o)) { validateProfilesDoc(o); return { kind: "profiles", doc: o }; }
    validateProgram(o);
    return { kind: "program", program: o };
  }

  /* ---- fusion d'un document profiles dans un état existant ----
     state = { [profileId]: { programs, progress, weeks, progression } }
     Les programmes sont remplacés par id ; progress/weeks/progression
     du document remplacent ceux du profil quand fournis.               */
  function mergeProfilesDoc(state, doc) {
    doc.profiles.forEach(pr => {
      const id = pr.id;
      const cur = state[id] || { programs: [], progress: {}, weeks: {}, progression: {} };
      (pr.programs || []).forEach(p => {
        const i = cur.programs.findIndex(x => x.id === p.id);
        if (i >= 0) cur.programs[i] = p; else cur.programs.push(p);
      });
      if (pr.progress)    cur.progress    = pr.progress;
      if (pr.weeks)       cur.weeks       = pr.weeks;
      if (pr.progression) cur.progression = pr.progression;
      state[id] = cur;
    });
    return state;
  }

  const API = {
    PROFILES, DEFAULT_PROFILE,
    nextTier, tierLabel, startTier, effectiveTier, recordRpe,
    isProfilesDoc, validateProgram, validateProfilesDoc, classifyImport, mergeProfilesDoc
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.PLProgression = API;
})(typeof window !== "undefined" ? window : globalThis);
