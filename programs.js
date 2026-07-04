/* =====================================================================
   PERF LAB — PROGRAMMES PAR DÉFAUT (semence)
   ===================================================================== */

const YT = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

const DEFAULT_PROGRAMS = [

/* ============================ UPPER POWER LAB ============================ */
{
  id:"upper", assign:["moss"],
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
            {k:"wpu",name:"Traction stricte lestée",reps:"3 reps",anim:"pullup",load:true,sets:6,tempo:["X","0","2","0"],key:0,tiers:{u:"kg",steps:[0,2.5,5,7.5,10,12.5,15,17.5,20],start:2},
             cue:"Scapulas engagées AVANT de tirer. Montée explosive, descente 2″. ~80-85 % du max lesté.",yt:YT("weighted pull up strict form")},
            {k:"wdip",name:"Dips lestées",reps:"4 reps",anim:"dip",load:true,sets:6,tempo:["3","0","1","0"],key:0,tiers:{u:"kg",steps:[0,5,10,15,20,25,30],start:2},
             cue:"Épaules basses, pas de rebond en bas. Buste légèrement penché = plus de pec.",yt:YT("weighted dips strict")}
          ]},
        { label:"FINISHER — 3 séries", note:"Habitue le corps au lest sous tension longue.",
          ex:[
            {k:"hang",name:"Dead hang lesté",reps:"max",anim:"hang",load:true,sets:3,timer:true,tiers:{u:"kg",steps:[0,5,10,15,20,25],start:1},
             cue:"Grip ferme, gainage actif, épaules engagées. Renforce la prise pour les tractions lourdes.",yt:YT("weighted dead hang")}
          ]}
      ]},
    { id:"s2", t:"PUISS-", t2:"ANCE", sub:"Contraste · explosivité", accent:"#4dd2ff", pill:"~14 MIN",
      focus:"Développer la vitesse de production de force. Tirage explosif + poussée pliométrique en contraste.",
      blocks:[
        { label:"EMOM 14′ — alternance / minute", emom:14, note:"Repos réel entre efforts. Vitesse > fatigue : si la vitesse chute, baisse les reps.",
          ex:[
            {k:"expull",name:"Traction explosive (C2B / high pull)",reps:"3 reps · min impaires",anim:"explo",load:true,sets:7,tiers:{u:"kg",steps:[0,2.5,5,7.5,10],start:2},
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
            {k:"row",name:"Rowing haltère 1 bras (appui au banc)",reps:"8-10 reps",anim:"row",load:true,sets:4,tempo:["2","1","1","0"],key:2,target:"24-26 kg / haltère",tiers:{u:"kg",steps:[18,20,22,24,26,28,30,32],start:3},
             cue:"Genou et main en appui sur le banc, dos à plat. 1″ de pause en haut, coude vers la hanche.",yt:YT("one arm dumbbell row bench form")},
            {k:"bench",name:"Développé couché (ou DB bench)",reps:"8-10 reps",anim:"bench",load:true,sets:4,tempo:["3","1","1","0"],key:0,target:"55-60 kg",tiers:{u:"kg",steps:[45,50,55,60,65,70,75],start:2},
             cue:"Descente 3″ contrôlée, omoplates serrées. Amplitude complète.",yt:YT("barbell bench press form")}
          ]},
        { label:"FINISHER BRAS B — 3 tours",
          ex:[
            {k:"curl",name:"Curl barre / haltères",reps:"10-12 reps",anim:"curl",load:true,sets:3,tempo:["2","0","2","0"],key:2,target:"28-30 kg",tiers:{u:"kg",steps:[22,24,26,28,30,32,34],start:3},
             cue:"Coudes fixes, pas d'élan. Squeeze en haut.",yt:YT("barbell biceps curl form")},
            {k:"tri",name:"Extension triceps (skull / banded)",reps:"max",anim:"curl",load:true,sets:3,target:"poids du corps / élastique — RPE 9",
             cue:"Coudes serrés et fixes, extension complète. Jusqu'à la chauffe.",yt:YT("barbell skullcrusher triceps")}
          ]}
      ]},
    { id:"s4", t:"ÉPAULE", t2:"OVERHEAD", sub:"Pressing vertical · prévention", accent:"#ff5a7a", pill:"~15 MIN",
      focus:"Force overhead + assurance de l'épaule qui encaisse tout le tirage de la semaine. Ne saute jamais cette séance.",
      blocks:[
        { label:"BLOC A — EVERY 2′ × 5", timer:120, note:"Gainage, pas de cambrure lombaire sur le pressing.",
          ex:[
            {k:"zpress",name:"Z-press (ou strict press)",reps:"6 reps",anim:"press",load:true,sets:5,tempo:["2","0","1","0"],key:0,tiers:{u:"kg",steps:[20,25,30,35,40,45,50],start:2},
             cue:"Assis jambes tendues = zéro triche. Verrouille en haut, abdos serrés.",yt:YT("z press strict overhead")},
            {k:"tpu",name:"Traction stricte (poids du corps)",reps:"5-8 reps",anim:"pullup",sets:5,tempo:["3","0","X","1"],key:0,
             cue:"Descente lente : ici on travaille la QUALITÉ de mouvement, sans lest.",yt:YT("strict pull up tempo")}
          ]},
        { label:"PRÉVENTION B — 3 tours", note:"Le filet de sécurité. Léger, propre, sans douleur.",
          ex:[
            {k:"kb",name:"KB bottom-up press hold",reps:"20″ / bras",anim:"press",sets:3,timer:true,tiers:{u:"s",steps:[15,20,25,30,40],start:1},
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
  id:"core", assign:["moss"], v:3,
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
            {k:"plcrunch",name:"Crunch lesté au sol (jambes 90/90)",reps:"8-10 reps",anim:"crunch",load:true,sets:5,tiers:{u:"kg",steps:[5,10,15,20,25],start:1},
             cue:"Allongé, hanches et genoux à 90°, plaque serrée sur la poitrine. Enroule le THORAX seulement — amplitude courte, lombaires collées au sol du début à la fin. Zéro traction sur le dos, zéro matériel de poulie.",yt:YT("weighted floor crunch legs elevated")},
            {k:"t2b",name:"Strict toes-to-bar (ou strict hanging leg raise)",reps:"5-8 reps",anim:"raise",sets:5,tempo:["3","0","X","0"],key:0,tiers:{u:"reps",steps:[5,6,8,10],start:0},
             cue:"Descente 3″ contrôlée, pas de balancier. Strict avant tout.",yt:YT("strict toes to bar")}
          ]},
        { label:"FINISHER — 3 minutes",
          ex:[
            {k:"hollow",name:"Hollow rock",reps:"30-45 s",anim:"hold",sets:3,timer:true,tiers:{u:"s",steps:[30,35,40,45,60],start:0},
             cue:"Lombaires plaquées au sol, exagère la fermeture.",yt:YT("hollow rock crossfit")}
          ]}
      ]},
    { id:"s2", t:"ANTI-", t2:"EXTENSION", sub:"Gainage lourd", accent:"#ffb02e", pill:"~12 MIN",
      focus:"Résister à l'extension lombaire sous charge — le gainage qui protège le bas du dos.",
      blocks:[
        { label:"SUPERSET — 5 tours", note:"À distance de tes jours de deadlift/squat lourds. Coupe à la moindre gêne lombaire.",
          ex:[
            {k:"rollout",name:"Ab-wheel rollout (ou rollout barre chargée)",reps:"6-8 reps",anim:"roll",load:true,sets:5,tiers:{u:"reps",steps:[6,8,10,12],start:0},
             cue:"Progression genoux → debout. Bassin rétroversé, jamais de cambrure.",yt:YT("ab wheel rollout progression")},
            {k:"plank",name:"Planche longue / lestée",reps:"30-40 s",anim:"hold",load:true,sets:5,timer:true,tiers:{u:"s",steps:[30,40,45,60,75],start:0},
             cue:"Ligne tête-talons, fessiers serrés. Pose une plaque sur le dos pour charger.",yt:YT("weighted plank")}
          ]},
        { label:"FINISHER — 3 minutes",
          ex:[
            {k:"deadbug",name:"Dead bug lesté (ultra-lent)",reps:"10 / côté",anim:"raise",load:true,sets:3,tiers:{u:"reps",steps:[8,10,12,15],start:1},
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
            {k:"sideplank",name:"Side plank lesté",reps:"30 s / côté",anim:"hold",load:true,sets:5,timer:true,tiers:{u:"s",steps:[30,35,40,45,60],start:0},
             cue:"Hanche haute, corps en ligne. Plaque sur la hanche pour charger.",yt:YT("weighted side plank")},
            {k:"suitcase",name:"Suitcase carry KB lourd",reps:"30-40 m",anim:"carry",load:true,sets:5,tiers:{u:"kg",steps:[16,20,24,28,32],start:1},
             cue:"Une seule charge, reste vertical sans pencher. Anti-flexion latérale pure.",yt:YT("suitcase carry kettlebell")}
          ]},
        { label:"FINISHER",
          ex:[
            {k:"twist",name:"Russian twist plaque / KB",reps:"20 reps",anim:"rotate",load:true,sets:3,tiers:{u:"kg",steps:[5,10,15,20],start:1},
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

/* ============================== LOWER LAB ==============================
   Rééducation genou & bas du corps. Progression conditionnelle par RPE :
   RPE ≤ 6 sur toutes les séries → palier supérieur à la séance suivante,
   RPE 7-8 → maintien, RPE ≥ 9 ou douleur → palier précédent.            */
{
  id:"lower", assign:["moss"],
  title:"LOWER", title2:"LAB",
  tag:"Bas du corps · Genou",
  accent:"#a78bfa",
  blurb:"Rééducation genou : force excentrique + yielding isométrique. Progression pilotée par le RPE.",
  meta:["2 séances","~30 min","Rééduc / Force"],
  intro:"J1 excentrique (chaîne postérieure & tolérance flexion), J2 yielding iso (tenir sous charge). Après chaque exercice, note ton RPE : ≤6 monte d'un palier, 7-8 maintient, ≥9 ou douleur redescend.",
  sessions:[
    { id:"j1", t:"J1", t2:"EXCENTRIQUE", sub:"Chaîne postérieure · contrôle", accent:"#a78bfa", pill:"~30 MIN",
      focus:"Force excentrique et stabilisation du genou : descentes lentes, remontées propres. Charge réelle mais jamais dans la douleur.",
      blocks:[
        { label:"BLOC A — Chaîne postérieure · EVERY 2′", timer:120, note:"Hanches vers l'arrière, contrôle total en descente, remontée explosive. Renforce la chaîne postérieure → stabilise le genou indirectement.",
          ex:[
            {k:"rdl",name:"RDL / Back Squat",reps:"6 reps",anim:"explo",load:true,sets:3,tempo:["3","0","X","0"],key:0,tiers:{u:"kg",steps:[40,50,60,70,80,90,100],start:2},
             cue:"3″ de descente hanches en arrière, zéro pause en bas, remontée explosive en poussant dans le sol, fessiers actifs.",yt:YT("romanian deadlift eccentric control form")}
          ]},
        { label:"BLOC B — Tolérance flexion genou · superset", timer:120, note:"Apprend au genou à tolérer la flexion sans stress excessif. Hauteur de box basse au début.",
          ex:[
            {k:"goblet",name:"Goblet Squat Box",reps:"6 reps",anim:"dip",load:true,sets:3,tempo:["4","1","1","0"],key:0,tiers:{u:"kg",steps:[8,12,16,20,24,28,32],start:2},
             cue:"4″ de descente, se poser sur la box sans écraser, remonter sans élan. Le tempo est l'exercice.",yt:YT("goblet box squat tempo")},
            {k:"stepup",name:"Step-Up bas contrôlé",reps:"8 reps / jambe",anim:"raise",load:true,sets:3,tempo:["3","1","1","1"],key:0,tiers:{u:"kg",steps:[0,4,8,12,16,20],start:0},
             cue:"Talon entier sur la box, 1″ de stabilisation en haut, 3″ de descente — la phase clé. Sans rebond en bas.",yt:YT("step up eccentric control knee")}
          ]},
        { label:"BLOC C — Fessiers & contrôle latéral · superset", timer:120, note:"Fessiers = stabilisateurs majeurs du genou. Contrôle et activation, pas la charge.",
          ex:[
            {k:"bridge",name:"Hip Bridge barre lourde",reps:"6 reps",anim:"raise",load:true,sets:3,tempo:["1","1","3","3"],key:2,tiers:{u:"kg",steps:[40,50,60,70,80,90],start:1},
             cue:"Montée en 3″, 3″ de contraction en haut, redescente contrôlée. Squeeze maximal des fessiers.",yt:YT("barbell hip thrust glute bridge")},
            {k:"abd",name:"Abduction hanche (élastique / machine)",reps:"8-15 / côté",anim:"rotate",sets:3,tempo:["2","1","2","1"],key:0,tiers:{u:"reps",steps:[8,10,12,15],start:0},
             cue:"Mouvement lent, bassin stable. Moyen fessier = anti-valgus du genou.",yt:YT("hip abduction band glute medius")}
          ]},
        { label:"FINISHER — Isométrique", note:"Dos au mur, cuisses parallèles au sol. Monte en temps quand le RPE le permet.",
          ex:[
            {k:"wallsit",name:"Wall Sit",reps:"tenue chronométrée",anim:"hold",sets:3,timer:true,tiers:{u:"s",steps:[30,35,40,45,50,60],start:0},
             cue:"Dos plaqué au mur, genoux à 90°, poids dans les talons. Respire, ne bloque pas.",yt:YT("wall sit form knee")}
          ]}
      ]},
    { id:"j2", t:"J2", t2:"YIELDING ISO", sub:"Tenir sous charge · tendon", accent:"#4dd2ff", pill:"~30 MIN",
      focus:"Isométrie yielding : tenir une position sous charge jusqu'au palier cible. Le tendon et le genou apprennent à encaisser — intensité pilotée par le RPE, jamais par la douleur.",
      blocks:[
        { label:"BLOC A — Quadriceps yielding · EVERY 90″", timer:90, note:"Les tenues longues à intensité modérée calment le tendon et construisent la tolérance. Douleur > 3/10 = redescendre d'un palier.",
          ex:[
            {k:"spsquat",name:"Spanish Squat iso (élastique derrière les genoux)",reps:"tenue / palier",anim:"hold",sets:3,timer:true,tiers:{u:"s",steps:[20,30,40,45,60],start:1},
             cue:"Élastique fort derrière les genoux, tibias verticaux, s'asseoir dans la sangle. Quadriceps en tension constante, buste droit.",yt:YT("spanish squat isometric knee tendon")},
            {k:"wallsit2",name:"Wall Sit profond (lesté si facile)",reps:"tenue / palier",anim:"hold",load:true,sets:3,timer:true,tiers:{u:"s",steps:[30,40,45,60,75,90],start:0},
             cue:"Plus profond qu'en J1 si toléré. Plaque sur les cuisses pour charger quand le RPE passe sous 6.",yt:YT("weighted wall sit deep")}
          ]},
        { label:"BLOC B — Unilatéral · superset", timer:120, note:"Une jambe à la fois : le côté opéré/faible dicte le palier. Symétrie avant intensité.",
          ex:[
            {k:"splitiso",name:"Split Squat iso (bas de fente)",reps:"tenue / jambe",anim:"hold",sets:3,timer:true,tiers:{u:"s",steps:[15,20,25,30,40,45],start:1},
             cue:"Genou arrière à 2-3 cm du sol, tibia avant vertical. Tenir immobile, bassin droit.",yt:YT("split squat isometric hold bottom")},
            {k:"calfiso",name:"Calf Raise iso (mi-hauteur, unilatéral)",reps:"tenue / jambe",anim:"hold",sets:3,timer:true,tiers:{u:"s",steps:[20,30,40,45,60],start:0},
             cue:"Sur une jambe, talon à mi-hauteur, immobile. Le soléaire protège le genou à la réception.",yt:YT("single leg calf raise isometric hold")}
          ]},
        { label:"BLOC C — Chaîne postérieure iso + accessoire", note:"Finir par l'arrière de la jambe et le verrouillage du genou en extension.",
          ex:[
            {k:"hamiso",name:"Hamstring Bridge iso (talons surélevés)",reps:"tenue / palier",anim:"raise",sets:3,timer:true,tiers:{u:"s",steps:[20,30,40,45,60],start:1},
             cue:"Talons sur une box basse, hanches hautes, tenir. Ischio-jambiers = frein du genou.",yt:YT("hamstring bridge isometric hold heels elevated")},
            {k:"tke",name:"Terminal Knee Extension (élastique)",reps:"répétitions / palier",anim:"curl",sets:3,tiers:{u:"reps",steps:[12,15,20,25],start:1},
             cue:"Élastique derrière le genou, verrouiller en extension complète, 2″ de squeeze du quadriceps. Léger et propre.",yt:YT("terminal knee extension band tke")}
          ]}
      ]}
  ]
},

/* ============================== HYROX LAB ==============================
   Préparation Hyrox, phase de base (échéance 4-6 mois). Point faible
   ciblé : la course — allure actuelle 5:00-5:30/km, objectif en faire
   une arme et une récupération active entre les stations. 3 séances :
   base aérobie, seuil, hybride course+stations (compromised running). */
{
  id:"hyrox", assign:["moss"], v:2,
  title:"HYROX", title2:"LAB",
  tag:"Hybride · Course",
  accent:"#4de0a6",
  blurb:"Après le 1h19 en binôme au Grand Palais : transformer la course en point fort, en protégeant le pied droit.",
  meta:["3 séances","40-60 min","Hyrox / Engine"],
  intro:"Phase de base : du volume facile avant l'intensité. S1 construit le moteur (Z2 — plus lent que ta moyenne, c'est voulu), S2 fait descendre la moyenne (seuil), S3 t'apprend à courir après les stations. ⚠️ Pied droit (5ᵉ métatarsien consolidé + plateau tibial) : toute gêne au pied, à la cheville ou au genou droit = bouton DOULEUR, le palier redescend. Le volume ne monte que si le pied reste silencieux.",
  sessions:[
    { id:"s1", t:"BASE", t2:"AÉROBIE", sub:"Z2 · strides · pied", accent:"#4de0a6", pill:"~50 MIN",
      focus:"Le moteur diesel : courir FACILE, longtemps. C'est cette séance qui rendra les courses de l'Hyrox confortables — et fera de la course ta récupération active.",
      blocks:[
        { label:"BLOC A — Footing Z2", note:"Allure conversation : 6:00-6:30/km pour toi. Oui, bien plus lent que ta moyenne — si tu peux parler en phrases complètes, c'est la bonne allure. Le RPE se juge sur la FIN de la sortie.",
          ex:[
            {k:"footz2",name:"Footing Z2 continu",reps:"durée / palier",anim:"carry",sets:1,timer:true,tiers:{u:"min",steps:[30,35,40,45,50,60],start:1},
             cue:"Nez qui respire, foulée courte et fréquente (~170-180 pas/min) — la cadence haute réduit la charge sur le métatarse. Le volume ne monte que si le pied droit reste muet 48 h après la sortie.",yt:YT("zone 2 running base training")}
          ]},
        { label:"BLOC B — Strides", note:"De la vitesse gratuite en fin de footing : jambes fraîches en mémoire, zéro fatigue ajoutée.",
          ex:[
            {k:"strides",name:"Lignes droites progressives (20″)",reps:"accélérations / palier",anim:"explo",sets:1,tiers:{u:"reps",steps:[4,6,8,10],start:1},
             cue:"Accélère progressivement jusqu'à ~90 % sur 20″, marche 60″ entre chaque. Grande foulée relâchée, bras actifs.",yt:YT("running strides technique")}
          ]},
        { label:"BLOC C — Pied & mollets (reconstruction)", note:"Ton pied droit sort d'une fracture du 5ᵉ métatarsien : on le RECONSTRUIT avant de le faire rebondir. Le renfo lent d'abord, la corde seulement quand tout est silencieux.",
          ex:[
            {k:"calfslow",name:"Calf raise lent unilatéral (marche d'escalier)",reps:"reps / palier · par jambe",anim:"hold",sets:3,tempo:["3","1","2","1"],key:0,tiers:{u:"reps",steps:[8,10,12,15,20],start:1},
             cue:"Sur une marche, descente 3″ sous l'horizontale, montée contrôlée. Commence TOUJOURS par le pied droit : c'est lui qui fixe la dose du gauche.",yt:YT("single leg calf raise eccentric slow")},
            {k:"rope",name:"Corde à sauter (optionnelle, pied silencieux uniquement)",reps:"tenue / palier",anim:"pulse",sets:2,timer:true,tiers:{u:"s",steps:[30,45,60,90,120],start:0},
             cue:"Seulement si zéro gêne au 5ᵉ métatarsien et à la cheville droite ce jour-là. Rebonds BAS, souples, silencieux — au moindre signal, stop et bouton douleur.",yt:YT("jump rope boxer skip footwork")}
          ]}
      ]},
    { id:"s2", t:"SEUIL", t2:"TEMPO", sub:"Faire descendre la moyenne", accent:"#ffb02e", pill:"~45 MIN",
      focus:"La séance qui transforme 5:15/km en 4:50/km : des blocs soutenus mais contrôlés, jamais à fond. C'est inconfortable-stable, pas la guerre.",
      blocks:[
        { label:"ÉCHAUFFEMENT — 12 min", note:"Toujours complet avant le seuil : 10 min footing progressif + gammes.",
          ex:[
            {k:"warm2",name:"Footing progressif + gammes (montées de genoux, talons-fesses)",reps:"10 min + 2×30 m de chaque",anim:"carry",sets:1,
             cue:"Termine l'échauffement proche de l'allure seuil sur la dernière minute.",yt:YT("running warm up drills")}
          ]},
        { label:"BLOC SEUIL — 5 min / bloc · récup 90″", note:"Allure cible 4:50-5:05/km (à ajuster : tu dois pouvoir dire 3-4 mots, pas plus). Coche une case par bloc réalisé — le palier fixe le nombre de blocs du jour.",
          ex:[
            {k:"thresh",name:"Intervalles seuil 5 min",reps:"blocs / palier",anim:"explo",sets:6,tiers:{u:"reps",steps:[3,4,5,6],start:0},
             cue:"Régularité absolue : le dernier bloc à la même allure que le premier. Si l'allure s'effondre, arrête — le RPE le dira.",yt:YT("threshold interval running workout")}
          ]},
        { label:"RETOUR AU CALME — 10 min",
          ex:[
            {k:"cool2",name:"Footing Z1 très facile",reps:"10 min",anim:"carry",sets:1,
             cue:"Trot lent, relâché. C'est ici que tu t'entraînes à récupérer en courant — le réflexe Hyrox.",yt:YT("cool down jog recovery")}
          ]}
      ]},
    { id:"s3", t:"HYBRIDE", t2:"COMPROMIS", sub:"Courir après les stations", accent:"#ff5a7a", pill:"~50 MIN",
      focus:"La signature Hyrox : courir vite sur des jambes détruites par le sled. On répète le geste jusqu'à ce qu'il devienne normal.",
      blocks:[
        { label:"ÉCHAUFFEMENT ERG — 8 min", note:"Monte en température sans entamer les jambes.",
          ex:[
            {k:"erg",name:"SkiErg + rameur alternés (2 × 500 m chaque, facile)",reps:"8 min",anim:"row",sets:1,
             cue:"Cadence tranquille, technique propre. Fin d'échauffement : 200 m un peu plus appuyés.",yt:YT("skierg technique basics")}
          ]},
        { label:"BLOC A — Sled + course · 4 tours", note:"Le cœur de la séance : sled lourd puis course IMMÉDIATE à allure Hyrox (5:15-5:30/km). Le RPE se juge sur la qualité de la course, pas sur le sled.",
          ex:[
            {k:"sled",name:"Sled push lourd (15-20 m)",reps:"1 poussée / tour",anim:"carry",load:true,sets:4,tiers:{u:"kg",steps:[40,60,80,100,120],start:1},
             cue:"Bras tendus ou fléchis mais dos long, pas de sautillement — des appuis qui poussent. Lourd mais continu.",yt:YT("sled push technique hyrox")},
            {k:"runpost",name:"Course post-sled (allure Hyrox, régulière)",reps:"distance / palier · par tour",anim:"explo",sets:4,tiers:{u:"m",steps:[200,300,400,600],start:2},
             cue:"Départ dans les 10″ après le sled. Les 100 premiers mètres sont horribles : raccourcis la foulée, monte la fréquence, l'allure revient.",yt:YT("compromised running hyrox training")}
          ]},
        { label:"BLOC B — Stations · superset 3 tours", note:"Enchaîné, récup 60-90″ entre les tours.",
          ex:[
            {k:"wb",name:"Wall balls",reps:"reps / palier",anim:"press",sets:3,tiers:{u:"reps",steps:[15,20,25,30],start:1},
             cue:"Squat complet, cible haute, rythme métronome — casse les séries avant d'y être obligé.",yt:YT("wall ball efficiency hyrox")},
            {k:"bbj",name:"Burpee broad jumps (réception amortie)",reps:"reps / palier",anim:"explo",sets:3,tiers:{u:"reps",steps:[6,8,10,12,15],start:0},
             cue:"Saute loin plutôt que haut, réception fléchie et SILENCIEUSE — c'est le pied droit qui décide du volume. Option sans saut si sensible : burpee step-back + grand pas marché.",yt:YT("burpee broad jump technique")}
          ]},
        { label:"FINISHER — Porté + fentes", note:"Les deux dernières stations de l'Hyrox, sur jambes cuites.",
          ex:[
            {k:"fcarry",name:"Farmer carry 2 KB (2 × 100 m / tour)",reps:"200 m / tour",anim:"carry",load:true,sets:3,tiers:{u:"kg",steps:[16,20,24,28,32],start:1},
             cue:"Épaules basses, pas rapides et courts. Le grip lâche ? Pose, secoue 5″, repars.",yt:YT("farmer carry hyrox kettlebell")},
            {k:"lunge",name:"Fentes marchées sandbag (épaules)",reps:"20 pas / tour",anim:"raise",load:true,sets:3,tiers:{u:"kg",steps:[10,15,20,25,30],start:1},
             cue:"Genou arrière qui frôle le sol, buste droit sous le sac. Des pas mesurés, pas des chutes.",yt:YT("sandbag walking lunge hyrox")}
          ]}
      ]}
  ]
},

/* ============================== PULL-UP LAB (Souad) ==============================
   Retour aux tractions après grossesse et arrêt du CrossFit. Base sportive
   solide : technique acquise, la force se reconstruit vite avec du volume
   propre et une progression RPE. Objectif : 1ʳᵉ traction stricte, puis 5.  */
{
  id:"pullup", assign:["souad"],
  title:"PULL-UP", title2:"LAB",
  tag:"Haut du corps · Retour",
  accent:"#b6f24e",
  blurb:"Retrouver les tractions et la force du haut du corps. Progression RPE, du contrôle vers la barre.",
  meta:["3 séances","~25 min","Force / Retour"],
  intro:"Tu sais déjà tirer — on reconstruit le moteur. Négatives et scapula d'abord, poussée et rowing pour l'équilibre, volume élastique pour le chemin vers la 1ʳᵉ stricte. RPE ≤6 monte, 7-8 maintient, ≥9 ou douleur descend.",
  sessions:[
    { id:"s1", t:"TIRAGE", t2:"VERTICAL", sub:"Négatives · scapula · barre", accent:"#b6f24e", pill:"~25 MIN",
      focus:"Le cœur du retour : temps sous tension sur la barre. Les négatives lentes reconstruisent exactement la force de la traction.",
      blocks:[
        { label:"BLOC A — Négatives strictes · 4 séries", note:"Saute ou monte sur box jusqu'au menton au-dessus de la barre, descends le plus lentement possible (cible 4-5″). La qualité de CHAQUE descente compte plus que le nombre.",
          ex:[
            {k:"negpu",name:"Traction négative (5″ de descente)",reps:"reps / palier",anim:"pullup",sets:4,tempo:["5","0","X","0"],key:0,tiers:{u:"reps",steps:[2,3,4,5,6],start:0},
             cue:"Menton au-dessus de la barre au départ, coudes qui résistent jusqu'aux bras tendus. Si la descente passe sous 3″, arrête la série.",yt:YT("negative pull up eccentric progression")},
            {k:"scap",name:"Scapula pull-ups",reps:"reps / palier",anim:"hang",sets:4,tiers:{u:"reps",steps:[5,8,10,12],start:1},
             cue:"Bras tendus, hausse et abaisse les épaules sans plier les coudes. C'est le premier étage de la traction.",yt:YT("scapula pull ups activation")}
          ]},
        { label:"BLOC B — Tirage assisté · superset 3 tours", note:"L'élastique enlève juste ce qu'il faut. Change de bande quand le RPE passe sous 6, pas avant.",
          ex:[
            {k:"bandpu",name:"Traction élastique (bande sous les pieds)",reps:"reps / palier",anim:"pullup",sets:3,tempo:["2","0","X","0"],key:2,tiers:{u:"reps",steps:[3,4,5,6,8],start:1},
             cue:"Stricte : pas de kip, poitrine vers la barre. Monte en reps au fil des semaines, puis passe à une bande plus fine.",yt:YT("band assisted pull up strict form")},
            {k:"row1",name:"Ring row / rowing inversé",reps:"reps / palier",anim:"row",sets:3,tempo:["2","1","1","0"],key:0,tiers:{u:"reps",steps:[6,8,10,12],start:1},
             cue:"Corps gainé en planche, tire la poitrine vers les anneaux/barre. Plus les pieds avancent, plus c'est dur.",yt:YT("ring row bodyweight progression")}
          ]},
        { label:"FINISHER — Grip & épaules", note:"La barre doit redevenir un endroit confortable.",
          ex:[
            {k:"hang2",name:"Dead hang actif",reps:"tenue / palier",anim:"hang",sets:3,timer:true,tiers:{u:"s",steps:[15,20,30,40,60],start:1},
             cue:"Épaules engagées (pas affaissées), grip ferme, corps gainé. Respire calmement.",yt:YT("active dead hang shoulder engaged")}
          ]}
      ]},
    { id:"s2", t:"FORCE", t2:"POUSSÉE", sub:"Press · pompes · équilibre", accent:"#ffb02e", pill:"~25 MIN",
      focus:"L'autre moitié du haut du corps : pousser fort pour équilibrer le tirage et protéger les épaules.",
      blocks:[
        { label:"BLOC A — Poussée · superset 4 tours", note:"Charges franches, RPE honnête. La force revient plus vite qu'elle n'est partie.",
          ex:[
            {k:"dbpress",name:"Développé haltères (assis ou debout)",reps:"8-10 reps",anim:"press",load:true,sets:4,tempo:["2","0","1","0"],key:2,tiers:{u:"kg",steps:[6,8,10,12,14,16],start:1},
             cue:"Gainage serré, pas de cambrure. Verrouille en haut sans hausser les épaules.",yt:YT("dumbbell shoulder press seated form")},
            {k:"pushup",name:"Pompes (surélevées → sol → lestées)",reps:"reps / palier",anim:"dip",sets:4,tempo:["2","0","1","0"],key:0,tiers:{u:"reps",steps:[5,8,10,12,15,20],start:1},
             cue:"Mains sous les épaules, corps rigide. Trop dur au sol ? Mains sur un banc. Trop facile ? Lesté ou pieds surélevés.",yt:YT("push up progression form")}
          ]},
        { label:"BLOC B — Tirage horizontal lourd · 3 séries", note:"Le rowing construit le dos qui portera tes tractions.",
          ex:[
            {k:"dbrow",name:"Rowing haltère 1 bras",reps:"8-10 reps",anim:"row",load:true,sets:3,tempo:["2","1","1","0"],key:2,tiers:{u:"kg",steps:[8,10,12,14,16,18,20],start:1},
             cue:"Appui au banc, dos plat, coude vers la hanche, 1″ de pause en haut.",yt:YT("one arm dumbbell row form")}
          ]},
        { label:"FINISHER — Gainage progressif", note:"Reconstruction de la sangle abdominale en douceur : contrôle avant intensité.",
          ex:[
            {k:"deadbug2",name:"Dead bug (lent, lombaires plaquées)",reps:"reps / côté",anim:"raise",sets:3,tiers:{u:"reps",steps:[8,10,12,15],start:0},
             cue:"Lombaires collées au sol en permanence. Si le dos décolle, réduis l'amplitude. Post-grossesse : c'est l'exercice roi.",yt:YT("dead bug core exercise slow")}
          ]}
      ]},
    { id:"s3", t:"VOLUME", t2:"& CHEMIN", sub:"Iso · volume · grip", accent:"#4dd2ff", pill:"~22 MIN",
      focus:"Accumuler du temps de qualité : tenue au-dessus de la barre, volume de tirage, grip. C'est ici que la 1ʳᵉ stricte se débloque.",
      blocks:[
        { label:"BLOC A — Isométrie haute · 4 séries", note:"Tenir menton au-dessus de la barre = la position que ton corps doit réapprendre à posséder.",
          ex:[
            {k:"chinhold",name:"Chin-over-bar hold (élastique si besoin)",reps:"tenue / palier",anim:"pullup",sets:4,timer:true,tiers:{u:"s",steps:[5,10,15,20,30],start:0},
             cue:"Menton au-dessus, coudes fléchis serrés, épaules basses. Descends contrôlé quand tu lâches — bonus de négative.",yt:YT("chin over bar hold isometric")}
          ]},
        { label:"BLOC B — Volume de tirage · superset 3 tours", note:"Du volume propre, jamais à l'échec. La technique reste parfaite du premier au dernier rep.",
          ex:[
            {k:"row2",name:"Ring row tempo (3″ de descente)",reps:"reps / palier",anim:"row",sets:3,tempo:["3","0","1","1"],key:0,tiers:{u:"reps",steps:[6,8,10,12],start:0},
             cue:"Même exercice qu'en S1 mais descente 3″. Le tempo transforme un exercice facile en constructeur de force.",yt:YT("ring row tempo eccentric")},
            {k:"curl2",name:"Curl haltères (biceps = assistants de la traction)",reps:"10-12 reps",anim:"curl",load:true,sets:3,tiers:{u:"kg",steps:[4,6,8,10,12],start:1},
             cue:"Coudes fixes, montée contrôlée. Des biceps solides = des tractions qui finissent.",yt:YT("dumbbell biceps curl form")}
          ]},
        { label:"FINISHER — Grip & posture", note:"Le grip lâche souvent avant le dos. On le blinde.",
          ex:[
            {k:"carry2",name:"Farmer carry (2 charges lourdes)",reps:"30-40 m",anim:"carry",load:true,sets:3,tiers:{u:"kg",steps:[12,16,20,24,28],start:1},
             cue:"Épaules basses et en arrière, marche droite. Charges qui obligent à serrer fort.",yt:YT("farmer carry grip posture")},
            {k:"kneeraise",name:"Hanging knee raises",reps:"reps / palier",anim:"raise",sets:3,tiers:{u:"reps",steps:[5,8,10,12],start:0},
             cue:"Suspendue à la barre, monte les genoux sans balancier. Grip + abdos + habitude de la barre.",yt:YT("hanging knee raise strict")}
          ]}
      ]},
    { id:"s4", t:"TEST", t2:"STRICTE", sub:"Jalon · toutes les 2 semaines", accent:"#ff5a7a", pill:"~10 MIN",
      focus:"Le juge de paix : combien de tractions strictes aujourd'hui ? Toutes les 2 semaines, fraîche, après un bon échauffement. 0 n'est pas un échec, c'est une mesure.",
      blocks:[
        { label:"ÉCHAUFFEMENT — 5 minutes", note:"Jamais de test à froid : le résultat serait faussé et l'épaule n'aimerait pas.",
          ex:[
            {k:"warmup",name:"Scapula pull-ups + dead hang + 2-3 tractions élastiques",reps:"2 tours légers",anim:"hang",sets:2,
             cue:"Monte progressivement en intensité. Arrête-toi loin de la fatigue : le test doit te trouver fraîche.",yt:YT("pull up warm up routine")}
          ]},
        { label:"LE TEST — 1 seule tentative", note:"Max de tractions strictes, sans élan, menton au-dessus. Note le résultat même si c'est 0 : la courbe se construit mesure après mesure.",
          ex:[
            {k:"testpu",name:"Tractions strictes — tentative max",reps:"max reps",anim:"pullup",sets:1,test:true,
             cue:"Départ bras tendus, zéro kip, menton clairement au-dessus de la barre. Arrête à la première rep dégradée.",yt:YT("strict pull up standard")}
          ]}
      ]}
  ]
},

/* ============================== PRÉ HALTERO ============================== */
{
  id:"prehaltero", assign:["souad"],
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
