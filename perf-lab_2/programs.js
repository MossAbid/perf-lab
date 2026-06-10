/* =====================================================================
   PERF LAB — PROGRAMMES PAR DÉFAUT (semence)
   ===================================================================== */

const YT = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

const DEFAULT_PROGRAMS = [

/* ============================ UPPER POWER LAB ============================ */
{
  id:"upper",
  title:"UPPER", title2:"POWER",
  tag:"Haut du corps",
  accent:"#ffb02e",
  blurb:"Force & puissance du haut. Apprivoiser le lest sur les tractions.",
  meta:["4 séances","≤15 min","Force / Puissance"],
  intro:"Ondulation force / puissance / hypertrophie / épaule. Cap unique : être à l'aise avec le lest. Surcharge chaque semaine, test en S4.",
  sessions:[
    { id:"s1", t:"FORCE", t2:"VERTICALE", sub:"Lest · tractions & dips", accent:"#ffb02e", pill:"~15 MIN",
      focus:"Force max sur le tirage et la poussée verticale lestés. Le cœur du projet : apprivoiser la charge.",
      blocks:[
        { label:"BLOC A — EVERY 2′ × 6", timer:120, note:"Qualité de contraction > échec. Garde 1 rep en réserve sur les tractions.",
          ex:[
            {k:"wpu",name:"Traction stricte lestée",reps:"3 reps",anim:"pullup",load:true,sets:6,tempo:["X","0","2","0"],key:0,
             cue:"Scapulas engagées AVANT de tirer. Montée explosive, descente 2″. ~80-85 % du max lesté.",yt:YT("weighted pull up strict form")},
            {k:"wdip",name:"Dips lestées",reps:"4 reps",anim:"dip",load:true,sets:6,tempo:["3","0","1","0"],key:0,
             cue:"Épaules basses, pas de rebond en bas. Buste légèrement penché = plus de pec.",yt:YT("weighted dips strict")}
          ]},
        { label:"FINISHER — 3 séries", note:"Habitue le corps au lest sous tension longue.",
          ex:[
            {k:"hang",name:"Dead hang lesté",reps:"max",anim:"hang",load:true,sets:3,timer:true,
             cue:"Grip ferme, gainage actif, épaules engagées. Renforce la prise pour les tractions lourdes.",yt:YT("weighted dead hang")}
          ]}
      ]},
    { id:"s2", t:"PUISS-", t2:"ANCE", sub:"Contraste · explosivité", accent:"#4dd2ff", pill:"~14 MIN",
      focus:"Développer la vitesse de production de force. Tirage explosif + poussée pliométrique en contraste.",
      blocks:[
        { label:"EMOM 14′ — alternance / minute", emom:14, note:"Repos réel entre efforts. Vitesse > fatigue : si la vitesse chute, baisse les reps.",
          ex:[
            {k:"expull",name:"Traction explosive (C2B / high pull)",reps:"3 reps · min impaires",anim:"explo",load:true,sets:7,
             cue:"Intention vitesse MAX, barre vers le bas du sternum. Lest léger (5-10 kg) pour le contraste.",yt:YT("explosive chest to bar pull up")},
            {k:"expush",name:"Pompe pliométrique",reps:"5 reps · min paires",anim:"dip",sets:7,
             cue:"Pousse fort, contact court. Sur élévation si le clap n'est pas là. Pas d'affaissement lombaire.",yt:YT("plyometric clapping push up")}
          ]},
        { label:"FINISHER — 1 minute",
          ex:[
            {k:"throw",name:"Med-ball chest throw (ou band punch)",reps:"10 reps",anim:"press",
             cue:"Projection explosive à hauteur de poitrine. Tout est dans l'intention de vitesse.",yt:YT("medicine ball chest pass explosive")}
          ]}
      ]},
    { id:"s3", t:"HYPER-", t2:"TROPHIE", sub:"Dos · pec · bras", accent:"#b6f24e", pill:"~14 MIN",
      focus:"Construire du muscle sur les gros groupes : tirage horizontal lourd, poussée, puis finisher bras.",
      blocks:[
        { label:"SUPERSET A — 4 tours", note:"Charge sub-maximale (RPE 8), tempo contrôlé, on cherche la congestion.",
          ex:[
            {k:"row",name:"Rowing haltère 1 bras (appui au banc)",reps:"8-10 reps",anim:"row",load:true,sets:4,tempo:["2","1","1","0"],key:2,
             cue:"Genou et main en appui sur le banc, dos à plat. 1″ de pause en haut, coude vers la hanche.",yt:YT("one arm dumbbell row bench form")},
            {k:"bench",name:"Développé couché (ou DB bench)",reps:"8-10 reps",anim:"bench",load:true,sets:4,tempo:["3","1","1","0"],key:0,
             cue:"Descente 3″ contrôlée, omoplates serrées. Amplitude complète.",yt:YT("barbell bench press form")}
          ]},
        { label:"FINISHER BRAS B — 3 tours",
          ex:[
            {k:"curl",name:"Curl barre / haltères",reps:"10-12 reps",anim:"curl",load:true,sets:3,tempo:["2","0","2","0"],key:2,
             cue:"Coudes fixes, pas d'élan. Squeeze en haut.",yt:YT("barbell biceps curl form")},
            {k:"tri",name:"Extension triceps (skull / banded)",reps:"max",anim:"curl",load:true,sets:3,
             cue:"Coudes serrés et fixes, extension complète. Jusqu'à la chauffe.",yt:YT("barbell skullcrusher triceps")}
          ]}
      ]},
    { id:"s4", t:"ÉPAULE", t2:"OVERHEAD", sub:"Pressing vertical · prévention", accent:"#ff5a7a", pill:"~15 MIN",
      focus:"Force overhead + assurance de l'épaule qui encaisse tout le tirage de la semaine. Ne saute jamais cette séance.",
      blocks:[
        { label:"BLOC A — EVERY 2′ × 5", timer:120, note:"Gainage, pas de cambrure lombaire sur le pressing.",
          ex:[
            {k:"zpress",name:"Z-press (ou strict press)",reps:"6 reps",anim:"press",load:true,sets:5,tempo:["2","0","1","0"],key:0,
             cue:"Assis jambes tendues = zéro triche. Verrouille en haut, abdos serrés.",yt:YT("z press strict overhead")},
            {k:"tpu",name:"Traction stricte (poids du corps)",reps:"5-8 reps",anim:"pullup",sets:5,tempo:["3","0","X","1"],key:0,
             cue:"Descente lente : ici on travaille la QUALITÉ de mouvement, sans lest.",yt:YT("strict pull up tempo")}
          ]},
        { label:"PRÉVENTION B — 3 tours", note:"Le filet de sécurité. Léger, propre, sans douleur.",
          ex:[
            {k:"kb",name:"KB bottom-up press hold",reps:"20″ / bras",anim:"press",sets:3,timer:true,
             cue:"Rotation externe ++, kettlebell à l'envers. Stabilité d'épaule sous charge instable.",yt:YT("kettlebell bottom up press hold")},
            {k:"er",name:"Rotation externe élastique",reps:"12 / bras",anim:"curl",sets:3,
             cue:"Coude collé au corps, mouvement lent. Coiffe des rotateurs.",yt:YT("band external rotation shoulder")},
            {k:"fp",name:"Face pull / W au sol",reps:"15 reps",anim:"row",sets:3,
             cue:"Tire vers le front, coudes hauts. Rhomboïdes et arrière d'épaule.",yt:YT("face pull rear delt")}
          ]}
      ]}
  ]
},

/* ============================== CORE LAB ============================== */
{
  id:"core",
  title:"CORE", title2:"LAB",
  tag:"Chaîne abdominale",
  accent:"#4dd2ff",
  blurb:"Sangle abdominale fonctionnelle : flexion, anti-extension, anti-rotation, engine.",
  meta:["4 séances","≤15 min","CrossFit"],
  intro:"Ondulation des qualités du tronc : force de flexion, anti-extension, anti-rotation, intégration. Surcharge progressive, S4 = test.",
  sessions:[
    { id:"s1", t:"FLEXION", t2:"LOURDE", sub:"Force de flexion", accent:"#4dd2ff", pill:"~12 MIN",
      focus:"Produire de la force en flexion du tronc, sous charge.",
      blocks:[
        { label:"SUPERSET — 5 tours", note:"Charge réelle, pas de reps infinies. Le tronc se travaille comme un muscle.",
          ex:[
            {k:"situp",name:"Sit-up lesté (plaque bras tendus au-dessus de la tête)",reps:"8-10 reps",anim:"crunch",load:true,sets:5,
             cue:"Plaque verrouillée bras tendus, déroule la colonne vertèbre par vertèbre.",yt:YT("weighted sit up plate overhead")},
            {k:"t2b",name:"Strict toes-to-bar (ou strict hanging leg raise)",reps:"5-8 reps",anim:"raise",sets:5,tempo:["3","0","X","0"],key:0,
             cue:"Descente 3″ contrôlée, pas de balancier. Strict avant tout.",yt:YT("strict toes to bar")}
          ]},
        { label:"FINISHER — 3 minutes",
          ex:[
            {k:"hollow",name:"Hollow rock",reps:"30-45 s",anim:"hold",sets:3,timer:true,
             cue:"Lombaires plaquées au sol, exagère la fermeture.",yt:YT("hollow rock crossfit")}
          ]}
      ]},
    { id:"s2", t:"ANTI-", t2:"EXTENSION", sub:"Gainage lourd", accent:"#ffb02e", pill:"~12 MIN",
      focus:"Résister à l'extension lombaire sous charge — le gainage qui protège le bas du dos.",
      blocks:[
        { label:"SUPERSET — 5 tours", note:"À distance de tes jours de deadlift/squat lourds. Coupe à la moindre gêne lombaire.",
          ex:[
            {k:"rollout",name:"Ab-wheel rollout (ou rollout barre chargée)",reps:"6-8 reps",anim:"roll",load:true,sets:5,
             cue:"Progression genoux → debout. Bassin rétroversé, jamais de cambrure.",yt:YT("ab wheel rollout progression")},
            {k:"plank",name:"Planche longue / lestée",reps:"30-40 s",anim:"hold",load:true,sets:5,timer:true,
             cue:"Ligne tête-talons, fessiers serrés. Pose une plaque sur le dos pour charger.",yt:YT("weighted plank")}
          ]},
        { label:"FINISHER — 3 minutes",
          ex:[
            {k:"deadbug",name:"Dead bug lesté (ultra-lent)",reps:"10 / côté",anim:"raise",load:true,sets:3,
             cue:"Lombaires plaquées en permanence, mouvement très lent et contrôlé.",yt:YT("weighted dead bug slow")}
          ]}
      ]},
    { id:"s3", t:"ANTI-", t2:"ROTATION", sub:"Anti-flexion latérale", accent:"#b6f24e", pill:"~12 MIN",
      focus:"Résister à la rotation et à la flexion latérale — stabilité du tronc dans tous les plans.",
      blocks:[
        { label:"SUPERSET — 4-5 tours", note:"Garde le bassin et les épaules face avant, ne laisse rien tourner.",
          ex:[
            {k:"pallof",name:"Pallof press élastique (ou front-rack carry KB unilatéral)",reps:"10 / côté",anim:"rotate",sets:5,
             cue:"Résiste à la traction latérale, bras tendus stables. Sans élastique : carry KB 20 m/côté.",yt:YT("pallof press anti rotation")},
            {k:"sideplank",name:"Side plank lesté",reps:"30 s / côté",anim:"hold",load:true,sets:5,timer:true,
             cue:"Hanche haute, corps en ligne. Plaque sur la hanche pour charger.",yt:YT("weighted side plank")},
            {k:"suitcase",name:"Suitcase carry KB lourd",reps:"30-40 m",anim:"carry",load:true,sets:5,
             cue:"Une seule charge, reste vertical sans pencher. Anti-flexion latérale pure.",yt:YT("suitcase carry kettlebell")}
          ]},
        { label:"FINISHER",
          ex:[
            {k:"twist",name:"Russian twist plaque / KB",reps:"20 reps",anim:"rotate",load:true,sets:3,
             cue:"Rotation contrôlée, pas de vitesse. Le tronc travaille, pas l'élan.",yt:YT("russian twist plate")}
          ]}
      ]},
    { id:"s4", t:"ENGINE", t2:"INTÉGRATION", sub:"Capacité du tronc", accent:"#ff5a7a", pill:"~12 MIN",
      focus:"Le liant : enchaîner les qualités sous fatigue, capacité de travail du tronc.",
      blocks:[
        { label:"EMOM 12′ — rotation / minute × 3", emom:12, note:"Une qualité par minute, on tourne 3 fois.",
          ex:[
            {k:"hlr",name:"Hanging leg raise",reps:"10 reps · min 1",anim:"raise",sets:3,
             cue:"Strict, jambes tendues si possible. Pas de balancier.",yt:YT("hanging leg raise")},
            {k:"hold",name:"Hollow hold",reps:"40 s · min 2",anim:"hold",sets:3,timer:true,
             cue:"Position fermée, lombaires plaquées tout du long.",yt:YT("hollow hold")},
            {k:"t2b2",name:"Toes-to-bar",reps:"8-10 reps · min 3",anim:"raise",sets:3,
             cue:"Kipping autorisé ici (capacité), reste rythmé.",yt:YT("toes to bar crossfit")},
            {k:"taps",name:"Plank shoulder taps",reps:"20 reps · min 4",anim:"hold",sets:3,
             cue:"Bassin immobile, ne laisse pas les hanches osciller.",yt:YT("plank shoulder taps")}
          ]}
      ]}
  ]
},

/* ============================== PRÉ HALTERO ============================== */
{
  id:"prehaltero",
  title:"PRÉ", title2:"HALTERO",
  tag:"Haltérophilie",
  accent:"#ff5a7a",
  blurb:"Mobilité, activation et préparation nerveuse avant une séance d'haltérophilie.",
  meta:["1 séance","22-25 min","Haltéro"],
  intro:"Réveille le système nerveux et les articulations avant la charge. EVERY au début, puis pattern léger. Zéro RPE, juste la technique.",
  sessions:[
    {
      id:"s1",
      t:"MOBILITÉ",
      t2:"HALTÉRO",
      sub:"Activation + pattern spécifique",
      accent:"#ff5a7a",
      pill:"~25 MIN",
      focus:"Prépare le corps à bouger lourd : articulations mobiles, système nerveux réveillé, pattern de mouvement calibré, jamais d'effort.",
      blocks:[
        {
          label:"BLOC A - Mobilité articulaire (EVERY 90s x 4)",
          timer:90,
          note:"Pas de charge, mobilité pure. Une minute = un exercice. Chaque répétition compte.",
          ex:[
            {k:"dislo",name:"Band dislocations (cassé en haut)",reps:"10 reps - min 1",anim:"press",sets:4,cue:"Bande tendue derrière toi. Tire d'avant en arrière, amplitude complète (hanche, poitrine, arrière). Réveille les épaules.",yt:YT("band dislocations shoulder mobility")},
            {k:"cars",name:"Hip CARs",reps:"5 / côté - min 2",anim:"rotate",sets:4,cue:"Debout sur une jambe, genou levé à 90 degrés. Fais tourner le genou (le plus loin possible) en cercle complet. Mobilité hanche active.",yt:YT("hip CARs controlled articular rotations")},
            {k:"ankle",name:"Ankle circles & dorsi/plantarflex",reps:"10 / côté - min 3",anim:"roll",sets:4,cue:"Debout sur une jambe. La jambe libre fait tourner la cheville (cercles gros et lents, deux directions). Essentiel pour le squat.",yt:YT("ankle circles mobility crossfit warm up")},
            {k:"thorax",name:"Thoracic rotations + arm circles",reps:"5 / côté - min 4",anim:"rotate",sets:4,cue:"A 4 pattes, main derrière la tête. Ouvre la poitrine en rotation (coude vers le plafond). Ou: bras tendus, circles (lents, gros).",yt:YT("thoracic rotation mobility shoulder")}
          ]
        },
        {
          label:"BLOC B - Activation neuro (3 tours, pas de timer)",
          note:"Flow continu, pas de repos chronométré. Prépare le système nerveux à se concentrer.",
          ex:[
            {k:"glute",name:"Glute bridges",reps:"12-15 reps",anim:"raise",sets:3,cue:"Allongé dos, pieds à plat près des fesses. Lève les hanches, full squeeze des fessiers en haut (1 sec). Extension hanche = base de l'haltéro.",yt:YT("glute bridges activation squeeze")},
            {k:"scap",name:"Scapula push-ups (ou hollow body shakes)",reps:"10-12 reps",anim:"curl",sets:3,cue:"Planche, jambes tendues. Pousse sans fléchir les coudes (seules les omoplates bougent : protrusion, rétraction). Ou: hollow hold, frotte d'avant en arrière.",yt:YT("scapula push ups shoulder blade activation")},
            {k:"pullparts",name:"Band pull-aparts",reps:"15-20 reps",anim:"row",sets:3,cue:"Bande devant toi à hauteur d'épaule, mains écartées. Tire de chaque côté (le band s'ouvre large). Arrière d'épaule & rhomboïdes.",yt:YT("band pull aparts rear deltoid")}
          ]
        },
        {
          label:"BLOC C - Haltéro pattern spécifique (3 x 2)",
          note:"Léger, technique, zéro force. Intention de vitesse uniquement. Empty bar ou 40% max.",
          ex:[
            {k:"tallclean",name:"Tall cleans",reps:"3 reps",anim:"explo",sets:3,cue:"Debout, barre à la poitrine. Descend en squat (clean dip), remonte explosif. Pattern du clean calibré sans la tirade d'avant.",yt:YT("tall clean weightlifting technique drill")},
            {k:"snatchpull",name:"Snatch pulls (légers)",reps:"3 reps",anim:"press",sets:3,cue:"Barre à terre. Tire jusqu'aux épaules (pas de catch, repose à terre). Extension verticale, shrug complet. Triple extension spécifique.",yt:YT("snatch pulls weightlifting technique")},
            {k:"overhead",name:"Overhead holds (pause + micro-movements)",reps:"3-5 sec",anim:"press",sets:3,timer:true,cue:"Barre overhead, lockout complet. Puis circles légères (barre reste overhead, hanche/thorax bougent). Stability overhead sous charge.",yt:YT("overhead squat hold stability mobility")}
          ]
        }
      ]
    }
  ]
}

];
