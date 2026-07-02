/* ============================ PERF LAB — BACKEND ============================
   Deux modes, même interface :
   - LOCAL : localStorage uniquement (si CONFIG vide).
   - CLOUD : Supabase (auth + Postgres), avec localStorage comme cache offline
             et une file d'attente pour les écritures faites hors-ligne.

   Multi-profils (LOCAL) : chaque profil (Moss, Souad) a son propre espace
   de stockage — programmes, progression hebdo, paliers RPE. Le profil actif
   est persistant. En mode CLOUD le compte fait office de profil : le
   sélecteur est masqué et l'espace « moss » sert de cache local.
   ========================================================================== */
const Backend = (() => {
  const CFG = window.CONFIG || {};
  const CLOUD = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  const P = window.PLProgression;

  /* ---- profils ---- */
  const PROFILE_KEY = "perflab.profile";
  let profile = null;
  function activeProfile(){
    if(CLOUD) return P.DEFAULT_PROFILE;
    if(!profile){
      const saved = localStorage.getItem(PROFILE_KEY);
      profile = P.PROFILES.some(p=>p.id===saved) ? saved : P.DEFAULT_PROFILE;
    }
    return profile;
  }
  function setProfile(id){
    if(!P.PROFILES.some(p=>p.id===id)) return;
    profile = id;
    try{ localStorage.setItem(PROFILE_KEY, id); }catch(e){}
  }
  function profiles(){ return P.PROFILES; }

  /* ---- clés namespacées par profil ---- */
  const K = name => `perflab.p.${activeProfile()}.${name}`;
  const Kp = (pid, name) => `perflab.p.${pid}.${name}`;

  /* ---- cache local ---- */
  const readLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };

  /* ---- migration silencieuse des clés legacy (mono-profil) → Moss ----
     Ancien stockage : perflab.programs / .progress / .weeks / .removed / .queue
     Une seule fois : si une clé legacy existe et que l'espace Moss est vierge,
     tout est déplacé vers Moss puis les clés legacy sont supprimées.         */
  (function migrateLegacy(){
    try{
      const names = ["programs","progress","weeks","removed","queue"];
      const hasLegacy = names.some(n => localStorage.getItem("perflab."+n) !== null);
      const mossEmpty = names.every(n => localStorage.getItem(Kp("moss",n)) === null);
      if(hasLegacy && mossEmpty){
        names.forEach(n=>{
          const v = localStorage.getItem("perflab."+n);
          if(v !== null){ localStorage.setItem(Kp("moss",n), v); localStorage.removeItem("perflab."+n); }
        });
      }
    }catch(e){}
  })();

  /* ---- migration one-shot : applique les assignations par profil ----
     Retire de chaque espace profil les programmes par défaut qui ne lui
     sont pas assignés (données comprises) — ex. Pré Haltéro quitte Moss,
     Upper/Core/Lower quittent Souad. Les programmes importés/persos ne
     sont jamais touchés.                                                */
  (function migrateAssign(){
    try{
      if(CLOUD) return;
      if(localStorage.getItem("perflab.mig.assign1")) return;
      P.PROFILES.forEach(pr=>{
        const banned = DEFAULT_PROGRAMS.filter(d=>d.assign && !d.assign.includes(pr.id)).map(d=>d.id);
        if(!banned.length) return;
        const key = Kp(pr.id,"programs");
        const progs = readLS(key, null);
        if(progs && progs.some(p=>banned.includes(p.id))){
          writeLS(key, progs.filter(p=>!banned.includes(p.id)));
        }
        ["progress","weeks","progression"].forEach(n=>{
          const v = readLS(Kp(pr.id,n), null);
          if(!v) return;
          let changed=false;
          banned.forEach(id=>{ if(v[id]!==undefined){ delete v[id]; changed=true; } });
          if(changed) writeLS(Kp(pr.id,n), v);
        });
      });
      localStorage.setItem("perflab.mig.assign1","1");
    }catch(e){}
  })();

  let client = null, currentUser = null, authCb = null;

  function cacheProgress(progId, week, state){
    const all = readLS(K("progress"), {});
    all[progId] = all[progId] || {};
    all[progId]["w"+week] = state;
    writeLS(K("progress"), all);
  }
  function cacheProgramsList(list){ writeLS(K("programs"), list); }

  /* ---- semaines courantes par programme ---- */
  function getWeek(pid){ return (readLS(K("weeks"), {})[pid] || 1); }
  function setWeek(pid, n){ const w = readLS(K("weeks"), {}); w[pid] = n; writeLS(K("weeks"), w); }

  /* ---- état de progression RPE (paliers) — local par profil ---- */
  function loadProgression(){ return readLS(K("progression"), {}); }
  function saveProgression(pr){ writeLS(K("progression"), pr); }

  /* ---- journal de séances (assiduité) — local par profil ----
     entrées {d:"AAAA-MM-JJ", prog, s, w} ; une par (jour, prog, séance). */
  function getLog(){ return readLS(K("log"), []); }
  function addLog(entry){
    const log = getLog().filter(e=>!(e.d===entry.d && e.prog===entry.prog && e.s===entry.s));
    log.push(entry); writeLS(K("log"), log); return log;
  }

  /* ---- horodatage de la dernière sauvegarde (export) — global ---- */
  const EXPORT_KEY = "perflab.lastExport";
  function lastExport(){ const v = localStorage.getItem(EXPORT_KEY); return v ? +v : null; }
  function markExported(){ try{ localStorage.setItem(EXPORT_KEY, String(Date.now())); }catch(e){} }

  /* ---- file d'attente offline (cloud) ---- */
  function enqueue(op){ const q = readLS(K("queue"), []); q.push(op); writeLS(K("queue"), q); }
  async function flushQueue(){
    if(!CLOUD || !currentUser) return;
    let q = readLS(K("queue"), []);
    if(!q.length) return;
    const rest = [];
    for(const op of q){
      try{ await applyOp(op); }
      catch(e){ rest.push(op); }
    }
    writeLS(K("queue"), rest);
  }
  async function applyOp(op){
    if(op.t==="progress"){
      const { error } = await client.from("progress").upsert({
        user_id: currentUser.id, program_id: op.programId, week: op.week,
        state: op.state, updated_at: new Date().toISOString()
      });
      if(error) throw error;
    } else if(op.t==="program"){
      const { error } = await client.from("programs").upsert({
        user_id: currentUser.id, id: op.p.id, data: op.p, sort: op.sort||0,
        updated_at: new Date().toISOString()
      });
      if(error) throw error;
    } else if(op.t==="delprogram"){
      const { error } = await client.from("programs").delete()
        .eq("user_id", currentUser.id).eq("id", op.id);
      if(error) throw error;
    }
  }

  /* ---- init ---- */
  async function init(){
    if(!CLOUD) return { mode:"local", needAuth:false };
    if(!window.supabase || !window.supabase.createClient){
      // client non chargé (hors-ligne au 1er lancement) : on sert le cache, pas de gate
      return { mode:"cloud", needAuth:false };
    }
    client = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
      auth:{ persistSession:true, autoRefreshToken:true }
    });
    const { data } = await client.auth.getSession();
    currentUser = data?.session?.user || null;
    client.auth.onAuthStateChange((_e, session)=>{
      currentUser = session?.user || null;
      if(authCb) authCb(currentUser);
      if(currentUser) flushQueue();
    });
    if(currentUser) flushQueue();
    window.addEventListener("online", flushQueue);
    return { mode:"cloud", needAuth: !currentUser };
  }

  /* ---- auth (cloud) ---- */
  async function signUp(email, pw){
    const { error } = await client.auth.signUp({ email, password: pw });
    if(error) throw error;
  }
  async function signIn(email, pw){
    const { error } = await client.auth.signInWithPassword({ email, password: pw });
    if(error) throw error;
  }
  async function signOut(){ if(client) await client.auth.signOut(); currentUser=null; }
  function user(){ return currentUser; }
  function onAuth(cb){ authCb = cb; }
  function isCloud(){ return CLOUD; }

  /* ---- programmes par défaut du profil actif ----
     Un programme par défaut peut être réservé à certains profils via
     son champ `assign` (ex. assign:["souad"]). Sans `assign` : tous. */
  function defaultsFor(pid){
    return DEFAULT_PROGRAMS.filter(d=>!d.assign || d.assign.includes(pid));
  }

  /* ---- fusion des programmes par défaut manquants ----
     Ajoute tout programme par défaut du profil dont l'id n'existe pas
     déjà ET qui n'a pas été supprimé volontairement. Rend l'ajout
     de futurs programmes par défaut automatique sans toucher
     aux programmes importés / à la progression. */
  function mergeDefaults(programs){
    const removed = readLS(K("removed"), []);
    const have = new Set(programs.map(p=>p.id));
    let added = false;
    defaultsFor(activeProfile()).forEach(d=>{
      if(!have.has(d.id) && !removed.includes(d.id)){ programs.push(d); added = true; }
    });
    return { programs, added };
  }

  /* ---- chargement de toute la bibliothèque + progression ---- */
  async function loadAll(){
    if(!CLOUD){
      let programs = readLS(K("programs"), null);
      if(!programs || !programs.length){ programs = defaultsFor(activeProfile()).slice(); }
      const m = mergeDefaults(programs); programs = m.programs;
      cacheProgramsList(programs);
      return { programs, progress: readLS(K("progress"), {}) };
    }
    // cloud : tente le réseau, sinon cache
    try{
      let { data: progs, error: e1 } = await client.from("programs")
        .select("*").eq("user_id", currentUser.id).order("sort",{ascending:true});
      if(e1) throw e1;
      if(!progs || !progs.length){
        // 1ère connexion : on sème les programmes par défaut
        const seed = defaultsFor(activeProfile()).map((p,i)=>({ user_id:currentUser.id, id:p.id, data:p, sort:i,
          updated_at:new Date().toISOString() }));
        await client.from("programs").upsert(seed);
        progs = seed;
      }
      const programs = progs.map(r=>r.data);
      // fusion des programmes par défaut manquants (hors supprimés)
      const m = mergeDefaults(programs);
      if(m.added){
        const removed = readLS(K("removed"), []);
        const existing = new Set(progs.map(r=>r.id));
        const newSeed = defaultsFor(activeProfile())
          .filter(d=>!existing.has(d.id) && !removed.includes(d.id))
          .map((p,i)=>({ user_id:currentUser.id, id:p.id, data:p, sort:progs.length+i,
            updated_at:new Date().toISOString() }));
        if(newSeed.length){ try{ await client.from("programs").upsert(newSeed); }catch(e){} }
      }
      cacheProgramsList(programs);

      const { data: rows, error: e2 } = await client.from("progress")
        .select("*").eq("user_id", currentUser.id);
      if(e2) throw e2;
      const progress = {};
      (rows||[]).forEach(r=>{ progress[r.program_id]=progress[r.program_id]||{}; progress[r.program_id]["w"+r.week]=r.state; });
      writeLS(K("progress"), progress);
      return { programs, progress };
    }catch(e){
      // offline / erreur : on sert le cache
      let programs = readLS(K("programs"), null) || defaultsFor(activeProfile()).slice();
      programs = mergeDefaults(programs).programs;
      cacheProgramsList(programs);
      return { programs, progress: readLS(K("progress"), {}), offline:true };
    }
  }

  /* ---- écritures ---- */
  async function saveProgress(programId, week, state){
    cacheProgress(programId, week, state);
    if(!CLOUD) return;
    const op = { t:"progress", programId, week, state };
    try{ if(!navigator.onLine) throw 0; await applyOp(op); }
    catch(e){ enqueue(op); }
  }
  async function upsertProgram(p, sort){
    const list = readLS(K("programs"), []);
    const i = list.findIndex(x=>x.id===p.id);
    if(i>=0) list[i]=p; else list.push(p);
    cacheProgramsList(list);
    if(!CLOUD) return;
    const op = { t:"program", p, sort: sort ?? (i>=0?i:list.length-1) };
    try{ if(!navigator.onLine) throw 0; await applyOp(op); }
    catch(e){ enqueue(op); }
  }
  /* upsert dans un profil précis (import ancien format → toujours Moss) */
  async function upsertProgramFor(pid, p){
    if(CLOUD || pid === activeProfile()) return upsertProgram(p);
    const key = Kp(pid, "programs");
    const list = readLS(key, []);
    const i = list.findIndex(x=>x.id===p.id);
    if(i>=0) list[i]=p; else list.push(p);
    writeLS(key, list);
  }
  async function deleteProgram(id){
    const list = readLS(K("programs"), []).filter(x=>x.id!==id);
    cacheProgramsList(list);
    const prog = readLS(K("progress"), {}); delete prog[id]; writeLS(K("progress"), prog);
    const pr = loadProgression(); delete pr[id]; saveProgression(pr);
    // si c'est un programme par défaut, on le mémorise pour ne pas le ré-ajouter
    if(DEFAULT_PROGRAMS.some(d=>d.id===id)){
      const removed = readLS(K("removed"), []);
      if(!removed.includes(id)){ removed.push(id); writeLS(K("removed"), removed); }
    }
    if(!CLOUD) return;
    const op = { t:"delprogram", id };
    try{ if(!navigator.onLine) throw 0; await applyOp(op); }
    catch(e){ enqueue(op); }
  }

  /* ---- export / import global multi-profils (schéma v2) ---- */
  function exportAll(){
    const P0 = window.PLProgression;
    return {
      schema: "perflab-profiles-v1",
      exported_at: new Date().toISOString(),
      profiles: P0.PROFILES.map(p=>({
        id: p.id, name: p.name,
        programs:    readLS(Kp(p.id,"programs"), []),
        progress:    readLS(Kp(p.id,"progress"), {}),
        weeks:       readLS(Kp(p.id,"weeks"), {}),
        progression: readLS(Kp(p.id,"progression"), {}),
        log:         readLS(Kp(p.id,"log"), [])
      }))
    };
  }
  function importProfilesDoc(doc){
    const state = {};
    window.PLProgression.PROFILES.forEach(p=>{
      state[p.id] = {
        programs:    readLS(Kp(p.id,"programs"), []),
        progress:    readLS(Kp(p.id,"progress"), {}),
        weeks:       readLS(Kp(p.id,"weeks"), {}),
        progression: readLS(Kp(p.id,"progression"), {}),
        log:         readLS(Kp(p.id,"log"), [])
      };
    });
    window.PLProgression.mergeProfilesDoc(state, doc);
    Object.keys(state).forEach(pid=>{
      // profils inconnus du sélecteur : ignorés silencieusement
      if(!window.PLProgression.PROFILES.some(p=>p.id===pid)) return;
      writeLS(Kp(pid,"programs"),    state[pid].programs);
      writeLS(Kp(pid,"progress"),    state[pid].progress);
      writeLS(Kp(pid,"weeks"),       state[pid].weeks);
      writeLS(Kp(pid,"progression"), state[pid].progression);
      writeLS(Kp(pid,"log"),         state[pid].log || []);
    });
  }

  return { init, isCloud, signUp, signIn, signOut, user, onAuth,
           loadAll, saveProgress, upsertProgram, upsertProgramFor, deleteProgram,
           activeProfile, setProfile, profiles,
           getWeek, setWeek, loadProgression, saveProgression,
           getLog, addLog, lastExport, markExported,
           exportAll, importProfilesDoc };
})();
