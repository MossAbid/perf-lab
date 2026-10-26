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
  const AUTH_KEY = "perflab.cf.auth";          // session Supabase du module (storageKey)
  const TIMEOUT = CFG.CYCLE_TIMEOUT_MS || 4000; // réseau de salle : on n'attend jamais plus

  const readLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const dropLS = k => { try { localStorage.removeItem(k); } catch(e){} };
  const msg = e => (e && e.message) || String(e);
  const withTimeout = p => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("Réseau trop lent.")), TIMEOUT))]);

  let client = null, currentUser = null, authCb = null;

  /* ---- lecture (toujours depuis le cache : marche hors-ligne) ---- */
  function getCycle(){ return readLS(CYCLE_KEY, null); }
  function getAthlete(){
    const a = readLS(ATHLETE_KEY, null);
    return a && a.v ? a : C().newAthlete();
  }

  /* ---- file d'attente : une seule opération, la dernière sauvegarde ----
     Écrite AVANT l'envoi (l'app peut être tuée pendant), retirée après succès
     seulement si personne ne l'a remplacée entre-temps. Les envois passent un
     par un : un envoi lent ne peut pas écraser une sauvegarde plus récente. */
  async function pushAthlete(value){
    const { error } = await withTimeout(client.from("state").upsert({
      user_id: currentUser.id, key: "cycle", value, updated_at: new Date().toISOString()
    }));
    if(error) throw error;
  }
  async function flushOnce(){
    if(!CLOUD || !client || !currentUser) return;
    const op = readLS(QUEUE_KEY, null);
    if(!op) return;
    try{
      await pushAthlete(op.value);
      const cur = readLS(QUEUE_KEY, null);
      if(cur && cur.seq === op.seq) dropLS(QUEUE_KEY);
    }catch(e){}
  }
  let pushing = Promise.resolve();
  function flush(){ pushing = pushing.then(flushOnce, flushOnce); return pushing; }

  /* ---- init / auth ---- */
  async function init(){
    if(!CLOUD) return { mode:"local", needAuth:false };
    if(!window.supabase || !window.supabase.createClient){
      // client non chargé (hors-ligne au 1er lancement) : on sert le cache
      return { mode:"cloud", needAuth:false };
    }
    client = window.supabase.createClient(CFG.CYCLE_SUPABASE_URL, CFG.CYCLE_SUPABASE_ANON_KEY, {
      auth:{ persistSession:true, autoRefreshToken:true, storageKey:AUTH_KEY }
    });
    try{
      const { data } = await withTimeout(client.auth.getSession());
      currentUser = data?.session?.user || null;
    }catch(e){ currentUser = null; }
    client.auth.onAuthStateChange((_e, session)=>{
      currentUser = session?.user || null;
      if(authCb) authCb(currentUser);
      if(currentUser) flush();
    });
    if(currentUser) flush();
    window.addEventListener("online", flush);
    return { mode:"cloud", needAuth: needAuth() };
  }
  /* écran de connexion seulement si aucune session n'est enregistrée : un jeton
     expiré qu'on n'a pas pu rafraîchir (réseau de salle) n'oblige pas à se
     reconnecter, on sert le cache et la session reprend au retour du réseau */
  const hasStoredSession = () => { try { return !!localStorage.getItem(AUTH_KEY); } catch(e){ return false; } };
  function needAuth(){ return CLOUD && !!client && !currentUser && !hasStoredSession() && navigator.onLine !== false; }
  async function signIn(email, pw){
    if(!client) throw "Connexion impossible hors-ligne.";
    const { data, error } = await withTimeout(client.auth.signInWithPassword({ email, password: pw }));
    if(error) throw msg(error);
    currentUser = data?.user || currentUser;
    await flush();
  }
  async function signOut(){ if(client) await client.auth.signOut(); currentUser = null; }
  function user(){ return currentUser; }
  function onAuth(cb){ authCb = cb; }
  function isCloud(){ return CLOUD; }

  /* ---- synchronisation ----
     CLOUD : cycle actif = cycle inscrit (active) au départ le plus récent, parmi
     les liens posés par moi (v1 : pas encore de coach) et les cycles valides.
     Une sauvegarde encore en file est plus récente que le serveur : on la garde.
     Chaque appel réseau est borné par TIMEOUT : au-delà, on sert le cache.     */
  async function refresh(){
    if(!CLOUD) return { cycle: getCycle(), athlete: getAthlete() };
    if(!client || !currentUser) return { cycle: getCycle(), athlete: getAthlete(), offline: !client };
    try{
      await flush();
      const { data: links, error: e1 } = await withTimeout(client.from("cycle_athletes")
        .select("*").eq("user_id", currentUser.id).eq("active", true));
      if(e1) throw e1;
      const ids = (links || []).filter(r => r.owner === currentUser.id).map(r => r.cycle_id);
      let cycle = null;
      if(ids.length){
        const { data: rows, error: e2 } = await withTimeout(client.from("cycles").select("*").in("id", ids));
        if(e2) throw e2;
        const valid = c => { try { return C().validateCycle(c); } catch(e){ return false; } };
        (rows || []).forEach(r => { if(r.data && valid(r.data) && (!cycle || r.data.start > cycle.start)) cycle = r.data; });
      }
      const { data: st, error: e3 } = await withTimeout(client.from("state")
        .select("*").eq("user_id", currentUser.id).eq("key", "cycle"));
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
  /* écrit en local puis met en file ; l'envoi part en arrière-plan (flush) :
     l'écran ne reste jamais suspendu à un réseau lent */
  async function saveAthlete(athlete){
    writeLS(ATHLETE_KEY, athlete);
    if(!CLOUD) return;
    writeLS(QUEUE_KEY, { t:"state", value: athlete, seq: Date.now() + Math.random() });
    if(navigator.onLine !== false) flush();
  }

  /* importe (ou remplace) un cycle ; le journal de l'athlète n'est jamais touché */
  async function importCycle(cycle){
    C().validateCycle(cycle);
    if(CLOUD){
      if(!client || !currentUser) throw "Connecte-toi pour importer un cycle.";
      if(navigator.onLine === false) throw "Connexion requise pour importer un cycle.";
      const r1 = await withTimeout(client.from("cycles").upsert({
        id: cycle.id, owner: currentUser.id, data: cycle, updated_at: new Date().toISOString()
      }));
      if(r1.error) throw msg(r1.error);
      const r2 = await withTimeout(client.from("cycle_athletes").upsert({
        cycle_id: cycle.id, user_id: currentUser.id, owner: currentUser.id, active: true
      }));
      if(r2.error) throw msg(r2.error);
    }
    writeLS(CYCLE_KEY, cycle);
  }

  return { init, isCloud, needAuth, signIn, signOut, user, onAuth,
           refresh, flush, getCycle, getAthlete, saveAthlete, importCycle };
})();
