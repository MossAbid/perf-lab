---
name: perflab-release
description: Release checklist for perf-lab — run tests, bump the service-worker CACHE version when shell files changed, push, and verify the GitHub Pages deploy. Use when asked to release, deploy, ship, or push perf-lab changes.
---

# Release perf-lab

## Procédure

1. **Tests** — les deux doivent passer, sinon stop et rapporter la sortie :
   ```bash
   node tests/progression.test.js && node tests/backend.test.js
   ```
2. **Bump CACHE si nécessaire** — comparer les fichiers modifiés depuis le
   dernier bump :
   ```bash
   git log -1 --format=%H -S 'const CACHE' -- sw.js   # dernier commit qui a bumpé
   git diff --name-only <ce-commit>..HEAD
   ```
   Si `index.html`, `app.css`, `app.js`, `backend.js` ou `sw.js` apparaissent et
   que `CACHE` n'a pas changé : incrémenter `perflab-vN` → `vN+1` dans `sw.js`.
   `programs.js`, `progression.js` ou `config.js` seuls → pas de bump.
3. **Commit & push** — message en français, style de l'historique (descriptif,
   pas de préfixe conventionnel).
4. **Vérifier le déploiement Pages** — via les outils GitHub (`actions_list` sur
   `mossabid/perf-lab`) : attendre le workflow Pages du commit poussé et
   confirmer `success`. En cas d'échec : lire les logs, corriger, re-pousser.
   (L'historique montre qu'un déploiement peut rester coincé en file — si
   \>10 min sans démarrer, relancer le workflow.)
5. **Rapport** — une ligne : tests OK, CACHE vN, deploy OK + URL.

## Garde-fous

- Ne jamais pousser si un test échoue.
- Ne jamais bumper CACHE « au cas où » : un bump inutile force tous les clients
  à re-télécharger la coque.
- Rappeler la sauvegarde si la bande d'export date de plus de 7 jours n'est pas
  vérifiable ici — c'est l'app qui l'affiche, juste le mentionner après un gros
  changement de schéma.
