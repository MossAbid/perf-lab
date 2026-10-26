/* Tests Node de cyclestore.js (module Programmation), modes LOCAL et CLOUD.
   Lancer :  node tests/cyclestore.test.js                                  */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { makeSampleCycle } = require(path.join(__dirname, "fixtures", "cycle-sample.js"));

let n = 0, chain = Promise.resolve();
// ONLY=<extrait du nom> pour ne lancer que les tests correspondants
const t = (name, fn) => { if (process.env.ONLY && !name.includes(process.env.ONLY)) return;
  chain = chain.then(fn).then(() => { n++; console.log("  ✓ " + name); }); };
process.on("unhandledRejection", e => { console.error("  ✗ " + e); process.exit(1); });

/* ---- stubs navigateur (même patron que tests/backend.test.js) ---- */
function makeLocalStorage(seed) {
  const store = Object.assign({}, seed || {});
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    _store: store
  };
}
const src = f => fs.readFileSync(path.join(__dirname, "..", f), "utf8");

/* Mock minimal du client Supabase : select/eq/in/order/upsert, thenables.
   opts.failSelect : toute lecture lève (réseau coupé) · opts.hang : lectures et
   getSession ne répondent jamais · opts.gate() : promesse attendue avant chaque
   écriture (envoi « en vol ») · opts.sessionError : getSession échoue (jeton expiré). */
function makeMockClient(store, session, opts) {
  opts = opts || {};
  const never = new Promise(() => {});
  function makeChain(execute) {
    const filters = [];
    const c = {
      eq: (col, val) => { filters.push(r => r[col] === val); return c; },
      in: (col, vals) => { filters.push(r => vals.includes(r[col])); return c; },
      order: () => c,
      then: (resolve, reject) => { if (opts.hang) return never.then(resolve, reject); try { resolve(execute(filters)); } catch (e) { reject(e); } }
    };
    return c;
  }
  const PK = { cycles: ["id"], cycle_athletes: ["cycle_id", "user_id"], state: ["user_id", "key"] };
  function from(table) {
    return {
      select: () => {
        if (opts.failSelect) throw new TypeError("Failed to fetch");
        return makeChain(filters => ({ data: store[table].filter(r => filters.every(f => f(r))), error: null }));
      },
      upsert: async rows => {
        if (opts.gate) await opts.gate();
        if (opts.upsertError) return { error: { message: opts.upsertError } };
        const arr = Array.isArray(rows) ? rows : [rows];
        arr.forEach(row => {
          const i = store[table].findIndex(r => PK[table].every(k => r[k] === row[k]));
          if (i >= 0) store[table][i] = row; else store[table].push(row);
        });
        return { error: null };
      }
    };
  }
  return {
    auth: {
      getSession: async () => opts.hang ? never
        : opts.sessionError ? { data: { session: null }, error: { message: "Failed to fetch" } }
        : { data: { session } },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => opts.signOutError ? { error: { message: "Failed to fetch" } } : {}
    },
    from
  };
}

/* Charge config → cycle → cyclestore comme index.html. cloud = { store, session, failSelect }.
   Sans cloud : config.js réel, clés CYCLE_* vidées (le dépôt porte la vraie clé publique). */
function boot(seedLS, cloud) {
  const ls = makeLocalStorage(seedLS);
  const onlineHandlers = [];
  const sandbox = {
    window: { addEventListener: (evt, cb) => { if (evt === "online") onlineHandlers.push(cb); } },
    localStorage: ls, navigator: { onLine: true },
    console, JSON, Math, Date, Array, Object, Set, String, Number, Boolean, Promise
  };
  sandbox.window.localStorage = ls;
  if (cloud) {
    sandbox.window.CONFIG = { CYCLE_SUPABASE_URL: "https://x.supabase.co", CYCLE_SUPABASE_ANON_KEY: "anon", CYCLE_TIMEOUT_MS: 50 };
    sandbox.window.supabase = { createClient: () => makeMockClient(cloud.store, cloud.session, cloud) };
  }
  const code = `
    const window = __sandbox.window;
    const localStorage = __sandbox.localStorage;
    const navigator = __sandbox.navigator;
    ${cloud ? "" : src("config.js") + "\nwindow.CONFIG.CYCLE_SUPABASE_URL = ''; window.CONFIG.CYCLE_SUPABASE_ANON_KEY = '';"}
    ${src("cycle.js")}
    ${src("cyclestore.js")}
    return { CycleStore, PLCycle: window.PLCycle };
  `;
  const r = new Function("__sandbox", "module", code)(sandbox, undefined);
  return { CycleStore: r.CycleStore, PLCycle: r.PLCycle, ls, sandbox, onlineHandlers };
}
const ME = { user: { id: "u1", email: "moss@test" } };
const athleteWith = kg => ({ v: 1, maxes: { back_squat: [{ kg, d: "2026-08-15" }] }, logs: {} });

