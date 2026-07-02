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

/* ---- state ---- */
const PL = window.PLProgression;
let LIBRARY=[], PROGRESS={}, PROGRESSION={}, CUR=null, activeSession=null;
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
    if(r.offline) toast("Hors-ligne — données locales");
  }catch(e){ LIBRARY = DEFAULT_PROGRAMS.slice(); PROGRESS = {}; PROGRESSION = {}; }
}

/* ---- ROUTER ---- */
function route(){
  const h = location.hash.replace(/^#\/?/,"");
  if(Backend.isCloud() && !Backend.user()){ renderAuth(); return; }
  if(h==="add"){ renderAdd(); return; }
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
  const profSel = cloud ? "" : `<div class="profsel">${Backend.profiles().map(p=>
    `<button class="profbtn${p.id===prof?" active":""}" data-prof="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>`;
  app.innerHTML = `<div class="view"><div class="wrap">
    <header>
      <div class="topbar">
        <div class="kicker">Perf Lab · Bibliothèque</div>
        ${cloud&&u?`<button class="back" id="signout">${esc(u.email||'compte')} · sortir</button>`:profSel}
      </div>
      <h1>PERF<br><em>LAB</em></h1>
      <p class="lede">${LIBRARY.length} programme${LIBRARY.length>1?"s":""} · ${cloud?"synchronisé sur tes appareils":"profil "+esc(prof.charAt(0).toUpperCase()+prof.slice(1))+" · stocké sur cet appareil"}.</p>
      <div class="lib">
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
  app.querySelectorAll("[data-prof]").forEach(b=> b.onclick=async()=>{
    if(b.dataset.prof===Backend.activeProfile()) return;
    Backend.setProfile(b.dataset.prof);
    await hydrate(); renderLibrary();
  });
  const so=$("#signout"); if(so) so.onclick=async()=>{ await Backend.signOut(); renderAuth(); };
  window.scrollTo(0,0);
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
function exCard(s,ex){
  const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
  const d=(st[s.id]&&st[s.id][ex.k])||{done:[],load:[]};
  const sets=ex.sets||1; let setsHtml="";
  for(let i=0;i<sets;i++){ const done=d.done&&d.done[i]; const lv=(d.load&&d.load[i]!=null)?d.load[i]:"";
    setsHtml+=`<div class="setcol"><button class="setbtn${done?" done":""}" data-s="${esc(s.id)}" data-k="${esc(ex.k)}" data-i="${i}">${i+1}</button>${ex.load?`<input class="load" type="number" inputmode="decimal" placeholder="–" value="${esc(lv)}" data-ls="${esc(s.id)}" data-lk="${esc(ex.k)}" data-li="${i}"><div class="loadu">kg</div>`:""}</div>`; }
  let tierHtml="", rpeHtml="";
  if(ex.tiers && Array.isArray(ex.tiers.steps) && ex.tiers.steps.length){
    const ti=PL.effectiveTier(PROGRESSION,CUR.id,ex.k,wk,ex.tiers);
    tierHtml=`<div class="target tier"><span class="t-ico">📶</span>Palier ${ti+1}/${ex.tiers.steps.length} — ${esc(PL.tierLabel(ex.tiers,ti))}</div>`;
    const entry=PROGRESSION[CUR.id]&&PROGRESSION[CUR.id][ex.k];
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
  return `<div class="ex" data-ex>
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
      ${rpeHtml}
      <div class="exbtns">
        <button class="gbtn" data-play><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>Animer</button>
        ${ex.yt?`<a class="gbtn" href="${esc(ex.yt)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 15l5.2-3L10 9v6zm12-3c0 2-.2 3.4-.5 4.2-.3.9-1 1.6-1.9 1.9-.8.3-2.6.4-5.6.4s-4.8-.1-5.6-.4c-.9-.3-1.6-1-1.9-1.9C5.2 15.4 5 14 5 12s.2-3.4.5-4.2c.3-.9 1-1.6 1.9-1.9C8.2 5.6 10 5.5 13 5.5s4.8.1 5.6.4c.9.3 1.6 1 1.9 1.9.3.8.5 2.2.5 4.2z"/></svg>Vidéo</a>`:""}
      </div></div></div></div>`;
}
function renderSession(){
  const s=CUR.sessions.find(x=>x.id===activeSession);
  let html=`<div class="shead"><h2>${esc(s.t)} <em>${esc(s.t2||'')}</em></h2><div class="pill">${esc(s.pill||'')}</div></div><p class="sfocus">${esc(s.focus||'')}</p>`;
  s.blocks.forEach(b=>{ html+=`<div class="blk"><div class="blk-h"><div class="bl">${esc(b.label||'')}</div><div class="line"></div>`;
    html+=`</div>`; if(b.note) html+=`<div class="blk-note">${esc(b.note)}</div>`;
    (b.ex||[]).forEach(ex=> html+=exCard(s,ex)); html+=`</div>`; });
  $("#main").innerHTML=html; bindSession();
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
function bindSession(){
  const main=$("#main");
  main.querySelectorAll("[data-toggle]").forEach(t=>{ t.onclick=e=>{ if(e.target.closest("[data-play]")||e.target.closest("a"))return; t.closest("[data-ex]").classList.toggle("open"); }; });
  main.querySelectorAll(".setbtn").forEach(b=>{ b.onclick=()=>{ const {s,k,i}=b.dataset; const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
    st[s]=st[s]||{}; st[s][k]=st[s][k]||{done:[],load:[]}; st[s][k].done[i]=!st[s][k].done[i]; b.classList.toggle("done",st[s][k].done[i]);
    Backend.saveProgress(CUR.id,wk,st); updateGlobal(); reevaluate(s,k); }; });
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
