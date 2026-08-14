/* ============================ PERF LAB — MOTEUR ============================ */

/* ---- figures animées (SVG) ---- */
const FIG = {
  pullup:`<svg class="fig a-pullup" viewBox="0 0 54 54"><line class="bar" x1="10" y1="13" x2="44" y2="13"/><g class="mover"><line x1="20" y1="13" x2="22" y2="24"/><line x1="34" y1="13" x2="32" y2="24"/><circle cx="27" cy="28" r="4"/><line x1="27" y1="32" x2="27" y2="42"/><line x1="27" y1="42" x2="22" y2="49"/><line x1="27" y1="42" x2="32" y2="49"/></g></svg>`,
  explo:`<svg class="fig a-explo" viewBox="0 0 54 54"><line class="bar" x1="10" y1="13" x2="44" y2="13"/><g class="mover"><line x1="20" y1="13" x2="22" y2="23"/><line x1="34" y1="13" x2="32" y2="23"/><circle cx="27" cy="27" r="4"/><line x1="27" y1="31" x2="27" y2="41"/><line x1="27" y1="41" x2="22" y2="48"/><line x1="27" y1="41" x2="32" y2="48"/></g></svg>`,
  dip:`<svg class="fig a-dip" viewBox="0 0 54 54"><line class="bar" x1="13" y1="20" x2="13" y2="44"/><line class="bar" x1="41" y1="20" x2="41" y2="44"/><g class="mover"><circle cx="27" cy="22" r="4"/><line x1="27" y1="26" x2="27" y2="38"/><line x1="27" y1="28" x2="14" y2="22"/><line x1="27" y1="28" x2="40" y2="22"/><line x1="27" y1="38" x2="23" y2="46"/><line x1="27" y1="38" x2="31" y2="46"/></g></svg>`,
  press:`<svg class="fig a-press" viewBox="0 0 54 54"><line class="bar" x1="16" y1="40" x2="38" y2="40"/><circle cx="27" cy="30" r="4"/><line x1="27" y1="34" x2="27" y2="41"/><g class="mover"><line class="bar" x1="17" y1="11" x2="37" y2="11"/><line x1="22" y1="13" x2="24" y2="27"/><line x1="32" y1="13" x2="30" y2="27"/></g></svg>`,
  row:`<svg class="fig a-row" viewBox="0 0 54 54"><line x1="10" y1="30" x2="34" y2="30"/><circle cx="38" cy="28" r="4"/><g class="mover"><line class="bar" x1="22" y1="44" x2="22" y2="33"/><line x1="22" y1="34" x2="34" y2="31"/></g></svg>`,
  bench:`<svg class="fig a-bench" viewBox="0 0 54 54"><line class="bar" x1="10" y1="38" x2="44" y2="38"/><circle cx="16" cy="32" r="4"/><line x1="20" y1="33" x2="34" y2="33"/><g class="mover"><line class="bar" x1="22" y1="14" x2="42" y2="14"/><line x1="30" y1="33" x2="30" y2="16"/><line x1="34" y1="33" x2="34" y2="16"/></g></svg>`,
  curl:`<svg class="fig a-curl" viewBox="0 0 54 54"><circle cx="27" cy="13" r="4"/><line x1="27" y1="17" x2="27" y2="34"/><line x1="27" y1="20" x2="20" y2="30"/><g class="mover"><line x1="20" y1="30" x2="30" y2="34"/><line class="bar" x1="26" y1="31" x2="34" y2="36"/></g></svg>`,
  hang:`<svg class="fig a-hang" viewBox="0 0 54 54"><line class="bar" x1="10" y1="11" x2="44" y2="11"/><g class="mover"><line x1="22" y1="11" x2="24" y2="22"/><line x1="32" y1="11" x2="30" y2="22"/><circle cx="27" cy="26" r="4"/><line x1="27" y1="30" x2="27" y2="42"/><line x1="27" y1="42" x2="23" y2="49"/><line x1="27" y1="42" x2="31" y2="49"/></g></svg>`,
  crunch:`<svg class="fig a-crunch" viewBox="0 0 54 54"><line x1="14" y1="42" x2="40" y2="42"/><line x1="40" y1="42" x2="34" y2="30"/><g class="mover"><circle cx="20" cy="34" r="4"/><line x1="22" y1="37" x2="34" y2="42"/></g></svg>`,
  raise:`<svg class="fig a-raise" viewBox="0 0 54 54"><line class="bar" x1="10" y1="11" x2="44" y2="11"/><line x1="24" y1="11" x2="24" y2="20"/><line x1="30" y1="11" x2="30" y2="20"/><circle cx="27" cy="24" r="4"/><g class="mover"><line x1="27" y1="28" x2="38" y2="34"/></g></svg>`,
  hold:`<svg class="fig a-hold" viewBox="0 0 54 54"><g class="mover"><line x1="12" y1="36" x2="42" y2="30"/><circle cx="42" cy="29" r="4"/><line x1="12" y1="36" x2="9" y2="44"/><line x1="12" y1="36" x2="15" y2="44"/></g></svg>`,
  roll:`<svg class="fig a-roll" viewBox="0 0 54 54"><circle cx="18" cy="40" r="3"/><g class="mover"><circle cx="40" cy="40" r="7"/></g><line x1="21" y1="39" x2="33" y2="40"/></svg>`,
  rotate:`<svg class="fig a-rotate" viewBox="0 0 54 54"><circle cx="27" cy="14" r="4"/><line x1="27" y1="18" x2="27" y2="34"/><g class="mover"><line x1="27" y1="22" x2="42" y2="22"/><line x1="27" y1="22" x2="12" y2="22"/></g><line x1="27" y1="34" x2="22" y2="46"/><line x1="27" y1="34" x2="32" y2="46"/></svg>`,
  carry:`<svg class="fig a-carry" viewBox="0 0 54 54"><g class="mover"><circle cx="27" cy="12" r="4"/><line x1="27" y1="16" x2="27" y2="34"/><line x1="27" y1="20" x2="36" y2="24"/><rect x="34" y="24" width="6" height="9" rx="1.5"/><line x1="27" y1="34" x2="22" y2="48"/><line x1="27" y1="34" x2="32" y2="48"/></g></svg>`,
  pulse:`<svg class="fig a-pulse" viewBox="0 0 54 54"><g class="mover"><circle cx="27" cy="27" r="11"/><line x1="27" y1="20" x2="27" y2="34"/><line x1="20" y1="27" x2="34" y2="27"/></g></svg>`
};
const figFor = a => FIG[a] || FIG.pulse;