/* ---- LOCAL ---- */
t("LOCAL : importCycle valide puis met en cache", async () => {
  const { CycleStore, ls } = boot();
  assert.deepEqual(await CycleStore.init(), { mode: "local", needAuth: false });
  await CycleStore.importCycle(makeSampleCycle());
  assert.equal(CycleStore.getCycle().id, "cycle-1");
  const broken = makeSampleCycle("2026-11-23", "cycle-2"); broken.schema = "x";
  await assert.rejects(CycleStore.importCycle(broken), m => /Schéma attendu : perflab-cycle-v1/.test(m));
  assert.equal(JSON.parse(ls.getItem("perflab.cf.cycle")).id, "cycle-1", "cache intact après un import refusé");
});

t("LOCAL : saveAthlete écrit perflab.p.moss.cycle", async () => {
  const { CycleStore, ls } = boot();
  await CycleStore.init();
  await CycleStore.saveAthlete(athleteWith(120));
  assert.equal(JSON.parse(ls.getItem("perflab.p.moss.cycle")).maxes.back_squat[0].kg, 120);
});

t("LOCAL : réimporter le même cycle conserve le journal", async () => {
  const { CycleStore, PLCycle } = boot();
  await CycleStore.init();
  await CycleStore.importCycle(makeSampleCycle());
  const a = CycleStore.getAthlete();
  a.logs["cycle-1"] = PLCycle.markDone(PLCycle.newLog(), "w1s1", "2026-11-24");
  await CycleStore.saveAthlete(a);
  await CycleStore.importCycle(makeSampleCycle());
  assert.equal(CycleStore.getAthlete().logs["cycle-1"].done.w1s1, "2026-11-24");
});

/* ---- CLOUD ---- */
t("CLOUD : refresh charge le cycle actif et le blob athlète", async () => {
  const store = {
    cycles: [
      { id: "c-sep", owner: "u1", data: makeSampleCycle("2026-09-07", "c-sep") },
      { id: "cycle-1", owner: "u1", data: makeSampleCycle() }
    ],
    cycle_athletes: [
      { cycle_id: "c-sep", user_id: "u1", owner: "u1", active: true },
      { cycle_id: "cycle-1", user_id: "u1", owner: "u1", active: true }
    ],
    state: [{ user_id: "u1", key: "cycle", value: athleteWith(120) }]
  };
  const { CycleStore } = boot(null, { store, session: ME });
  assert.deepEqual(await CycleStore.init(), { mode: "cloud", needAuth: false });
  const r = await CycleStore.refresh();
  assert.equal(r.cycle.id, "cycle-1");
  assert.equal(r.athlete.maxes.back_squat[0].kg, 120);
  assert.equal(CycleStore.getCycle().id, "cycle-1", "cycle mis en cache");
});

t("CLOUD : importCycle écrit cycles + cycle_athletes avec owner = moi", async () => {
  const store = { cycles: [], cycle_athletes: [], state: [] };
  const { CycleStore } = boot(null, { store, session: ME });
  await CycleStore.init();
  await CycleStore.importCycle(makeSampleCycle());
  assert.equal(store.cycles.length, 1);
  assert.equal(store.cycles[0].owner, "u1");
  assert.equal(store.cycles[0].data.id, "cycle-1");
  assert.deepEqual(
    { cycle_id: store.cycle_athletes[0].cycle_id, user_id: store.cycle_athletes[0].user_id, owner: store.cycle_athletes[0].owner, active: store.cycle_athletes[0].active },
    { cycle_id: "cycle-1", user_id: "u1", owner: "u1", active: true });
  assert.equal(CycleStore.getCycle().id, "cycle-1");
});

