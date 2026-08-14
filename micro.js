/* =====================================================================
   PERF LAB — ADAPTIVE MICRO-PROGRAM
   ---------------------------------------------------------------------
   Logique pure, sans DOM : chargée après progression.js dans le navigateur,
   et requirable telle quelle en Node pour les tests.

   Principe : MINIMUM EFFECTIVE DOSE · MAXIMUM CONSISTENCY.
   L'utilisateur déclare le contenu de sa séance WYS du jour, sa fatigue
   et le temps dont il dispose ; le moteur choisit la plus petite dose
   utile — ou répond « rien aujourd'hui ». Ce n'est JAMAIS un 2e entraînement.

   La progression de difficulté réutilise telle quelle la règle RPE de
   progression.js (paliers `tiers`) — aucune règle parallèle ici.
   ===================================================================== */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------------
     1. CATALOGUE WYS — ce que l'utilisateur peut cocher
     ------------------------------------------------------------------ */
  const TAGS = [
    { id: "heavy_pull",  label: "Heavy Pulling",        g: "Tirage"     },
    { id: "pullups",     label: "Pull-ups",             g: "Tirage"     },
    { id: "bmu",         label: "BMU",                  g: "Tirage"     },
    { id: "ttb",         label: "TTB",                  g: "Tirage"     },
    { id: "hspu",        label: "HSPU",                 g: "Gymnastique"},
    { id: "handstand",   label: "Handstand",            g: "Gymnastique"},
    { id: "overhead",    label: "Overhead",             g: "Gymnastique"},
    { id: "heavy_squat", label: "Heavy Squat",          g: "Force"      },
    { id: "deadlift",    label: "Deadlift",             g: "Force"      },
    { id: "oly",         label: "Olympic Lifting",      g: "Force"      },
    { id: "grip",        label: "High Grip",            g: "Force"      },
    { id: "du",          label: "Double Unders",        g: "Engine"     },
    { id: "metcon",      label: "High Intensity Metcon",g: "Engine"     },
    { id: "lower_vol",   label: "Lower Body Volume",    g: "Volume"     },
    { id: "upper_vol",   label: "Upper Body Volume",    g: "Volume"     },
    { id: "core",        label: "Core",                 g: "Volume"     }
  ];

  const FATIGUE = [
    { id: "green",  label: "Green",  sub: "Fresh",    dot: "#4de0a6" },
    { id: "yellow", label: "Yellow", sub: "Normal",   dot: "#ffb02e" },
    { id: "red",    label: "Red",    sub: "Fatigued", dot: "#ff4d3d" }
  ];

  const TIMES = [3, 5, 7, 10];

  /* ------------------------------------------------------------------
     2. TABLE DE CONFLIT — données, pas de if/else en cascade
     ------------------------------------------------------------------
     Pénalité par cible : 1 = dose réduite · 2 = on retire du jour.
     Les pénalités s'additionnent, plafonnées à 2.
     Cibles : les 4 skills (bmu, du, ttb, hsw) + les familles de renfort
     (sho = épaules/scapulas, post = chaîne postérieure, core, pull,
      uni = unilatéral, grip).                                          */
  const CONFLICTS = {
    heavy_pull:  { bmu: 2, ttb: 1, pull: 2, grip: 1 },
    pullups:     { bmu: 2, ttb: 1, pull: 2 },
    bmu:         { bmu: 2, ttb: 1, pull: 1 },
    ttb:         { ttb: 2, core: 1, grip: 1 },
    hspu:        { hsw: 2, sho: 1 },
    handstand:   { hsw: 2, sho: 1 },
    overhead:    { hsw: 1, sho: 2 },
    heavy_squat: { post: 2, uni: 2 },
    deadlift:    { post: 2, grip: 1, ttb: 1 },
    oly:         { post: 1, sho: 1, hsw: 1 },
    grip:        { bmu: 1, ttb: 1, du: 1, grip: 2 },
    du:          { du: 2 },
    metcon:      { bmu: 1, du: 1, ttb: 1, hsw: 1, sho: 1, post: 1, core: 1, pull: 1, uni: 1, grip: 1 },
    lower_vol:   { post: 2, uni: 2 },
    upper_vol:   { bmu: 1, pull: 2, sho: 1 },
    core:        { core: 2, ttb: 1 }
  };

  /* Un metcon très intense combiné à du grip/tirage lourd = journée où la
     bonne réponse est souvent « rien ». Ces tags comptent comme « dure ». */
  const HARD_TAGS = ["metcon", "heavy_pull", "deadlift", "oly", "heavy_squat"];

  /* ------------------------------------------------------------------
     3. DRILLS
     ------------------------------------------------------------------
     dose(v, red) : v = valeur du palier courant, red = dose réduite.
     Retourne { s: séries, x: schéma affiché, tip? }.
     min = minutes consommées à dose pleine (dose réduite : min - 1).    */
  const DRILLS = {
    /* ---------------- BAR MUSCLE-UP ---------------- */
    bmu_swing: {
      n: "Kip swing + arch/hollow", anim: "hang", min: 3,
      cue: "Épaules actives, amplitude franche. Tu cherches la corde du swing, pas la vitesse.",
      dose: (v, red) => ({ s: red ? 3 : 4, x: "6 swings", tip: "repos 30″" })
    },
    bmu_trans: {
      n: "Transition assistée (élastique)", anim: "pullup", min: 4,
      cue: "Hanches à la barre puis passage lent. Zéro échec : si la transition casse, monte l'assistance.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "3 transitions", tip: "repos 45″" })
    },
    bmu_hp: {
      n: "High pull explosif (chest-to-bar+)", anim: "explo", min: 3,
      cue: "Tire le plus haut possible sur la barre. Vitesse maximale, 3 reps max par série.",
      dose: (v, red) => ({ s: red ? 3 : 5, x: "3 reps", tip: "repos 45″ — arrête si la hauteur baisse" })
    },
    bmu_turn: {
      n: "Jumping BMU — turnover", anim: "explo", min: 4,
      cue: "Saut modéré, tout le focus sur le passage rapide des poignets. Le turnover doit être net.",
      dose: (v, red) => ({ s: red ? 3 : 4, x: "3 reps", tip: "repos 45″" })
    },
    bmu_single: {
      n: "BMU — singles propres", anim: "explo", min: 4,
      cue: "1 rep, repos, 1 rep. Chaque rep doit ressembler à la première. Aucune tentative en échec.",
      dose: (v, red) => ({ s: red ? 3 : 5, x: "1 rep", tip: "EMOM — coupe dès que la qualité baisse" })
    },
    bmu_multi: {
      n: "BMU — séries enchaînées", anim: "explo", min: 5,
      cue: "Enchaîne uniquement ce qui reste propre. Objectif du jour : " + "des séries identiques, pas un record.",
      dose: (v, red) => ({ s: red ? 2 : 4, x: v + " rep" + (v > 1 ? "s" : ""), tip: "repos 60-90″" })
    },

    /* ---------------- DOUBLE UNDERS ---------------- */
    du_rhythm: {
      n: "Single-double alternés", anim: "pulse", min: 3,
      cue: "Poignets, pas les bras. Coudes près du corps, respiration continue. Cherche le relâchement.",
      dose: (v, red) => ({ s: red ? 3 : 4, x: "30″ de travail", tip: "repos 30″" })
    },
    du_submax: {
      n: "DU — séries submaximales", anim: "pulse", min: 4,
      cue: "Séries volontairement en dessous de ton max : tu construis la répétabilité, pas le record.",
      dose: (v, red) => {
        const r = Math.max(10, Math.round(v * (red ? 0.5 : 0.7) / 5) * 5);
        return { s: red ? 3 : 5, x: r + " DU", tip: "repos 45″ — coupe la série avant l'accroc" };
      }
    },
    du_density: {
      n: "DU — EMOM densité", anim: "pulse", min: 5,
      cue: "Même volume chaque minute. La qualité de la dernière minute doit valoir celle de la première.",
      dose: (v, red) => {
        const r = Math.max(10, Math.round(v * (red ? 0.45 : 0.6) / 5) * 5);
        return { s: red ? 3 : 5, x: r + " DU / min", tip: "EMOM — le repos est ce qui reste dans la minute" };
      }
    },
    du_ub: {
      n: "DU — tentative unbroken", anim: "pulse", min: 4,
      cue: "UNE tentative franche, à froid. Puis on redescend en submaximal. Respire pendant, ne bloque pas.",
      dose: (v, red) => ({ s: 1, x: "max unbroken (cible " + v + ")", tip: "puis 2 × " + Math.round(v * 0.5) + " DU" })
    },
    du_fatigue: {
      n: "DU sous fatigue légère", anim: "pulse", min: 5,
      cue: "10 air squats puis la série. Objectif : garder la technique quand la respiration monte.",
      dose: (v, red) => {
        const r = Math.max(10, Math.round(v * (red ? 0.4 : 0.55) / 5) * 5);
        return { s: red ? 2 : 4, x: "10 air squats + " + r + " DU", tip: "repos 60″" };
      }
    },

    /* ---------------- TOES-TO-BAR ---------------- */
    ttb_swing: {
      n: "Arch/hollow + kip vide", anim: "hang", min: 3,
      cue: "Le balancier avant les pointes. Épaules actives, bassin qui pilote. Rien dans les bras.",
      dose: (v, red) => ({ s: red ? 3 : 4, x: "8 swings", tip: "repos 30″" })
    },
    ttb_submax: {
      n: "TTB — séries submaximales", anim: "hang", min: 4,
      cue: "Tu t'arrêtes 2-3 reps avant l'accroc. C'est le volume propre accumulé qui construit l'endurance.",
      dose: (v, red) => {
        const r = Math.max(5, Math.round(v * (red ? 0.45 : 0.6)));
        return { s: red ? 3 : 5, x: r + " TTB", tip: "repos 60″ — grip et fléchisseurs de hanche d'abord" };
      }
    },
    ttb_density: {
      n: "TTB — EMOM densité", anim: "hang", min: 5,
      cue: "Volume identique chaque minute. Si une minute casse, tu arrêtes l'EMOM — pas de rattrapage.",
      dose: (v, red) => {
        const r = Math.max(4, Math.round(v * (red ? 0.35 : 0.5)));
        return { s: red ? 3 : 5, x: r + " TTB / min", tip: "EMOM" };
      }
    },
    ttb_grip: {
      n: "TTB + gestion du grip", anim: "hang", min: 5,
      cue: "Séries courtes très rapprochées : on entraîne la récupération du grip, pas la souffrance.",
      dose: (v, red) => {
        const r = Math.max(4, Math.round(v * 0.4));
        return { s: red ? 4 : 6, x: r + " TTB", tip: "repos 30″ seulement" };
      }
    },
    ttb_ub: {
      n: "TTB — tentative unbroken", anim: "hang", min: 4,
      cue: "Une seule tentative, à froid. Tu coupes dès que les pointes ne touchent plus franchement.",
      dose: (v, red) => ({ s: 1, x: "max unbroken (cible " + v + ")", tip: "puis 2 × " + Math.max(3, Math.round(v * 0.4)) + " TTB" })
    },

    /* ---------------- HANDSTAND WALK ---------------- */
    hsw_kick: {
      n: "Kick-up au mur — régularité", anim: "hold", min: 3,
      cue: "Même jambe, même impulsion, arrivée douce. Tu construis un réflexe, pas un effort.",
      dose: (v, red) => ({ s: red ? 5 : 8, x: "1 kick-up", tip: "repos complet entre chaque" })
    },
    hsw_wall: {
      n: "Face wall hold + shoulder taps", anim: "hold", min: 4,
      cue: "Ventre au mur, côtes fermées, pousse le sol. Les taps restent minuscules et lents.",
      dose: (v, red) => ({ s: red ? 3 : 4, x: "20-30″ hold + 4 taps", tip: "repos 45″" })
    },
    hsw_shift: {
      n: "Weight shift latéral", anim: "hold", min: 4,
      cue: "Transfert lent d'une main à l'autre sans bouger les pieds. C'est ici que naît le déplacement.",
      dose: (v, red) => ({ s: red ? 3 : 4, x: "6 transferts", tip: "repos 45″" })
    },
    hsw_free: {
      n: "Kick-up libre + hold", anim: "hold", min: 4,
      cue: "Loin du mur, tu cherches l'équilibre puis tu sors proprement. Zéro tentative sous fatigue.",
      dose: (v, red) => ({ s: red ? 4 : 6, x: "1 kick-up + hold max", tip: "repos complet — arrête après 2 échecs de suite" })
    },
    hsw_steps: {
      n: "Premiers pas", anim: "hold", min: 5,
      cue: "2-4 pas puis sortie contrôlée. Regard entre les mains, hanches empilées.",
      dose: (v, red) => ({ s: red ? 4 : 6, x: "2-4 pas", tip: "repos complet" })
    },
    hsw_walk: {
      n: "Handstand walk — distance", anim: "hold", min: 5,
      cue: "Séries courtes et fraîches. Une distance propre vaut mieux que trois tentatives cassées.",
      dose: (v, red) => ({ s: red ? 3 : 5, x: v + " m", tip: "repos complet entre les essais" })
    },

    /* ---------------- RENFORCEMENT (longévité) ---------------- */
    st_sho: {
      n: "Prone Y-T-W + band pull-apart", anim: "raise", min: 3, fam: "sho",
      cue: "Charge dérisoire, amplitude complète. Scapulas qui glissent, cou détendu.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "8 Y + 8 T + 12 pull-apart", tip: "repos 45″" })
    },
    st_sho2: {
      n: "Bottoms-up KB press", anim: "press", min: 3, fam: "sho",
      cue: "Léger. La stabilité du poignet et de l'épaule est le seul objectif.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "6 reps / bras", tip: "repos 45″" })
    },
    st_post: {
      n: "Nordic curl excentrique", anim: "hold", min: 4, fam: "post",
      cue: "Descente 4-5″ contrôlée, remontée assistée aux mains. Ischios en excentrique, rien d'autre.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "4 reps", tip: "repos 60″" })
    },
    st_post2: {
      n: "RDL unilatéral (léger)", anim: "hold", min: 4, fam: "post",
      cue: "Dos neutre, bassin fermé. Tu sens la chaîne postérieure, pas le bas du dos.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "8 reps / jambe", tip: "repos 45″" })
    },
    st_core: {
      n: "Hollow hold + side plank", anim: "crunch", min: 3, fam: "core",
      cue: "Lombaires plaquées au sol. Tu casses la série dès que le bas du dos décolle.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "20-30″ hollow + 30″ / côté", tip: "repos 30″" })
    },
    st_pull: {
      n: "Ring row — tempo", anim: "row", min: 4, fam: "pull",
      cue: "Tirage 1″, tenue 1″, retour 3″. Corps en planche du talon à la nuque.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "8-10 reps", tip: "repos 60″" })
    },
    st_uni: {
      n: "Split squat bulgare (léger)", anim: "hold", min: 4, fam: "uni",
      cue: "Charge modérée, genou aligné. Travail de contrôle, pas de charge maximale.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "8 reps / jambe", tip: "repos 60″" })
    },
    st_grip: {
      n: "Dead hang + farmer carry", anim: "carry", min: 3, fam: "grip",
      cue: "Épaules engagées en suspension. Marche haute, côtes fermées.",
      dose: (v, red) => ({ s: red ? 2 : 3, x: "30″ hang + 20 m carry", tip: "repos 45″" })
    },

    /* ---------------- MOBILITÉ (uniquement si directement pertinent) ---- */
    mob_sho: {
      n: "Ouverture épaules + thoracique", anim: "rotate", min: 3, fam: "mob",
      cue: "Respiration lente, pas de forçage. Complète la mobilité WYS, ne la remplace pas.",
      dose: (v, red) => ({ s: 1, x: "3 min guidées", tip: "PVC pass-through, thoracic opener, hang passif" })
    },
    mob_hip: {
      n: "Hanches + chevilles", anim: "rotate", min: 3, fam: "mob",
      cue: "Couplet 90/90 et dorsiflexion. Respire dans la position, ne pousse pas.",
      dose: (v, red) => ({ s: 1, x: "3 min guidées", tip: "90/90, couch stretch, knee-to-wall" })
    },
    mob_hang: {
      n: "Décompression — hang passif", anim: "hang", min: 3, fam: "mob",
      cue: "Suspension relâchée, respiration ample. Rien à serrer.",
      dose: (v, red) => ({ s: 3, x: "30-45″", tip: "repos libre" })
    }
  };

  /* ------------------------------------------------------------------
     4. SKILLS — paliers (format `tiers` de progression.js) + plan 8 semaines
     ------------------------------------------------------------------ */
  const SKILLS = {
    bmu: {
      id: "bmu", name: "Bar Muscle-Up", short: "BMU", prio: 100, accent: "#ffb02e",
      unit: "reps", goal: "Plusieurs reps propres enchaînées",
      tiers: { u: "reps", steps: [1, 2, 3, 4, 5, 6, 8], start: 0 },
      metrics: [
        { k: "ub",    label: "Best unbroken", ph: "reps" },
        { k: "total", label: "Total reps",    ph: "reps" },
        { k: "q",     label: "Quality",       ph: "1-5", max: 5 }
      ],
      plan: ["bmu_swing", "bmu_trans", "bmu_hp", "bmu_turn", "bmu_single", "bmu_single", "bmu_multi", "bmu_multi"],
      phase: ["Transition", "Transition", "Puissance de tirage", "Turnover", "Singles propres", "Singles densifiés", "Doubles", "Doubles / triples"]
    },
    du: {
      id: "du", name: "Double Unders", short: "DU", prio: 95, accent: "#4de0a6",
      unit: "reps", goal: "50 puis 100 unbroken",
      tiers: { u: "reps", steps: [20, 25, 30, 35, 40, 50, 60, 75, 100], start: 0 },
      metrics: [
        { k: "ub",     label: "Best unbroken", ph: "reps" },
        { k: "total",  label: "Total reps",    ph: "reps" },
        { k: "breaks", label: "Breaks",        ph: "nb"   }
      ],
      plan: ["du_rhythm", "du_submax", "du_density", "du_submax", "du_density", "du_ub", "du_fatigue", "du_ub"],
      phase: ["Relâchement & rythme", "Submaximal", "Densité", "Volume submaximal", "Densité", "Test unbroken", "Sous fatigue", "Test unbroken"]
    },
    ttb: {
      id: "ttb", name: "Toes-to-Bar", short: "TTB", prio: 80, accent: "#4dd2ff",
      unit: "reps", goal: "Endurance & volume propre",
      tiers: { u: "reps", steps: [10, 12, 15, 18, 20, 25, 30], start: 2 },
      metrics: [
        { k: "ub",    label: "Best unbroken", ph: "reps" },
        { k: "total", label: "Total reps",    ph: "reps" },
        { k: "sets",  label: "Séries",        ph: "nb"   }
      ],
      plan: ["ttb_swing", "ttb_submax", "ttb_density", "ttb_submax", "ttb_density", "ttb_submax", "ttb_grip", "ttb_ub"],
      phase: ["Kip & hollow", "Submaximal", "Densité", "Volume submaximal", "Densité", "Volume submaximal", "Grip", "Test unbroken"]
    },
    hsw: {
      id: "hsw", name: "Handstand Walk", short: "HSW", prio: 75, accent: "#a78bfa",
      unit: "m", goal: "Équilibre, contrôle, distance",
      tiers: { u: "m", steps: [3, 5, 8, 10, 15, 20, 25], start: 0 },
      metrics: [
        { k: "ub",    label: "Best distance", ph: "m"  },
        { k: "total", label: "Total distance",ph: "m"  },
        { k: "sets",  label: "Tentatives",    ph: "nb" }
      ],
      plan: ["hsw_kick", "hsw_wall", "hsw_shift", "hsw_free", "hsw_wall", "hsw_steps", "hsw_walk", "hsw_walk"],
      phase: ["Kick-up", "Balance au mur", "Weight shift", "Kick-up libre", "Shoulder control", "Premiers pas", "Distance", "Distance"]
    }
  };
  const SKILL_IDS = ["bmu", "du", "ttb", "hsw"];

  /* familles de renfort : ordre = priorité par défaut (longévité) */
  const STRENGTH_FAMS = [
    { fam: "sho",  label: "Épaules / scapulas",  drills: ["st_sho", "st_sho2"] },
    { fam: "post", label: "Chaîne postérieure",  drills: ["st_post", "st_post2"] },
    { fam: "core", label: "Gainage",             drills: ["st_core"] },
    { fam: "pull", label: "Tirage",              drills: ["st_pull"] },
    { fam: "uni",  label: "Unilatéral",          drills: ["st_uni"] },
    { fam: "grip", label: "Grip",                drills: ["st_grip"] }
  ];

  /* nombre maximum d'items selon le temps — garde-fou anti « 2e séance » */
  const MAX_ITEMS = { 3: 1, 5: 2, 7: 2, 10: 3 };

  /* ------------------------------------------------------------------
     5. ÉTAT PERSISTANT
     ------------------------------------------------------------------
     { v, start:"AAAA-MM-JJ", skills:{ [skillId]: {week,tier,next,hist} },
       history:[ {d, tags, fatigue, min, items, res, rpe, pain} ] }
     `skills` a EXACTEMENT la forme de progression[progId] : les fonctions
     de progression.js s'y appliquent sans adaptation.                   */
  const STATE_V = 1;
  const HISTORY_MAX = 400;

  function newState(todayISO) {
    return { v: STATE_V, start: todayISO, skills: {}, history: [] };
  }
  function normalizeState(s, todayISO) {
    const st = (s && typeof s === "object") ? s : {};
    return {
      v: STATE_V,
      start: st.start || todayISO,
      skills: st.skills && typeof st.skills === "object" ? st.skills : {},
      history: Array.isArray(st.history) ? st.history : []
    };
  }

  /* ---- semaine du bloc de 8 (cycle infini, jamais bloqué) ---- */
  function daysBetween(aISO, bISO) {
    const a = Date.parse(aISO + "T00:00:00Z"), b = Date.parse(bISO + "T00:00:00Z");
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.floor((b - a) / 864e5);
  }
  function microWeek(state, todayISO) {
    const d = Math.max(0, daysBetween(state.start || todayISO, todayISO));
    const n = Math.floor(d / 7);
    return { week: (n % 8) + 1, cycle: Math.floor(n / 8) + 1 };
  }

  /* ---- palier courant d'un skill (délègue à progression.js) ----
     `state.skills` a la forme de progression[progId] : on l'enveloppe pour
     réutiliser effectiveTier tel quel, sans variante de la règle RPE.     */
  function tierOf(state, skillId, week) {
    const P = root.PLProgression;
    const sk = SKILLS[skillId];
    if (!P || !sk) return 0;
    return P.effectiveTier({ skills: (state && state.skills) || {} }, "skills", skillId, week, sk.tiers);
  }
  function tierValue(state, skillId, week) {
    const sk = SKILLS[skillId];
    if (!sk) return 0;
    const i = tierOf(state, skillId, week);
    return sk.tiers.steps[Math.max(0, Math.min(sk.tiers.steps.length - 1, i))];
  }

  /* ------------------------------------------------------------------
     6. MOTEUR D'ADAPTATION
     ------------------------------------------------------------------ */

  /* pénalités cumulées par cible, à partir des tags WYS cochés */
  function penalties(tags) {
    const out = {};
    (tags || []).forEach(t => {
      const c = CONFLICTS[t];
      if (!c) return;
      Object.keys(c).forEach(k => { out[k] = Math.min(2, (out[k] || 0) + c[k]); });
    });
    return out;
  }

  /* jours écoulés depuis la dernière fois qu'un skill a été travaillé */
  function daysSince(state, skillId, todayISO) {
    const h = state.history || [];
    for (let i = h.length - 1; i >= 0; i--) {
      if ((h[i].items || []).some(it => it.skill === skillId)) return daysBetween(h[i].d, todayISO);
    }
    return 99;
  }

  /* mobilité pertinente selon la séance déclarée (jamais un substitut à WYS) */
  function mobilityFor(tags) {
    const t = tags || [];
    if (t.includes("overhead") || t.includes("hspu") || t.includes("handstand") || t.includes("oly")) return "mob_sho";
    if (t.includes("heavy_squat") || t.includes("lower_vol") || t.includes("deadlift")) return "mob_hip";
    if (t.includes("heavy_pull") || t.includes("pullups") || t.includes("ttb") || t.includes("grip")) return "mob_hang";
    return "mob_sho";
  }

  function buildItem(skillId, drillId, red, state, week) {
    const d = DRILLS[drillId];
    const sk = SKILLS[skillId] || null;
    const v = sk ? tierValue(state, skillId, week) : 0;
    const dose = d.dose(v, red);
    return {
      skill: skillId, drill: drillId, name: d.n, anim: d.anim || "pulse",
      cue: d.cue, sets: dose.s, scheme: dose.x, tip: dose.tip || "",
      min: red ? Math.max(2, d.min - 1) : d.min,
      reduced: !!red,
      tier: sk ? tierOf(state, skillId, week) : null,
      target: sk ? v : null
    };
  }

  /* generate({tags, fatigue, minutes, todayISO, state})
     → { week, cycle, items:[…], notes:[…] }
     → { week, cycle, items:[], none:true, why:"…" }                     */
  function generate(opt) {
    const todayISO = opt.todayISO;
    const state = normalizeState(opt.state, todayISO);
    const tags = Array.isArray(opt.tags) ? opt.tags.filter(t => CONFLICTS[t]) : [];
    const fatigue = FATIGUE.some(f => f.id === opt.fatigue) ? opt.fatigue : "yellow";
    const minutes = TIMES.includes(+opt.minutes) ? +opt.minutes : 5;
    const { week, cycle } = microWeek(state, todayISO);

    const pen = penalties(tags);
    const notes = [];
    const hardCount = tags.filter(t => HARD_TAGS.includes(t)).length;

    /* ---- FATIGUE ROUGE : 3-5 min, technique légère ou mobilité, rien d'autre ---- */
    if (fatigue === "red") {
      const budget = Math.min(minutes, 5);
      if (tags.includes("metcon") || hardCount >= 2) {
        return {
          week, cycle, items: [], none: true,
          why: "Fatigue rouge après une séance dure. Le meilleur choix aujourd'hui est de récupérer — la constance se joue sur les semaines, pas sur cette session."
        };
      }
      const mob = mobilityFor(tags);
      const it = buildItem(null, mob, true, state, week);
      it.skill = "mob"; it.min = Math.min(budget, it.min);
      notes.push("Fatigue rouge : mobilité et respiration uniquement, aucune charge nerveuse.");
      return { week, cycle, items: [it], notes };
    }

    /* ---- candidats skills ---- */
    const cands = [];
    SKILL_IDS.forEach(id => {
      const p = pen[id] || 0;
      if (p >= 2) { notes.push(SKILLS[id].short + " retiré : déjà couvert par ta séance WYS."); return; }
      const ds = daysSince(state, id, todayISO);
      let score = SKILLS[id].prio - p * 45;
      if (ds >= 7) score += 20;          // trop longtemps sans y toucher
      else if (ds <= 1) score -= 30;     // fait hier ou aujourd'hui
      if (fatigue === "yellow" && (id === "bmu" || id === "hsw")) score -= 15; // skills coûteux en SNC
      cands.push({ kind: "skill", id, score, red: p >= 1 || fatigue === "yellow" });
    });

    /* ---- candidat renfort : la famille la moins pénalisée ---- */
    let bestFam = null;
    STRENGTH_FAMS.forEach(f => {
      const p = pen[f.fam] || 0;
      if (p >= 2) return;
      const sc = 40 - p * 25 + (f.fam === "sho" || f.fam === "post" ? 6 : 0);
      if (!bestFam || sc > bestFam.score) bestFam = { kind: "strength", fam: f, score: sc, red: p >= 1 || fatigue === "yellow" };
    });
    if (bestFam) cands.push(bestFam);

    /* ---- metcon très intense : technique légère uniquement ---- */
    const lightOnly = tags.includes("metcon") && hardCount >= 2;
    if (lightOnly) notes.push("Metcon intense : on reste sur de la technique légère, aucune accumulation.");

    cands.sort((a, b) => b.score - a.score);

    /* ---- remplissage du budget ---- */
    let budget = minutes;
    if (fatigue === "yellow") budget = Math.max(3, minutes - 1);
    const cap = MAX_ITEMS[minutes] || 2;
    const items = [];
    const usedFams = new Set();

    for (const c of cands) {
      if (items.length >= cap) break;
      let it;
      if (c.kind === "skill") {
        const sk = SKILLS[c.id];
        const drillId = sk.plan[(week - 1) % sk.plan.length];
        it = buildItem(c.id, drillId, c.red || lightOnly, state, week);
      } else {
        if (usedFams.has(c.fam.fam)) continue;
        const drillId = c.fam.drills[(week - 1) % c.fam.drills.length];
        it = buildItem(null, drillId, c.red || lightOnly, state, week);
        it.skill = "strength"; it.fam = c.fam.fam; it.famLabel = c.fam.label;
        usedFams.add(c.fam.fam);
      }
      if (it.min > budget) continue;
      items.push(it);
      budget -= it.min;
      if (budget < 2) break;
    }

    if (!items.length) {
      return {
        week, cycle, items: [], none: true,
        why: tags.length
          ? "Ta séance WYS couvre déjà tout ce sur quoi tu progresses aujourd'hui. Ajouter du volume ne t'apporterait que de la fatigue."
          : "Pas assez de temps pour une dose utile. Mieux vaut rien qu'une demi-mesure."
      };
    }
    if (items.length === 1 && minutes >= 7) notes.push("Une seule entrée : c'est la dose minimale efficace pour aujourd'hui.");
    return { week, cycle, items, notes };
  }

  /* ------------------------------------------------------------------
     7. ENREGISTREMENT — progression conservatrice via la règle RPE
     ------------------------------------------------------------------
     session = { d, tags, fatigue, min, items, res:{ [skill]:{ub,total,…} },
                 rpe, pain }
     Un palier ne monte QUE si : cible atteinte + RPE ≤ 6 + aucune douleur
     + qualité ≥ 3 (BMU). Sinon maintien, et régression si RPE ≥ 9/douleur.
     C'est strictement `nextTier` de progression.js — aucune règle nouvelle. */
  function metTarget(skillId, res, item) {
    if (!res || res.ub == null || res.ub === "") return false;
    if (skillId === "bmu" && res.q != null && res.q !== "" && +res.q < 3) return false; // technique dégradée
    return +res.ub >= (item && item.target != null ? item.target : Infinity);
  }

  function recordSession(state0, session, todayISO) {
    const P = root.PLProgression;
    const state = normalizeState(state0, todayISO);
    const d = session.d || todayISO;
    const { week } = microWeek(state, d);
    const container = { skills: state.skills };

    (session.items || []).forEach(it => {
      if (!SKILLS[it.skill]) return;                 // renfort / mobilité : pas de palier
      const res = (session.res || {})[it.skill];
      if (!res || (res.ub == null || res.ub === "")) return; // rien saisi → on ne juge pas
      const ok = metTarget(it.skill, res, it);
      P.recordRpe(container, "skills", it.skill, week, SKILLS[it.skill].tiers,
        session.rpe == null || session.rpe === "" ? null : +session.rpe,
        !!session.pain, ok);
    });
    state.skills = container.skills;

    const entry = {
      d: d, tags: session.tags || [], fatigue: session.fatigue || "yellow",
      min: session.min || 0, items: (session.items || []).map(it => ({
        skill: it.skill, drill: it.drill, name: it.name, scheme: it.scheme,
        sets: it.sets, min: it.min, target: it.target
      })),
      res: session.res || {},
      rpe: session.rpe == null || session.rpe === "" ? null : +session.rpe,
      pain: !!session.pain
    };
    const hist = (state.history || []).filter(e => e.d !== d);
    hist.push(entry);
    hist.sort((a, b) => a.d < b.d ? -1 : 1);
    state.history = hist.slice(-HISTORY_MAX);
    return state;
  }

  /* ------------------------------------------------------------------
     8. STATISTIQUES — dashboard « Skill Progress »
     ------------------------------------------------------------------ */
  function skillStats(state0, todayISO) {
    const state = normalizeState(state0, todayISO);
    const { week } = microWeek(state, todayISO);
    const out = {};
    SKILL_IDS.forEach(id => {
      const sk = SKILLS[id];
      let cur = null, best = null, week7 = 0, sessions = 0;
      (state.history || []).forEach(e => {
        const r = (e.res || {})[id];
        if (!r) return;
        if (r.ub != null && r.ub !== "") {
          cur = +r.ub;                                    // dernier relevé chronologique
          best = best == null ? +r.ub : Math.max(best, +r.ub);
        }
        if (daysBetween(e.d, todayISO) < 7) {
          week7 += (r.total != null && r.total !== "") ? +r.total : 0;
          sessions++;
        }
      });
      const entry = state.skills[id];
      out[id] = {
        id, name: sk.name, short: sk.short, unit: sk.tiers.u, accent: sk.accent, goal: sk.goal,
        cur, best,
        target: sk.tiers.steps[tierOf(state, id, week)],
        final: sk.tiers.steps[sk.tiers.steps.length - 1],
        week7, sessions,
        phase: sk.phase[(week - 1) % sk.phase.length],
        hist: (entry && entry.hist) || []
      };
    });
    return out;
  }

  /* volume hebdomadaire toutes disciplines confondues */
  function weeklyVolume(state0, todayISO) {
    const state = normalizeState(state0, todayISO);
    let sessions = 0, minutes = 0;
    (state.history || []).forEach(e => {
      if (daysBetween(e.d, todayISO) >= 7) return;
      sessions++; minutes += e.min || 0;
    });
    return { sessions, minutes };
  }

  const API = {
    TAGS, FATIGUE, TIMES, CONFLICTS, DRILLS, SKILLS, SKILL_IDS, STRENGTH_FAMS, MAX_ITEMS,
    newState, normalizeState, microWeek, daysBetween,
    penalties, daysSince, generate, recordSession, metTarget,
    skillStats, weeklyVolume, tierOf, tierValue
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.PLMicro = API;
})(typeof window !== "undefined" ? window : globalThis);
