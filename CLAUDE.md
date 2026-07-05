# perf-lab

PWA d'entraînement multi-profils (Moss / Souad), vanilla JS, sans build. Mode
LOCAL par défaut, mode CLOUD via Supabase (`config.js`). Voir `README.md`.

## Commandes

```bash
node tests/progression.test.js   # logique pure (règle RPE, schéma, migration)
node tests/backend.test.js       # couche local/cloud
python3 -m http.server 8000      # test manuel local
```

## Règles du dépôt

- `progression.js` est de la **logique pure** (zéro DOM) : toute modif doit passer
  les tests Node existants et en ajouter pour tout nouveau comportement.
- La règle RPE est **verrouillée** (≤6 monte · 7-8 maintient · ≥9/douleur descend) :
  ne jamais la changer sans demande explicite.
- **Bump `CACHE` dans `sw.js`** (`perflab-vN` → `vN+1`) à chaque modif de la coque
  (`index.html`, `app.css`, `app.js`, `backend.js`, `sw.js`). Pas nécessaire pour
  `programs.js` seul. Utiliser `/perflab-release` pour ne rien oublier.
- Nouveaux programmes : format v1 (`id`, `title`, `sessions[]`), validé par
  `PLProgression.validateProgram`. Générer via `/perflab-program`.
- Textes de l'app en **français** ; garder le ton existant.

## Skills

- `/perflab-program` — génère un programme JSON valide prêt à importer
- `/perflab-release` — tests + bump CACHE + push + vérification du déploiement Pages
