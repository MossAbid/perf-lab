# CLAUDE.md — Perf Lab

## Projet
PWA de suivi d'entraînement hébergée sur GitHub Pages : https://mossabid.github.io/perf-lab/
Deux parties :
- **Bibliothèques** (Upper, Core, Lower, Hyrox, Pull-Up Lab, Pré Haltéro) : deux profils, Moss et Souad, progression par RPE.
- **Programmation** (profil Moss) : la programmation CrossFit sur mesure qui remplace WYS60 — cycles de 9 semaines, 4 séances par semaine en file ordonnée, charges calculées sur les max.

## Architecture (verrouillée, ne pas remettre en question sans discussion explicite)
- Schéma JSON à deux profils (Moss / Souad), chaque profil porte ses propres séances, charges, historique.
- **Bibliothèques** : logique de progression conditionnelle basée sur le RPE (Rate of Perceived Exertion) :
  - RPE ≤ 6 → progression de charge/volume
  - RPE 7-8 → maintien
  - RPE ≥ 9 ou douleur signalée → régression
- **Programmation** : pas de RPE ni de ressenti. Charges = max × % arrondi au 2,5 kg ; la progression vient de la périodisation du cycle et des semaines de test qui mettent à jour les max.
- Migration silencieuse des anciens JSON (legacy) vers le schéma courant, sans intervention manuelle ni perte de données historiques.
- Offline-first : les bibliothèques restent en mode LOCAL ; **Supabase n'est activé que pour la Programmation** (clés `CYCLE_SUPABASE_*`). Activer `SUPABASE_URL` ferait du compte le seul profil et masquerait Souad.

## Fichiers clés
- `index.html` : coque, scripts dans l'ordre `config.js → programs.js → progression.js → cycle.js → (CDN Supabase) → backend.js → cyclestore.js → cycle-ui.js → app.js` (`cycle-ui.js` avant `app.js` : `boot()` route dès le chargement)
- `app.js` : moteur — routeur, rendu des bibliothèques, écran d'ajout, timer ; délègue les routes `#/cf…` à `CycleUI`
- `app.css` : design + animations (section `/* ===== Programmation ===== */`, classes `cf-`)
- `progression.js` : règle RPE, paliers, validation & migration du schéma (logique pure, testée en Node)
- `cycle.js` (`PLCycle`) : format `perflab-cycle-v1`, validation, max et charges, semaine/file/rattraper-passer, scores (logique pure, testée en Node)
- `cyclestore.js` (`CycleStore`) : données de la Programmation, LOCAL ou CLOUD (tables `cycles`/`cycle_athletes`, blob `state` clé `cycle`), cache offline, file d'une opération
- `cycle-ui.js` (`CycleUI`) : écrans Ta semaine, Ton mois, Ton programme, Séance, Fiches mouvement, Tes max, Importer un cycle, connexion
- `backend.js` : couche local/cloud des bibliothèques — profils, auth, sync, cache offline, file d'attente
- `programs.js` : programmes par défaut (semés à la première utilisation), champ `assign` pour le routage par profil
- `config.js` : clés Supabase (vide = mode LOCAL), `SUPABASE_*` pour les bibliothèques, `CYCLE_SUPABASE_*` pour la Programmation
- `schema.sql` : schéma Postgres à coller dans Supabase
- `sw.js` : service worker, cache `perflab-vX` (bump manuel après modif de la coque)
- `tools/validate-cycle.js` : vérifie un fichier de cycle ; `tools/serve.py` : serveur local (test + e2e)
- `manifest.webmanifest`, `icons/` : métadonnées PWA
- `tests/progression.test.js`, `tests/backend.test.js`, `tests/cycle.test.js`, `tests/cyclestore.test.js`, `tests/sw.test.js` : tests Node ; `tests/fixtures/cycle-sample.js` : cycle d'exemple
- `tests/e2e.html` : harnais e2e navigateur

L'app réelle est une SPA unique (`index.html` + `app.js`), pas un multi-pages.

