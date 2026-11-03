/* Tests Node des variables de design (app.css) : tout passe par :root, et la palette reste lisible.
   Lancer :  node tests/tokens.test.js                                                            */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "app.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
let n = 0, failed = 0;
const t = (name, fn) => { try { fn(); n++; console.log("  ✓ " + name); }
  catch(e){ failed++; console.error("  ✗ " + name + "\n" + String(e.message).split("\n").slice(0, 12).join("\n")); } };

/* :root (mode sombre) et :root[data-theme="light"] (mode clair) à part ; le reste = les règles, sans les @font-face */
const rootBody = (css.match(/:root\s*\{([^}]*)\}/) || [])[1] || "";
const lightBody = (css.match(/:root\[data-theme="light"\]\s*\{([^}]*)\}/) || [])[1] || "";
const rules = css.replace(/:root(\[[^\]]*\])?\s*\{[^}]*\}/g, "").replace(/@font-face\s*\{[^}]*\}/g, "");
const decls = [...rules.matchAll(/\{([^{}]*)\}/g)].flatMap(m => m[1].split(";")).map(d => d.trim()).filter(d => d.includes(":"))
  .map(d => { const i = d.indexOf(":"); return { prop: d.slice(0, i).trim(), val: d.slice(i + 1).trim() }; });
const toVars = body => Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)].map(m => [m[1], m[2].trim()]));
const vars = toVars(rootBody), lightVars = toVars(lightBody);
const bad = (pred) => decls.filter(pred).map(d => d.prop + ":" + d.val);

t("couleurs : aucune valeur en dur hors de :root", () => {
  const off = bad(d => /#[0-9a-f]{3,8}\b/i.test(d.val) || /rgba?\((?!var\()/i.test(d.val) || /\b(white|black)\b/i.test(d.val));
  assert.deepStrictEqual(off, []);
});

t("polices : familles par variable uniquement", () => {
  assert.deepStrictEqual(bad(d => d.prop === "font-family" && !/^var\(--f-[\w-]+\)$/.test(d.val)), []);
});

t("tailles de texte : échelle --fs-* uniquement", () => {
  assert.deepStrictEqual(bad(d => d.prop === "font-size" && !/^var\(--fs-[\w-]+\)$/.test(d.val)), []);
});

t("espacements : marges, retraits et écarts sans px en dur", () => {
  assert.deepStrictEqual(bad(d => /^(margin|padding)(-\w+)?$|^(row-|column-)?gap$/.test(d.prop) && /\d(px|rem|em)\b/.test(d.val)), []);
});

t("arrondis : échelle --r-* (ou cercle)", () => {
  assert.deepStrictEqual(bad(d => d.prop === "border-radius" && /\d(px|rem|em)\b/.test(d.val)), []);
});

t("le JS ne porte aucune couleur de l'interface", () => {
  ["app.js", "cycle-ui.js"].forEach(f => {
    const src = fs.readFileSync(path.join(root, f), "utf8");
    // les couleurs propres à un programme (champ accent : modèle d'exemple) sont des données, pas l'interface
    const hits = [...src.matchAll(/(\w+\s*:\s*)?["'`(]\s*#[0-9a-f]{6}\b/gi)].filter(m => !/^accent/.test(m[1] || "")).map(m => m[0]);
    assert.deepStrictEqual(hits, [], f);
  });
});

t("mode clair : chaque couleur de :root a sa valeur claire, sans nom nouveau", () => {
  const colors = Object.keys(vars).filter(k => /^#[0-9a-f]{3,8}$|^\d+,\s*\d+,\s*\d+$/i.test(vars[k]));
  assert.deepStrictEqual(colors.filter(k => !(k in lightVars)), [], "couleurs sombres reprises telles quelles en mode clair");
  assert.deepStrictEqual(Object.keys(lightVars).filter(k => !(k in vars)), [], "variables inconnues de :root");
});

t("chaque thème déclare son color-scheme (champs natifs, sélecteur de date)", () => {
  assert.ok(/color-scheme\s*:\s*dark/.test(rootBody), ":root sans color-scheme:dark");
  assert.ok(/color-scheme\s*:\s*light/.test(lightBody), "mode clair sans color-scheme:light");
});

/* contrastes WCAG 2.x calculés sur les valeurs de chaque thème */
const lum = hex => { const h = hex.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
  .map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0); };
Object.entries({ sombre: vars, clair: { ...vars, ...lightVars } }).forEach(([theme, P]) => {
  const resolve = v => { for(let i = 0; i < 9; i++){ const m = /^var\((--[\w-]+)\)$/.exec(v); if(!m) break; v = P[m[1]]; } return v; };
  const ratio = (a, b) => { const [x, y] = [lum(resolve(a)), lum(resolve(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const v = k => { assert.ok(P[k], k + " absente de :root"); return "var(" + k + ")"; };

  t(theme + " : texte lisible (4,5:1) sur le fond et les deux panneaux", () => {
    ["--ink", "--muted", "--cf-accent", "--lib-accent", "--hot", "--info", "--warn",
     "--phase-base", "--phase-montee", "--phase-surcharge", "--phase-decharge", "--phase-test"].forEach(fg =>
      ["--bg", "--panel", "--panel2"].forEach(bgk => assert.ok(ratio(v(fg), v(bgk)) >= 4.5, fg + " sur " + bgk + " : " + ratio(v(fg), v(bgk)).toFixed(2))));
  });

  t(theme + " : texte posé sur une couleur pleine lisible (4,5:1)", () => {
    [["--on-accent", "--cf-accent"], ["--on-accent", "--lib-accent"], ["--on-hot", "--hot"], ["--bg", "--info"], ["--warn", "--warn-bg"], ["--bg", "--ink"]]
      .forEach(([fg, bgk]) => assert.ok(ratio(v(fg), v(bgk)) >= 4.5, fg + " sur " + bgk + " : " + ratio(v(fg), v(bgk)).toFixed(2)));
  });

  t(theme + " : bord des champs à 3:1 (WCAG 1.4.11)", () => {
    ["--bg", "--panel", "--panel2"].forEach(bgk => assert.ok(ratio(v("--line-strong"), v(bgk)) >= 3, bgk));
  });

  t(theme + " : la teinte RVB de l'accent suit l'accent", () => {
    const hex = resolve(v("--cf-accent")).replace("#", "");
    assert.strictEqual(P["--cf-accent-rgb"].replace(/\s/g, ""), [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).join(","));
  });
});

t("polices déclarées présentes dans fonts/", () => {
  const urls = [...css.matchAll(/url\((fonts\/[^)]+)\)/g)].map(m => m[1]);
  assert.ok(urls.length > 0, "aucune @font-face");
  urls.forEach(u => assert.ok(fs.existsSync(path.join(root, u)), u + " absent"));
  fs.readdirSync(path.join(root, "fonts")).filter(f => f.endsWith(".woff2"))
    .forEach(f => assert.ok(urls.includes("fonts/" + f), f + " présent mais jamais déclaré"));
});

if(failed){ console.error(`\n${failed} en échec`); process.exit(1); }
console.log(`\n${n} tests OK`);
