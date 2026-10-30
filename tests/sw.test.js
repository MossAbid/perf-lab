/* Tests Node du service worker (sw.js) : stratégie réseau/cache de la coque.
   Lancer :  node tests/sw.test.js                                          */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

let n = 0, chain = Promise.resolve();
const t = (name, fn) => { chain = chain.then(fn).then(() => { n++; console.log("  ✓ " + name); }); };

const res = body => ({ ok: true, body, clone() { return res(body); } });

/* Charge sw.js dans un contexte simulé ; fetchImpl et cached pilotent réseau et cache. */
function bootSW(fetchImpl, cached) {
  const handlers = {}, puts = [];
  const self = { addEventListener: (type, fn) => { handlers[type] = fn; }, clients: { claim() {} }, skipWaiting: async () => {} };
  const caches = {
    match: async req => (req === "./index.html" ? res("index") : cached),
    open: async () => ({ put: (req, res) => puts.push(res), addAll: async () => {} }),
    keys: async () => [], delete: async () => true
  };
  new Function("self", "caches", "fetch", "location", fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8"))
    (self, caches, fetchImpl, { origin: "https://perflab.test" });
  const get = url => new Promise(resolve => handlers.fetch({
    request: { method: "GET", url: "https://perflab.test" + url },
    respondWith: p => resolve({ p })   // emballé : sinon resolve() adopterait la promesse de réponse
  }));
  const install = () => new Promise(resolve => handlers.install({ waitUntil: p => resolve(p) }));
  return { get, puts, install };
}
/* fetch espion : garde (url, options) de chaque appel */
const spy = () => { const calls = []; const f = async (url, init) => { calls.push({ url, init }); return res("réseau"); }; f.calls = calls; return f; };
const within = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r("bloqué"), ms))]);

t("code : réseau qui ne répond pas → l'app part du cache en quelques secondes", async () => {
  const { get } = bootSW(() => new Promise(() => {}), res("cache"));
  const r = await within((await get("/app.js")).p, 5000);
  assert.notEqual(r, "bloqué", "la réponse attend le réseau indéfiniment");
  assert.equal(r.body, "cache");
});

t("code : en ligne → version du réseau servie et mise en cache", async () => {
  const { get, puts } = bootSW(async () => res("réseau"), res("cache"));
  const r = await within((await get("/cycle-ui.js")).p, 5000);
  assert.equal(r.body, "réseau");
  await new Promise(r => setTimeout(r, 0));
  assert.equal(puts.length, 1);
});

t("code : hors-ligne et absent du cache → repli sur index.html", async () => {
  const { get } = bootSW(async () => { throw new TypeError("offline"); }, undefined);
  const r = await within((await get("/inconnu.js")).p, 5000);
  assert.equal(r.body, "index");
});

t("code : le réseau est relu sans le cache HTTP (max-age 600 de GitHub Pages)", async () => {
  const f = spy(), { get } = bootSW(f, res("cache"));
  await within((await get("/app.js")).p, 5000);
  assert.equal(f.calls[0].url, "https://perflab.test/app.js");
  assert.equal((f.calls[0].init || {}).cache, "no-cache");
});

t("installation : la coque est relue sur le réseau, pas dans le cache HTTP", async () => {
  const f = spy(), { install, puts } = bootSW(f, undefined);
  await install();
  assert.ok(f.calls.length > 5, "la coque n'est pas téléchargée");
  assert.ok(f.calls.every(c => (c.init || {}).cache === "reload"), "un fichier de la coque peut venir du cache HTTP");
  assert.equal(puts.length, f.calls.length);
});

chain.then(() => console.log(`\n${n} tests OK`)).catch(e => { console.error("  ✗ " + (e && e.stack || e)); process.exit(1); });
