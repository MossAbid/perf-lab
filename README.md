# Perf Lab — PWA bibliothèque d'entraînement (backend réel)

Coque multi-programmes : **Upper Power Lab**, **Core Lab**, **Lower Lab** (Moss),
**Pull-Up Lab** et **Pré Haltéro** (Souad). Animations par mouvement, suivi de charge
& de séries, progression conditionnelle par RPE.
**Deux modes :**
- **LOCAL** (par défaut, `config.js` vide) : tout marche, données stockées sur l'appareil.
- **CLOUD** (tu remplis `config.js`) : compte + **synchronisation entre tous tes appareils**.

## Fichiers
- `index.html` · coque
- `app.css` · design + animations
- `app.js` · moteur (routeur, rendu, écran d'ajout, timer)
- `progression.js` · règle RPE, paliers, validation & migration du schéma JSON (logique pure, testée en Node)
- `backend.js` · couche local/cloud (profils + auth + sync + cache offline + file d'attente)
- `cycle.js` · programmation : format de cycle, charges, semaine, scores (logique pure, testée en Node)
- `cyclestore.js` · programmation : données local/cloud (Supabase du module, cache offline, file d'attente)
- `cycle-ui.js` · programmation : écrans Ta semaine, Séance, Tes max, Importer un cycle
- `config.js` · **tes clés Supabase** (vide = local) — bibliothèques d'un côté, programmation de l'autre
- `programs.js` · programmes par défaut (semence à la 1ʳᵉ utilisation)
- `manifest.webmanifest`, `sw.js`, `icons/`
- `schema.sql` · à exécuter dans Supabase
- `tools/validate-cycle.js` · vérifie un fichier de cycle avant import
- `tools/serve.py` · serveur local pour le test et l'e2e

---

## Profils (mode LOCAL)

Deux profils sans compte ni mot de passe : **Moss** et **Souad**. Le sélecteur est en haut
de la bibliothèque ; le profil actif est persistant (localStorage). Chaque profil a ses
propres programmes, sa progression hebdo et ses paliers RPE, dans des espaces de stockage
séparés (`perflab.p.<profil>.*`). Les données d'une installation mono-profil existante
sont migrées automatiquement et silencieusement vers Moss au premier lancement.
En mode CLOUD, le compte fait office de profil : le sélecteur est masqué.

Les programmes par défaut sont assignés par profil via le champ `assign` dans
`programs.js` : Moss reçoit Upper / Core / Lower, Souad reçoit Pull-Up Lab et
Pré Haltéro (sans `assign`, un programme est seedé chez tout le monde).

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
est conservé par exercice et par profil, et une **sparkline** d'évolution du palier
apparaît sur l'exercice dès deux évaluations. Format d'un palier dans le JSON :
`"tiers": { "u": "kg" | "s" | "reps", "steps": [40,50,60,70], "start": 2 }`
(`start` = indice du palier de départ). Le programme **Pré Haltéro** n'a pas de paliers :
c'est un échauffement, zéro RPE par conception.

## Séances, repos et jalons

- **Repos inline** : cocher une série lance un compte à rebours discret dans la carte
  (durée du bloc via `timer`, sinon 90″ ; toucher pour arrêter ; pas de repos après la
  dernière série).
- **✓ Séance faite** : bouton en bas de séance — le journal alimente la bande
  d'assiduité (14 jours) de la bibliothèque. Une entrée par (jour, programme, séance).
- **Jalons** (`"test": true` sur un exercice) : saisie d'un résultat daté (ex. tractions
  strictes max du Pull-Up Lab, séance TEST toutes les 2 semaines), historique affiché.
- **Sauvegarde** : la bibliothèque affiche la date du dernier export et le signale
  au-delà de 7 jours ; le bouton télécharge un fichier `perflab-backup-<date>.json`
  (format profils v2, champ `log` inclus). Pense-bête utile : iOS peut purger le
  localStorage d'une PWA peu utilisée.

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

En mode CLOUD, tout est synchronisé : programmes, séries/charges (`progress`), **et**
paliers RPE, semaine courante et journal de séances (table `state`, un blob JSON par clé).
Compte créé avant l'ajout de la table `state` ? Recolle juste ce bloc de `schema.sql` dans
le SQL Editor, rien d'autre à migrer. (L'ancienne clé `micro` du micro-programme retiré
reste lue et exportée : les vieilles sauvegardes ne perdent rien.)

## Déployer + installer sur iPhone (plein écran, offline, icône)
Une PWA doit être servie en **HTTPS** (le `file://` ne permet ni l'offline ni le plein écran).
1. https://app.netlify.com/drop → **glisse le dossier** entier. (ou GitHub → Pages.)
2. Ouvre l'URL dans **Safari** → **Partager → Sur l'écran d'accueil**.
3. Sur ton Mac : ouvre la même URL, connecte-toi avec le **même email/mot de passe** → mêmes données.

### Test local (optionnel)
```
cd perf-lab && python3 tools/serve.py 8000   # http://localhost:8000
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

## Programmation (remplace WYS60)
Carte **TA SEMAINE** de la bibliothèque (profil Moss uniquement) → `#/cf`.

- **Ta semaine** : 4 séances en file ordonnée, faites le jour qui t'arrange (la date est notée
  quand tu la coches), + un bonus facultatif et le team WOD du dimanche. Une semaine non
  bouclée au lundi suivant → bandeau **La rattraper / La passer** (une seule question, même
  après plusieurs semaines manquées).
- **Séance** (`#/cf/s/<id>`) : blocs dépliables ; charges = **max × % arrondi au 2,5 kg**,
  pastille *Ceinture* dès 80 %, *Tapis* quand le genou touche le sol ; metcon en **RX / INT**
  (ouvrir l'un replie l'autre), score enregistré et comparé à la dernière fois. Aucune saisie
  de ressenti.
- **Tes max** (`#/cf/max`) : le plus récent par mouvement ; un mouvement *dérivé* (ex. front
  squat = 85 % du back squat) est estimé tant qu'il n'a pas son propre max.
- **Importer un cycle** (`#/cf/import`) : colle le JSON. Le journal (séances, scores, max)
  est conservé.

**Format** `perflab-cycle-v1` : `{ schema, id, title, start (un lundi), lifts, weeks[] }` ;
chaque semaine = `{ n, phase, bloc, intent, sessions[4], bonus? }` ; une séance = blocs
`warmup | strength | metcon | accessory | skill`, ≤ 60 min hors blocs `optional`, au plus un
metcon (niveaux `rx` et `int`, score `time | reps | rounds_reps | load`, `bench` pour relier
les metcons répétés). Vérifier avant import : `node tools/validate-cycle.js content/cycle-1.json`.

**Le contenu des cycles n'est jamais dans le dépôt** (public) : le dossier `content/` est
ignoré par git ; le cycle vit dans Supabase et dans le cache de l'appareil.

**Supabase pour ce module seulement** : les bibliothèques et le sélecteur Moss / Souad
restent en mode LOCAL. Pour activer la synchro de la programmation :
1. Crée un projet Supabase, colle `schema.sql` dans le SQL Editor → *Run* (tables `cycles`,
   `cycle_athletes`, `state` + règles RLS).
2. *Authentication → Sign In / Providers* : désactive **« Allow new users to sign up »** (personne
   d'autre ne doit pouvoir créer un compte) et « Confirm email ». Crée ton compte dans
   *Authentication → Users → Add user* (l'app n'a pas d'écran de création de compte pour ce module).
3. Renseigne `CYCLE_SUPABASE_URL` et `CYCLE_SUPABASE_ANON_KEY` dans `config.js`
   (laisse `SUPABASE_URL` / `SUPABASE_ANON_KEY` vides).

Données de l'athlète : blob `state` clé `cycle` (cache `perflab.p.moss.cycle`) =
`{ v, maxes, logs }`, inclus dans l'export/import de profils.

**Tests** : `node tests/cycle.test.js && node tests/cyclestore.test.js`, puis l'e2e
(`python3 tools/serve.py 8741` et `chrome --headless=new --virtual-time-budget=30000
--dump-dom http://localhost:8741/tests/e2e.html` → aucune ligne `E2E-FAIL`).

## Offline & sync
- Les données s'affichent immédiatement depuis le cache local.
- Les modifs faites hors-ligne sont **mises en file d'attente** et **synchronisées** au retour du réseau.
- Granularité de sync : une ligne par (programme, semaine) → quasi aucun conflit en usage perso.

> Après une grosse modif de la coque, incrémente `CACHE` dans `sw.js` (`perflab-v1` → `v2`).