t("CLOUD : saveAthlete hors-ligne → file, poussé au retour du réseau", async () => {
  const store = { cycles: [], cycle_athletes: [], state: [] };
  const { CycleStore, sandbox, onlineHandlers, ls } = boot(null, { store, session: ME });
  await CycleStore.init();
  sandbox.navigator.onLine = false;
  await CycleStore.saveAthlete(athleteWith(125));
  assert.equal(store.state.length, 0, "rien poussé pendant la coupure");
  assert.equal(CycleStore.getAthlete().maxes.back_squat[0].kg, 125, "lisible localement");
  sandbox.navigator.onLine = true;
  assert.equal(onlineHandlers.length, 1, "flush enregistré sur l'event online");
  await onlineHandlers[0]();
  const row = store.state.find(r => r.user_id === "u1" && r.key === "cycle");
  assert.equal(row.value.maxes.back_squat[0].kg, 125);
  assert.equal(JSON.parse(ls.getItem("perflab.cf.queue")), null, "file vide");
  assert.deepEqual(CycleStore.syncState(), { pending: false, error: null });
});

t("CLOUD : refresh hors-ligne sert le cache", async () => {
  const seed = {
    "perflab.cf.cycle": JSON.stringify(makeSampleCycle()),
    "perflab.p.moss.cycle": JSON.stringify(athleteWith(120))
  };
  const { CycleStore } = boot(seed, { store: {}, session: ME, failSelect: true });
  await CycleStore.init();
  const r = await CycleStore.refresh();
  assert.equal(r.offline, true);
  assert.equal(r.cycle.id, "cycle-1");
  assert.equal(r.athlete.maxes.back_squat[0].kg, 120);
});

/* ---- revue finale : sécurité, pertes de données, réseau de salle ---- */
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms));

t("CLOUD : lien posé par un autre compte ignoré", async () => {
  const store = {
    cycles: [{ id: "cycle-1", owner: "u1", data: makeSampleCycle() },
             { id: "intrus", owner: "u2", data: makeSampleCycle("2027-06-07", "intrus") }],
    cycle_athletes: [{ cycle_id: "cycle-1", user_id: "u1", owner: "u1", active: true },
                     { cycle_id: "intrus", user_id: "u1", owner: "u2", active: true }],
    state: []
  };
  const { CycleStore } = boot(null, { store, session: ME });
  await CycleStore.init();
  assert.equal((await CycleStore.refresh()).cycle.id, "cycle-1");
});

t("CLOUD : cycle invalide côté serveur ignoré", async () => {
  const broken = makeSampleCycle("2027-01-04", "casse"); broken.weeks[0].sessions[0].blocks[1].sets[0].pct = "lourd";
  const store = {
    cycles: [{ id: "cycle-1", owner: "u1", data: makeSampleCycle() }, { id: "casse", owner: "u1", data: broken }],
    cycle_athletes: [{ cycle_id: "cycle-1", user_id: "u1", owner: "u1", active: true },
                     { cycle_id: "casse", user_id: "u1", owner: "u1", active: true }],
    state: []
  };
  const { CycleStore } = boot(null, { store, session: ME });
  await CycleStore.init();
  assert.equal((await CycleStore.refresh()).cycle.id, "cycle-1");
});