/* ---- helpers ---- */
const $ = s => document.querySelector(s);
const app = $("#app");
const setAccent = hex => document.documentElement.style.setProperty("--accent", hex);
const rLS = (k,d)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } };
const wLS = (k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const today = ()=>{ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
/* téléchargement d'un fichier (sauvegarde JSON) */
function dl(name, text){
  const b=new Blob([text],{type:"application/json"});
  const u=URL.createObjectURL(b), a=document.createElement("a");
  a.href=u; a.download=name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(u); a.remove(); },500);
}
function softBeep(){ try{ const c=new (window.AudioContext||window.webkitAudioContext)(); const o=c.createOscillator(),g=c.createGain(); o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.15;o.start(); setTimeout(()=>{o.stop();c.close();},160);}catch(e){} }

/* ---- state ---- */
const PL = window.PLProgression;
const M  = window.PLMicro || null;   // absent = micro-programme masqué, app intacte
let LIBRARY=[], PROGRESS={}, PROGRESSION={}, CUR=null, activeSession=null;
let MICRO=null;   // état du micro-programme adaptatif (blob micro.js)
const getWeek = pid => Backend.getWeek(pid);
const setWeek = (pid,n)=> Backend.setWeek(pid,n);
function weekState(pid,wk){ PROGRESS[pid]=PROGRESS[pid]||{}; PROGRESS[pid]["w"+wk]=PROGRESS[pid]["w"+wk]||{}; return PROGRESS[pid]["w"+wk]; }

/* ---- toast ---- */
let toastT=null;
function toast(msg){ let t=$("#toast"); if(!t){ t=document.createElement("div"); t.id="toast"; t.className="toast"; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2600); }

/* ---- BOOT ---- */
async function boot(){
  let res;
  try{ res = await Backend.init(); }catch(e){ res={mode:"local",needAuth:false}; }
  Backend.onAuth(async u=>{
    if(u){ await hydrate(); route(); }
    else { renderAuth(); }
  });
  if(Backend.isCloud() && res.needAuth){ renderAuth(); return; }
  await hydrate(); route();
}
async function hydrate(){
  try{
    const r = await Backend.loadAll();
    LIBRARY = r.programs || []; PROGRESS = r.progress || {};
    PROGRESSION = Backend.loadProgression();
    if(M) MICRO = M.normalizeState(Backend.getMicro(), today());
    if(r.offline) toast("Hors-ligne — données locales");
  }catch(e){ LIBRARY = DEFAULT_PROGRAMS.slice(); PROGRESS = {}; PROGRESSION = {};
    if(M) MICRO = M.normalizeState(null, today()); }
}

