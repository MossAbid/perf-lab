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
let LIBRARY=[], PROGRESS={}, CUR=null, activeSession=null;
const WEEKS="perflab.weeks";
const getWeek = pid => (rLS(WEEKS,{})[pid] || 1);
const setWeek = (pid,n)=>{ const w=rLS(WEEKS,{}); w[pid]=n; wLS(WEEKS,w); };
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
    if(r.offline) toast("Hors-ligne — données locales");
  }catch(e){ LIBRARY = rLS("perflab.programs", DEFAULT_PROGRAMS.slice()); PROGRESS = rLS("perflab.progress",{}); }
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
  document.querySelector(".dock").style.display="none";
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
  document.querySelector(".dock").style.display="none";
  const cloud = Backend.isCloud(), u = Backend.user();
  const cards = LIBRARY.map(p=>`
    <div class="card" data-go="${esc(p.id)}" style="--c-accent:${esc(p.accent||'#ffb02e')}">
      <div class="tag">${esc(p.tag||'')}</div><div class="dot"></div>
      <div class="ct">${esc(p.title||'')} <em>${esc(p.title2||'')}</em></div>
      <div class="cb">${esc(p.blurb||'')}</div>
      <div class="cmeta">${(p.meta||[]).map(m=>`<span>${esc(m)}</span>`).join("")}</div>
    </div>`).join("");
  app.innerHTML = `<div class="view"><div class="wrap">
    <header>
      <div class="topbar">
        <div class="kicker">Perf Lab · Bibliothèque</div>
        ${cloud&&u?`<button class="back" id="signout">${esc(u.email||'compte')} · sortir</button>`:``}
      </div>
      <h1>PERF<br><em>LAB</em></h1>
      <p class="lede">${LIBRARY.length} programme${LIBRARY.length>1?"s":""} · ${cloud?"synchronisé sur tes appareils":"stocké sur cet appareil"}.</p>
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
            yt:"https://www.youtube.com/results?search_query=exercice" }] }] }]
};
function validateProgram(p){
  if(!p || typeof p!=="object") throw "JSON invalide.";
  if(!p.id || typeof p.id!=="string") throw "Champ 'id' (texte) requis.";
  if(!p.title) throw "Champ 'title' requis.";
  if(!Array.isArray(p.sessions) || !p.sessions.length) throw "Au moins une séance ('sessions').";
  p.sessions.forEach((s,i)=>{ if(!Array.isArray(s.blocks)) throw `Séance ${i+1} : 'blocks' manquant.`; });
  return true;
}
function renderAdd(){
  document.querySelector(".dock").style.display="none";
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
      </div>
    </div>
    <div class="blk"><div class="blk-h"><div class="bl">Dans ta bibliothèque</div><div class="line"></div></div>
      ${list||'<div class="blk-note">Aucun programme.</div>'}</div>
  </div></div>`;
  $("#back").onclick=()=> location.hash="#/";
  $("#tmpl").onclick=()=>{ $("#jsonin").value = JSON.stringify(TEMPLATE,null,2); };
  $("#import").onclick=async()=>{
    let p; try{ p=JSON.parse($("#jsonin").value); validateProgram(p); }
    catch(ex){ $("#adderr").textContent = "Erreur : "+(ex.message||ex); return; }
    if(LIBRARY.some(x=>x.id===p.id) && !confirm(`Un programme « ${p.id} » existe déjà. Le remplacer ?`)) return;
    await Backend.upsertProgram(p); await hydrate(); toast("Programme importé."); location.hash="#/";
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
  document.querySelector(".dock").style.display="block";
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
  return `<div class="ex" data-ex>
    <div class="ex-top" data-toggle>
      <div class="anim a-${esc(ex.anim||'pulse')}">${figFor(ex.anim)}</div>
      <div class="ex-id"><div class="ex-name">${esc(ex.name)}</div><div class="ex-scheme">${esc(ex.reps||'')}</div></div>
      <div class="chev">▶</div></div>
    <div class="ex-body"><div class="ex-inner">
      <div class="cue">${esc(ex.cue||'')}</div>
      ${ex.target?`<div class="target"><span class="t-ico">🎯</span>Charge cible — ${esc(ex.target)}</div>`:""}
      ${ex.tempo?tempoGrid(ex.tempo,ex.key||0):""}
      <div class="setlab">Séries — coche${ex.load?" + note ta charge":""}</div>
      <div class="sets">${setsHtml}</div>
      <div class="exbtns">
        <button class="gbtn" data-play><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>Animer</button>
        ${ex.yt?`<a class="gbtn" href="${esc(ex.yt)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 15l5.2-3L10 9v6zm12-3c0 2-.2 3.4-.5 4.2-.3.9-1 1.6-1.9 1.9-.8.3-2.6.4-5.6.4s-4.8-.1-5.6-.4c-.9-.3-1.6-1-1.9-1.9C5.2 15.4 5 14 5 12s.2-3.4.5-4.2c.3-.9 1-1.6 1.9-1.9C8.2 5.6 10 5.5 13 5.5s4.8.1 5.6.4c.9.3 1.6 1 1.9 1.9.3.8.5 2.2.5 4.2z"/></svg>Vidéo</a>`:""}
      </div></div></div></div>`;
}
function renderSession(){
  const s=CUR.sessions.find(x=>x.id===activeSession);
  let html=`<div class="shead"><h2>${esc(s.t)} <em>${esc(s.t2||'')}</em></h2><div class="pill">${esc(s.pill||'')}</div></div><p class="sfocus">${esc(s.focus||'')}</p>`;
  s.blocks.forEach(b=>{ html+=`<div class="blk"><div class="blk-h"><div class="bl">${esc(b.label||'')}</div><div class="line"></div>`;
    if(b.timer) html+=`<button class="gbtn" data-settimer="${b.timer}" style="padding:5px 9px"><svg viewBox="0 0 24 24" style="width:12px;height:12px"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 11h-2V7h2z"/></svg>Timer</button>`;
    if(b.emom) html+=`<button class="gbtn" data-setemom="${b.emom}" style="padding:5px 9px">EMOM</button>`;
    html+=`</div>`; if(b.note) html+=`<div class="blk-note">${esc(b.note)}</div>`;
    (b.ex||[]).forEach(ex=> html+=exCard(s,ex)); html+=`</div>`; });
  $("#main").innerHTML=html; bindSession();
}
function bindSession(){
  const main=$("#main");
  main.querySelectorAll("[data-toggle]").forEach(t=>{ t.onclick=e=>{ if(e.target.closest("[data-play]")||e.target.closest("a"))return; t.closest("[data-ex]").classList.toggle("open"); }; });
  main.querySelectorAll(".setbtn").forEach(b=>{ b.onclick=()=>{ const {s,k,i}=b.dataset; const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
    st[s]=st[s]||{}; st[s][k]=st[s][k]||{done:[],load:[]}; st[s][k].done[i]=!st[s][k].done[i]; b.classList.toggle("done",st[s][k].done[i]);
    Backend.saveProgress(CUR.id,wk,st); updateGlobal(); }; });
  main.querySelectorAll(".load").forEach(inp=>{ inp.onchange=()=>{ const {ls,lk,li}=inp.dataset; const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
    st[ls]=st[ls]||{}; st[ls][lk]=st[ls][lk]||{done:[],load:[]}; st[ls][lk].load[li]=inp.value; Backend.saveProgress(CUR.id,wk,st); }; });
  main.querySelectorAll("[data-play]").forEach(p=>{ p.onclick=()=>{ const a=p.closest("[data-ex]").querySelector(".anim"); const on=a.classList.toggle("go"); p.classList.toggle("on",on); }; });
  main.querySelectorAll("[data-settimer]").forEach(b=> b.onclick=()=> startCountdown(+b.dataset.settimer,true));
  main.querySelectorAll("[data-setemom]").forEach(b=> b.onclick=()=> startEmom(+b.dataset.setemom));
}
function updateGlobal(){
  const s=CUR.sessions.find(x=>x.id===activeSession); const wk=getWeek(CUR.id); const st=weekState(CUR.id,wk);
  let total=0,done=0;
  s.blocks.forEach(b=>(b.ex||[]).forEach(ex=>{ const n=ex.sets||1; total+=n; const arr=(st[s.id]&&st[s.id][ex.k]&&st[s.id][ex.k].done)||[]; for(let i=0;i<n;i++) if(arr[i]) done++; }));
  const pct=total?Math.round(done/total*100):0;
  $("#gfill").style.width=pct+"%"; $("#gtxt").textContent=`${done} / ${total} séries · ${s.t} ${s.t2||''}`; $("#gpct").textContent=pct+"%";
}

