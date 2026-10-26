/* ======================= PERF LAB — PROGRAMMATION : DONNÉES =======================
   Même interface dans les deux modes :
   - LOCAL : localStorage uniquement (CYCLE_SUPABASE_* vides).
   - CLOUD : Supabase pour ce module seulement (Backend reste LOCAL : bibliothèques
             et sélecteur Moss / Souad inchangés). localStorage sert de cache
             hors-ligne et une file d'une seule opération garde la dernière
             sauvegarde faite sans réseau.

   Contenu du cycle : tables `cycles` / `cycle_athletes` (jamais dans le dépôt),
   cache `perflab.cf.cycle`. Données de l'athlète (max, séances faites, scores) :
   table `state` clé `cycle`, cache `perflab.p.moss.cycle` — la clé que lit
   l'export de Backend, donc la sauvegarde JSON les emporte.
   ================================================================================= */
const CycleStore = (() => {
  const CFG = window.CONFIG || {};
  const CLOUD = !!(CFG.CYCLE_SUPABASE_URL && CFG.CYCLE_SUPABASE_ANON_KEY);
  const C = () => window.PLCycle;

  const CYCLE_KEY = "perflab.cf.cycle";
  const ATHLETE_KEY = "perflab.p.moss.cycle";
  const QUEUE_KEY = "perflab.cf.queue";

  const readLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const dropLS = k => { try { localStorage.removeItem(k); } catch(e){} };
  const msg = e => (e && e.message) || String(e);

  let client = null, currentUser = null, authCb = null;

  /* ---- lecture (toujours depuis le cache : marche hors-ligne) ---- */
  function getCycle(){ return readLS(CYCLE_KEY, null); }
  function getAthlete(){
    const a = readLS(ATHLETE_KEY, null);
    return a && a.v ? a : C().newAthlete();
  }

  /* ---- file d'attente : une seule opération, la dernière sauvegarde ---- */
  async function pushAthlete(value){
    const { error } = await client.from("state").upsert({
      user_id: currentUser.id, key: "cycle", value, updated_at: new Date().toISOString()
    });
    if(error) throw error;
  }
  async function flushQueue(){
    if(!CLOUD || !client || !currentUser) return;
    const op = readLS(QUEUE_KEY, null);
    if(!op) return;
    try{ await pushAthlete(op.value); dropLS(QUEUE_KEY); }catch(e){}
  }

  /* ---- init / auth ---- */
  async function init(){
    if(!CLOUD) return { mode:"local", needAuth:false };
    if(!window.supabase || !window.supabase.createClient){
      // client non chargé (hors-ligne au 1er lancement) : on sert le cache
      return { mode:"cloud", needAuth:false };
    }
    client = window.supabase.createClient(CFG.CYCLE_SUPABASE_URL, CFG.CYCLE_SUPABASE_ANON_KEY, {
      auth:{ persistSession:true, autoRefreshToken:true, storageKey:"perflab.cf.auth" }
    });
    try{
      const { data } = await client.auth.getSession();
      currentUser = data?.session?.user || null;
    }catch(e){ currentUser = null; }
    client.auth.onAuthStateChange((_e, session)=>{
      currentUser = session?.user || null;
      if(authCb) authCb(currentUser);
      if(currentUser) flushQueue();
    });
    if(currentUser) flushQueue();
    window.addEventListener("online", flushQueue);
    return { mode:"cloud", needAuth: needAuth() };
  }
  /* écran de connexion seulement en ligne : en salle sans réseau, on sert le cache */
  function needAuth(){ return CLOUD && !!client && !currentUser && navigator.onLine !== false; }
  async function signIn(email, pw){
    if(!client) throw "Connexion impossible hors-ligne.";
    const { data, error } = await client.auth.signInWithPassword({ email, password: pw });
    if(error) throw msg(error);
    currentUser = data?.user || currentUser;
    await flushQueue();
  }
  async function signOut(){ if(client) await client.auth.signOut(); currentUser = null; }
  function user(){ return currentUser; }
  function onAuth(cb){ authCb = cb; }
  function isCloud(){ return CLOUD; }

  /* ---- synchronisation ----
     CLOUD : cycle actif = cycle inscrit (active) au départ le plus récent.
     Une sauvegarde encore en file est plus récente que le serveur : on la garde. */
  async function refresh(){
    if(!CLOUD) return { cycle: getCycle(), athlete: getAthlete() };
    if(!client || !currentUser) return { cycle: getCycle(), athlete: getAthlete(), offline: !client };
    try{
      await flushQueue();
      const { data: links, error: e1 } = await client.from("cycle_athletes")
        .select("*").eq("user_id", currentUser.id).eq("active", true);
      if(e1) throw e1;
      const ids = (links || []).map(r => r.cycle_id);
      let cycle = null;
      if(ids.length){
        const { data: rows, error: e2 } = await client.from("cycles").select("*").in("id", ids);
        if(e2) throw e2;
        (rows || []).forEach(r => { if(r.data && (!cycle || r.data.start > cycle.start)) cycle = r.data; });
      }
      const { data: st, error: e3 } = await client.from("state")
        .select("*").eq("user_id", currentUser.id).eq("key", "cycle");
      if(e3) throw e3;
      writeLS(CYCLE_KEY, cycle);
      const remote = st && st[0] && st[0].value;
      if(remote && !readLS(QUEUE_KEY, null)) writeLS(ATHLETE_KEY, remote);
      return { cycle, athlete: getAthlete() };
    }catch(e){
      return { cycle: getCycle(), athlete: getAthlete(), offline: true };
    }
  }

  /* ---- écritures ---- */
  async function saveAthlete(athlete){
    writeLS(ATHLETE_KEY, athlete);
    if(!CLOUD) return;
    try{
      if(!client || !currentUser || navigator.onLine === false) throw 0;
      await pushAthlete(athlete);
      dropLS(QUEUE_KEY);
    }catch(e){ writeLS(QUEUE_KEY, { t:"state", value: athlete }); }
  }

  /* importe (ou remplace) un cycle ; le journal de l'athlète n'est jamais touché */
  async function importCycle(cycle){
    C().validateCycle(cycle);
    if(CLOUD){
      if(!client || !currentUser) throw "Connecte-toi pour importer un cycle.";
      if(navigator.onLine === false) throw "Connexion requise pour importer un cycle.";
      const r1 = await client.from("cycles").upsert({
        id: cycle.id, owner: currentUser.id, data: cycle, updated_at: new Date().toISOString()
      });
      if(r1.error) throw msg(r1.error);
      const r2 = await client.from("cycle_athletes").upsert({
        cycle_id: cycle.id, user_id: currentUser.id, owner: currentUser.id, active: true
      });
      if(r2.error) throw msg(r2.error);
    }
    writeLS(CYCLE_KEY, cycle);
  }

  return { init, isCloud, needAuth, signIn, signOut, user, onAuth,
           refresh, getCycle, getAthlete, saveAthlete, importCycle };
})();