t("CLOUD : app tuée pendant l'envoi → la sauvegarde reste en file et passe au relancement", async () => {
  const store = { cycles: [], cycle_athletes: [], state: [{ user_id: "u1", key: "cycle", value: athleteWith(120) }] };
  const a = boot(null, { store, session: ME, gate: () => new Promise(() => {}) });   // l'envoi ne finit jamais
  await a.CycleStore.init();
  a.CycleStore.saveAthlete(athleteWith(125));
  await tick(10);
  assert.equal(JSON.parse(a.ls.getItem("perflab.cf.queue")).value.maxes.back_squat[0].kg, 125, "en file avant la fin de l'envoi");
  const b = boot(Object.assign({}, a.ls._store), { store, session: ME });             // relancement, réseau sain
  await b.CycleStore.init();
  const r = await b.CycleStore.refresh();
  assert.equal(r.athlete.maxes.back_squat[0].kg, 125, "le cache n'est pas écrasé par la vieille copie serveur");
  assert.equal(store.state[0].value.maxes.back_squat[0].kg, 125, "poussé au relancement");
});

t("CLOUD : deux sauvegardes rapprochées → le serveur garde la dernière", async () => {
  const store = { cycles: [], cycle_athletes: [], state: [] };
  let release, first = true;
  const gate = () => { if (!first) return null; first = false; return new Promise(r => { release = r; }); };
  const { CycleStore } = boot(null, { store, session: ME, gate });
  await CycleStore.init();
  CycleStore.saveAthlete(athleteWith(125));
  await tick(5);
  CycleStore.saveAthlete(athleteWith(130));
  await tick(5);
  release();
  await CycleStore.flush();
  assert.equal(store.state[0].value.maxes.back_squat[0].kg, 130);
});

t("CLOUD : jeton expiré + réseau en échec → pas d'écran de connexion", async () => {
  const seed = { "perflab.cf.auth": JSON.stringify({ access_token: "x" }), "perflab.cf.cycle": JSON.stringify(makeSampleCycle()) };
  const { CycleStore } = boot(seed, { store: {}, session: null, sessionError: true });
  assert.deepEqual(await CycleStore.init(), { mode: "cloud", needAuth: false });
  assert.equal(CycleStore.needAuth(), false);
  assert.equal((await CycleStore.refresh()).cycle.id, "cycle-1", "le cache est servi");
});

t("CLOUD : aucune session enregistrée, en ligne → connexion demandée", async () => {
  const { CycleStore } = boot(null, { store: {}, session: null });
  assert.deepEqual(await CycleStore.init(), { mode: "cloud", needAuth: true });
});

t("CLOUD : réseau qui ne répond pas → init et refresh rendent la main avec le cache", async () => {
  const seed = { "perflab.cf.auth": "{}", "perflab.cf.cycle": JSON.stringify(makeSampleCycle()) };
  const { CycleStore } = boot(seed, { store: {}, session: ME, hang: true });
  const t0 = Date.now();
  await CycleStore.init();
  const r = await CycleStore.refresh();
  assert.ok(Date.now() - t0 < 1000, "rendu en moins d'une seconde");
  assert.equal(r.cycle.id, "cycle-1");
});

/* ---- défauts mineurs de la revue ---- */
t("CLOUD : déconnexion hors-ligne → session locale effacée, connexion redemandée", async () => {
  const { CycleStore, ls } = boot({ "perflab.cf.auth": "{}" }, { store: {}, session: ME, signOutError: true });
  await CycleStore.init();
  await CycleStore.signOut();
  assert.equal(ls.getItem("perflab.cf.auth"), null);
  assert.equal(CycleStore.user(), null);
  assert.equal(CycleStore.needAuth(), true);
});

t("CLOUD : état de synchro — en attente hors-ligne, refus du serveur signalé", async () => {
  const store = { cycles: [], cycle_athletes: [], state: [] };
  const { CycleStore, sandbox } = boot(null, { store, session: ME, upsertError: "permission denied for table state" });
  await CycleStore.init();
  sandbox.navigator.onLine = false;
  await CycleStore.saveAthlete(athleteWith(125));
  assert.deepEqual(CycleStore.syncState(), { pending: true, error: null });
  sandbox.navigator.onLine = true;
  await CycleStore.flush();
  const st = CycleStore.syncState();
  assert.equal(st.pending, true);
  assert.ok(/permission denied/.test(st.error), "refus visible : " + st.error);
});

chain.then(() => console.log(`\n${n} tests OK`)).catch(e => { console.error("  ✗ " + (e && e.stack || e)); process.exit(1); });
