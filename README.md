# Perf Lab — PWA bibliothèque d'entraînement (backend réel)

Coque multi-programmes : héberge **Core Lab** + **Upper Power Lab**, accueille les suivants.
Animations par mouvement, timer (EVERY / EMOM / countdown), suivi de charge & de séries.
**Deux modes :**
- **LOCAL** (par défaut, `config.js` vide) : tout marche, données stockées sur l'appareil.
- **CLOUD** (tu remplis `config.js`) : compte + **synchronisation entre tous tes appareils**.

## Fichiers
- `index.html` · coque
- `app.css` · design + animations
- `app.js` · moteur (routeur, rendu, écran d'ajout, timer)
- `progression.js` · règle RPE, paliers, validation & migration du schéma JSON (logique pure, testée en Node)
- `backend.js` · couche local/cloud (profils + auth + sync + cache offline + file d'attente)
- `config.js` · **tes clés Supabase** (vide = local)
- `programs.js` · programmes par défaut (semence à la 1ʳᵉ utilisation)
- `manifest.webmanifest`, `sw.js`, `icons/`
- `schema.sql` · à exécuter dans Supabase

---

## Profils (mode LOCAL)

Deux profils sans compte ni mot de passe : **Moss** et **Souad**. Le sélecteur est en haut
de la bibliothèque ; le profil actif est persistant (localStorage). Chaque profil a ses
propres programmes, sa progression hebdo et ses paliers RPE, dans des espaces de stockage
séparés (`perflab.p.<profil>.*`). Les données d'une installation mono-profil existante
sont migrées automatiquement et silencieusement vers Moss au premier lancement.
En mode CLOUD, le compte fait office de profil : le sélecteur est masqué.

## Progression conditionnelle par RPE

Les exercices qui portent un champ `tiers` ont des paliers prédéfinis (charge en kg,
temps de maintien en secondes, ou répétitions). Après l'exercice, saisis un **RPE 0-10**
(+ bouton **Douleur** le cas échéant) :

| Condition | Palier à la séance suivante |
|---|---|
| Toutes les séries faites **et** RPE ≤ 6 | palier supérieur |
| RPE 7-8 | maintien |
| RPE ≥ 9 **ou** douleur signalée | palier précédent |

Le palier proposé s'applique dès que tu passes à la semaine suivante. L'historique RPE
est conservé par exercice et par profil. Format d'un palier dans le JSON :
`"tiers": { "u": "kg" | "s" | "reps", "steps": [40,50,60,70], "start": 2 }`
(`start` = indice du palier de départ). Le programme **Pré Haltéro** n'a pas de paliers :
c'est un échauffement, zéro RPE par conception.

## Schéma JSON — deux formats d'import

**Format programme (v1, inchangé)** : objet racine avec `id`, `title`, `sessions[]`.
Toujours accepté — un fichier à ce format est rattaché automatiquement et silencieusement
au profil **Moss**.

**Format profils (v2, export/import global)** :
```json
{
  "schema": "perflab-profiles-v1",
  "profiles": [
    { "id": "moss",  "name": "Moss",  "programs": [ ... ], "progress": { }, "weeks": { }, "progression": { } },
    { "id": "souad", "name": "Souad", "programs": [ ... ], "progress": { }, "weeks": { }, "progression": { } }
  ]
}
```
Le bouton **Exporter tout (profils)** de l'écran ＋ AJOUTER produit ce format ; l'import
le fusionne profil par profil (programmes remplacés par `id`, états remplacés quand fournis).

---

## Activer le backend cloud (≈ 5 min, gratuit)

1. **Crée un projet** sur https://supabase.com (Free tier).
2. **Schéma** : dashboard → *SQL Editor* → *New query* → colle tout `schema.sql` → *Run*.
3. **Auth** : *Authentication → Providers → Email* → désactive **Confirm email**
   (usage perso : connexion instantanée). Laisse *Email* activé.
4. **Clés** : *Project Settings → API* → copie **Project URL** et la clé **anon public**,
   colle-les dans `config.js`.
5. **Déploie** (voir ci-dessous) et ouvre l'app → crée ton compte → c'est synchronisé.

La clé *anon* est publique : la sécurité vient des règles **RLS** (chaque utilisateur ne
voit que ses propres lignes), déjà définies dans `schema.sql`.

## Déployer + installer sur iPhone (plein écran, offline, icône)
Une PWA doit être servie en **HTTPS** (le `file://` ne permet ni l'offline ni le plein écran).
1. https://app.netlify.com/drop → **glisse le dossier** entier. (ou GitHub → Pages.)
2. Ouvre l'URL dans **Safari** → **Partager → Sur l'écran d'accueil**.
3. Sur ton Mac : ouvre la même URL, connecte-toi avec le **même email/mot de passe** → mêmes données.

### Test local (optionnel)
```
cd perf-lab && python3 -m http.server 8000   # http://localhost:8000
```

---

## Ajouter un programme (sans toucher au code)
Dans l'app : bouton **＋ AJOUTER** → colle un **programme JSON** → *Importer*.
Il est sauvegardé côté backend et apparaît sur **tous tes appareils**.
- **Insérer un modèle** te donne la structure à remplir.
- **Exporter** (sur un programme existant) copie son JSON pour le dupliquer/modifier.
- Le plus simple : demande à Claude « *génère-moi un programme Perf Lab pour …* »
  et colle sa réponse dans la zone d'import.

Animations dispo : `pullup explo dip press row bench curl hang crunch raise hold roll rotate carry` (défaut `pulse`).

## Offline & sync
- Les données s'affichent immédiatement depuis le cache local.
- Les modifs faites hors-ligne sont **mises en file d'attente** et **synchronisées** au retour du réseau.
- Granularité de sync : une ligne par (programme, semaine) → quasi aucun conflit en usage perso.

> Après une grosse modif de la coque, incrémente `CACHE` dans `sw.js` (`perflab-v1` → `v2`).