/* ---- ROUTER ---- */
function route(){
  const h = location.hash.replace(/^#\/?/,"");
  if(Backend.isCloud() && !Backend.user()){ renderAuth(); return; }
  if(h==="add"){ renderAdd(); return; }
  if(h==="micro" && M){ renderMicro(); return; }
  if(h.startsWith("p/")){
    const prog = LIBRARY.find(p=>p.id===h.slice(2));
    if(prog){ renderProgram(prog); return; }
  }
  renderLibrary();
}
window.addEventListener("hashchange", route);

/* ---- AUTH ---- */
function renderAuth(){
  setAccent("#ffb02e");
  app.innerHTML = `<div class="view"><div class="wrap auth">
    <div class="kicker">Perf Lab · Compte</div>
    <h1>PERF <em>LAB</em></h1>
    <p class="lede">Connecte-toi pour retrouver tes programmes et tes charges sur tous tes appareils.</p>
    <div class="authbox">
      <input id="email" type="email" inputmode="email" autocomplete="email" placeholder="email">
      <input id="pw" type="password" autocomplete="current-password" placeholder="mot de passe">
      <div class="autherr" id="autherr"></div>
      <div class="authbtns">
        <button class="dbtn go" id="signin">Se connecter</button>
        <button class="dbtn" id="signup">Créer un compte</button>
      </div>
    </div>
  </div></div>`;
  const err = m => { $("#autherr").textContent = m; };
  const creds = ()=>({ e:$("#email").value.trim(), p:$("#pw").value });
  $("#signin").onclick = async ()=>{ const {e,p}=creds(); if(!e||!p)return err("Email et mot de passe requis.");
    try{ await Backend.signIn(e,p); }catch(ex){ err(ex.message||"Connexion impossible."); } };
  $("#signup").onclick = async ()=>{ const {e,p}=creds(); if(!e||!p)return err("Email et mot de passe requis.");
    try{ await Backend.signUp(e,p); toast("Compte créé — connecte-toi."); }catch(ex){ err(ex.message||"Création impossible."); } };
  window.scrollTo(0,0);
}

/* ---- LIBRARY ---- */
function renderLibrary(){
  setAccent("#ffb02e");
  const cloud = Backend.isCloud(), u = Backend.user();
  const cards = LIBRARY.map(p=>`
    <div class="card" data-go="${esc(p.id)}" style="--c-accent:${esc(p.accent||'#ffb02e')}">
      <div class="tag">${esc(p.tag||'')}</div><div class="dot"></div>
      <div class="ct">${esc(p.title||'')} <em>${esc(p.title2||'')}</em></div>
      <div class="cb">${esc(p.blurb||'')}</div>
      <div class="cmeta">${(p.meta||[]).map(m=>`<span>${esc(m)}</span>`).join("")}</div>
    </div>`).join("");
  const prof = Backend.activeProfile();
  /* micro-programme adaptatif : quotidien, complément de la programmation WYS60 (Moss) */
  const microOn = !!M && prof === "moss";
  const mstats = microOn ? M.skillStats(MICRO, today()) : null;
  const mvol = microOn ? M.weeklyVolume(MICRO, today()) : null;
  const microCard = microOn ? `
    <div class="card mcard" data-micro style="--c-accent:#ff4d3d">
      <div class="tag">⚡ Quotidien</div><div class="dot"></div>
      <div class="ct">MICRO <em>PROGRAM</em></div>
      <div class="cb">3-10 min après ta séance WYS — la dose est choisie d'après ce que tu viens de faire.</div>
      <div class="cmeta">${["bmu","du","ttb","hsw"].map(k=>
        `<span>${esc(M.SKILLS[k].short)} ${mstats[k].cur!=null?esc(mstats[k].cur):"–"}</span>`).join("")}</div>
      <div class="cs">${mvol.sessions} session${mvol.sessions>1?"s":""} · ${mvol.minutes} min / 7 j</div>
    </div>` : "";
  const profSel = cloud ? "" : `<div class="profsel">${Backend.profiles().map(p=>
    `<button class="profbtn${p.id===prof?" active":""}" data-prof="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>`;
  /* assiduité : 14 derniers jours du journal de séances du profil */
  const log = Backend.getLog();
  const doneDays = new Set(log.map(e=>e.d));
  let assid = "";
  for(let i=13;i>=0;i--){
    const d = new Date(Date.now()-i*864e5);
    const iso = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    assid += `<span class="aday${doneDays.has(iso)?" on":""}" title="${iso.split("-").reverse().join("/")}"></span>`;
  }
  const assidHtml = `<div class="assid"><span class="alab">14 derniers jours</span>${assid}<span class="acount">${log.length} séance${log.length>1?"s":""}</span></div>`;
  /* rappel de sauvegarde : jamais exporté avec des données, ou > 7 jours */
  const le = Backend.lastExport();
  const hasData = log.length>0 || Object.keys(PROGRESSION).length>0;
  const staleDays = le ? Math.floor((Date.now()-le)/864e5) : null;
  const warn = (!le && hasData) || (staleDays!=null && staleDays>7);
  const backupHtml = cloud ? "" : `<div class="backup${warn?" warn":""}">
      <span>💾 Sauvegarde : ${le ? (staleDays===0?"aujourd'hui":"il y a "+staleDays+" j") : "jamais"}</span>
      <button class="dbtn" id="backup">Exporter</button>
    </div>`;
  app.innerHTML = `<div class="view"><div class="wrap">
    <header>
      <div class="topbar">
        <div class="kicker">Perf Lab · Bibliothèque</div>
        ${cloud&&u?`<button class="back" id="signout">${esc(u.email||'compte')} · sortir</button>`:profSel}
      </div>
      <h1>PERF<br><em>LAB</em></h1>
      <p class="lede">${LIBRARY.length} programme${LIBRARY.length>1?"s":""} · ${cloud?"synchronisé sur tes appareils":"profil "+esc(prof.charAt(0).toUpperCase()+prof.slice(1))+" · stocké sur cet appareil"}.</p>
      ${assidHtml}
      ${backupHtml}
      <div class="lib">
        ${microCard}
        ${cards}
        <div class="card add" data-add>
          <div class="plus">＋</div>
          <div class="ct">AJOUTER</div>
          <div class="cb">Colle un programme (JSON) — il apparaît partout.</div>
        </div>
      </div>
    </header>
  </div></div>`;
  app.querySelectorAll("[data-go]").forEach(c=> c.onclick=()=> location.hash="#/p/"+c.dataset.go );
  app.querySelector("[data-add]").onclick=()=> location.hash="#/add";
  const mc=app.querySelector("[data-micro]"); if(mc) mc.onclick=()=> location.hash="#/micro";
  app.querySelectorAll("[data-prof]").forEach(b=> b.onclick=async()=>{
    if(b.dataset.prof===Backend.activeProfile()) return;
    Backend.setProfile(b.dataset.prof);
    await hydrate(); renderLibrary();
  });
  const so=$("#signout"); if(so) so.onclick=async()=>{ await Backend.signOut(); renderAuth(); };
  const bk=$("#backup"); if(bk) bk.onclick=()=>{
    dl("perflab-backup-"+today()+".json", JSON.stringify(Backend.exportAll(),null,2));
    Backend.markExported(); toast("Sauvegarde téléchargée."); renderLibrary();
  };
  window.scrollTo(0,0);
}

/* ============================ MICRO-PROGRAM ============================
   Complément quotidien de 3-10 min à la programmation WYS60. L'utilisateur
   déclare ce que contenait sa séance, le moteur (micro.js) choisit la plus
   petite dose utile — ou répond « rien aujourd'hui ».
   Ce n'est jamais un 2e entraînement.                                     */
const MUI_KEY = "perflab.micro.ui";
let MSEL = null, MGEN = null;

function microSel(){
  const d = today();
  if(MSEL && MSEL.d === d) return MSEL;
  const saved = rLS(MUI_KEY, {});   // fatigue + temps mémorisés : moins de taps le lendemain
  MSEL = { d, tags: [], fatigue: M.FATIGUE.some(f=>f.id===saved.fatigue) ? saved.fatigue : "yellow",
           min: M.TIMES.includes(saved.min) ? saved.min : 5 };
  return MSEL;
}
function microUnit(id){ return M.SKILLS[id].tiers.u === "m" ? " m" : ""; }

/* ---- dashboard « Skill Progress » ---- */
function microDash(){
  const st = M.skillStats(MICRO, today());
  const vol = M.weeklyVolume(MICRO, today());
  const rows = M.SKILL_IDS.map(id=>{
    const s = st[id], u = microUnit(id);
    const spark = PL.sparklineSVG(s.hist, M.SKILLS[id].tiers);
    const pct = s.cur!=null && s.final ? Math.min(100, Math.round(s.cur/s.final*100)) : 0;
    return `<div class="skrow" style="--c-accent:${esc(s.accent)}">
      <div class="skhead"><span class="skdot"></span>
        <div class="skn">${esc(s.name)}</div>
        <div class="skph">${esc(s.phase)}</div></div>
      <div class="sknums">
        <div class="skn1"><span class="l">Current</span><b>${s.cur!=null?esc(s.cur)+u:"–"}</b></div>
        <div class="skn1"><span class="l">Best</span><b>${s.best!=null?esc(s.best)+u:"–"}</b></div>
        <div class="skn1"><span class="l">Target</span><b class="tg">${esc(s.target)+u}</b></div>
        <div class="skn1"><span class="l">7 jours</span><b>${esc(s.week7)+u}</b></div>
      </div>
      <div class="skbar"><div class="skfill" style="width:${pct}%"></div></div>
      ${spark?`<div class="sparkrow">${spark}<span class="sparklab">palier · objectif final ${esc(s.final)+u}</span></div>`:""}
    </div>`;
  }).join("");
  return `<div class="blk"><div class="blk-h"><div class="bl">Skill Progress</div><div class="line"></div></div>
    <div class="skgrid">${rows}</div>
    <div class="blk-note">Volume 7 jours : ${vol.sessions} micro-session${vol.sessions>1?"s":""} · ${vol.minutes} min au total.</div>
  </div>`;
}

/* ---- rendu d'une micro-séance générée ---- */
function microOut(gen){
  if(!gen) return "";
  if(gen.none){
    return `<div class="mnone">
      <div class="mnone-t">NO ADDITIONAL WORK TODAY</div>
      <div class="mnone-b">${esc(gen.why)}</div></div>`;
  }
  const total = gen.items.reduce((a,i)=>a+i.min,0);
  const items = gen.items.map((it,ix)=>{
    const sk = M.SKILLS[it.skill];
    const badge = sk ? sk.short : (it.skill==="mob" ? "MOBILITY" : (it.famLabel||"STRENGTH"));
    const col = sk ? sk.accent : (it.skill==="mob" ? "#8b929c" : "#b6f24e");
    return `<div class="mitem" style="--c-accent:${esc(col)}">
      <div class="mi-top">
        <div class="anim a-${esc(it.anim)} go">${figFor(it.anim)}</div>
        <div class="mi-id">
          <div class="mi-badge">${esc(badge)}${it.reduced?` · <span class="red">dose réduite</span>`:""}</div>
          <div class="mi-name">${esc(it.name)}</div>
          <div class="mi-scheme">${esc(it.sets)} × ${esc(it.scheme)}</div>
        </div>
        <div class="mi-min">${esc(it.min)}′</div>
      </div>
      <div class="cue">${esc(it.cue)}</div>
      ${it.tip?`<div class="mi-tip">${esc(it.tip)}</div>`:""}
      ${sk?`<div class="mi-res">
        ${sk.metrics.map(m=>`<label class="mres1"><span>${esc(m.label)}</span>
          <input class="load" type="number" inputmode="numeric" min="0"${m.max?` max="${m.max}"`:""}
                 placeholder="${esc(m.ph)}" data-rk="${esc(it.skill)}" data-rm="${esc(m.k)}"></label>`).join("")}
      </div>`:`<label class="mdone"><input type="checkbox" data-mdone="${ix}"> Fait</label>`}
    </div>`;
  }).join("");
  const notes = (gen.notes||[]).map(n=>`<div class="mnote">${esc(n)}</div>`).join("");
  return `<div class="msession">
    <div class="msess-h"><div class="bl">Micro-session · ${esc(total)} min</div>
      <div class="msess-w">Semaine ${esc(gen.week)}/8 · cycle ${esc(gen.cycle)}</div></div>
    ${notes}
    ${items}
    <div class="setlab" style="margin-top:14px">RPE global de la micro-session — ≤6 monte le palier · 7-8 maintient · ≥9 ou douleur descend</div>
    <div class="rpe-row">
      <input class="load rpe" id="mrpe" type="number" inputmode="numeric" min="0" max="10" placeholder="–">
      <button class="painbtn" id="mpain">⚡ Douleur</button>
      <span class="rpe-next" id="mnext"></span>
    </div>
    <button class="donebtn" id="msave">✓ Enregistrer la micro-session</button>
  </div>`;
}

/* ---- historique récent ---- */
function microHist(){
  const h = (MICRO.history||[]).slice(-6).reverse();
  if(!h.length) return "";
  const rows = h.map(e=>{
    const f = M.FATIGUE.find(x=>x.id===e.fatigue) || M.FATIGUE[1];
    const what = (e.items||[]).map(i=>{
      const sk = M.SKILLS[i.skill];
      return esc((sk?sk.short:(i.skill==="mob"?"MOB":"RENF")) + " " + (i.scheme||""));
    }).join(" · ") || "repos";
    const res = M.SKILL_IDS.filter(id=>e.res && e.res[id] && e.res[id].ub!=null && e.res[id].ub!=="")
      .map(id=>`<span class="tres win">${esc(M.SKILLS[id].short)} ${esc(e.res[id].ub)}${microUnit(id)}</span>`).join("");
    return `<div class="mhrow">
      <div class="mh-d">${esc(e.d.slice(5).split("-").reverse().join("/"))}
        <span class="mh-f" style="background:${esc(f.dot)}" title="${esc(f.label)}"></span></div>
      <div class="mh-w">${what}</div>
      <div class="mh-r">${res}${e.rpe!=null?`<span class="tres">RPE ${esc(e.rpe)}</span>`:""}${e.pain?`<span class="tres pain">⚡</span>`:""}</div>
    </div>`;
  }).join("");
  return `<div class="blk"><div class="blk-h"><div class="bl">Micro-session history</div><div class="line"></div></div>
    ${rows}</div>`;
}

function renderMicro(){
  setAccent("#ff4d3d");
  const sel = microSel();
  const wk = M.microWeek(MICRO, today());
  const groups = [];
  M.TAGS.forEach(t=>{ let g=groups.find(x=>x.g===t.g); if(!g){ g={g:t.g,items:[]}; groups.push(g); } g.items.push(t); });
  const chips = groups.map(g=>`<div class="tgroup"><div class="tglab">${esc(g.g)}</div>
    <div class="tgchips">${g.items.map(t=>
      `<button class="chip${sel.tags.includes(t.id)?" on":""}" data-tag="${esc(t.id)}">${esc(t.label)}</button>`).join("")}</div></div>`).join("");
  const fat = M.FATIGUE.map(f=>`<button class="fbtn${sel.fatigue===f.id?" on":""}" data-fat="${esc(f.id)}"
      style="--c-accent:${esc(f.dot)}"><span class="fdot"></span><b>${esc(f.label)}</b><i>${esc(f.sub)}</i></button>`).join("");
  const tim = M.TIMES.map(n=>`<button class="tbtn${sel.min===n?" on":""}" data-min="${n}">${n}′</button>`).join("");

  app.innerHTML = `<div class="view"><div class="wrap">
    <header>
      <div class="topbar"><div class="kicker">Perf Lab · Micro-Program</div>
        <button class="back" id="back">◂ Bibliothèque</button></div>
      <h1>MICRO<br><em>PROGRAM</em></h1>
      <p class="lede">Complément de <b>WYS60</b> — semaine <b>${wk.week}/8</b> (cycle ${wk.cycle}).
        Minimum effective dose, maximum consistency. Jamais un 2ᵉ entraînement.</p>
    </header>
    ${microDash()}
    <div class="blk"><div class="blk-h"><div class="bl">Today's WYS</div><div class="line"></div></div>
      <div class="blk-note">Coche ce que ta séance contenait vraiment — 3 à 5 cases suffisent.</div>
      <div class="tags">${chips}</div>
    </div>
    <div class="blk"><div class="blk-h"><div class="bl">Fatigue &amp; temps</div><div class="line"></div></div>
      <div class="fatrow">${fat}</div>
      <div class="setlab" style="margin-top:14px">Available time</div>
      <div class="timerow">${tim}</div>
    </div>
    <button class="genbtn" id="gen">Generate micro-session</button>
    <div id="mout">${microOut(MGEN)}</div>
    ${microHist()}
    <footer>Micro-Program · ${Backend.isCloud()?"synchronisé":"local"} · dose minimale efficace</footer>
  </div></div>`;

  $("#back").onclick=()=> location.hash="#/";
  app.querySelectorAll("[data-tag]").forEach(b=> b.onclick=()=>{
    const id=b.dataset.tag, i=sel.tags.indexOf(id);
    if(i>=0) sel.tags.splice(i,1); else sel.tags.push(id);
    b.classList.toggle("on", i<0);
  });
  app.querySelectorAll("[data-fat]").forEach(b=> b.onclick=()=>{
    sel.fatigue=b.dataset.fat; wLS(MUI_KEY,{fatigue:sel.fatigue,min:sel.min});
    app.querySelectorAll("[data-fat]").forEach(x=>x.classList.toggle("on", x===b));
  });
  app.querySelectorAll("[data-min]").forEach(b=> b.onclick=()=>{
    sel.min=+b.dataset.min; wLS(MUI_KEY,{fatigue:sel.fatigue,min:sel.min});
    app.querySelectorAll("[data-min]").forEach(x=>x.classList.toggle("on", x===b));
  });
  $("#gen").onclick=()=>{
    MGEN = M.generate({ tags:sel.tags, fatigue:sel.fatigue, minutes:sel.min, todayISO:today(), state:MICRO });
    $("#mout").innerHTML = microOut(MGEN);
    bindMicroOut();
    $("#mout").scrollIntoView({behavior:"smooth", block:"start"});
  };
  bindMicroOut();
  window.scrollTo(0,0);
}

function bindMicroOut(){
  const out=$("#mout"); if(!out || !MGEN || MGEN.none) return;
  let pain=false;
  const pb=$("#mpain"); if(pb) pb.onclick=()=>{ pain=!pain; pb.classList.toggle("on",pain); };
  const rp=$("#mrpe"); if(rp) rp.onchange=()=>{
    if(rp.value==="") return;
    rp.value = Math.max(0,Math.min(10,Math.round(+rp.value)));
  };
  const sv=$("#msave"); if(!sv) return;
  sv.onclick=async()=>{
    const res={};
    out.querySelectorAll("[data-rk]").forEach(inp=>{
      if(inp.value==="") return;
      const k=inp.dataset.rk;
      res[k]=res[k]||{};
      res[k][inp.dataset.rm]= Math.max(0, +inp.value);
    });
    const session = {
      d: today(), tags: microSel().tags.slice(), fatigue: microSel().fatigue,
      min: MGEN.items.reduce((a,i)=>a+i.min,0), items: MGEN.items, res,
      rpe: rp && rp.value!=="" ? +rp.value : null, pain
    };
    MICRO = M.recordSession(MICRO, session, today());
    await Backend.saveMicro(MICRO);
    MGEN = null;
    toast("Micro-session enregistrée.");
    renderMicro();
  };
}

/* ---- ADD / MANAGE ---- */
const TEMPLATE = {
  id:"mon-prog", title:"MON", title2:"PROG", tag:"Catégorie", accent:"#4dd2ff",
  blurb:"Une phrase de description.", meta:["4 séances","≤15 min"],
  intro:"Phrase d'intro en haut du programme.",
  sessions:[{ id:"s1", t:"BLOC", t2:"UN", sub:"sous-titre", accent:"#4dd2ff", pill:"~15 MIN",
    focus:"Objectif de la séance.",
    blocks:[{ label:"BLOC A — 4 tours", note:"consigne du bloc",
      ex:[{ k:"ex1", name:"Exercice", reps:"8-10 reps", anim:"pullup", load:true, sets:4,
            tempo:["3","0","1","0"], key:0, cue:"Consigne d'exécution.",
            tiers:{ u:"kg", steps:[10,12.5,15,17.5,20], start:1 },
            yt:"https://www.youtube.com/results?search_query=exercice" }] }] }]
};
function renderAdd(){
  setAccent("#ffb02e");
  const list = LIBRARY.map(p=>`
    <div class="mrow">
      <div><div class="mt">${esc(p.title)} ${esc(p.title2||'')}</div><div class="ms">${esc(p.id)}</div></div>
      <div class="mbtns">
        <button class="dbtn" data-exp="${esc(p.id)}">Exporter</button>
        <button class="dbtn" data-del="${esc(p.id)}">Suppr.</button>
      </div>
    </div>`).join("");
  app.innerHTML = `<div class="view"><div class="wrap">
    <header>
      <div class="topbar"><div class="kicker">Bibliothèque · Ajouter</div>
        <button class="back" id="back">◂ Retour</button></div>
      <h1>＋ <em>PROGRAMME</em></h1>
      <p class="lede">Colle un programme au format JSON puis <b>Importer</b>. Astuce : demande à Claude « génère-moi un programme Perf Lab pour … » et colle sa réponse ici.</p>
    </header>
    <div class="addbox">
      <textarea id="jsonin" spellcheck="false" placeholder="{ ... programme JSON ... }"></textarea>
      <div class="autherr" id="adderr"></div>
      <div class="authbtns">
        <button class="dbtn go" id="import">Importer</button>
        <button class="dbtn" id="tmpl">Insérer un modèle</button>
        ${Backend.isCloud()?"":`<button class="dbtn" id="expall">Exporter tout (profils)</button>`}
      </div>
    </div>
    <div class="blk"><div class="blk-h"><div class="bl">Dans ta bibliothèque</div><div class="line"></div></div>
      ${list||'<div class="blk-note">Aucun programme.</div>'}</div>
  </div></div>`;
  $("#back").onclick=()=> location.hash="#/";
  $("#tmpl").onclick=()=>{ $("#jsonin").value = JSON.stringify(TEMPLATE,null,2); };
  $("#import").onclick=async()=>{
    let r; try{ r=PL.classifyImport(JSON.parse($("#jsonin").value)); }
    catch(ex){ $("#adderr").textContent = "Erreur : "+(ex.message||ex); return; }
    if(r.kind==="profiles"){
      Backend.importProfilesDoc(r.doc);
      await hydrate(); toast("Profils importés."); location.hash="#/"; return;
    }
    // ancien format (racine id + sessions) : rattaché au profil Moss, silencieusement
    const p=r.program;
    const dest = Backend.isCloud() ? Backend.activeProfile() : "moss";
    if(dest===Backend.activeProfile()){
      if(LIBRARY.some(x=>x.id===p.id) && !confirm(`Un programme « ${p.id} » existe déjà. Le remplacer ?`)) return;
      await Backend.upsertProgram(p);
    } else {
      await Backend.upsertProgramFor("moss", p);
    }
    await hydrate(); toast("Programme importé."); location.hash="#/";
  };
  const ea=$("#expall"); if(ea) ea.onclick=async()=>{
    const txt=JSON.stringify(Backend.exportAll(),null,2);
    Backend.markExported();
    try{ await navigator.clipboard.writeText(txt); toast("Export profils copié."); }
    catch(e){ const t=$("#jsonin"); t.value=txt; toast("Export affiché ci-dessus."); }
  };
  app.querySelectorAll("[data-exp]").forEach(b=>b.onclick=async()=>{
    const p=LIBRARY.find(x=>x.id===b.dataset.exp); const txt=JSON.stringify(p,null,2);
    try{ await navigator.clipboard.writeText(txt); toast("JSON copié."); }
    catch(e){ const t=$("#jsonin"); t.value=txt; t.scrollIntoView({behavior:"smooth"}); toast("JSON affiché ci-dessus."); }
  });
  app.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{
    if(!confirm(`Supprimer « ${b.dataset.del} » et sa progression ?`)) return;
    await Backend.deleteProgram(b.dataset.del); await hydrate(); renderAdd(); toast("Supprimé.");
  });
  window.scrollTo(0,0);
}

