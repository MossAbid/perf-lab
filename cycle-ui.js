/* ======================= PERF LAB — PROGRAMMATION : ÉCRANS =======================
   Module réservé au profil Moss. Routes :
     #/cf           Ta semaine (file ordonnée de 4 séances + bonus + team WOD)
     #/cf/s/<sid>   une séance
     #/cf/max       tes max
     #/cf/import    importer un cycle
     #/cf/login     connexion (CLOUD, sans création de compte)
   Chargé avant app.js ; utilise ses helpers ($, app, esc, toast, setAccent,
   today) au moment du rendu seulement.
   ================================================================================= */
const CycleUI = (() => {
  const C = window.PLCycle;
  const ACC = "#d7f25a";
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

  function shell(kicker, title, body){
    setAccent(ACC);
    app.innerHTML = `<div class="view cf"><div class="wrap">
      <header>
        <div class="topbar"><div class="kicker">${esc(kicker)}</div>
          <button class="back" id="cfback">◂ Bibliothèque</button></div>
        <h1>${title}</h1>
      </header>
      ${body}
    </div></div>`;
    $("#cfback").onclick = () => location.hash = "#/";
    window.scrollTo(0, 0);
  }

  /* ---- carte de la bibliothèque ---- */
  function libraryCard(){
    if(!isMoss()) return "";
    const cycle = CycleStore.getCycle();
    let blurb = "Importe ton cycle pour démarrer.", meta = "Aucun cycle";
    if(cycle){
      const v = C.weekView(cycle, logFor(CycleStore.getAthlete(), cycle), today());
      const done = v.sessions.filter(s => s.status === "done").length;
      blurb = v.state === "upcoming" ? `${esc(cycle.title)} démarre le ${dayLabel(cycle.start)}.`
        : v.state === "finished" ? `${esc(cycle.title)} terminé.`
        : v.nextId ? `Prochaine : ${esc(v.sessions.find(s => s.id === v.nextId).title)}.`
        : "Semaine bouclée. Reste le team WOD.";
      meta = `Semaine ${v.weekIndex + 1}/${cycle.weeks.length} · ${done}/4`;
    }
    return `<div class="card cfcard" data-cf style="--c-accent:${ACC}">
      <div class="tag">Programmation</div><div class="dot"></div>
      <div class="ct">TA <em>SEMAINE</em></div>
      <div class="cb">${blurb}</div>
      <div class="cs">${meta}</div>
    </div>`;
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
      <div class="cf-lab">Ta semaine a débordé</div>
      <div class="cf-dt">${title}</div>
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
      shell("Programmation", "TA <em>SEMAINE</em>", `
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

    let next = "";
    if(v.nextId){
      const i = w.sessions.findIndex(x => x.id === v.nextId), s = w.sessions[i];
      next = `<div class="cf-next">
        <div class="cf-lab">Prochaine séance</div>
        <div class="cf-nt">Séance ${i + 1} · ${esc(s.title)}</div>
        <div class="cf-nm">${minutesOf(s)} min · ${s.blocks.filter(b => !b.optional).map(b => esc(b.title)).join(" · ")}</div>
        <button class="dbtn go" data-open="${esc(s.id)}">Ouvrir</button>
      </div>`;
    } else if(v.state === "active" && done === 4){
      next = `<div class="cf-next cf-closed"><div class="cf-lab">Semaine bouclée</div>
        <div class="cf-nt">4 séances sur 4</div>
        <div class="cf-nm">Reste le team WOD dimanche à la salle.</div></div>`;
    }

    const STATUS = { done: "faite", skipped: "passée", next: "à faire", todo: "ensuite", locked: "semaine suivante" };
    const rows = v.sessions.map((s, i) => `
      <button class="cf-sess st-${s.status}" data-sess="${esc(s.id)}">
        <span class="cf-num">${s.status === "done" ? "✓" : i + 1}</span>
        <span class="cf-st"><b>${esc(s.title)}</b><small>${s.status === "done" ? "faite " + dayLabel(s.date) : STATUS[s.status]}</small></span>
      </button>`).join("");
    const bonus = v.bonus ? `
      <div class="cf-bonus">
        <button class="cf-bopen" data-sess="${esc(v.bonus.id)}"><span class="cf-num">+</span>
          <span class="cf-st"><b>Bonus · facultatif</b><small>${esc(v.bonus.title)}</small></span></button>
        ${v.bonus.date ? `<span class="cf-bdate">fait ${dayLabel(v.bonus.date)}</span>`
          : v.state === "active" ? `<button class="dbtn" data-bonus="${esc(v.bonus.id)}">Fait</button>` : ""}
      </div>` : "";
    const wod = `<div class="cf-wod"><span class="cf-num">D</span>
      <span class="cf-st"><b>Team WOD à la salle</b><small>Compté dans ta semaine</small></span>
      <span class="cf-bdate">${dayLabel(addDays(wStart, 6))}</span></div>`;

    shell("Programmation", "TA <em>SEMAINE</em>", `
      <p class="lede">${esc(cycle.title)} · Semaine ${v.weekIndex + 1} sur ${cycle.weeks.length} · ${esc(PHASE[w.phase] || w.phase)}
        · ${ddmm(wStart)} → ${ddmm(addDays(wStart, 6))}${w.intent ? `<br>${esc(w.intent)}` : ""}</p>
      ${banner}
      <div class="cf-prog"><div class="cf-bar"><div style="width:${done * 25}%"></div></div><span>${done} sur 4</span></div>
      ${next}
      <div class="blk"><div class="blk-h"><div class="bl">Dans l'ordre, le jour qui t'arrange</div><div class="line"></div></div>
        <div class="cf-list">${rows}${bonus}${wod}</div></div>
      ${footer()}`);

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

  function footer(){
    const u = CycleStore.isCloud() && CycleStore.user();
    return `<div class="cf-foot">
      <a class="dbtn" href="#/cf/max">Tes max</a>
      <a class="dbtn" href="#/cf/import">Importer un cycle</a>
      ${u ? `<button class="dbtn" id="cfout">${esc(u.email || "compte")} · sortir</button>` : ""}
    </div>`;
  }
  function bindFooter(){
    const o = $("#cfout");
    if(o) o.onclick = async () => { await CycleStore.signOut(); renderLogin(); };
  }

  /* ---- connexion (CLOUD) : pas de création de compte ici ---- */
  function renderLogin(){
    shell("Programmation", "TA <em>SEMAINE</em>", `
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

  /* ---- routeur du module : true si la route est gérée ---- */
  function route(h){
    if(!/^cf(\/|$)/.test(h) || !isMoss()) return false;
    if(CycleStore.needAuth()){ renderLogin(); return true; }
    renderWeek();
    return true;
  }

  return { libraryCard, route };
})();
