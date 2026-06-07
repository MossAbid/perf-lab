/* ============================ PERF LAB — BACKEND ============================
   Deux modes, même interface :
   - LOCAL : localStorage uniquement (si CONFIG vide).
   - CLOUD : Supabase (auth + Postgres), avec localStorage comme cache offline
             et une file d'attente pour les écritures faites hors-ligne.
   ========================================================================== */
const Backend = (() => {
  const CFG = window.CONFIG || {};
  const CLOUD = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  const LS = {
    programs: "perflab.programs",
    progress: "perflab.progress",
    queue:    "perflab.queue",
    removed:  "perflab.removed"
  };
  let client = null, currentUser = null, authCb = null;

  /* ---- cache local ---- */
  const readLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };

  function cacheProgress(progId, week, state){
    const all = readLS(LS.progress, {});
    all[progId] = all[progId] || {};
    all[progId]["w"+week] = state;
    writeLS(LS.progress, all);
  }
  function cacheProgramsList(list){ writeLS(LS.programs, list); }

  /* ---- file d'attente offline (cloud) ---- */
  function enqueue(op){ const q = readLS(LS.queue, []); q.push(op); writeLS(LS.queue, q); }
  async function flushQueue(){
    if(!CLOUD || !currentUser) return;
    let q = readLS(LS.queue, []);
    if(!q.length) return;
    const rest = [];
    for(const op of q){
      try{ await applyOp(op); }
      catch(e){ rest.push(op); }
    }
    writeLS(LS.queue, rest);
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

  /* ---- fusion des programmes par défaut manquants ----
     Ajoute tout DEFAULT_PROGRAMS dont l'id n'existe pas déjà
     ET qui n'a pas été supprimé volontairement. Rend l'ajout
     de futurs programmes par défaut automatique sans toucher
     aux programmes importés / à la progression. */
  function mergeDefaults(programs){
    const removed = readLS(LS.removed, []);
    const have = new Set(programs.map(p=>p.id));
    let added = false;
    DEFAULT_PROGRAMS.forEach(d=>{
      if(!have.has(d.id) && !removed.includes(d.id)){ programs.push(d); added = true; }
    });
    return { programs, added };
  }

  /* ---- chargement de toute la bibliothèque + progression ---- */
  async function loadAll(){
    if(!CLOUD){
      let programs = readLS(LS.programs, null);
      if(!programs || !programs.length){ programs = DEFAULT_PROGRAMS.slice(); }
      const m = mergeDefaults(programs); programs = m.programs;
      cacheProgramsList(programs);
      return { programs, progress: readLS(LS.progress, {}) };
    }
    // cloud : tente le réseau, sinon cache
    try{
      let { data: progs, error: e1 } = await client.from("programs")
        .select("*").eq("user_id", currentUser.id).order("sort",{ascending:true});
      if(e1) throw e1;
      if(!progs || !progs.length){
        // 1ère connexion : on sème les programmes par défaut
        const seed = DEFAULT_PROGRAMS.map((p,i)=>({ user_id:currentUser.id, id:p.id, data:p, sort:i,
          updated_at:new Date().toISOString() }));
        await client.from("programs").upsert(seed);
        progs = seed;
      }
      const programs = progs.map(r=>r.data);
      // fusion des programmes par défaut manquants (hors supprimés)
      const m = mergeDefaults(programs);
      if(m.added){
        const removed = readLS(LS.removed, []);
        const existing = new Set(progs.map(r=>r.id));
        const newSeed = DEFAULT_PROGRAMS
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
      writeLS(LS.progress, progress);
      return { programs, progress };
    }catch(e){
      // offline / erreur : on sert le cache
      let programs = readLS(LS.programs, null) || DEFAULT_PROGRAMS.slice();
      programs = mergeDefaults(programs).programs;
      cacheProgramsList(programs);
      return { programs, progress: readLS(LS.progress, {}), offline:true };
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
    const list = readLS(LS.programs, []);
    const i = list.findIndex(x=>x.id===p.id);
    if(i>=0) list[i]=p; else list.push(p);
    cacheProgramsList(list);
    if(!CLOUD) return;
    const op = { t:"program", p, sort: sort ?? (i>=0?i:list.length-1) };
    try{ if(!navigator.onLine) throw 0; await applyOp(op); }
    catch(e){ enqueue(op); }
  }
  async function deleteProgram(id){
    const list = readLS(LS.programs, []).filter(x=>x.id!==id);
    cacheProgramsList(list);
    const prog = readLS(LS.progress, {}); delete prog[id]; writeLS(LS.progress, prog);
    // si c'est un programme par défaut, on le mémorise pour ne pas le ré-ajouter
    if(DEFAULT_PROGRAMS.some(d=>d.id===id)){
      const removed = readLS(LS.removed, []);
      if(!removed.includes(id)){ removed.push(id); writeLS(LS.removed, removed); }
    }
    if(!CLOUD) return;
    const op = { t:"delprogram", id };
    try{ if(!navigator.onLine) throw 0; await applyOp(op); }
    catch(e){ enqueue(op); }
  }

  return { init, isCloud, signUp, signIn, signOut, user, onAuth,
           loadAll, saveProgress, upsertProgram, deleteProgram };
})();