## Stack technique exacte
- Frontend 100% vanilla JS (pas de framework, pas de bundler, scripts classiques non-`module` chargés par balises `<script>`).
- CSS vanilla (`app.css`), pas de préprocesseur.
- Backend optionnel : Supabase — Postgres + Auth + Row Level Security, client chargé via CDN jsDelivr (`@supabase/supabase-js@2.118.0`, version épinglée et testée), pas de dépendance npm.
- Aucun `package.json` / aucun outil de build.
- Tests : scripts Node purs avec `assert` + un harnais e2e HTML exécuté dans Chrome headless.
- PWA : `manifest.webmanifest` + `sw.js` (code HTML/CSS/JS en network-first borné à 3 s puis cache, relu sans le cache HTTP — GitHub Pages sert en max-age 600 — et coque réinstallée en `cache: "reload"` ; icônes et polices en cache-first).

## Commandes réelles
- Pas de build : les fichiers sont directement déployables.
- **Déploiement** : `git push` sur `main` de `github.com/mossabid/perf-lab` → GitHub Pages. Uniquement avec l'accord de Moss.
- **Test local** : `python3 tools/serve.py 8000` puis `http://localhost:8000`.
- **Tests unitaires** : `node tests/progression.test.js && node tests/backend.test.js && node tests/cycle.test.js && node tests/cyclestore.test.js && node tests/sw.test.js`.
- **Tests e2e** : `python3 tools/serve.py 8741` à la racine, puis `chrome --headless=new --virtual-time-budget=30000 --dump-dom "http://localhost:8741/tests/e2e.html"` → aucune ligne `E2E-FAIL` dans `#results`. (Avec `python3 -m http.server`, la file de 5 connexions fait échouer des scripts au hasard.)
- **Vérifier un cycle** : `node tools/validate-cycle.js content/cycle-1.json`.
- Après une modification de la coque (`index.html`, `app.css`, `app.js`, `backend.js`, `config.js`, `programs.js`, `progression.js`, `cycle.js`, `cyclestore.js`, `cycle-ui.js`, icônes), incrémenter la constante `CACHE` dans `sw.js` (actuellement `perflab-v15`) **et** ajouter tout nouveau fichier au tableau `SHELL`.

## Schéma des données
Aucun fichier `.json` de schéma dans le dépôt :
- Formats documentés en prose dans `README.md` (`perflab-profiles-v1`, programme v1, profils v2, cycle `perflab-cycle-v1`).
- Validation et migration : `progression.js` (bibliothèques), `cycle.js` (cycles).
- Côté serveur : `schema.sql` — tables `programs`, `progress`, `state` (bibliothèques ; `state` = un blob par clé libre) et `cycles`, `cycle_athletes` (Programmation, avec RLS ; `owner` recopié dans `cycle_athletes` pour éviter la récursion de RLS).

## Conventions
- Toute nouvelle fonctionnalité respecte le schéma à deux profils existant, pas de refonte de structure sans validation.
- Tout nouvel état persistant est ajouté à `exportAll` / `importProfilesDoc` (`backend.js`) **et** à `mergeProfilesDoc` (`progression.js`), en gardant l'ancien format tolérant : une clé absente d'un backup n'écrase jamais les données existantes. (Clés actuelles : `programs`, `progress`, `weeks`, `progression`, `log`, `micro` — héritée, `cycle`.)
- La règle RPE ci-dessus est la source de vérité des bibliothèques ; ne pas la réinterpréter ni l'assouplir silencieusement, et ne pas l'introduire dans la Programmation.
- Programmation : séance ≤ 60 min hors blocs facultatifs ; metcons en deux niveaux RX et INT seulement ; pas de double unders ; contenu 100 % original (s'inspirer des principes de WYS, HWPO… jamais de copie de séances, noms ou vidéos).
- **Le contenu des cycles n'est jamais commité** (dépôt public) : dossier `content/` ignoré par git ; le contenu vit dans Supabase et le cache local.
- Prioriser la simplicité offline-first (PWA).

## Notes
Le cahier des charges de la Programmation est un Claude Doc privé de Moss ; le plan d'implémentation v1 est dans `docs/superpowers/plans/` (local, non commité). Prochaines étapes prévues : passe esthétique, préparation multi-athlètes.
