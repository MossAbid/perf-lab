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

  /* gabarit commun ; le défilement est remis en haut par route(), pas ici :
     déplier un bloc re-rend l'écran sans faire sauter la page */
  function shell(kicker, title, body, back = ["Bibliothèque", "#/"]){
    setAccent(ACC);
    app.innerHTML = `<div class="view cf"><div class="wrap">
      <header>
        <div class="topbar"><div class="kicker">${esc(kicker)}</div>
          <button class="back" id="cfback">◂ ${esc(back[0])}</button></div>
        <h1>${title}</h1>
      </header>
      ${body}
    </div></div>`;
    $("#cfback").onclick = () => location.hash = back[1];
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
      <span class="cf-bdate">${dayLabel(addDays(cycle.start, Math.max(0, C.calendarWeek(cycle, today())) * 7 + 6))}</span></div>`;

    shell("Programmation", "TA <em>SEMAINE</em>", `
      <p class="lede">${esc(cycle.title)} · Semaine ${v.weekIndex + 1} sur ${cycle.weeks.length}${w.bloc && w.phase !== "test" ? ` · Bloc ${esc(w.bloc)}` : ""} · ${esc(PHASE[w.phase] || w.phase)}
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
      <a class="dbtn" href="#/cf/max">Tes max</a>
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

  /* ---- Séance ----
     Un bloc = un en-tête qui déplie/replie (force déplié par défaut).
     Metcon : RX et INT exclusifs, score rangé par séance au niveau choisi. */
  const FLAG = { tapis: "Tapis", ceinture: "Ceinture" };
  const SCORE_HINT = { time: "Ton temps (mm:ss)", reps: "Tes reps", rounds_reps: "Tours + reps (ex. 5+8)", load: "Ta charge (kg)" };
  const SCORE_MODE = { time: "text", reps: "numeric", rounds_reps: "text", load: "decimal" };
  const fmtKg = kg => String(kg).replace(".", ",") + " kg";
  const lines = t => String(t || "").split("\n").map(l => l.trim()).filter(Boolean).map(l => `<span>${esc(l)}</span>`).join("");
  const flagsHtml = b => (b.flags || []).map(f => `<span class="cf-flag cf-flag-${esc(f)}">${esc(FLAG[f] || f)}</span>`).join("");
  let SS = { sid: null };   // état d'écran de la séance ouverte

  function findSession(cycle, sid){
    for(let wi = 0; wi < cycle.weeks.length; wi++){
      const w = cycle.weeks[wi], i = w.sessions.findIndex(s => s.id === sid);
      if(i >= 0) return { s: w.sessions[i], w, wi, n: i + 1, bonus: false };
      if(w.bonus && w.bonus.id === sid) return { s: w.bonus, w, wi, n: null, bonus: true };
    }
    return null;
  }

  function strengthBody(cycle, athlete, b){
    const lift = cycle.lifts[b.lift];
    const m = C.liftMax(cycle, athlete.maxes, b.lift);
    const src = m && m.derived ? cycle.lifts[lift.derive.from] : null;
    const maxLine = m
      ? `Calculé sur ton max : <b>${fmtKg(m.kg)}</b>${src ? ` · dérivé du ${esc(src.name.toLowerCase())}` : ""}`
      : `Pas encore de max pour ce mouvement · <a href="#/cf/max">Saisis ton max</a>`;
    const rows = C.strengthLines(cycle, athlete.maxes, b).map(l => `
      <span>${esc(l.sets)} × ${esc(l.reps)}</span><span>${esc(l.pct)} %</span>
      <span class="cf-kg"><span class="cf-load">${l.kg != null ? fmtKg(l.kg) : "—"}</span>${l.belt ? `<span class="cf-belt">Ceinture</span>` : ""}</span>`).join("");
    return `<div class="cf-max">${maxLine}</div>
      <div class="cf-table"><span class="cf-th">Séries</span><span class="cf-th">% du max</span><span class="cf-th">Charge</span>${rows}</div>
      ${b.rest ? `<div class="cf-rest">Repos : ${esc(b.rest)}</div>` : ""}
      ${b.notes ? `<div class="cf-text">${lines(b.notes)}</div>` : ""}
      ${lift.video ? `<a class="cf-video" href="${esc(lift.video)}" target="_blank" rel="noopener">▶ Vidéo · ${esc(lift.name)}</a>` : ""}`;
  }

  function metconBody(athlete, log, b, sid, readOnly){
    const levels = ["rx", "int"].map(k => {
      const open = SS.levelOpen && SS.level === k, t = b.levels[k].text || "";
      return `<button class="cf-lvh${open ? " on" : ""}" data-level="${k}" aria-expanded="${open}">
          <span class="cf-lvp lv-${k}">${k === "rx" ? "RX" : "INT"}</span>
          <span class="cf-lvs">${open ? "" : esc(t.split("\n")[0])}</span><span class="cf-chev">${open ? "−" : "+"}</span></button>
        ${open ? `<div class="cf-level" data-open-level="${k}">${lines(t)}</div>` : ""}`;
    }).join("");
    const mine = log.scores[sid];
    // « dernière fois » = avant le score de cette séance, pour ne pas le répéter
    const prev = C.previousScore(athlete, b.bench, mine ? mine.d : today());
    const draft = SS.draft != null ? SS.draft : mine ? mine.text : "";
    const score = readOnly ? "" : `<div class="cf-score">
        <label for="cfscore">${SCORE_HINT[b.score]} · niveau ${SS.level === "rx" ? "RX" : "INT"}</label>
        <div class="cf-srow"><input id="cfscore" type="text" inputmode="${SCORE_MODE[b.score]}" autocomplete="off" value="${esc(draft)}">
          <button class="dbtn go" id="cfsave">Enregistrer</button></div>
        <div class="cf-err">${esc(SS.err || "")}</div>
        ${mine ? `<div class="cf-sline">Enregistré : <b>${esc(mine.text)}</b> · ${mine.level === "rx" ? "RX" : "INT"}</div>` : ""}
        ${prev ? `<div class="cf-sline">Dernière fois : ${esc(prev.text)} · ${prev.level === "rx" ? "RX" : "INT"} · ${dayLabel(prev.d)}</div>` : ""}
      </div>`;
    return `${b.text ? `<div class="cf-text">${lines(b.text)}</div>` : ""}<div class="cf-levels">${levels}</div>${score}`;
  }

  function renderSession(sid){
    const cycle = CycleStore.getCycle();
    const f = cycle && findSession(cycle, sid);
    if(!f){ location.hash = "#/cf"; return; }
    const athlete = CycleStore.getAthlete(), log = logFor(athlete, cycle);
    const metcon = f.s.blocks.find(b => b.kind === "metcon");
    if(SS.sid !== sid){
      const prev = metcon && C.previousScore(athlete, metcon.bench, today());
      SS = { sid, open: new Set(f.s.blocks.map((b, i) => b.kind === "strength" ? i : -1).filter(i => i >= 0)),
             level: (log.scores[sid] || prev || {}).level || "rx", levelOpen: true, err: "" };
    }
    const locked = f.wi > C.calendarWeek(cycle, today());
    const doneDate = f.bonus ? log.bonus[sid] : log.done[sid];

    const blocks = f.s.blocks.map((b, i) => {
      const isMet = b.kind === "metcon", open = isMet || SS.open.has(i);
      const sub = `${Number(b.minutes) > 0 ? Number(b.minutes) + " min" : ""}${b.optional ? " · facultatif" : ""}`;
      const head = `<span class="cf-bn">${String(i + 1).padStart(2, "0")}</span>
        <span class="cf-bt"><b>${esc(b.title)}</b><small>${sub}</small></span>${flagsHtml(b)}`;
      const body = b.kind === "strength" ? strengthBody(cycle, athlete, b)
        : isMet ? metconBody(athlete, log, b, sid, locked)
        : `<div class="cf-text">${lines(b.text)}</div>`;
      return `<section class="cf-blk k-${esc(b.kind)}">
        ${isMet ? `<div class="cf-bh">${head}</div>`
          : `<button class="cf-bh" data-block="${i}" aria-expanded="${open}">${head}<span class="cf-chev">${open ? "−" : "+"}</span></button>`}
        ${open ? `<div class="cf-bb">${body}</div>` : ""}
      </section>`;
    }).join("");

    const foot = locked
      ? `<div class="cf-note">Séance de la semaine ${f.wi + 1} : elle s'ouvre le ${dayLabel(addDays(cycle.start, f.wi * 7))}.</div>`
      : doneDate ? `<button class="donebtn ok" id="cfdone" disabled>✓ Faite ${dayLabel(doneDate)}</button>
          <button class="dbtn cf-undo" id="cfundo">Annuler : pas encore faite</button>`
      : `<button class="donebtn" id="cfdone">✓ ${f.bonus ? "Bonus fait" : "Séance faite"}</button>`;
    const title = f.bonus ? "BONUS" : `SÉANCE ${f.n}`;
    shell(`Semaine ${f.wi + 1} · ${PHASE[f.w.phase] || f.w.phase}`, `${title}<br><em>${esc(f.s.title.replace(/^Bonus · /, ""))}</em>`, `
      <p class="lede">${minutesOf(f.s)} min, hors blocs facultatifs.</p>
      <div class="cf-blocks">${blocks}</div>
      ${foot}`, ["Ta semaine", "#/cf"]);

    app.querySelectorAll("[data-block]").forEach(btn => btn.onclick = () => {
      const i = +btn.dataset.block;
      if(SS.open.has(i)) SS.open.delete(i); else SS.open.add(i);
      renderSession(sid);
    });
    app.querySelectorAll("[data-level]").forEach(btn => btn.onclick = () => {
      const k = btn.dataset.level, inp = $("#cfscore");
      if(inp) SS.draft = inp.value;   // garder la saisie en cours
      if(SS.level === k && SS.levelOpen) SS.levelOpen = false; else { SS.level = k; SS.levelOpen = true; }
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
      shell("Programmation", "TES <em>MAX</em>", `<div class="cf-empty"><p>Importe d'abord un cycle : la liste des mouvements vient du cycle.</p>
        <a class="dbtn go" href="#/cf/import">Importer un cycle</a></div>`, ["Ta semaine", "#/cf"]);
      return;
    }
    const athlete = CycleStore.getAthlete();
    const ids = Object.keys(cycle.lifts);
    const has = id => (athlete.maxes[id] || []).length > 0;
    const staleBefore = addDays(cycle.start, -63);
    const withMax = ids.filter(has), without = ids.filter(id => !has(id));
    shell("Programmation", "TES <em>MAX</em>", `
      <p class="lede">Ils calculent toutes tes charges. Chaque nouveau max recalcule les séances à venir.</p>
      ${withMax.length ? `<div class="blk"><div class="blk-h"><div class="bl">Force & haltéro</div><div class="line"></div></div>
        <div class="cf-mlist">${withMax.map(id => maxRow(cycle, athlete, id, staleBefore)).join("")}</div>
        ${withMax.some(id => C.liftMax({ lifts: {} }, athlete.maxes, id).d < staleBefore)
          ? `<div class="cf-rest">Date en orange : max de plus de 9 semaines avant le début du cycle.</div>` : ""}</div>` : ""}
      ${without.length ? `<div class="blk"><div class="blk-h"><div class="bl">Pas encore de repère</div><div class="line"></div></div>
        <div class="cf-mlist dashed">${without.map(id => maxRow(cycle, athlete, id, staleBefore)).join("")}</div></div>` : ""}`,
      ["Ta semaine", "#/cf"]);

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
    shell("Programmation", "IMPORTER <em>UN CYCLE</em>", `
      <p class="lede">Colle le JSON du cycle. Il remplace le cycle en cours${cur ? ` (${esc(cur.title)})` : ""} ; tes séances faites, tes scores et tes max sont conservés.</p>
      <textarea id="cfjson" class="cf-json" spellcheck="false" placeholder='{ "schema": "perflab-cycle-v1", … }'></textarea>
      <div class="cf-err" id="cfimperr"></div>
      <button class="dbtn go cf-wide" id="cfimport">Importer</button>`, ["Ta semaine", "#/cf"]);
    $("#cfimport").onclick = async () => {
      const err = m => { $("#cfimperr").textContent = m; };
      let cycle;
      try{ cycle = JSON.parse($("#cfjson").value); }catch(e){ return err("JSON invalide : " + e.message); }
      try{ await CycleStore.importCycle(cycle); }catch(m){ return err((m && m.message) || String(m)); }
      toast("Cycle importé.");
      location.hash = "#/cf";
    };
  }

  /* ---- routeur du module : true si la route est gérée ---- */
  function route(h){
    if(!/^cf(\/|$)/.test(h) || !isMoss()) return false;
    const m = h.match(/^cf\/s\/(.+)$/);
    if(CycleStore.needAuth()) renderLogin();
    else if(m){ SS = { sid: null }; renderSession(decodeURIComponent(m[1])); }   // écran neuf à chaque arrivée
    else if(h === "cf/max"){ editLift = null; renderMax(); }
    else if(h === "cf/import") renderImport();
    else renderWeek();
    window.scrollTo(0, 0);
    return true;
  }

  return { libraryCard, route };
})();