/* ---- TIMER ---- */
let tInt=null, interval=0;
const clk=()=>$("#clock"), dm=()=>$("#dmode");
const fmt=s=>{ s=Math.max(0,s); return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); };
function beep(){ try{ const c=new (window.AudioContext||window.webkitAudioContext)(); const o=c.createOscillator(),g=c.createGain(); o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.18;o.start(); setTimeout(()=>{o.stop();c.close();},160);}catch(e){} }
const clearT=()=>{ clearInterval(tInt); tInt=null; };
function startCountdown(sec,loop){ clearT(); interval=sec; let rem=sec; if(dm())dm().textContent=(loop?"INTERVALLE":"COUNTDOWN")+" · "+fmt(sec); if(clk())clk().textContent=fmt(rem);
  tInt=setInterval(()=>{ rem--; if(clk())clk().textContent=fmt(rem); if(rem<=0){ beep(); if(loop) rem=interval; else { clearT(); if(dm())dm().textContent="TERMINÉ"; } } },1000); }
function startEmom(min){ clearT(); let rem=60,round=1; if(dm())dm().textContent="EMOM · 1/"+min; if(clk())clk().textContent=fmt(rem);
  tInt=setInterval(()=>{ rem--; if(clk())clk().textContent=fmt(rem); if(rem<=0){ beep(); round++; if(round>min){ clearT(); if(dm())dm().textContent="EMOM TERMINÉ"; } else { rem=60; if(dm())dm().textContent="EMOM · "+round+"/"+min; } } },1000); }
document.addEventListener("click",e=>{ const b=e.target.closest(".dbtn"); if(!b)return;
  if(b.dataset.t) startCountdown(+b.dataset.t,true);
  else if(b.dataset.emom) startEmom(+b.dataset.emom);
  else if(b.id==="tstart"){ if(!tInt&&interval) startCountdown(interval,true); }
  else if(b.id==="tstop"){ clearT(); if(dm())dm().textContent="ARRÊT"; if(clk())clk().textContent="00:00"; } });

/* ---- service worker + go ---- */
if("serviceWorker" in navigator){ window.addEventListener("load",()=> navigator.serviceWorker.register("sw.js").catch(()=>{}) ); }
boot();
