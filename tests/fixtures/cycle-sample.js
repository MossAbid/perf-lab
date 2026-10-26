/* Cycle d'exemple (format perflab-cycle-v1) pour les tests Node et l'e2e.
   Contenu neutre écrit pour les tests : 2 semaines × 4 séances + bonus.     */
(function (root) {
  "use strict";

  function session(id, title, lift, metcon) {
    return {
      id, title, blocks: [
        { kind: "warmup", title: "Échauffement", minutes: 12, text: "3 tours : 200 m rameur, 10 air squats, 10 pompes." },
        { kind: "strength", title: "Force · " + title, minutes: 20, lift,
          sets: [{ sets: 3, reps: "5", pct: 70 }], rest: "2 min", notes: "Tempo contrôlé à la descente." },
        Object.assign({ kind: "metcon", minutes: 14,
          levels: { rx: { text: "Version RX." }, int: { text: "Version intermédiaire." } } }, metcon),
        { kind: "accessory", title: "Accessoire", minutes: 10, optional: true, text: "3 × 12 rowing haltère." }
      ]
    };
  }

  function bonus(n) {
    return { id: `w${n}b`, title: "Bonus · BMU + mobilité", blocks: [
      { kind: "skill", title: "Bar muscle-up", minutes: 15, text: "EMOM 10 min : 1 à 2 bar muscle-ups.", moves: ["bar_muscle_up"] },
      { kind: "accessory", title: "Mobilité", minutes: 15, text: "Hanches et épaules." }
    ] };
  }

  function makeSampleCycle(startISO = "2026-11-23", id = "cycle-1") {
    const w1s1 = session("w1s1", "Back squat", "back_squat", { title: "AMRAP 12 min", score: "rounds_reps", bench: "amrap-a" });
    w1s1.blocks[0].flags = ["tapis"];
    w1s1.blocks[1].sets = [{ sets: 1, reps: "5", pct: 60 }, { sets: 1, reps: "3", pct: 70 }, { sets: 4, reps: "3", pct: 80 }];
    w1s1.blocks[2].moves = ["wall_ball"];
    return {
      schema: "perflab-cycle-v1",
      id, title: "Cycle test", start: startISO,
      goals: [
        { label: "Force", text: "Battre ton max de back squat." },
        { label: "Gym", text: "Enchaîner 3 bar muscle-ups." }
      ],
      movements: {
        back_squat: { name: "Back squat", cat: "force", video: "https://example.com/v", videoBy: "Démo",
          cues: ["Pieds largeur d'épaules, genoux dans l'axe des pieds."] },
        wall_ball: { name: "Wall ball", cat: "moteur", cues: ["Squat complet avant de lancer."],
          faults: ["Lancer avec les bras."], rx: "9 kg", int: "6 kg" },
        bar_muscle_up: { name: "Bar muscle-up", cat: "gymnastique", level: "À l'unité.",
          cues: ["Balancier bras tendus."],
          progression: [{ text: "À l'unité", state: "done" }, { text: "Enchaîner 2", state: "current" }, { text: "Enchaîner 5", state: "next" }] }
      },
      lifts: {
        back_squat:   { name: "Back squat", video: "https://example.com/lift" },
        snatch:       { name: "Snatch" },
        bench_press:  { name: "Bench press" },
        deadlift:     { name: "Deadlift" },
        front_squat:  { name: "Front squat", derive: { from: "back_squat", ratio: 0.85 } },
        strict_press: { name: "Strict press" }
      },
      weeks: [
        { n: 1, phase: "base", bloc: "A", intent: "Volume modéré, technique propre.", sessions: [
          w1s1,
          session("w1s2", "Strict press", "strict_press", { title: "For time", score: "time" }),
          session("w1s3", "Snatch", "snatch", { title: "EMOM 12 min", score: "reps" }),
          session("w1s4", "Deadlift", "deadlift", { title: "Montée en charge", score: "load" })
        ], bonus: bonus(1) },
        { n: 2, phase: "montee", bloc: "A", intent: "On monte d'un cran.", sessions: [
          session("w2s1", "Back squat", "back_squat", { title: "AMRAP 12 min", score: "rounds_reps", bench: "amrap-a" }),
          session("w2s2", "Bench press", "bench_press", { title: "For time", score: "time" }),
          session("w2s3", "Front squat", "front_squat", { title: "EMOM 12 min", score: "reps" }),
          session("w2s4", "Deadlift", "deadlift", { title: "Chipper", score: "time" })
        ], bonus: bonus(2) }
      ]
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { makeSampleCycle };
  root.makeSampleCycle = makeSampleCycle;
})(typeof window !== "undefined" ? window : globalThis);
