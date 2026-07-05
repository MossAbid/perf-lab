---
name: perflab-program
description: Generate a Perf Lab training program as valid importable JSON (v1 program format, RPE tiers, animations). Use when asked to create, generate, or adapt a training program, séance, or programme for the app.
---

# Générer un programme Perf Lab

## Inputs

L'argument décrit l'objectif : ex. `hyrox 3 séances 20min`, `mobilité épaule
pour Souad`. Demander si absent : objectif, profil (`moss`/`souad`), nombre de
séances, durée cible, matériel.

## Procédure

1. Relire un programme existant dans `programs.js` comme référence de style —
   les champs, le ton des `cue`, la structure `sessions[] > blocks[] > ex[]`.
2. Rédiger le JSON au **format v1** : racine `{id, title, title2, tag, accent,
   blurb, meta[], intro, sessions[]}` + `assign:["moss"|"souad"]`.
   - `ex[]` : `{k, name, reps, anim, sets, ...}` ; anims autorisées :
     `pullup explo dip press row bench curl hang crunch raise hold roll rotate carry`
     (défaut `pulse`).
   - Progression : `tiers: {u:"kg"|"s"|"reps", steps:[...], start:<idx>}` sur les
     exercices à surcharge — jamais sur un échauffement.
   - Jalon : `"test": true` sur un exercice testé toutes les 2 semaines max.
   - `yt:` lien de recherche YouTube comme dans `programs.js` (helper `YT`n'existe
     pas dans un JSON : mettre l'URL complète).
   - Textes en **français**, cues concrets (position, tempo, intention).
3. **Valider avant de livrer** :
   ```bash
   node -e 'const P=require("./progression.js");const p=JSON.parse(require("fs").readFileSync(0,"utf8"));
   try{P.validateProgram(p);console.log("OK")}catch(e){console.error("INVALIDE:",e);process.exit(1)}' < prog.json
   ```
   (`validateProgram` **lance** une chaîne d'erreur en français, il ne retourne
   pas de liste.) Corriger toute erreur avant de montrer le JSON.
4. Livrer le JSON dans un bloc de code prêt à coller dans **＋ AJOUTER → Importer**.
   Ne modifier `programs.js` que si l'utilisateur veut le programme **en semence
   par défaut** (dans ce cas : `/perflab-release` ensuite, car seed = pas de bump
   CACHE nécessaire, mais tests obligatoires).

## Output contract

Le JSON complet dans la réponse + une ligne résumé (profil, nb séances, durée).
Si écrit sur disque, le mettre dans `programs/` (créé au besoin), jamais à la racine.
