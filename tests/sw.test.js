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
  const self = { addEventListener: (type, fn) => { handlers[type] = fn; }, clients: { claim() {} } };
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
  return { get, puts };
}
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

chain.then(() => console.log(`\n${n} tests OK`)).catch(e => { console.error("  ✗ " + (e && e.stack || e)); process.exit(1); });