/* ---- PROGRAM ---- */
function renderProgram(prog){
  CUR = prog; setAccent(prog.accent||"#ffb02e");
  activeSession = prog.sessions[0].id;
  const wk = getWeek(prog.id);
  app.innerHTML = `<div class="view"><div class="wrap">
    <header>
      <div class="topbar"><div class="kicker">${esc(prog.tag||'')}</div>
        <button class="back" id="back">◂ Bibliothèque</button></div>
      <h1>${esc(prog.title)} <em>${esc(prog.title2||'')}</em></h1>
      <p class="lede">${esc(prog.intro||'')}</p>
      <div class="meta">
        <div class="weekbox"><span class="wl">Semaine</span>
          <button class="wbtn" id="wdown">−</button>
          <div class="wnum" id="wnum">${wk}</div>
          <button class="wbtn" id="wup">+</button></div>
        <div class="gprog"><div class="bar"><div class="fill" id="gfill"></div></div>
          <div class="lab"><span id="gtxt">0 / 0</span><span id="gpct">0%</span></div></div>
      </div>
      <div class="tabs" id="tabs"></div>
    </header>
    <main id="main"></main>
    <button class="reset" id="reset">↺ Réinitialiser la semaine</button>
    <footer>${esc(prog.title)} ${esc(prog.title2||'')} · ${Backend.isCloud()?"synchronisé":"local"} · surcharge progressive</footer>
  </div></div>`;
  $("#back").onclick=()=> location.hash="#/";
  $("#wup").onclick=()=> changeWeek(1);
  $("#wdown").onclick=()=> changeWeek(-1);
  $("#reset").onclick=()=>{ const wk=getWeek(CUR.id); if(confirm("Réinitialiser la semaine "+wk+" ?")){
    PROGRESS[CUR.id]=PROGRESS[CUR.id]||{}; PROGRESS[CUR.id]["w"+wk]={}; Backend.saveProgress(CUR.id,wk,{}); renderSession(); updateGlobal(); } };
  renderTabs(); renderSession(); updateGlobal(); window.scrollTo(0,0);
}
function changeWeek(d){
  const n = Math.max(1, Math.min(12, getWeek(CUR.id)+d));
  setWeek(CUR.id,n); $("#wnum").textContent=n; renderSession(); updateGlobal();
}
function renderTabs(){
  const tabs=$("#tabs"); tabs.innerHTML="";
  CUR.sessions.forEach(s=>{ const b=document.createElement("button");
    b.className="tab"+(s.id===activeSession?" active":"");
    b.innerHTML=`<span class="tdot" style="background:${esc(s.accent||'#ffb02e')}"></span><div class="t">${esc(s.t)} ${esc(s.t2||'')}</div><div class="s">${esc(s.sub||'')}</div>`;
    b.onclick=()=>{ activeSession=s.id; setAccent(s.accent||"#ffb02e"); renderTabs(); renderSession(); updateGlobal(); };
    tabs.appendChild(b); });
}
function tempoGrid(t,key){ const L=["EXC","PAUSE","CONC","PAUSE"];
  return `<div class="tempo">`+t.map((n,i)=>`<div class="tcell${i===key?" key":""}"><div class="n">${esc(n)}</div><div class="l">${L[i]}</div></div>`).join("")+`</div>`; }
