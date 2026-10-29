/* ======================= PERF LAB — PROGRAMMATION : ÉCRANS =======================
   Module réservé au profil Moss. Routes :
     #/cf           Ta semaine (file ordonnée de 4 séances + bonus + team WOD)
     #/cf/s/<sid>   une séance
     #/cf/mois      ton mois (calendrier des séances faites)
     #/cf/programme ton programme (objectifs, semaines, charges)
     #/cf/progres   progrès (max, charge semaine par semaine, assiduité)
     #/cf/max       tes max
     #/cf/import    importer un cycle
     #/cf/m         fiches mouvement (index)
     #/cf/m/<id>    une fiche mouvement
     #/cf/login     connexion (CLOUD, sans création de compte)
   Chargé avant app.js ; utilise ses helpers ($, app, esc, toast, setGround,
   today) au moment du rendu seulement.
   ================================================================================= */
const CycleUI = (() => {
  const C = window.PLCycle;
  const PHASE = { base: "Base", montee: "Montée", surcharge: "Surcharge", decharge: "Décharge", test: "Test" };
  const DAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

  /* ---- dates AAAA-MM-JJ (UTC, comme cycle.js) ---- */
  const utc = iso => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const addDays = (iso, n) => new Date(utc(iso).getTime() + n * 864e5).toISOString().slice(0, 10);
  const ddmm = iso => iso.slice(8, 10) + "/" + iso.slice(5, 7);
  const dayLabel = iso => DAYS[utc(iso).getUTCDay()] + " " + ddmm(iso);

  /* journal du cycle dans le blob athlète (créé à la première écriture) */
  function logFor(athlete, cycle){
    athlete.logs[cycle.id] = athlete.logs[cycle.id] || C.newLog();
    return athlete.logs[cycle.id];
  }
  const minutesOf = s => s.blocks.filter(b => !b.optional).reduce((a, b) => a + (Number(b.minutes) || 0), 0);
  const isMoss = () => Backend.activeProfile() === "moss";

  /* gabarit commun ; le défilement est remis en haut par route(), pas ici :
     déplier un bloc re-rend l'écran sans faire sauter la page.
     title est échappé ici ; sub est du HTML déjà échappé par l'appelant. */
  const CHEV = `<svg viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2 2 10l8 8"/></svg>`;
  function shell({ title, sub = "", back = null, context = "", tab = "week", kind = null, head = true }, body){
    setGround(kind);
    if(!head){ app.innerHTML = `<div class="view cf">${body}${tabBar(tab)}</div>`; return; }
    const top = back || context ? `<div class="topbar">${back
      ? `<button class="back" id="cfback">${CHEV}<span>${esc(back[0])}</span></button>` : "<span></span>"}${context ? `<span class="ctx">${esc(context)}</span>` : ""}</div>` : "";
    app.innerHTML = `<div class="view cf"${kind ? ` data-kind="${kind}"` : ""}><div class="wrap">
      <header>${top}<h1${back ? ' class="sm"' : ""}>${esc(title)}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</header>
      ${body}
    </div>${tabBar(tab)}</div>`;
    if(back) $("#cfback").onclick = () => location.hash = back[1];
  }

  /* ---- barre d'onglets (profil Moss) ---- */
  const TABS = [
    ["week", "#/cf", "Semaine", '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14.5h9"/>'],
    ["month", "#/cf/mois", "Mois", '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.2h.01M12 17.2h.01" stroke-width="2.4"/>'],
    ["progres", "#/cf/progres", "Progrès", '<path d="M4 20h16"/><path d="M5 16l4.5-4.5 3.5 3L19 8"/><path d="M15 8h4v4"/>'],
    ["lib", "#/lib", "Bibliothèques", '<path d="M5 4.5h3.5v15H5z"/><path d="M10.5 4.5H14v15h-3.5z"/><path d="M15.6 5.6l3.2-.9 3 14.4-3.2.9z"/>']
  ];
  function tabBar(active){
    if(!isMoss()) return "";
    return `<nav class="tabbar" aria-label="Onglets">${TABS.map(([k, href, label, icon]) => `<a href="${href}"${k === active ? ' aria-current="page"' : ""}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><span>${label}</span></a>`).join("")}</nav>`;
  }

  /* ---- Ta semaine ---- */
  function decisionHtml(cycle, v){
    const d = v.decision;
    const order = C.sessionOrder(cycle);
    const weeks = [...new Set(d.missed.map(sid => Math.floor(order.indexOf(sid) / 4) + 1))];
    const many = weeks.length > 1;
    const title = many
      ? `${d.missed.length} séances manquées · semaines ${weeks[0]} à ${weeks[weeks.length - 1]}`
      : `Semaine ${weeks[0]} terminée à ${4 - d.missed.length} sur 4`;
    return `<div class="cf-decide">
      <p class="cf-dt">${title}</p>
      <p>Rattraper : tu reprends là où tu t'es arrêté. Passer : tu sautes à la semaine du calendrier, le cycle garde son rythme.</p>
      <div class="cf-dbtns">
        <button class="dbtn go" data-decide="catchup">${many ? "Les" : "La"} rattraper</button>
        <button class="dbtn" data-decide="skip">${many ? "Les" : "La"} passer</button>
      </div>
    </div>`;
  }

  function renderWeek(){
    const cycle = CycleStore.getCycle();
    if(!cycle){
      shell({ title: "Ta semaine" }, `
        <div class="cf-empty"><p>Aucun cycle importé pour l'instant.</p>
          <a class="dbtn go" href="#/cf/import">Importer un cycle</a></div>
        ${footer()}`);
      bindFooter();
      return;
    }
    const athlete = CycleStore.getAthlete();
    const v = C.weekView(cycle, logFor(athlete, cycle), today());
    const w = v.week, wStart = addDays(cycle.start, v.weekIndex * 7);
    const done = v.sessions.filter(s => s.status === "done").length;

    let banner = "";
    if(v.state === "upcoming") banner = `<div class="cf-note">Le cycle démarre le ${dayLabel(cycle.start)}.</div>`;
    else if(v.state === "finished") banner = `<div class="cf-note">Cycle terminé · prépare le cycle suivant avec Claude.</div>`;
    else if(v.decision) banner = decisionHtml(cycle, v);

    // séance mise en avant : la prochaine de la file, ou la 1re du cycle avant son début
    const featId = v.nextId || (v.state === "upcoming" ? w.sessions[0].id : null);
    let feat = "", kind = null;
    if(featId){
      const i = w.sessions.findIndex(x => x.id === featId), s = w.sessions[i];
      const hb = s.blocks.find(b => b.kind === "strength") || s.blocks.find(b => b.kind !== "warmup") || s.blocks[0];
      kind = hb.kind;
      let hero = "";
      if(hb.kind === "strength"){
        const ls = C.strengthLines(cycle, athlete.maxes, hb), t = ls[ls.length - 1], name = esc(cycle.lifts[hb.lift].name);
        hero = `<div class="cf-nhero">${heroHtml(t.kg)}<span class="cf-nsch">${name}<br>${hb.test ? `test ${esc(hb.test)}` : esc(C.schemeOf(t))}</span></div>`;
      }
      feat = `<div class="cf-next">
        <h2>${esc(s.title)}</h2><p class="cf-nm">Séance ${i + 1} · ${minutesLine(s)}</p>
        ${hero}${compo(s)}
        <button class="dbtn go" data-open="${esc(s.id)}">${v.state === "upcoming" ? "Voir la séance" : "Commencer la séance"}</button>
      </div>`;
    } else if(v.state === "active" && done === 4){
      feat = `<p class="cf-closed">Semaine bouclée. Reste le team WOD dimanche à la salle.</p>`;
    }

    const mini = s => `<span class="cf-mini"><span style="width:${Math.round(Math.min(minutesOf(s) + optMinutes(s), 60) / 60 * 100)}%">${compo(s)}</span></span>`;
    const rows = v.sessions.filter(x => x.id !== featId).map(x => {
      const ws = w.sessions.find(y => y.id === x.id);
      const st = x.status === "done" ? "faite " + dayLabel(x.date) : x.status === "skipped" ? "passée"
        : x.status === "locked" && v.state !== "upcoming" ? "semaine suivante" : minutesLine(ws);
      return `<button class="cf-sess st-${x.status}" data-sess="${esc(x.id)}">
        <span class="cf-st"><b>${x.status === "done" ? "✓ " : ""}${esc(x.title)}</b><small>${st}</small></span>${mini(ws)}</button>`;
    }).join("");
    const bonus = v.bonus ? `
      <div class="cf-bonus">
        <button class="cf-bopen" data-sess="${esc(v.bonus.id)}"><span class="cf-st"><b>${esc(v.bonus.title)}</b>
          <small>${minutesLine(w.bonus, true)}</small></span>${v.bonus.date || v.state !== "active" ? mini(w.bonus) : ""}</button>
        ${v.bonus.date ? `<span class="cf-bdate">fait ${dayLabel(v.bonus.date)}</span>`
          : v.state === "active" ? `<button class="dbtn" data-bonus="${esc(v.bonus.id)}">Fait</button>` : ""}
      </div>` : "";
    const wod = `<div class="cf-wod">
      <span class="cf-st"><b>Team WOD à la salle</b><small>Compté dans ta semaine</small></span>
      <span class="cf-bdate">${dayLabel(addDays(cycle.start, Math.max(0, C.calendarWeek(cycle, today())) * 7 + 6))}</span></div>`;

    shell({ title: "Ta semaine", head: false }, `
      <section class="cf-top"${kind ? ` data-kind="${kind}"` : ""}><div class="wrap">
        <div class="cf-th"><h1>Ta semaine</h1><span class="r cf-count">${done} sur 4</span></div>
        <p class="sub">Semaine ${v.weekIndex + 1} · ${esc(PHASE[w.phase] || w.phase)}${w.bloc && w.phase !== "test" ? " " + esc(w.bloc) : ""}
          · ${ddmm(wStart)} → ${ddmm(addDays(wStart, 6))}</p>
        ${w.intent ? `<p class="cf-intent">${esc(w.intent)}</p>` : ""}
        ${banner}${feat}
      </div></section>
      <div class="wrap">
        <h3 class="cf-h3">${featId ? "Ensuite" : "Tes séances"}</h3>
        <div class="cf-list">${rows}${bonus}${wod}</div>
        ${footer()}
      </div>`);

    app.querySelectorAll("[data-open],[data-sess]").forEach(b => b.onclick = () => location.hash = "#/cf/s/" + (b.dataset.open || b.dataset.sess));
    app.querySelectorAll("[data-decide]").forEach(b => b.onclick = async () => {
      const a = CycleStore.getAthlete();
      C.applyDecision(logFor(a, cycle), cycle, today(), b.dataset.decide);
      await CycleStore.saveAthlete(a);
      toast(b.dataset.decide === "skip" ? "Séances passées : on reprend au calendrier." : "On rattrape dans l'ordre.");
      renderWeek();
    });
    app.querySelectorAll("[data-bonus]").forEach(b => b.onclick = async () => {
      const a = CycleStore.getAthlete();
      C.markBonus(logFor(a, cycle), b.dataset.bonus, today());
      await CycleStore.saveAthlete(a);
      toast("Bonus noté.");
      renderWeek();
    });
    bindFooter();
  }

  /* ---- Ton mois : séances faites à leur date, team WOD le dimanche ---- */
  let MS = { ym: null, sel: null };
  const shiftYm = (ym, d) => {
    let [y, m] = ym.split("-").map(Number);
    m += d; if(m < 1){ m = 12; y--; } if(m > 12){ m = 1; y++; }
    return `${y}-${String(m).padStart(2, "0")}`;
  };
  const ITEM_ARIA = { session: it => `séance ${it.n} faite`, bonus: () => "bonus fait", wod: () => "team WOD" };

  function dayDetail(cycle, log, cell, td){
    const rows = cell.items.map(it => {
      if(it.type === "wod") return `<div class="cf-ditem"><b>Team WOD à la salle · compté dans ta semaine.</b></div>`;
      const link = `<a href="#/cf/s/${encodeURIComponent(it.id)}">Revoir la séance</a>`;
      if(it.type === "bonus") return `<div class="cf-ditem"><b>Bonus · ${esc(it.title.replace(/^Bonus · /, ""))}</b>${link}</div>`;
      const sc = log.scores[it.id];
      return `<div class="cf-ditem"><b>Séance ${it.n} · ${esc(it.title)}</b>
        <small>Semaine ${it.wi + 1} · ${sc ? "score : " + esc(sc.text) : "pas de score"}</small>${link}</div>`;
    });
    if(!rows.length){
      const iso = cell.iso, v = C.weekView(cycle, log, td);
      let msg = "Repos.", link = "";
      if(iso < cycle.start) msg = `Avant le début du cycle (${dayLabel(cycle.start)}).`;
      else if(iso > C.cycleEnd(cycle)) msg = "Après la fin du cycle.";
      else if(iso === td && v.nextId){
        const i = v.week.sessions.findIndex(s => s.id === v.nextId);
        msg = `Prochaine séance : Séance ${i + 1} · ${esc(v.week.sessions[i].title)}.`;
        link = `<a href="#/cf">Voir ta semaine</a>`;
      } else if(iso > td) msg = "À venir : tes séances se placent ici le jour où tu les fais.";
      rows.push(`<div class="cf-ditem"><p>${msg}</p>${link}</div>`);
    }
    return `<div class="cf-dday"><div class="cf-lab">${dayLabel(cell.iso)}</div>${rows.join("")}</div>`;
  }

  function renderMonth(){
    const cycle = CycleStore.getCycle();
    if(!cycle){ location.hash = "#/cf"; return; }
    const log = logFor(CycleStore.getAthlete(), cycle), td = today();
    const b = C.monthBounds(cycle, td), [y, mo] = MS.ym.split("-").map(Number);
    const g = C.monthGrid(cycle, log, y, mo, td), all = g.weeks.flat();
    const chip = it => `<span class="cf-chip c-${it.type}${it.past ? " past" : ""}">${it.chip}</span>`;
    const cells = all.map(c => `<button class="cf-day${c.inMonth ? "" : " out"}${c.today ? " today" : ""}${c.iso === MS.sel ? " sel" : ""}"
        data-day="${c.iso}"${c.inMonth ? "" : " disabled"}
        aria-label="${dayLabel(c.iso)}${c.items.map(it => ", " + ITEM_ARIA[it.type](it)).join("")}">
        <span class="cf-dn">${c.day}</span><span class="cf-chips">${c.items.map(chip).join("")}</span></button>`).join("");
    const sel = MS.sel && all.find(c => c.iso === MS.sel && c.inMonth);
    shell({ title: "Ton mois", tab: "month" }, `
      <div class="cf-mnav">
        <button class="dbtn" id="cfprev" aria-label="Mois précédent"${MS.ym <= b.min ? " disabled" : ""}>‹</button>
        <div class="cf-mlabel">${g.label}</div>
        <button class="dbtn" id="cfnext" aria-label="Mois suivant"${MS.ym >= b.max ? " disabled" : ""}>›</button>
      </div>
      <div class="cf-cal">
        <div class="cf-dow" aria-hidden="true">${["L", "M", "M", "J", "V", "S", "D"].map(d => `<span>${d}</span>`).join("")}</div>
        <div class="cf-grid">${cells}</div>
      </div>
      <div class="cf-legend">
        <span><span class="cf-chip c-session">S1</span>séance faite</span>
        <span><span class="cf-chip c-bonus">B</span>bonus</span>
        <span><span class="cf-chip c-wod">T</span>team WOD</span>
        <span><span class="cf-todaykey"></span>aujourd'hui</span>
      </div>
      ${sel ? dayDetail(cycle, log, sel, td) : `<div class="cf-dday"><p>Touche un jour.</p></div>`}
      ${footer()}`);
    const go = d => { MS.ym = shiftYm(MS.ym, d); MS.sel = td.slice(0, 7) === MS.ym ? td : null; renderMonth(); };
    $("#cfprev").onclick = () => go(-1);
    $("#cfnext").onclick = () => go(1);
    app.querySelectorAll(".cf-day:not([disabled])").forEach(btn => btn.onclick = () => { MS.sel = btn.dataset.day; renderMonth(); });
    bindFooter();
  }

  /* ---- Ton programme : le cycle, ses objectifs, chaque semaine en charges ---- */
  const PHASE_COLOR = { base: "#8ab4ff", montee: "#d7f25a", surcharge: "#ffb25b", decharge: "#9ba1ac", test: "#ff7a7a" };
  let PS = { wi: 0 };
  function progLine(l){
    if(l.kind === "strength") return `<span>${esc(l.name)} · ${l.test
      ? `test ${esc(l.test)} · ${l.maxKg != null ? "max actuel " + fmtKg(l.maxKg) : "pas encore de max"}`
      : `${esc(l.scheme)} · ${l.kg != null ? fmtKg(l.kg) : "saisis ton max"}`}</span>`;
    if(l.kind === "skill") return `<span>${esc(l.title)} · ${esc(l.text)}</span>`;
    return `<span>Metcon · ${esc(l.title)}</span>`;
  }

  function renderProgramme(){
    const cycle = CycleStore.getCycle();
    if(!cycle){ location.hash = "#/cf"; return; }
    const athlete = CycleStore.getAthlete(), log = logFor(athlete, cycle);
    const nW = cycle.weeks.length;
    PS.wi = Math.min(PS.wi, nW - 1);   // cycle réimporté plus court
    const p = C.programmeWeek(cycle, athlete.maxes, PS.wi);
    const goals = (cycle.goals || []).length ? `<div class="cf-goals"><div class="cf-lab">Objectifs du cycle</div>
      ${cycle.goals.map(g => `<div class="cf-goal"><span class="cf-glab">${esc(g.label)}</span><span>${esc(g.text)}</span></div>`).join("")}</div>` : "";
    const strip = cycle.weeks.map((w, i) => `<button class="cf-wk" data-week="${i}" aria-pressed="${i === PS.wi}"
        aria-label="Semaine ${i + 1}, ${esc(PHASE[w.phase] || w.phase)}"><span>${i + 1}</span>
        <span class="cf-wbar" style="background:${PHASE_COLOR[w.phase] || "#9ba1ac"}"></span></button>`).join("");
    const legend = Object.keys(PHASE).map(k => `<span><span class="cf-wbar" style="background:${PHASE_COLOR[k]}"></span>${PHASE[k]}</span>`).join("");
    const card = (sid, head, body, st) => `<button class="cf-pcard" data-psess="${esc(sid)}">
        <span class="cf-pbody"><b>${head}</b>${body}</span>${st ? `<span class="cf-bdate">${st}</span>` : ""}</button>`;
    const status = sid => log.done[sid] ? `faite ${ddmm(log.done[sid])}` : (log.skipped || []).includes(sid) ? "passée" : "";
    const cards = p.sessions.map(s => card(s.id, `Séance ${s.n} · ${esc(s.title)}`, s.lines.map(progLine).join(""), status(s.id))).join("")
      + (p.bonus ? card(p.bonus.id, `Bonus · ${esc(p.bonus.title.replace(/^Bonus · /, ""))}`, `<span>Facultatif</span>`,
          (log.bonus || {})[p.bonus.id] ? `fait ${ddmm(log.bonus[p.bonus.id])}` : "") : "");
    shell({ title: "Ton programme", back: ["Ta semaine", "#/cf"] }, `
      <p class="lede">${esc(cycle.title)} · ${nW} semaines · ${ddmm(cycle.start)} → ${ddmm(C.cycleEnd(cycle))}</p>
      ${goals}
      <div class="cf-lab cf-mt">Les ${nW} semaines</div>
      <div class="cf-strip">${strip}</div>
      <div class="cf-plegend">${legend}</div>
      <div class="cf-whead">
        <div class="cf-lab" style="color:${PHASE_COLOR[p.phase] || "#9ba1ac"}">Semaine ${p.n} · ${esc(PHASE[p.phase] || p.phase)}${p.bloc && p.phase !== "test" ? ` · Bloc ${esc(p.bloc)}` : ""}</div>
        <div class="cf-wdates">${ddmm(p.start)} → ${ddmm(p.end)}</div>
        ${p.intent ? `<p class="cf-p">${esc(p.intent)}</p>` : ""}
      </div>
      <div class="cf-pcards">${cards}</div>
      <p class="cf-rest cf-mt">Charges calculées sur tes max, arrondies à 2,5 kg. Elles se recalculent dès qu'un max change.</p>
      ${Object.keys(cycle.movements || {}).length ? `<a class="cf-flink cf-mt" href="#/cf/m">Fiches mouvement</a>` : ""}
      ${footer()}`);
    // bandeau plus large que l'écran (9 × 44 px) : la semaine choisie est ramenée au centre
    const band = $(".cf-strip"), on = band.querySelector('[aria-pressed="true"]');
    band.scrollLeft += on.getBoundingClientRect().left - band.getBoundingClientRect().left - (band.clientWidth - on.offsetWidth) / 2;
    app.querySelectorAll("[data-week]").forEach(b => b.onclick = () => { PS.wi = +b.dataset.week; renderProgramme(); });
    app.querySelectorAll("[data-psess]").forEach(b => b.onclick = () => location.hash = "#/cf/s/" + encodeURIComponent(b.dataset.psess));
    bindFooter();
  }

  /* état de la synchro (CLOUD) : envoi en attente ou refusé, jamais silencieux */
  function syncLine(){
    if(!CycleStore.isCloud()) return "";
    const st = CycleStore.syncState();
    if(st.error) return `<div class="cf-sync err">Envoi refusé par le serveur : ${esc(st.error)}. Tes données restent sur ce téléphone.</div>`;
    if(st.pending) return `<div class="cf-sync">Envoi en attente : il repart au retour du réseau.</div>`;
    return `<div class="cf-sync ok">Synchronisé.</div>`;
  }
  function footer(){
    const u = CycleStore.isCloud() && CycleStore.user();
    return `${syncLine()}<div class="cf-foot">
      <a class="dbtn" href="#/cf/programme">Ton programme</a>
      <a class="dbtn" href="#/cf/import">Importer un cycle</a>
      ${u ? `<button class="dbtn" id="cfout">${esc(u.email || "compte")} · sortir</button>` : ""}
    </div>`;
  }
  function bindFooter(){
    const o = $("#cfout");
    if(o) o.onclick = async () => { await CycleStore.signOut(); toast("Déconnecté."); renderLogin(); };
  }

  /* ---- connexion (CLOUD) : pas de création de compte ici ---- */
  function renderLogin(){
    shell({ title: "Connexion" }, `
      <p class="lede">Connecte-toi pour retrouver ta programmation sur tous tes appareils.</p>
      <div class="authbox">
        <input id="cfemail" type="email" inputmode="email" autocomplete="email" placeholder="email">
        <input id="cfpw" type="password" autocomplete="current-password" placeholder="mot de passe">
        <div class="autherr" id="cferr"></div>
        <div class="authbtns"><button class="dbtn go" id="cfsignin">Se connecter</button></div>
      </div>`);
    $("#cfsignin").onclick = async () => {
      const e = $("#cfemail").value.trim(), p = $("#cfpw").value;
      if(!e || !p){ $("#cferr").textContent = "Email et mot de passe requis."; return; }
      try{
        await CycleStore.signIn(e, p);
        await CycleStore.refresh();
        if(location.hash === "#/cf") renderWeek(); else location.hash = "#/cf";
      }catch(ex){ $("#cferr").textContent = (ex && ex.message) || String(ex) || "Connexion impossible."; }
    };
  }

  /* ---- Séance plein cadre ----
     Un bloc à la fois : la page prend la couleur du bloc en cours, la bande de
     composition (proportionnelle aux minutes) fait passer d'un bloc à l'autre.
     Le bloc courant reste sur l'appareil (perflab.cf.cur) : iOS peut tuer la PWA
     entre deux séries. Metcon : RX et INT exclusifs, score rangé par séance. */
  const FLAG = { tapis: "Tapis", ceinture: "Ceinture" };
  const SCORE_HINT = { time: "Ton temps (mm:ss)", reps: "Tes reps", rounds_reps: "Tours + reps (ex. 5+8)", load: "Ta charge (kg)" };
  const SCORE_MODE = { time: "text", reps: "numeric", rounds_reps: "text", load: "decimal" };
  const fmtKg = kg => String(kg).replace(".", ",") + " kg";
  const lines = t => String(t || "").split("\n").map(l => l.trim()).filter(Boolean).map(l => `<span>${esc(l)}</span>`).join("");
  const flagsHtml = b => (b.flags || []).map(f => `<span class="cf-flag cf-flag-${esc(f)}">${esc(FLAG[f] || f)}</span>`).join("");
  const moveHref = id => "#/cf/m/" + encodeURIComponent(id);
  /* rangée de liens vers les fiches d'un bloc (ids absents de movements ignorés) */
  function movesHtml(cycle, ids){
    const mv = cycle.movements || {}, ok = (ids || []).filter(id => mv[id]);
    return ok.length ? `<div class="cf-moves"><span class="cf-mvl">Fiches</span>${ok.map(id =>
      `<a href="${moveHref(id)}">${esc(mv[id].name)}</a>`).join("")}</div>` : "";
  }
  let SS = { sid: null };   // état d'écran de la séance ouverte (cur = bloc courant)
  let sessBack = ["Ta semaine", "#/cf"];   // retour de la séance : l'écran d'où on l'a ouverte

  function findSession(cycle, sid){
    for(let wi = 0; wi < cycle.weeks.length; wi++){
      const w = cycle.weeks[wi], i = w.sessions.findIndex(s => s.id === sid);
      if(i >= 0) return { s: w.sessions[i], w, wi, n: i + 1, bonus: false };
      if(w.bonus && w.bonus.id === sid) return { s: w.bonus, w, wi, n: null, bonus: true };
    }
    return null;
  }

  const KIND_LABEL = { warmup: "Échauffement", strength: "Force", skill: "Gym", metcon: "Metcon", accessory: "Accessoire" };
  const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const monthYear = iso => MONTHS[+iso.slice(5, 7) - 1] + " " + iso.slice(0, 4);
  const fmtDelta = kg => kg === 0 ? "même charge" : (kg > 0 ? "+" : "\u2212") + fmtKg(Math.abs(kg));
  const optMinutes = s => s.blocks.filter(b => b.optional).reduce((a, b) => a + (Number(b.minutes) || 0), 0);
  const minutesLine = (s, bonus) => bonus ? `${minutesOf(s) + optMinutes(s)} min, facultative`
    : `${minutesOf(s)} min${optMinutes(s) ? `, plus ${optMinutes(s)} facultatives` : ""}`;
  const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`;

  const CUR_KEY = "perflab.cf.cur";
  function readCur(sid, n){
    try{
      const c = JSON.parse(localStorage.getItem(CUR_KEY));
      if(c && c.sid === sid && Number.isInteger(c.i)) return Math.max(0, Math.min(c.i, n - 1));
    }catch(e){}
    return 0;
  }
  const writeCur = (sid, i) => { try{ localStorage.setItem(CUR_KEY, JSON.stringify({ sid, i })); }catch(e){} };

  /* bande de composition : un segment par bloc, largeur = minutes ; cur ≥ 0 → segments cliquables */
  function compo(s, cur = -1){
    const fx = b => Math.max(Number(b.minutes) || 0, 3);
    const segs = s.blocks.map((b, i) => {
      const cls = `cf-cseg${b.optional ? " opt" : ""}`, st = `flex:${fx(b)}`, min = Number(b.minutes) || 0;
      return cur < 0 ? `<span class="${cls}" data-kind="${esc(b.kind)}" style="${st}"></span>`
        : `<button type="button" class="${cls}" data-kind="${esc(b.kind)}" data-goto="${i}" style="${st}"${i === cur ? ' aria-current="step"' : ""}
            aria-label="Bloc ${i + 1} : ${esc(b.title)}${min ? `, ${min} min` : ""}"></button>`;
    }).join("");
    if(cur < 0) return `<div class="cf-compo">${segs}</div>`;
    const labels = s.blocks.map((b, i) => {
      const min = Number(b.minutes) || 0, t = (i === cur ? KIND_LABEL[b.kind] + (min ? " · " : "") : "") + (min ? min + " min" : "");
      return `<span style="--f:${fx(b)}"${i === cur ? ' class="on"' : ""}>${esc(t)}</span>`;
    }).join("");
    return `<div class="cf-bstrip"><div class="cf-compo">${segs}</div><div class="cf-blabels" aria-hidden="true">${labels}</div></div>`;
  }

  /* jauge d'intensité : 0 → 100 % du max, curseur sur la série, zone de travail de la semaine */
  function gauge(pct, zone){
    const p = Math.min(Math.max(pct, 0), 100);
    const zt = zone ? (zone.lo === zone.hi ? `${zone.lo}` : `${zone.lo} à ${zone.hi}`) : "";
    return `<div class="cf-gwrap">
      <div class="cf-ghead"><span>Intensité</span>${zone ? `<span>Zone de la semaine : ${zt} %</span>` : ""}</div>
      <div class="cf-gauge" style="--pct:${p}" role="img" aria-label="Série à ${pct} % du max${zone ? `, zone de la semaine ${zt} %` : ""}">
        <span class="cf-gfill"></span>${zone ? `<span class="cf-gzone" style="left:${zone.lo}%;width:${Math.max(zone.hi - zone.lo, 2)}%"></span>` : ""}<span class="cf-gcur"></span></div>
      <div class="cf-gscale" aria-hidden="true"><span>0</span><span>50</span><span>100 % du max</span></div></div>`;
  }

  const heroHtml = (kg, load = true) => `<span class="${load ? "cf-load " : ""}cf-hero">${kg != null
    ? `<span class="r cf-hn">${String(kg).replace(".", ",")}</span> <span class="r cf-hu">kg</span>` : `<span class="r cf-hn">—</span>`}</span>`;
  const listFr = xs => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + ", puis " + xs[xs.length - 1];

  /* force : chiffre héros, jauge, « Ce qui l'explique » (max, écart, consigne) */
  function strengthPane(cycle, athlete, f, b){
    const lift = cycle.lifts[b.lift], m = C.liftMax(cycle, athlete.maxes, b.lift);
    const ls = C.strengthLines(cycle, athlete.maxes, b), top = ls[ls.length - 1];
    const belt = l => l.belt ? ` <span class="cf-belt">Ceinture</span>` : "";
    const item = l => `${esc(l.sets)} × ${esc(l.reps)} à <span class="cf-load">${l.kg != null ? fmtKg(l.kg) : "—"}</span>${belt(l)}`;
    const before = b.test ? ls : ls.slice(0, -1);
    const hero = b.test
      ? `${heroHtml(m ? m.kg : null, false)}<p class="cf-scheme">Test ${esc(b.test)} · ${m ? "ton max actuel, à battre" : "pas encore de max"}</p>`
      : `${heroHtml(top.kg)}<p class="cf-scheme">${esc(top.sets)} × ${esc(top.reps)} à ${esc(top.pct)} %${belt(top)}</p>`;
    const d = C.loadDelta(cycle, athlete.maxes, f.wi, b);
    const notes = String(b.notes || "").split("\n").map(x => x.trim()).filter(Boolean);
    const src = m && m.derived ? cycle.lifts[lift.derive.from] : null;
    const why = m ? `<div class="cf-why-row cf-why-max"><div><p>Ton max${m.derived ? " estimé" : ""}</p>
          <small>${monthYear(m.d)}${src ? ` · dérivé du ${esc(src.name.toLowerCase())}` : ""}</small></div><span class="r">${fmtKg(m.kg)}</span></div>
        ${d ? `<div class="cf-why-row cf-why-delta"><div><p>Par rapport à la semaine ${d.ref.wi + 1}</p>
          <small>${fmtKg(d.ref.kg)} en ${esc(d.ref.scheme)}</small></div><span class="r">${fmtDelta(d.kg)}</span></div>` : ""}`
      : `<p class="cf-nomax">Pas encore de max pour ce mouvement · <a href="#/cf/max">Saisis ton max</a></p>`;
    return `<div class="cf-hrow">${hero}</div>
      ${before.length ? `<p class="cf-before">${b.test ? "Approches" : "Avant"} : ${listFr(before.map(item))}</p>` : ""}
      ${gauge(top.pct, C.weekZone(cycle, f.wi))}
      <div class="cf-why"><h3>Ce qui l'explique</h3>${why}
        ${notes.length ? `<p class="cf-cue">${esc(notes[0])}</p>` : ""}
        ${notes.length > 1 ? `<div class="cf-text">${notes.slice(1).map(l => `<span>${esc(l)}</span>`).join("")}</div>` : ""}</div>
      ${(cycle.movements || {})[b.lift] ? `<a class="cf-flink" href="${moveHref(b.lift)}">Fiche · ${esc(lift.name)}</a>`
        : lift.video ? `<a class="cf-video" href="${esc(lift.video)}" target="_blank" rel="noopener">${PLAY}Vidéo · ${esc(lift.name)}</a>` : ""}`;
  }

  function metconPane(athlete, log, b, sid, readOnly){
    const seg = ["rx", "int"].map(k => `<button type="button" data-level="${k}" aria-pressed="${SS.level === k}">${k === "rx" ? "RX" : "Intermédiaire"}</button>`).join("");
    const mine = log.scores[sid];
    // « dernière fois » = avant le score de cette séance, pour ne pas le répéter
    const prev = C.previousScore(athlete, b.bench, mine ? mine.d : today());
    const draft = SS.draft != null ? SS.draft : mine ? mine.text : "";
    const score = readOnly ? "" : `<div class="cf-score">
        <label for="cfscore">${SCORE_HINT[b.score]} · ${SS.level === "rx" ? "RX" : "Intermédiaire"}</label>
        <div class="cf-srow"><input id="cfscore" type="text" inputmode="${SCORE_MODE[b.score]}" autocomplete="off" value="${esc(draft)}">
          <button class="dbtn" id="cfsave">Enregistrer</button></div>
        <div class="cf-err">${esc(SS.err || "")}</div>
        ${mine ? `<div class="cf-sline">Enregistré : <b>${esc(mine.text)}</b> · ${mine.level === "rx" ? "RX" : "INT"}</div>` : ""}
        ${prev ? `<div class="cf-sline">Dernière fois : ${esc(prev.text)} · ${prev.level === "rx" ? "RX" : "INT"} · ${dayLabel(prev.d)}</div>` : ""}
      </div>`;
    return `${b.text ? `<div class="cf-text">${lines(b.text)}</div>` : ""}
      <div class="cf-lvseg" role="group" aria-label="Niveau">${seg}</div>
      <div class="cf-level" data-open-level="${SS.level}">${lines(b.levels[SS.level].text)}</div>${score}`;
  }

  function renderSession(sid){
    const cycle = CycleStore.getCycle();
    const f = cycle && findSession(cycle, sid);
    if(!f){ location.hash = "#/cf"; return; }
    const athlete = CycleStore.getAthlete(), log = logFor(athlete, cycle);
    const bl = f.s.blocks, n = bl.length;
    const metcon = bl.find(b => b.kind === "metcon");
    if(SS.sid !== sid){
      const prev = metcon && C.previousScore(athlete, metcon.bench, today());
      SS = { sid, cur: readCur(sid, n), level: (log.scores[sid] || prev || {}).level || "rx", err: "" };
    }
    const cur = Math.min(SS.cur, n - 1), b = bl[cur];
    const locked = f.wi > C.calendarWeek(cycle, today());
    const doneDate = f.bonus ? log.bonus[sid] : log.done[sid];
    const lastReq = bl.reduce((a, x, i) => x.optional ? a : i, 0);

    const body = b.kind === "strength" ? strengthPane(cycle, athlete, f, b)
      : b.kind === "metcon" ? metconPane(athlete, log, b, sid, locked)
      : `<div class="cf-text cf-big">${lines(b.text)}</div>`;
    const min = Number(b.minutes) || 0;
    const right = b.kind === "strength" && b.rest ? `repos ${esc(b.rest)}`
      : `${min ? min + " min" : ""}${b.optional ? (min ? " · " : "") + "facultatif" : ""}`;
    const fl = flagsHtml(b);
    const nav = `<div class="cf-bnav">${cur > 0 ? `<button class="dbtn" id="cfprevb"><span>‹ ${esc(bl[cur - 1].title)}</span></button>` : ""}
      ${cur < n - 1 ? `<button class="dbtn${cur < lastReq ? " go" : ""}" id="cfnextb"><span>${esc(bl[cur + 1].title)} ›</span></button>` : ""}</div>`;
    const foot = locked ? ""
      : doneDate ? `<button class="donebtn ok" id="cfdone" disabled>✓ Faite ${dayLabel(doneDate)}</button>
          <button class="dbtn cf-undo" id="cfundo">Annuler : pas encore faite</button>`
      : `<button class="donebtn" id="cfdone">✓ ${f.bonus ? "Bonus fait" : "Séance faite"}</button>`;
    const sub = (f.bonus ? `Bonus · ${minutesLine(f.s, true)}` : `Séance ${f.n} · ${minutesLine(f.s)}`) + (doneDate ? ` · faite ${dayLabel(doneDate)}` : "");
    shell({ title: f.s.title.replace(/^Bonus · /, ""), sub: esc(sub), back: sessBack, kind: b.kind,
            context: `Semaine ${f.wi + 1} · ${PHASE[f.w.phase] || f.w.phase}${f.w.bloc && f.w.phase !== "test" ? " " + f.w.bloc : ""}` }, `
      ${compo(f.s, cur)}
      ${locked ? `<div class="cf-note">Séance de la semaine ${f.wi + 1} : elle s'ouvre le ${dayLabel(addDays(cycle.start, f.wi * 7))}.</div>` : ""}
      <section class="cf-pane" aria-label="Bloc ${cur + 1} sur ${n}">
        <div class="cf-ph"><h2>${esc(b.title)}</h2>${right ? `<span class="cf-pr">${right}</span>` : ""}</div>
        ${fl ? `<div class="cf-flags">${fl}</div>` : ""}
        ${body}${movesHtml(cycle, b.moves)}
      </section>
      ${nav}${cur >= lastReq ? foot : ""}`);

    const go = i => {
      const inp = $("#cfscore"); if(inp) SS.draft = inp.value;   // garder la saisie en cours
      SS.cur = i; writeCur(sid, i); renderSession(sid); window.scrollTo(0, 0);
    };
    app.querySelectorAll("[data-goto]").forEach(btn => btn.onclick = () => go(+btn.dataset.goto));
    const pv = $("#cfprevb"), nx = $("#cfnextb");
    if(pv) pv.onclick = () => go(cur - 1);
    if(nx) nx.onclick = () => go(cur + 1);
    app.querySelectorAll("[data-level]").forEach(btn => btn.onclick = () => {
      const inp = $("#cfscore");
      if(inp) SS.draft = inp.value;
      SS.level = btn.dataset.level;
      renderSession(sid);
    });
    const save = $("#cfsave");
    if(save) save.onclick = async () => {
      let sc;
      try{ sc = C.parseScore(metcon.score, $("#cfscore").value); }
      catch(m){ SS.err = String(m); $(".cf-err").textContent = SS.err; return; }
      SS.err = ""; SS.draft = null;
      const a = CycleStore.getAthlete();
      C.recordScore(logFor(a, cycle), sid, SS.level, sc, today(), metcon.bench);
      await CycleStore.saveAthlete(a);
      toast("Score enregistré.");
      renderSession(sid);
    };
    const undo = $("#cfundo");
    if(undo) undo.onclick = async () => {
      const a = CycleStore.getAthlete(), l = logFor(a, cycle);
      if(f.bonus) C.unmarkBonus(l, sid); else C.unmarkDone(l, sid);
      await CycleStore.saveAthlete(a);
      toast("Séance remise à faire.");
      renderSession(sid);
    };
    const done = $("#cfdone");
    if(done && !done.disabled) done.onclick = async () => {
      const a = CycleStore.getAthlete(), l = logFor(a, cycle);
      if(f.bonus) C.markBonus(l, sid, today()); else C.markDone(l, sid, today());
      await CycleStore.saveAthlete(a);
      toast(f.bonus ? "Bonus noté." : "Séance enregistrée — bien joué.");
      renderSession(sid);
    };
  }

  /* ---- Progrès : ton max, ta charge semaine par semaine, ton assiduité ---- */
  let PG = { lift: null };
  const dayMonth = iso => +iso.slice(8) + " " + MONTHS[+iso.slice(5, 7) - 1];
  const rangeFr = (a, b) => a.slice(5, 7) === b.slice(5, 7) ? `du ${+a.slice(8)} au ${dayMonth(b)}` : `du ${dayMonth(a)} au ${dayMonth(b)}`;
  const kgNum = kg => String(kg).replace(".", ",");

  function liftTop(cycle, athlete, id, v, td){
    const lift = cycle.lifts[id], m = C.liftMax(cycle, athlete.maxes, id), nt = C.nextTest(cycle, id, td);
    const bars = C.liftSeries(cycle, athlete.maxes, id).map((x, wi) => {
      if(!x) return `<div class="cf-bar empty" data-wi="${wi}"><span></span><i></i></div>`;
      if(x.test) return `<div class="cf-bar test" data-wi="${wi}" style="--h:100"><span>${esc(x.test)}</span><i></i></div>`;
      const cls = wi < v.weekIndex ? "past" : wi === v.weekIndex ? "now" : "future";
      return `<div class="cf-bar ${cls}" data-wi="${wi}" style="--h:${x.kg != null ? Math.round(x.kg / m.kg * 100) : 0}">
        <span class="r">${x.kg != null ? kgNum(x.kg) : ""}</span><i></i></div>`;
    }).join("");
    const axis = cycle.weeks.map((w, wi) => `<span${wi === v.weekIndex ? ' class="on"' : ""}>${w.phase === "test" ? "Test" : "S" + (wi + 1)}</span>`).join("");
    return `<div class="cf-pmax" data-kg="${m.kg}">${heroHtml(m.kg, false)}</div>
      <p class="cf-pname">Ton max de ${esc(lift.name.toLowerCase())}</p>
      <p class="cf-ptest">${monthYear(m.d)}.${nt ? ` Prochain test : ${esc(nt.test)} en semaine ${nt.wi + 1}, ${rangeFr(nt.start, nt.end)}.` : ""}</p>
      <h2 class="cf-ch2">Ta charge de travail, semaine par semaine</h2>
      <div class="cf-chart" role="img" aria-label="Charge de la dernière série de ${esc(lift.name.toLowerCase())}, semaine par semaine">
        <span class="cf-maxl">max ${kgNum(m.kg)}</span>${bars}</div>
      <div class="cf-axis" aria-hidden="true">${axis}</div>`;
  }

  function attendanceHtml(at){
    const plural = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;
    const extras = [at.late ? plural(at.late, "rattrapée") : "", at.skipped ? plural(at.skipped, "passée") : ""].filter(Boolean).join(" · ");
    const weeks = at.weeks.map(x => `<div class="cf-attw" data-wi="${x.wi}"><p>S${x.wi + 1}</p>
      <div>${x.dots.map(d => `<span class="cf-adot ${d}"></span>`).join("")}</div></div>`).join("");
    const DOTS = [["done", "faite"], ["late", "rattrapée"], ["skipped", "passée"], ["missed", "manquée"]];
    return `<section class="cf-att">
      <div class="cf-atth"><h2>Assiduité</h2>${at.bonusTotal ? `<span>Bonus : ${at.bonusDone} sur ${at.bonusTotal}</span>` : ""}</div>
      ${at.closed ? `<div class="cf-attn"><span class="r">${at.done} sur ${at.total}</span>
          <span>séances, ${at.closed > 1 ? `semaines 1 à ${at.closed}` : "semaine 1"}</span></div>${extras ? `<p class="cf-attx">${extras}</p>` : ""}`
        : `<p class="cf-attx">Ton assiduité s'affiche après ta première semaine.</p>`}
      ${weeks ? `<div class="cf-attg">${weeks}</div>
        <div class="cf-dlegend">${DOTS.map(([k, l]) => `<span><span class="cf-adot ${k}"></span>${l}</span>`).join("")}</div>` : ""}
    </section>`;
  }

  function renderProgres(){
    const cycle = CycleStore.getCycle();
    if(!cycle){
      shell({ title: "Progrès", tab: "progres" }, `<div class="cf-empty"><p>Importe d'abord un cycle : tes max et ton assiduité en dépendent.</p>
        <a class="dbtn go" href="#/cf/import">Importer un cycle</a></div>`);
      return;
    }
    const athlete = CycleStore.getAthlete(), log = logFor(athlete, cycle), td = today();
    const own = Object.keys(cycle.lifts).filter(id => (athlete.maxes[id] || []).length);
    if(!own.includes(PG.lift)) PG.lift = own[0] || null;
    const v = C.weekView(cycle, log, td), id = PG.lift;
    const chips = own.map(x => `<button type="button" class="cf-lchip" data-lift-pick="${esc(x)}" aria-pressed="${x === id}">${esc(cycle.lifts[x].name)}</button>`).join("");
    const hist = id ? athlete.maxes[id].slice().sort((a, b) => a.d < b.d ? 1 : a.d > b.d ? -1 : 0) : [];
    shell({ title: "Progrès", tab: "progres", head: false }, `
      <section class="cf-top cf-ptop"${id ? ' data-kind="strength"' : ""}><div class="wrap">
        <h1>Progrès</h1>
        ${id ? `<div class="cf-lchips" role="group" aria-label="Mouvement">${chips}</div>${liftTop(cycle, athlete, id, v, td)}`
          : `<p class="cf-intent">Saisis tes max pour suivre ta progression : ils calculent toutes tes charges.</p>
             <a class="dbtn go cf-mt" href="#/cf/max">Saisis tes max</a>`}
      </div></section>
      <div class="wrap">
        ${attendanceHtml(C.attendance(cycle, log, td))}
        ${id ? `<section class="cf-hist"><h2>Historique de ton max</h2>
          ${hist.map((e, k) => `<div class="cf-hline"><span>${monthYear(e.d)}</span>${hist[k + 1] ? `<span class="cf-hd">${fmtDelta(e.kg - hist[k + 1].kg)}</span>` : ""}
            <span class="r">${fmtKg(e.kg)}</span></div>`).join("")}
          <a class="dbtn" href="#/cf/max">Modifier tes max</a></section>` : ""}
      </div>`);
    app.querySelectorAll("[data-lift-pick]").forEach(b => b.onclick = () => { PG.lift = b.dataset.liftPick; renderProgres(); });
    const on = app.querySelector('[data-lift-pick][aria-pressed="true"]');
    if(on) on.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /* ---- Tes max ----
     Max saisis (le plus récent par mouvement) ; les mouvements sans max
     — dont les dérivés, avec leur estimation — dans « Pas encore de repère ».
     Date en orange : max antérieur de plus de 9 semaines au début du cycle. */
  let editLift = null;
  function maxRow(cycle, athlete, id, staleBefore){
    const l = cycle.lifts[id], own = C.liftMax({ lifts: {} }, athlete.maxes, id);
    const est = !own && l.derive ? C.liftMax(cycle, athlete.maxes, id) : null;
    const right = own
      ? `<span class="cf-mdate${own.d < staleBefore ? " stale" : ""}">${ddmm(own.d)}</span><span class="cf-mkg">${fmtKg(own.kg)}</span>`
      : `<span class="cf-mest">${est ? `estimé : ${fmtKg(Math.round(est.kg))}` : "à tester"}</span>`;
    const editor = editLift === id ? `
      <div class="cf-medit">
        <input id="cfmkg" type="text" inputmode="decimal" placeholder="kg" value="${own ? String(own.kg).replace(".", ",") : ""}">
        <input id="cfmdate" type="date" value="${today()}">
        <button class="dbtn go" id="cfmsave">OK</button>
        <div class="cf-err" id="cfmerr"></div>
      </div>` : "";
    return `<div class="cf-mrow" data-lift="${esc(id)}">
      <div class="cf-mline"><span class="cf-mname">${esc(l.name)}</span>${right}
        <button class="dbtn" data-edit="${esc(id)}">${own ? "Modifier" : "Saisir"}</button></div>${editor}
    </div>`;
  }

  function renderMax(){
    const cycle = CycleStore.getCycle();
    if(!cycle){
      shell({ title: "Tes max", back: ["Progrès", "#/cf/progres"], tab: "progres" }, `<div class="cf-empty"><p>Importe d'abord un cycle : la liste des mouvements vient du cycle.</p>
        <a class="dbtn go" href="#/cf/import">Importer un cycle</a></div>`);
      return;
    }
    const athlete = CycleStore.getAthlete();
    const ids = Object.keys(cycle.lifts);
    const has = id => (athlete.maxes[id] || []).length > 0;
    const staleBefore = addDays(cycle.start, -63);
    const withMax = ids.filter(has), without = ids.filter(id => !has(id));
    shell({ title: "Tes max", back: ["Progrès", "#/cf/progres"], tab: "progres" }, `
      <p class="lede">Ils calculent toutes tes charges. Chaque nouveau max recalcule les séances à venir.</p>
      ${withMax.length ? `<div class="blk"><div class="blk-h"><div class="bl">Force & haltéro</div><div class="line"></div></div>
        <div class="cf-mlist">${withMax.map(id => maxRow(cycle, athlete, id, staleBefore)).join("")}</div>
        ${withMax.some(id => C.liftMax({ lifts: {} }, athlete.maxes, id).d < staleBefore)
          ? `<div class="cf-rest">Date en orange : max de plus de 9 semaines avant le début du cycle.</div>` : ""}</div>` : ""}
      ${without.length ? `<div class="blk"><div class="blk-h"><div class="bl">Pas encore de repère</div><div class="line"></div></div>
        <div class="cf-mlist dashed">${without.map(id => maxRow(cycle, athlete, id, staleBefore)).join("")}</div></div>` : ""}`);

    app.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => {
      editLift = editLift === b.dataset.edit ? null : b.dataset.edit;
      renderMax();
      const k = $("#cfmkg"); if(k) k.focus();
    });
    const save = $("#cfmsave");
    if(save) save.onclick = async () => {
      const kg = parseFloat(String($("#cfmkg").value).replace(",", ".").replace(/\s*kg$/i, ""));
      const d = $("#cfmdate").value || today();
      if(!(kg > 0 && kg < 500)){ $("#cfmerr").textContent = "Une charge en kg est attendue (ex. 57,5)."; return; }
      if(d > today()){ $("#cfmerr").textContent = "La date ne peut pas être dans le futur."; return; }
      const a = CycleStore.getAthlete();
      C.setMax(a, editLift, kg, d);
      await CycleStore.saveAthlete(a);
      toast(`${cycle.lifts[editLift].name} : ${fmtKg(kg)}`);
      editLift = null;
      renderMax();
    };
  }

  /* ---- Importer un cycle (JSON perflab-cycle-v1) ---- */
  function renderImport(){
    const cur = CycleStore.getCycle();
    shell({ title: "Importer un cycle", back: ["Ta semaine", "#/cf"] }, `
      <p class="lede">Colle le JSON du cycle. Il remplace le cycle en cours${cur ? ` (${esc(cur.title)})` : ""} ; tes séances faites, tes scores et tes max sont conservés.</p>
      <textarea id="cfjson" class="cf-json" spellcheck="false" placeholder='{ "schema": "perflab-cycle-v1", … }'></textarea>
      <div class="cf-err" id="cfimperr"></div>
      <button class="dbtn go cf-wide" id="cfimport">Importer</button>`);
    $("#cfimport").onclick = async () => {
      const err = m => { $("#cfimperr").textContent = m; };
      let cycle;
      try{ cycle = JSON.parse($("#cfjson").value); }catch(e){ return err("JSON invalide : " + e.message); }
      try{ await CycleStore.importCycle(cycle); }catch(m){ return err((m && m.message) || String(m)); }
      toast("Cycle importé.");
      location.hash = "#/cf";
    };
  }

  /* ---- Fiches mouvement ----
     Le retour ramène à l'écran d'où l'on vient (séance, programme…), sinon à l'index. */
  const CAT = { force: "Force", halterophilie: "Haltérophilie", gymnastique: "Gymnastique", moteur: "Moteur", accessoire: "Accessoire" };
  let prevHash = null, curHash = null;
  const BACK = [[/^cf\/s\//, "Séance"], [/^cf\/programme$/, "Ton programme"], [/^cf\/mois$/, "Ton mois"], [/^cf$/, "Ta semaine"], [/^cf\/max$/, "Tes max"]];
  function ficheBack(){
    const hit = prevHash != null && BACK.find(([re]) => re.test(prevHash));
    return hit ? [hit[1], "#/" + prevHash] : ["Fiches", "#/cf/m"];
  }

  function renderFiche(id){
    const cycle = CycleStore.getCycle();
    const m = cycle && (cycle.movements || {})[id];
    if(!m){ location.hash = "#/cf/m"; return; }
    const sec = (label, html) => html ? `<div class="cf-fsec"><div class="cf-lab">${label}</div>${html}</div>` : "";
    let max = "";
    if(cycle.lifts[id]){
      const mx = C.liftMax(cycle, CycleStore.getAthlete().maxes, id);
      max = `<div class="cf-fmax">${mx ? `Ton max : <b>${fmtKg(mx.kg)}</b> · ${ddmm(mx.d)}${mx.derived ? " · estimé" : ""}`
        : `Pas encore de max · <a href="#/cf/max">Saisis ton max</a>`}</div>`;
    }
    const video = m.video ? `<a class="cf-vid" href="${esc(m.video)}" target="_blank" rel="noopener">▶ Voir la démonstration</a>
      ${m.videoBy ? `<div class="cf-vby">Vidéo publique · ${esc(m.videoBy)}</div>` : ""}` : "";
    const steps = (m.progression || []).map(p => `<div class="cf-step ${esc(p.state)}">
      <span class="cf-dot">${p.state === "done" ? "✓" : ""}</span><span class="cf-stext">${esc(p.text)}</span>
      ${p.state === "current" ? `<span class="cf-here">Tu es ici</span>` : ""}</div>`).join("");
    const lv = [["rx", "RX", m.rx], ["int", "INT", m.int]].filter(x => x[2])
      .map(([k, l, t]) => `<div class="cf-fl"><span class="cf-lvp lv-${k}">${l}</span><span>${esc(t)}</span></div>`).join("");
    shell({ title: m.name, sub: esc(CAT[m.cat] || "Fiche"), back: ficheBack() }, `
      ${max}${video}
      ${m.level ? `<div class="cf-flevel"><div class="cf-lab">Ton niveau</div><p>${esc(m.level)}</p></div>` : ""}
      ${sec("Points clés", `<ol class="cf-cues">${m.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ol>`)}
      ${sec("Pour enchaîner", m.chain ? `<p class="cf-p">${esc(m.chain)}</p>` : "")}
      ${sec("Progression", steps)}
      ${sec("En metcon", lv)}
      ${sec("Erreurs fréquentes", (m.faults || []).length ? `<ul class="cf-faults">${m.faults.map(f => `<li>${esc(f)}</li>`).join("")}</ul>` : "")}`,
      );
  }

  function renderMoves(){
    const cycle = CycleStore.getCycle(), mv = (cycle && cycle.movements) || {};
    const ids = Object.keys(mv);
    const groups = C.MOVE_CATS.map(cat => ({ cat, ids: ids.filter(id => mv[id].cat === cat)
      .sort((a, b) => mv[a].name.localeCompare(mv[b].name, "fr")) })).filter(g => g.ids.length);
    shell({ title: "Fiches mouvement", back: ["Ton programme", "#/cf/programme"] }, ids.length ? groups.map(g => `
      <div class="blk"><div class="blk-h"><div class="bl">${CAT[g.cat]}</div><div class="line"></div></div>
        <div class="cf-list">${g.ids.map(id => `<button class="cf-sess" data-move="${esc(id)}">
          <span class="cf-st"><b>${esc(mv[id].name)}</b></span><span class="cf-chev">›</span></button>`).join("")}</div></div>`).join("")
      : `<div class="cf-empty"><p>Ce cycle n'a pas encore de fiches.</p></div>`);
    app.querySelectorAll("[data-move]").forEach(b => b.onclick = () => location.hash = moveHref(b.dataset.move));
  }

  /* ---- routeur du module : true si la route est gérée ---- */
  function route(h){
    if(h !== curHash){
      // on quitte une séance : garder sa position et la saisie en cours (retour depuis une fiche)
      if(/^cf\/s\//.test(curHash || "")){ SS.y = window.scrollY; const inp = $("#cfscore"); if(inp) SS.draft = inp.value; }
      prevHash = curHash; curHash = h;
    }
    if(!/^cf(\/|$)/.test(h) || !isMoss()) return false;
    const m = h.match(/^cf\/s\/(.+)$/), mv = h.match(/^cf\/m\/(.+)$/);
    const from = prevHash || "", back = /^cf\/[sm]\//.test(from);   // retour d'une séance ou d'une fiche
    let y = 0;
    if(CycleStore.needAuth()) renderLogin();
    else if(m){
      const sid = decodeURIComponent(m[1]), fromFiche = /^cf\/m\//.test(from);
      if(/^cf\/(programme|mois)$/.test(from)) sessBack = [from === "cf/mois" ? "Ton mois" : "Ton programme", "#/" + from];
      else if(!fromFiche) sessBack = ["Ta semaine", "#/cf"];
      if(fromFiche && SS.sid === sid) y = SS.y || 0;
      else SS = { sid: null };   // écran neuf, sauf au retour d'une fiche
      renderSession(sid);
    }
    else if(mv) renderFiche(decodeURIComponent(mv[1]));
    else if(h === "cf/m") renderMoves();
    else if(h === "cf/mois"){
      if(!back || !MS.ym) MS = { ym: today().slice(0, 7), sel: today() };
      renderMonth();
    }
    else if(h === "cf/programme"){
      const c = CycleStore.getCycle();   // semaine affichée par Ta semaine (0 avant le début)
      if(!back) PS = { wi: c ? C.weekView(c, logFor(CycleStore.getAthlete(), c), today()).weekIndex : 0 };
      renderProgramme();
    }
    else if(h === "cf/progres") renderProgres();
    else if(h === "cf/max"){ editLift = null; renderMax(); }
    else if(h === "cf/import") renderImport();
    else renderWeek();
    window.scrollTo(0, y);
    return true;
  }

  return { route, tabBar };
})();
