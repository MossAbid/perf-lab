/* Vérifie un fichier de cycle (format perflab-cycle-v1) avant import.
   Lancer :  node tools/validate-cycle.js content/cycle-1.json              */
"use strict";
const fs = require("fs");
const path = require("path");
const C = require(path.join(__dirname, "..", "cycle.js"));

const file = process.argv[2];
if (!file) { console.error("Usage : node tools/validate-cycle.js <fichier.json>"); process.exit(1); }
try {
  const cycle = JSON.parse(fs.readFileSync(file, "utf8"));
  C.validateCycle(cycle);
  const sessions = cycle.weeks.reduce((a, w) => a + w.sessions.length, 0);
  console.log(`OK — ${cycle.title} : ${cycle.weeks.length} semaines, ${sessions} séances`);
} catch (e) {
  console.error("Cycle invalide : " + (e && e.message ? e.message : e));
  process.exit(1);
}