function exCard(s,ex,blockTimer){
  const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
  const d=(st[s.id]&&st[s.id][ex.k])||{done:[],load:[]};
  const sets=ex.sets||1; let setsHtml="";
  for(let i=0;i<sets;i++){ const done=d.done&&d.done[i]; const lv=(d.load&&d.load[i]!=null)?d.load[i]:"";
    setsHtml+=`<div class="setcol"><button class="setbtn${done?" done":""}" data-s="${esc(s.id)}" data-k="${esc(ex.k)}" data-i="${i}">${i+1}</button>${ex.load?`<input class="load" type="number" inputmode="decimal" placeholder="–" value="${esc(lv)}" data-ls="${esc(s.id)}" data-lk="${esc(ex.k)}" data-li="${i}"><div class="loadu">kg</div>`:""}</div>`; }
  const entry=PROGRESSION[CUR.id]&&PROGRESSION[CUR.id][ex.k];
  let tierHtml="", rpeHtml="", testHtml="";
  if(ex.tiers && Array.isArray(ex.tiers.steps) && ex.tiers.steps.length){
    const ti=PL.effectiveTier(PROGRESSION,CUR.id,ex.k,wk,ex.tiers);
    tierHtml=`<div class="target tier"><span class="t-ico">📶</span>Palier ${ti+1}/${ex.tiers.steps.length} — ${esc(PL.tierLabel(ex.tiers,ti))}</div>`;
    const spark=PL.sparklineSVG(entry&&entry.hist, ex.tiers);
    if(spark) tierHtml+=`<div class="sparkrow">${spark}<span class="sparklab">évolution du palier</span></div>`;
    const prop=(entry&&entry.week===wk&&entry.next!=null)
      ? (entry.next>entry.tier?"→ prochaine séance : "+PL.tierLabel(ex.tiers,entry.next)
        :entry.next<entry.tier?"→ retour à : "+PL.tierLabel(ex.tiers,entry.next)
        :"→ maintien du palier") : "";
    rpeHtml=`<div class="setlab" style="margin-top:12px">RPE 0-10 après l'exercice — ≤6 monte · 7-8 maintient · ≥9 ou douleur descend</div>
      <div class="rpe-row">
        <input class="load rpe" type="number" inputmode="numeric" min="0" max="10" placeholder="–" value="${d.rpe!=null?esc(d.rpe):""}" data-rs="${esc(s.id)}" data-rk="${esc(ex.k)}">
        <button class="painbtn${d.pain?" on":""}" data-ps="${esc(s.id)}" data-pk="${esc(ex.k)}">⚡ Douleur</button>
        <span class="rpe-next" data-ns="${esc(s.id)}" data-nk="${esc(ex.k)}">${esc(prop)}</span>
      </div>`;
  }
  if(ex.test){
    const tests=(entry&&entry.tests)||[];
    const cur=tests.find(t=>t.d===today());
    const hist=tests.slice(-6).map(t=>
      `<span class="tres${t.reps>0?" win":""}">${esc(t.d.slice(5).split("-").reverse().join("/"))} → ${t.reps}</span>`).join("");
    testHtml=`<div class="setlab" style="margin-top:12px">Résultat du jour — répétitions strictes réussies</div>
      <div class="rpe-row">
        <input class="load tin" type="number" inputmode="numeric" min="0" placeholder="–" value="${cur?cur.reps:""}" data-tt="${esc(ex.k)}">
        <span class="rpe-next" data-tout="${esc(ex.k)}"></span>
      </div>
      ${hist?`<div class="tresrow">${hist}</div>`:""}`;
  }
  return `<div class="ex" data-ex data-rest-s="${blockTimer||90}">
    <div class="ex-top" data-toggle>
      <div class="anim a-${esc(ex.anim||'pulse')}">${figFor(ex.anim)}</div>
      <div class="ex-id"><div class="ex-name">${esc(ex.name)}</div><div class="ex-scheme">${esc(ex.reps||'')}</div></div>
      <div class="chev">▶</div></div>
    <div class="ex-body"><div class="ex-inner">
      <div class="cue">${esc(ex.cue||'')}</div>
      ${ex.target?`<div class="target"><span class="t-ico">🎯</span>Charge cible — ${esc(ex.target)}</div>`:""}
      ${tierHtml}
      ${ex.tempo?tempoGrid(ex.tempo,ex.key||0):""}
      <div class="setlab">Séries — coche${ex.load?" + note ta charge":""}</div>
      <div class="sets">${setsHtml}</div>
      <div class="rest" data-rest hidden></div>
      ${rpeHtml}
      ${testHtml}
      <div class="exbtns">
        <button class="gbtn" data-play><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>Animer</button>
        ${ex.yt?`<a class="gbtn" href="${esc(ex.yt)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 15l5.2-3L10 9v6zm12-3c0 2-.2 3.4-.5 4.2-.3.9-1 1.6-1.9 1.9-.8.3-2.6.4-5.6.4s-4.8-.1-5.6-.4c-.9-.3-1.6-1-1.9-1.9C5.2 15.4 5 14 5 12s.2-3.4.5-4.2c.3-.9 1-1.6 1.9-1.9C8.2 5.6 10 5.5 13 5.5s4.8.1 5.6.4c.9.3 1.6 1 1.9 1.9.3.8.5 2.2.5 4.2z"/></svg>Vidéo</a>`:""}
      </div></div></div></div>`;
}
function renderSession(){
  stopRest();
  const s=CUR.sessions.find(x=>x.id===activeSession);
  let html=`<div class="shead"><h2>${esc(s.t)} <em>${esc(s.t2||'')}</em></h2><div class="pill">${esc(s.pill||'')}</div></div><p class="sfocus">${esc(s.focus||'')}</p>`;
  s.blocks.forEach(b=>{ html+=`<div class="blk"><div class="blk-h"><div class="bl">${esc(b.label||'')}</div><div class="line"></div>`;
    html+=`</div>`; if(b.note) html+=`<div class="blk-note">${esc(b.note)}</div>`;
    (b.ex||[]).forEach(ex=> html+=exCard(s,ex,b.timer)); html+=`</div>`; });
  const logged=Backend.getLog().some(e=>e.d===today() && e.prog===CUR.id && e.s===s.id);
  html+=`<button class="donebtn${logged?" ok":""}" id="sdone" ${logged?"disabled":""}>${logged?"✓ Séance enregistrée aujourd'hui":"✓ Séance faite"}</button>`;
  $("#main").innerHTML=html; bindSession();
  $("#sdone").onclick=()=>{
    Backend.addLog({ d:today(), prog:CUR.id, s:s.id, w:getWeek(CUR.id) });
    toast("Séance enregistrée — bien joué."); renderSession();
  };
}
function findEx(sid,k){
  const s=CUR.sessions.find(x=>x.id===sid); if(!s) return null;
  let r=null; s.blocks.forEach(b=>(b.ex||[]).forEach(e=>{ if(e.k===k) r=e; })); return r;
}
/* réévalue le palier proposé dès qu'un RPE / douleur / série change */
function reevaluate(sid,k){
  const ex=findEx(sid,k);
  if(!ex||!ex.tiers||!Array.isArray(ex.tiers.steps)||!ex.tiers.steps.length) return;
  const wk=getWeek(CUR.id), st=weekState(CUR.id,wk);
  const d=(st[sid]&&st[sid][k])||{};
  if(d.rpe==null && !d.pain) return;
  const n=ex.sets||1, done=d.done||[];
  let all=true; for(let i=0;i<n;i++) if(!done[i]) all=false;
  const r=PL.recordRpe(PROGRESSION,CUR.id,k,wk,ex.tiers,d.rpe,!!d.pain,all);
  Backend.saveProgression(PROGRESSION);
  const out=$("#main").querySelector(`[data-ns="${sid}"][data-nk="${k}"]`);
  if(out) out.textContent = r.next>r.tier ? "→ prochaine séance : "+PL.tierLabel(ex.tiers,r.next)
    : r.next<r.tier ? "→ retour à : "+PL.tierLabel(ex.tiers,r.next)
    : "→ maintien du palier";
}
/* ---- repos inline : compte à rebours discret dans la carte après une série ---- */
let restInt=null, restEl=null;
function stopRest(){ clearInterval(restInt); restInt=null; if(restEl){ restEl.hidden=true; restEl=null; } }
function startRest(card, sec){
  stopRest();
  const el=card.querySelector("[data-rest]"); if(!el) return;
  let rem=sec; restEl=el; el.hidden=false;
  const fmt=r=>Math.floor(r/60)+":"+String(r%60).padStart(2,"0");
  const draw=()=>{ el.textContent="REPOS "+fmt(rem)+" · toucher pour arrêter"; };
  draw();
  el.onclick=stopRest;
  restInt=setInterval(()=>{ rem--; if(rem<=0){ softBeep(); stopRest(); } else draw(); },1000);
}
function bindSession(){
  const main=$("#main");
  main.querySelectorAll("[data-toggle]").forEach(t=>{ t.onclick=e=>{ if(e.target.closest("[data-play]")||e.target.closest("a"))return; t.closest("[data-ex]").classList.toggle("open"); }; });
  main.querySelectorAll(".setbtn").forEach(b=>{ b.onclick=()=>{ const {s,k,i}=b.dataset; const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
    st[s]=st[s]||{}; st[s][k]=st[s][k]||{done:[],load:[]}; st[s][k].done[i]=!st[s][k].done[i]; b.classList.toggle("done",st[s][k].done[i]);
    Backend.saveProgress(CUR.id,wk,st); updateGlobal(); reevaluate(s,k);
    // repos auto après une série cochée, sauf la dernière de l'exercice
    if(st[s][k].done[i]){
      const ex=findEx(s,k); const n=(ex&&ex.sets)||1;
      let done=0; for(let j=0;j<n;j++) if(st[s][k].done[j]) done++;
      const card=b.closest("[data-ex]");
      if(done<n) startRest(card, +card.dataset.restS||90); else stopRest();
    } else stopRest(); }; });
  main.querySelectorAll(".load:not(.rpe)").forEach(inp=>{ inp.onchange=()=>{ const {ls,lk,li}=inp.dataset; const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
    st[ls]=st[ls]||{}; st[ls][lk]=st[ls][lk]||{done:[],load:[]}; st[ls][lk].load[li]=inp.value; Backend.saveProgress(CUR.id,wk,st); }; });
  main.querySelectorAll(".rpe").forEach(inp=>{ inp.onchange=()=>{ const {rs,rk}=inp.dataset; const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
    st[rs]=st[rs]||{}; st[rs][rk]=st[rs][rk]||{done:[],load:[]};
    const v=inp.value===""?null:Math.max(0,Math.min(10,Math.round(+inp.value)));
    if(v!=null) inp.value=v;
    st[rs][rk].rpe=v; Backend.saveProgress(CUR.id,wk,st); reevaluate(rs,rk); }; });
  main.querySelectorAll(".painbtn").forEach(b=>{ b.onclick=()=>{ const {ps,pk}=b.dataset; const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
    st[ps]=st[ps]||{}; st[ps][pk]=st[ps][pk]||{done:[],load:[]};
    st[ps][pk].pain=!st[ps][pk].pain; b.classList.toggle("on",st[ps][pk].pain);
    Backend.saveProgress(CUR.id,wk,st); reevaluate(ps,pk); }; });
  main.querySelectorAll(".tin").forEach(inp=>{ inp.onchange=()=>{ const k=inp.dataset.tt;
    if(inp.value==="") return;
    const v=Math.max(0,Math.round(+inp.value)); inp.value=v;
    PL.recordTest(PROGRESSION,CUR.id,k,today(),v);
    Backend.saveProgression(PROGRESSION);
    const out=main.querySelector(`[data-tout="${k}"]`);
    if(out) out.textContent = v>0 ? "🎉 "+v+" stricte"+(v>1?"s":"")+" — enregistré" : "enregistré — la prochaine est pour bientôt";
    toast("Test enregistré."); }; });
  main.querySelectorAll("[data-play]").forEach(p=>{ p.onclick=()=>{ const a=p.closest("[data-ex]").querySelector(".anim"); const on=a.classList.toggle("go"); p.classList.toggle("on",on); }; });
}
function updateGlobal(){
  const s=CUR.sessions.find(x=>x.id===activeSession); const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
  let total=0,done=0;
  s.blocks.forEach(b=>(b.ex||[]).forEach(ex=>{ const n=ex.sets||1; total+=n; const arr=(st[s.id]&&st[s.id][ex.k]&&st[s.id][ex.k].done)||[]; for(let i=0;i<n;i++) if(arr[i]) done++; }));
  const pct=total?Math.round(done/total*100):0;
  $("#gfill").style.width=pct+"%"; $("#gtxt").textContent=`${done} / ${total} séries · ${s.t} ${s.t2||''}`; $("#gpct").textContent=pct+"%";
}

/* ---- service worker + go ---- */
if("serviceWorker" in navigator){ window.addEventListener("load",()=> navigator.serviceWorker.register("sw.js").catch(()=>{}) ); }
boot();
