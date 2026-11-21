// Tradeline prototype: core state, math and hero screens.
(function () {
  const D = TL.deal;
  const monthly = D.annual / 12;

  // ---------- Formatting ----------
  const fmt = (n) => {
    if (n === null || n === undefined) return "n/a";
    const a = Math.abs(n);
    if (a >= 1e6) return "$" + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    if (a >= 1e3) return "$" + (Math.round(n / 100) / 10).toString().replace(/\.0$/, "") + "K";
    return "$" + Math.round(n);
  };
  TL.fmt = fmt;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  TL.esc = esc;

  // ---------- State ----------
  const fresh = () => ({
    view: "deal",          // deal | approvals | story | playbook
    stage: "packet",       // packet | review | issue | counter | round2 | agreed
    issueId: null,
    term: D.defaultTerm,
    laneFilter: null,
    choice: Object.fromEntries(TL.issues.map((i) => [i.id, i.recommended])),
    confirmed: {},         // extraction confirmed by human
    flagged: {},           // extraction flagged as wrong
    status: {},            // issueId -> {state:'decided'|'pending'|'approved'|'rejected', lane, by, note, at}
    greensApproved: false,
    greensOpen: false,
    packetRequested: false,
    packetContinued: false,
    drawer: null,          // {issueId, tab}
    role: "legal",
    log: [],
    reopened: {},
    counterSent: false,
    r2: {},                // issueId -> 'accepted' | 'pushed' | 'pending' | 'approved'
    agreed: false,
    tourStep: null,
    ai: {},                // issueId -> {mode:'live'|'cached', data}
  });
  let S = fresh();
  TL.S = () => S;
  TL.resetState = () => { S = fresh(); return S; };

  const logIt = (who, what) => {
    const d = new Date();
    S.log.push({ who, what, at: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  };
  TL.logIt = logIt;

  // ---------- Math ----------
  const total = () => D.annual * S.term;
  const dealApprover = () => TL.doa.find((t) => total() <= t.max);
  TL.total = total;
  TL.dealApprover = dealApprover;

  const issueById = (id) => TL.issues.find((i) => i.id === id);
  TL.issueById = issueById;
  const pb = (id) => TL.playbook.find((p) => p.id === id);
  TL.pb = pb;

  // Exposure for an issue under an option key. Returns {value, kind, formula}
  function exposure(issue, optKey, override) {
    const o = Object.assign({}, issue.options[optKey] || {}, override || {});
    const term = S.term;
    switch (issue.id) {
      case "exit_fee": {
        const m = o.months(term);
        const half = term * 6;
        const months = Math.min(m, half);
        return { value: months * monthly, kind: "risk", formula: `<b>${months} months</b> of fees owed x <b>${fmt(monthly)}</b> a month (exit halfway through a ${term}-year term, ${half} months left)` };
      }
      case "liability_cap": {
        const cap = Math.max(o.months() * monthly, 10000);
        const v = Math.max(issue.incident - cap, 0);
        return { value: v, kind: "risk", formula: `<b>${fmt(issue.incident)}</b> incident (assumed) minus a cap of <b>${fmt(cap)}</b> (${o.months()} months' fees)` };
      }
      case "renewal_price": {
        let extra = 0;
        for (let y = 1; y < term; y++) extra += D.annual * (Math.pow(1 + o.rate, y) - 1);
        const next = D.annual * Math.pow(1 + o.rate, Math.max(term, 1));
        return { value: extra, kind: "cost", formula: `Yearly increase of <b>${Math.round(o.rate * 100)}%</b> compounded over ${term} year${term > 1 ? "s" : ""} on <b>${fmt(D.annual)}</b>. If the renewal notice is missed, year ${term + 1} costs <b>${fmt(next)}</b>.`, next };
      }
      case "payment_terms": {
        const errors = D.annual * issue.errorRate;
        const v = errors * o.lostShare * term;
        return { value: v, kind: "cost", formula: `<b>${fmt(errors)}</b> of invoice errors a year (2%, assumed) x <b>${Math.round(o.lostShare * 100)}%</b> found too late x ${term} year${term === 1 ? "" : "s"}` };
      }
      case "sla_credits": {
        const std = 0.05;
        const v = issue.missedMonths * monthly * term * Math.max(std - o.credit, 0);
        return { value: v, kind: "cost", formula: `<b>${issue.missedMonths}</b> missed months a year (assumed) x <b>${fmt(monthly)}</b> x credits forgone versus our 5% standard (${Math.round(o.credit * 100)}% offered) x ${term} years` };
      }
      default:
        return { value: null, kind: "unpriced", formula: "Not priced. The impact depends on what Ridgeline later changes, so Tradeline does not invent a number." };
    }
  }
  TL.exposure = exposure;

  // Precedent similarity (transparent, deterministic)
  const levels = ["Low", "Medium", "High"];
  function similarity(p) {
    const cat = (TL.categoryAffinity["Managed IT"][p.category] ?? 0.1);
    const sizeRatio = Math.abs(Math.log(p.annual / D.annual)) / Math.log(4);
    const size = Math.max(0, 1 - Math.min(sizeRatio, 1));
    const ld = Math.abs(levels.indexOf(p.leverage) - levels.indexOf(D.leverage));
    const lev = ld === 0 ? 1 : ld === 1 ? 0.5 : 0;
    const urg = p.urgency === D.urgency ? 1 : 0;
    const score = 0.4 * cat + 0.3 * size + 0.2 * lev + 0.1 * urg;
    const matched = [];
    if (cat === 1) matched.push("Managed IT");
    else matched.push(p.category + " (related)");
    if (size > 0.7) matched.push(fmt(p.annual) + "/yr, similar size");
    if (lev === 1) matched.push(p.leverage.toLowerCase() + " supplier leverage");
    if (urg) matched.push("high urgency");
    const parts = [["Category", cat], ["Deal size", size], ["Supplier leverage", lev], ["Urgency", urg]];
    return { score, matched, parts };
  }
  TL.similarity = similarity;

  function evidence(issueId) {
    const list = TL.precedents.filter((p) => p.issue === issueId).map((p) => ({ p, sim: similarity(p) })).sort((a, b) => b.sim.score - a.sim.score);
    const similar = list.filter((x) => x.sim.score >= 0.7);
    const n = similar.length;
    const losses = similar.filter((x) => x.p.outcome.type === "loss").length;
    const level = n >= 4 ? 3 : n >= 2 ? 2 : 1;
    const label = level === 3 ? "Strong" : level === 2 ? "Some" : "Thin";
    return { list, similar, n, losses, level, label };
  }
  TL.evidence = evidence;

  // Who must approve the currently chosen option
  function laneFor(issue, optKey) {
    const ev = evidence(issue.id);
    const opt = issue.options[optKey];
    if (S.flagged[issue.id]) return "legal";
    if (ev.level === 1 && optKey !== "standard") return "legal";
    return opt.lane;
  }
  TL.laneFor = laneFor;

  // Scale positions (0 to 100): left third = below fallback, middle = fallback, right = standard
  TL.scale = {
    exit_fee: { ask: 6, usual: 52, usualLabel: "Halden usually lands: 3 to 6 months' fees" },
    liability_cap: { ask: 14, usual: 58, usualLabel: "Halden usually lands: 6 to 9 months' fees" },
    renewal_price: { ask: 20, usual: 62, usualLabel: "Halden usually lands: 3 to 4% cap" },
    payment_terms: { ask: 24, usual: 52, usualLabel: "Halden usually lands: 90 days" },
    sla_credits: { ask: 4, usual: 55, usualLabel: "Halden usually lands: 3 to 5% credits" },
    unilateral_changes: { ask: 5, usual: null, usualLabel: "Not enough past deals to say" },
  };
  const optPos = { accept: null, standard: 84, fallback: 50, trade: 40 };

  // ---------- Aggregates ----------
  function dealTotals(mode) {
    let cost = 0, risk = 0, riskIssue = null;
    TL.issues.forEach((i) => {
      const key = mode === "written" ? "accept" : (S.status[i.id] && S.status[i.id].finalKey) || S.choice[i.id];
      const e = exposure(i, key, S.status[i.id] && S.status[i.id].override);
      if (e.kind === "cost") cost += e.value;
      if (e.kind === "risk" && e.value > risk) { risk = e.value; riskIssue = i; }
    });
    return { cost, risk, riskIssue };
  }
  TL.dealTotals = dealTotals;

  function laneCounts() {
    const c = { maya: 0, legal: 0, finance: 0, owner: 0 };
    TL.issues.forEach((i) => { c[laneFor(i, S.choice[i.id])]++; });
    c.maya += TL.greens.length;
    return c;
  }
  function laneCountsWritten() {
    const c = { maya: TL.greens.length, legal: 0, finance: 0, owner: 0 };
    TL.issues.forEach((i) => { c[i.asWrittenLane]++; });
    return c;
  }
  TL.laneCounts = laneCounts;

  // ---------- AI ----------
  TL.aiFor = function (issueId) {
    const cached = TL.ai[issueId];
    const live = S.ai[issueId];
    return live && live.mode === "live" ? Object.assign({}, cached, live.data, { mode: "live" }) : Object.assign({}, cached, { mode: "cached" });
  };
  TL.requestAI = async function (issueId) {
    if (S.ai[issueId]) return;
    S.ai[issueId] = { mode: "loading" };
    const issue = issueById(issueId);
    const ev = evidence(issueId);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 28000);
      const res = await fetch("/api/extract", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
        body: JSON.stringify({
          task: "issue",
          clause: issue.text,
          playbook: pb(issue.clause),
          deal: { supplier: D.supplier, type: D.type, annual: D.annual, term: S.term, leverage: D.leverage, urgency: D.urgency },
          precedents: ev.similar.slice(0, 4).map((x) => ({ id: x.p.id, supplier: x.p.supplier, ask: x.p.ask, agreed: x.p.agreed, outcome: x.p.outcome.label, leverage: x.p.leverage, urgency: x.p.urgency, similarity: Math.round(x.sim.score * 100) })),
        }),
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      if (!data || !data.plain || !data.fields) throw new Error("bad shape");
      S.ai[issueId] = { mode: "live", data: { plain: data.plain, precedentNote: data.precedentNote || TL.ai[issueId].precedentNote, fields: data.fields, type: data.type } };
    } catch (e) {
      S.ai[issueId] = { mode: "cached" };
    }
    TL.keepScroll = true;
    render();
  };

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 2600);
  }
  TL.toast = toast;

  // ---------- Small render helpers ----------
  const laneChip = (lane) => {
    const map = { maya: ["blue", "Maya can close"], legal: ["purple", "Legal approves"], finance: ["amber", "Finance approves"], owner: ["green", "IT Director decides"] };
    const [c, t] = map[lane];
    return `<span class="chip ${c}">${t}</span>`;
  };
  TL.laneChip = laneChip;
  const strength = (ev) => `<span class="row" style="gap:6px"><span class="strength s${ev.level}"><span></span><span></span><span></span></span><span class="tiny muted">${ev.label} evidence · ${ev.n} similar deal${ev.n === 1 ? "" : "s"}</span></span>`;
  TL.strength = strength;
  const moneyCell = (e) => e.value === null ? `<span class="money none">Not priced</span>` : `<span class="money ${e.kind}">${fmt(e.value)}</span>`;
  TL.moneyCell = moneyCell;
  const kindLabel = (k) => k === "risk" ? "Risk if things go wrong" : k === "cost" ? "Cost exposure" : "Not priced";

  // ---------- Top bar ----------
  function topbar() {
    const v = S.view;
    const pendingCount = Object.values(S.status).filter((s) => s.state === "pending").length;
    return `<div class="topbar"><div class="topbar-in">
      <div class="brand"><div class="brand-mark">T</div>Tradeline<small>a concept on Sirion</small></div>
      <nav class="nav">
        <button data-act="view" data-v="deal" class="${v === "deal" ? "on" : ""}">Ridgeline deal</button>
        <button data-act="view" data-v="approvals" class="${v === "approvals" ? "on" : ""}">Approvals${pendingCount ? ` · ${pendingCount}` : ""}</button>
        <button data-act="view" data-v="story" class="${v === "story" ? "on" : ""}">Why we built this</button>
        <button data-act="view" data-v="playbook" class="${v === "playbook" ? "on" : ""}">Playbook and data</button>
      </nav>
      <div class="top-right">
        <button class="btn small ghost" data-act="tour">Guided tour</button>
        <button class="btn small ghost" data-act="reset">Reset demo</button>
        <div class="persona-chip"><div class="avatar">MR</div>Maya Reyes</div>
      </div>
    </div></div>`;
  }

  function stepper() {
    const steps = [["packet", "Supplier paper"], ["review", "Review issues"], ["approvals", "Approvals"], ["counter", "Counter-proposal"], ["round2", "Supplier's reply"], ["agreed", "Agreed"]];
    const order = steps.map((s) => s[0]);
    const cur = S.stage === "issue" ? "review" : S.stage;
    const ci = order.indexOf(cur);
    return `<div class="stepper">${steps.map(([k, l], i) => {
      const cls = i === ci ? "on" : i < ci ? "done" : "";
      return `<div class="step ${cls}" data-act="stage" data-s="${k}"><span class="n">${i < ci ? "✓" : i + 1}</span>${l}</div>`;
    }).join("")}</div>`;
  }

  // ---------- Packet check ----------
  function packet() {
    const docs = D.documents.map((d) => {
      const missing = d.status === "missing" && !S.packetRequested;
      const requested = d.status === "missing" && S.packetRequested;
      return `<div class="doc ${missing ? "missing" : ""}">
        <div class="doc-icon">${d.id === "guide" ? "?" : "PDF"}</div>
        <div><div style="font-weight:500">${d.name}</div>
          <div class="small muted">${d.status === "missing" ? esc(d.ref) : `From ${d.from} · ${d.pages} pages`}</div></div>
        <div>${d.status === "received" ? `<span class="chip green">Received</span>` : requested ? `<span class="chip amber">Requested, awaiting</span>` : `<span class="chip red">Missing</span>`}</div>
      </div>`;
    }).join("");
    return `${stepper()}
    <div class="grid2" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">
      <div class="card pad" data-tour="packet">
        <div class="eyebrow">Mon 9:12 AM · forwarded by Tom Becker, IT Director</div>
        <h2 style="margin:8px 0 6px">Ridgeline sent their contract. One document it relies on is missing.</h2>
        <p class="muted" style="margin:0 0 18px">Tradeline checks the whole packet before review, because key terms often sit outside the main agreement.</p>
        ${docs}
        <div class="callout blue" style="margin-top:16px">Terms are read from every document received. <b>2 of the 6 real issues sit in the Order Form, not the MSA</b>, including the early termination fee. A review of the MSA alone would miss them.</div>
      </div>
      <div class="card pad">
        <h3>What would you like to do?</h3>
        <p class="small muted">The Services Guide holds service levels. Until it arrives, the service-level issue is marked provisional.</p>
        ${S.packetRequested ? `<div class="callout green">Request sent to Ridgeline at 9:14 AM. Logged in the deal history.</div>` : `
        <div class="card" style="box-shadow:none;background:var(--surface-2);padding:14px 16px;margin:12px 0">
          <div class="tiny muted">Drafted request <span class="cached-badge">· AI draft</span></div>
          <div class="small" style="margin-top:6px">Hi Ridgeline team, your MSA (§2(b) and §6.1) refers to the Services Guide v4.2, which wasn't included. Could you send it so we can review service levels alongside the agreement? Thanks, Maya</div>
        </div>
        <button class="btn" data-act="request-guide">Send request to Ridgeline</button>`}
        <div class="divider"></div>
        <button class="btn primary" data-act="start-review">Start review with what we have →</button>
        <p class="tiny muted" style="margin-top:10px">In production, Sirion's IssueDetection Agent finds the issues. Tradeline builds on it with a price, an owner and evidence for each one.</p>
      </div>
    </div>`;
  }

  // ---------- Deal review (hero) ----------
  function review() {
    const w = dealTotals("written");
    const r = dealTotals("current");
    const lc = laneCounts();
    const lw = laneCountsWritten();
    const appr = dealApprover();
    const decided = Object.keys(S.status).length + (S.greensApproved ? 1 : 0);
    const rows = TL.issues
      .map((i) => ({ i, e: exposure(i, S.choice[i.id], S.status[i.id] && S.status[i.id].override), ew: exposure(i, "accept") }))
      .sort((a, b) => (b.ew.value ?? -1) - (a.ew.value ?? -1))
      .filter((x) => !S.laneFilter || laneFor(x.i, S.choice[x.i.id]) === S.laneFilter);
    const allDone = TL.issues.every((i) => S.status[i.id]) && S.greensApproved;

    return `${stepper()}
    <div class="deal-head">
      <div class="card pad">
        <div class="row between wrap-row"><div class="eyebrow">${D.type} · ${D.context.split(".")[0]}</div><span class="synthetic">Synthetic demo data</span></div>
        <h1 style="margin:8px 0 4px">Ridgeline Managed IT</h1>
        <div class="muted">${fmt(D.annual)} a year · ${S.term}-year term · <b style="color:var(--ink)">${fmt(total())} total</b></div>
        <div class="grid2" style="margin-top:18px" data-tour="kpis">
          <div class="kpi"><div class="label">Cost exposure in the terms as written</div><div class="val mono"><span class="strike">${fmt(w.cost)}</span>${fmt(r.cost)}</div><div class="sub">As written → with your choices. Under stated assumptions: price rises, late invoice disputes, missed credits.</div></div>
          <div class="kpi"><div class="label">Biggest single risk if things go wrong</div><div class="val mono"><span class="strike">${fmt(w.risk)}</span>${fmt(r.risk)}</div><div class="sub">Not added to costs. Each risk is a different scenario, shown separately.</div></div>
        </div>
      </div>
      <div class="card pad">
        <div class="slider-box" data-tour="slider">
          <div class="row between"><b class="small">What if the contract term changes?</b><span class="chip outline">${S.term} year${S.term > 1 ? "s" : ""}</span></div>
          <input type="range" min="1" max="5" step="1" value="${S.term}" data-act="term" aria-label="Contract term in years" style="margin:10px 0 6px">
          <div class="small">Total value <b>${fmt(total())}</b>. Final contract signed by <b>${appr.who}</b>${appr.lane === "cpo" ? `, because it is above Maya's $1M limit.` : `, within her limit.`}</div>
        </div>
        <div class="tiny muted" style="margin-top:12px">Approval limits (total contract value): buyers up to $100K · Maya up to $1M · CPO above. Halden's playbook applies at any value.</div>
      </div>
    </div>

    <div class="card pad" style="margin-top:16px">
      <div class="row between wrap-row" style="margin-bottom:14px">
        <div><h3>Who needs to decide what</h3><div class="small muted">Following Tradeline's recommendations. As written, ${lw.legal} issues would need Legal, ${lw.finance} Finance and ${lw.owner} the IT Director.</div></div>
        ${S.laneFilter ? `<button class="btn small" data-act="lane" data-l="">Show all</button>` : ""}
      </div>
      <div class="lanes" data-tour="lanes">
        ${["maya", "legal", "finance", "owner"].map((l) => `<div class="lane ${l} ${S.laneFilter === l ? "on" : ""}" data-act="lane" data-l="${l}"><div class="count">${lc[l]}</div><div class="name">${l === "maya" ? `You can close (of ${TL.issues.length + TL.greens.length})` : TL.lanes[l].label}</div></div>`).join("")}
      </div>
    </div>

    <div class="card pad" style="margin-top:16px" data-tour="issues">
      <div class="row between wrap-row"><div><h3>Issues, ranked by what they could cost</h3><div class="small muted">Click any issue to see the evidence and decide.</div></div><div class="small muted">${decided} of ${TL.issues.length + 1} items decided (${TL.issues.length} issues and the ${TL.greens.length}-clause batch)</div></div>
      <div class="issue-list" style="margin-top:12px">
        ${rows.map(({ i, e, ew }) => {
          const st = S.status[i.id];
          const ev = evidence(i.id);
          return `<div class="issue-row" data-act="open" data-id="${i.id}">
            <span class="dot ${i.light}"></span>
            <div><div class="t">${i.title}${i.provisional ? ` <span class="chip amber" style="margin-left:4px">Provisional</span>` : ""}</div><div class="s">${D.documents.find((d) => d.id === i.source.doc).name.split(" #")[0]} ${i.source.section} · ${esc(i.extract.fields.map((f) => f[1]).slice(0, 2).join(", "))}</div></div>
            <div class="hide-sm">${ew.value === null ? `<span class="money none">Not priced</span>` : `<div class="tiny muted">${kindLabel(ew.kind)}, as written</div><span class="money ${ew.kind}">${fmt(ew.value)}</span>`}</div>
            <div class="hide-sm">${strength(ev)}</div>
            <div>${st ? statusChip(st) : laneChip(laneFor(i, S.choice[i.id]))}</div>
            <span class="muted">›</span>
          </div>`;
        }).join("")}
        ${!S.laneFilter || S.laneFilter === "maya" ? greensBlock() : ""}
      </div>
      <div class="row between wrap-row" style="margin-top:18px">
        <div class="small muted">${allDone ? "Every issue has a decision. Next: approvals and the counter-proposal." : "Decide each issue, or approve the in-playbook items in one go."}</div>
        <button class="btn ${allDone ? "primary" : ""}" data-act="stage" data-s="approvals">Go to approvals →</button>
      </div>
    </div>`;
  }

  function statusChip(st) {
    if (st.state === "decided") return `<span class="chip blue">✓ Decided by Maya</span>`;
    if (st.state === "pending") return `<span class="chip ${st.lane === "legal" ? "purple" : st.lane === "finance" ? "amber" : "green"}">Waiting: ${TL.lanes[st.lane].short}</span>`;
    if (st.state === "approved") return `<span class="chip green">✓ Approved by ${TL.lanes[st.lane].short}</span>`;
    if (st.state === "rejected") return `<span class="chip red">Sent back by ${TL.lanes[st.lane].short}</span>`;
    return "";
  }
  TL.statusChip = statusChip;

  function greensBlock() {
    const head = `<div class="issue-row" data-act="greens-toggle">
      <span class="dot green"></span>
      <div><div class="t">${TL.greens.length} clauses match the playbook</div><div class="s">Confidentiality, governing law, data location and ${TL.greens.length - 3} more</div></div>
      <div class="hide-sm"><span class="money none">No exposure</span></div>
      <div class="hide-sm"><span class="tiny muted">Checked against playbook</span></div>
      <div>${S.greensApproved ? `<span class="chip blue">✓ Approved by Maya</span>` : laneChip("maya")}</div>
      <span class="muted">${S.greensOpen ? "⌄" : "›"}</span></div>`;
    if (!S.greensOpen) return head;
    return head + `<div style="padding:4px 6px 14px 38px;background:var(--surface-2)">
      ${TL.greens.map((g) => `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div><div style="font-weight:500;font-size:14px">${g.title} <span class="tiny muted">${g.source}</span></div><div class="small muted">${g.text}</div></div><span class="chip green">${g.match}</span></div>`).join("")}
      <div class="row" style="margin-top:12px">${S.greensApproved ? `<span class="status-done">✓ All ${TL.greens.length} approved and logged. Each one was shown above before approval.</span>` : `<button class="btn primary small" data-act="greens-approve">Approve all ${TL.greens.length}</button><span class="tiny muted">Each item is listed above so nothing is approved unseen.</span>`}</div>
    </div>`;
  }

  // ---------- Issue detail ----------
  function issueDetail() {
    const i = issueById(S.issueId);
    const p = pb(i.clause);
    const ai = TL.aiFor(i.id);
    const ev = evidence(i.id);
    const key = S.choice[i.id];
    const e = exposure(i, key);
    const ew = exposure(i, "accept");
    const lane = laneFor(i, key);
    const st = S.status[i.id];
    const confirmed = S.confirmed[i.id];
    const sc = TL.scale[i.id];
    const fields = ai.fields || i.extract.fields;
    if (!S.ai[i.id]) setTimeout(() => TL.requestAI(i.id), 0);
    const aiBadge = S.ai[i.id] && S.ai[i.id].mode === "loading" ? `<span class="cached-badge">Reading…</span>` : ai.mode === "live" ? `<span class="live-badge">Live AI</span>` : `<span class="cached-badge">AI · saved result</span>`;

    const optsHtml = Object.entries(i.options).map(([k, o]) => {
      const oe = exposure(i, k);
      const l = laneFor(i, k);
      return `<button class="opt ${key === k ? "sel" : ""}" data-act="choose" data-k="${k}" ${st ? "disabled" : ""}>
        <span class="radio"></span>
        <span><span class="ol">${o.label}</span>${k === i.recommended ? `<span class="rec-tag">Recommended</span>` : ""}<br><span class="op">${esc(o.position)}</span></span>
        <span style="text-align:right">${oe.value === null ? `<span class="tiny muted">Not priced</span>` : `<span class="money ${oe.kind}" style="font-size:17px">${fmt(oe.value)}</span>`}<br>${laneChip(l)}</span>
      </button>`;
    }).join("");

    const trade = i.options[key] && i.options[key].priceCut ? (() => {
      const gain = i.options[key].priceCut * total();
      const fb = exposure(i, "fallback");
      return `<div class="balance" style="margin-top:12px"><div class="give"><div class="bl">You give</div><div class="bv">+${fmt(e.value - fb.value)} risk</div><div class="small">versus our fallback, if Halden exits halfway</div></div><div class="get"><div class="bl">You get</div><div class="bv">${fmt(gain)} saved</div><div class="small">${Math.round(i.options[key].priceCut * 100)}% price cut over ${S.term} years</div></div></div>
      <div class="callout ${gain >= e.value - fb.value ? "green" : "red"}" style="margin-top:8px">${gain >= e.value - fb.value ? "The saving covers the extra risk." : "The saving is smaller than the extra risk. This trades legal protection for a lower price, so Legal and the IT Director both approve."}</div>`;
    })() : "";

    const comm = dealApprover();
    const inPlaybook = ["standard", "fallback"].includes(key) || (key === "trade" && lane === "maya");
    const evOk = ev.level > 1 || key === "standard";

    return `<button class="back" data-act="back">← All issues</button>
    <div class="row between wrap-row" style="margin-bottom:16px">
      <div><div class="row" style="gap:10px"><span class="dot ${i.light}"></span><span class="eyebrow">${D.documents.find((d) => d.id === i.source.doc).name} ${i.source.section}</span>${i.provisional ? `<span class="chip amber">Provisional: Services Guide missing</span>` : ""}</div>
      <h1 style="margin-top:8px">${i.title}</h1></div>
      <div class="row">${st ? statusChip(st) : ""}</div>
    </div>
    <div class="detail">
      <div class="stack">
        <div class="card pad" data-tour="ai-read">
          <div class="row between"><div class="eyebrow">What Ridgeline wrote</div>${i.hiddenIn ? `<span class="chip amber">Found outside the MSA</span>` : ""}</div>
          <p class="quote" style="margin-top:12px">${esc(i.text)}</p>
          ${i.hiddenIn ? `<p class="small muted" style="margin:10px 0 0">${i.hiddenIn}</p>` : ""}
          <div class="divider"></div>
          <div class="row between"><div class="eyebrow">How the AI read it</div>${aiBadge}</div>
          <div class="fields" style="margin-top:10px">${fields.map((f) => `<div class="k">${esc(f[0])}</div><div>${esc(f[1])}</div>`).join("")}</div>
          <div class="plain" style="margin-top:12px">${esc(ai.plain || i.plain)}</div>
          ${i.combo ? `<div class="callout amber" style="margin-top:10px"><b>Combination trap.</b> ${i.combo}</div>` : ""}
          <div style="margin-top:12px">${S.flagged[i.id] ? `<div class="confirm-bar">Flagged as misread. Routed to Legal to check before any decision.</div>` : confirmed ? `<div class="confirm-bar ok">✓ You confirmed this reading. It is now used for routing.</div>` : `<div class="confirm-bar"><span>Is this reading right? Routing waits for your check.</span><span style="margin-left:auto" class="row"><button class="btn small" data-act="flag">Something's wrong</button><button class="btn small primary" data-act="confirm">Looks right</button></span></div>`}</div>
        </div>

        <div class="card pad">
          <div class="row between"><div class="eyebrow">Where this sits in Halden's playbook</div><button class="btn small" data-act="drawer" data-tab="playbook">Playbook clause</button></div>
          <div class="scale" style="margin-bottom:${sc.usual !== null ? "56px" : "18px"}">
            <div class="scale-track"><div></div><div></div><div></div></div>
            <div class="marker" style="left:${sc.ask}%"><span>Ridgeline's ask</span><span class="pin"></span></div>
            ${optPos[key] && key !== "accept" ? `<div class="marker" style="left:${optPos[key]}%;color:var(--accent)"><span>Your position</span><span class="pin" style="background:var(--accent)"></span></div>` : ""}
            ${sc.usual !== null ? `<div class="marker usual" style="left:${sc.usual}%"><span>${sc.usualLabel}</span></div>` : ""}
          </div>
          <div class="scale-labels"><div><b style="color:var(--red)">Below fallback</b><br>needs approval</div><div><b style="color:var(--amber)">Fallback</b><br>${esc(p.fallback)}</div><div><b style="color:var(--green)">Standard</b><br>${esc(p.standard)}</div></div>
          ${sc.usual === null ? `<div class="callout amber" style="margin-top:12px">${sc.usualLabel}. With thin evidence, Tradeline sends this to Legal by default.</div>` : ""}
        </div>

        <div class="card pad">
          <div class="eyebrow">What it could cost</div>
          <div class="row" style="gap:24px;margin-top:10px;align-items:flex-end">
            <div><div class="tiny muted">As written</div>${moneyCell(ew)}</div>
            <div class="muted">→</div>
            <div><div class="tiny muted">With your choice</div>${moneyCell(e)}</div>
            <div class="tiny muted" style="margin-left:auto;max-width:200px;text-align:right">${kindLabel(e.kind)}. ${esc(i.scenario)}.</div>
          </div>
          <div class="formula" style="margin-top:12px">${e.formula}</div>
          <div class="tiny muted" style="margin-top:8px">Exposure if the scenario happens, not a prediction. Inputs marked "assumed" are synthetic.</div>
        </div>
      </div>

      <div class="stack" style="position:sticky;top:84px">
        <div class="card pad" data-tour="rec">
          <div class="eyebrow">Recommendation</div>
          <h3 style="margin:6px 0 10px">${i.options[i.recommended].label}: ${esc(i.options[i.recommended].position)}</h3>
          <div class="small" style="color:var(--ink-2)">${esc(ai.precedentNote)}</div>
          <div class="row between wrap-row" style="margin-top:12px">${strength(ev)}<button class="btn small" data-act="drawer" data-tab="precedents">See the ${ev.n} deals →</button></div>
        </div>

        <div class="card pad" data-tour="options">
          <div class="eyebrow" style="margin-bottom:10px">Your decision</div>
          <div class="options">${optsHtml}</div>
          ${trade}
        </div>

        <div class="card pad" data-tour="authority">
          <div class="eyebrow">Who approves this</div>
          <div class="auth-q"><span class="tick ${inPlaybook ? "yes" : "no"}">${inPlaybook ? "✓" : "!"}</span><div><b>Inside Halden's playbook?</b><br><span class="small muted">${inPlaybook ? "Yes, within the playbook's limits." : "No. Below fallback, so it needs approval."} ${esc(pb(i.clause) ? pb(i.clause).tier : "")}</span></div></div>
          <div class="auth-q"><span class="tick ${evOk ? "yes" : "no"}">${evOk ? "✓" : "!"}</span><div><b>Enough evidence?</b><br><span class="small muted">${evOk ? `${ev.label} evidence from ${ev.n} similar deals.` : `Thin evidence (${ev.n} similar deal${ev.n === 1 ? "" : "s"}). Legal by default.`}</span></div></div>
          <div class="auth-q"><span class="tick ${comm.lane === "cpo" ? "cpo" : "yes"}">${comm.lane === "cpo" ? "↑" : "✓"}</span><div><b>Inside Maya's signing limit?</b><br><span class="small muted">${comm.lane === "cpo" ? `No. ${fmt(total())} total is above $1M, so the CPO signs the final contract. This issue can still be settled here.` : `Yes. ${fmt(total())} total is within her $1M limit.`}</span></div></div>
          <div class="divider" style="margin:12px 0"></div>
          ${st ? `<div class="row between"><span>${statusChip(st)}</span><button class="btn small" data-act="undo">Change decision</button></div>` :
            `<div class="row between wrap-row"><div class="small">This issue: <b>${TL.lanes[lane].who}</b></div>
            <button class="btn primary" data-act="decide" ${!confirmed && !S.flagged[i.id] ? 'title="Confirm the AI reading first"' : ""}>${lane === "maya" ? "Confirm decision" : `Send to ${TL.lanes[lane].short}`}</button></div>
            ${!confirmed && !S.flagged[i.id] ? `<div class="tiny muted" style="margin-top:8px">Check the AI's reading above first.</div>` : ""}`}
        </div>
      </div>
    </div>`;
  }

  // ---------- Evidence drawer ----------
  function drawer() {
    if (!S.drawer) return "";
    const i = issueById(S.drawer.issueId);
    const p = pb(i.clause);
    const ev = evidence(i.id);
    const tab = S.drawer.tab;
    const outcomeLabel = { none: "No later loss", loss: "Later cost money", recovered: "Protected Halden", unknown: "Outcome not recorded", ongoing: "Too early to tell", disputed: "Disputed" };
    let body = "";
    if (tab === "playbook") {
      body = `<div class="card pad">
        <div class="eyebrow">Halden playbook · maintained by Legal · this clause owned by ${esc(p.owner)}</div>
        <h3 style="margin:6px 0 14px">${p.name}</h3>
        <table class="simple"><tr><th>Standard</th><td>${esc(p.standard)}</td></tr><tr><th>Fallback</th><td>${esc(p.fallback)}</td></tr><tr><th>Walk-away</th><td>${esc(p.walkaway)}</td></tr><tr><th>Who decides</th><td>${esc(p.tier)}</td></tr><tr><th>How it's priced</th><td>${esc(p.formula)}</td></tr></table>
        <p class="tiny muted" style="margin-top:12px">Playbook structure (standard, fallback, walk-away, escalation tier) follows the industry pattern used by Ironclad, Spellbook and LegalOn.</p>
      </div>`;
    } else {
      body = `<div class="callout blue">Similarity is calculated, not guessed: 40% category, 30% deal size, 20% supplier leverage, 10% urgency. Deals scoring 70% or more count as similar.</div>
      <div style="margin-top:12px">${ev.list.map(({ p: x, sim }) => `<div class="prec" style="${sim.score < 0.7 ? "opacity:.62" : ""}">
        <div class="row between"><div><b>${x.supplier}</b> <span class="tiny muted">${x.id} · ${x.year} · ${x.category} · ${fmt(x.annual)}/yr</span></div><span class="chip ${sim.score >= 0.7 ? "blue" : "outline"}">${Math.round(sim.score * 100)}% similar</span></div>
        <div class="small" style="margin-top:8px"><span class="muted">Supplier asked:</span> ${esc(x.ask)}<br><span class="muted">Halden agreed:</span> <b>${esc(x.agreed)}</b> · ${x.rounds} round${x.rounds > 1 ? "s" : ""} · approved by ${esc(x.approver)}</div>
        <div class="tiny muted" style="margin-top:6px">Matched on: ${sim.matched.join(" · ")}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px">${sim.parts.map(([n, v]) => `<div><div class="tiny muted">${n}</div><div class="sim-bar"><div style="width:${Math.round(v * 100)}%"></div></div></div>`).join("")}</div>
        <div class="outcome ${x.outcome.type}"><b>${outcomeLabel[x.outcome.type]}:</b> ${esc(x.outcome.label)}</div>
        ${x.note ? `<div class="tiny muted" style="margin-top:8px">Note: ${esc(x.note)}</div>` : ""}
      </div>`).join("")}</div>`;
    }
    return `<div class="drawer-bg" data-act="drawer-close"><div class="drawer" data-stop="1">
      <div class="row between"><div class="eyebrow">Evidence · ${i.title}</div><button class="btn small" data-act="drawer-close">Close</button></div>
      <h2 style="margin-top:8px">${tab === "playbook" ? "What Halden's playbook says" : `${ev.n} similar past deal${ev.n === 1 ? "" : "s"}, ${ev.losses} later cost money`}</h2>
      <div class="tabs"><button class="${tab === "precedents" ? "on" : ""}" data-act="drawer" data-tab="precedents">Past deals (${ev.list.length})</button><button class="${tab === "playbook" ? "on" : ""}" data-act="drawer" data-tab="playbook">Playbook clause</button></div>
      ${body}
      <p class="tiny muted" style="margin-top:16px">All past deals are synthetic seed data for this prototype. In production, history comes from Halden's signed contracts and redline versions (for example via Sirion's Extraction Agent), and outcomes from post-signature records.</p>
    </div></div>`;
  }

  // ---------- Main render ----------
  function main() {
    if (S.view === "approvals") return TL.renderApprovals ? TL.renderApprovals() : "";
    if (S.view === "story") return TL.renderStory ? TL.renderStory() : "";
    if (S.view === "playbook") return TL.renderPlaybook ? TL.renderPlaybook() : "";
    switch (S.stage) {
      case "packet": return packet();
      case "review": return review();
      case "issue": return issueDetail();
      case "counter": return TL.renderCounter ? stepper() + TL.renderCounter() : "";
      case "round2": return TL.renderRound2 ? stepper() + TL.renderRound2() : "";
      case "agreed": return TL.renderAgreed ? stepper() + TL.renderAgreed() : "";
    }
    return "";
  }
  TL.stepper = stepper;

  function render() {
    const y = window.scrollY;
    document.getElementById("app").innerHTML = topbar() + `<div class="wrap">${main()}</div>` + drawer() + (TL.renderTour ? TL.renderTour() : "");
    if (TL.keepScroll) window.scrollTo(0, y);
    TL.keepScroll = false;
    if (TL.afterRender) TL.afterRender();
  }
  TL.render = render;

  // ---------- Events ----------
  document.addEventListener("click", (ev) => {
    const stop = ev.target.closest("[data-stop]");
    const el = ev.target.closest("[data-act]");
    if (!el) return;
    if (stop && el.dataset.act === "drawer-close" && !el.classList.contains("btn")) return;
    const a = el.dataset.act;
    const handlers = {
      view: () => { S.view = el.dataset.v; window.scrollTo(0, 0); },
      stage: () => {
        const s = el.dataset.s;
        if (s === "approvals") { S.view = "approvals"; window.scrollTo(0, 0); return; }
        if ((s === "round2" && !S.counterSent) || (s === "agreed" && !S.agreed)) { toast(s === "round2" ? "Send the counter-proposal first." : "Settle the supplier's reply first."); return; }
        S.view = "deal"; S.stage = s; window.scrollTo(0, 0);
      },
      "request-guide": () => { S.packetRequested = true; logIt("Maya", "Requested the missing Services Guide from Ridgeline"); toast("Request sent to Ridgeline"); },
      "start-review": () => { S.stage = "review"; S.packetContinued = true; window.scrollTo(0, 0); },
      term: () => {},
      lane: () => { const l = el.dataset.l; S.laneFilter = S.laneFilter === l || !l ? null : l; TL.keepScroll = true; },
      open: () => { S.issueId = el.dataset.id; S.stage = "issue"; window.scrollTo(0, 0); },
      back: () => { S.stage = "review"; S.issueId = null; },
      "greens-toggle": () => { S.greensOpen = !S.greensOpen; TL.keepScroll = true; },
      "greens-approve": () => { S.greensApproved = true; logIt("Maya", `Approved ${TL.greens.length} in-playbook clauses after reviewing each`); toast(`${TL.greens.length} clauses approved`); TL.keepScroll = true; },
      choose: () => { S.choice[S.issueId] = el.dataset.k; TL.keepScroll = true; },
      confirm: () => { S.confirmed[S.issueId] = true; logIt("Maya", `Confirmed the AI reading of "${issueById(S.issueId).title}"`); TL.keepScroll = true; },
      flag: () => { S.flagged[S.issueId] = true; logIt("Maya", `Flagged the AI reading of "${issueById(S.issueId).title}" for Legal`); toast("Flagged. Legal will check the reading."); TL.keepScroll = true; },
      decide: () => {
        const id = S.issueId;
        if (!S.confirmed[id] && !S.flagged[id]) { toast("Check the AI's reading first: confirm it or flag it."); TL.keepScroll = true; return; }
        const i = issueById(id);
        const k = S.choice[id];
        const lane = laneFor(i, k);
        if (lane === "maya") {
          S.status[id] = { state: "decided", lane, finalKey: k };
          logIt("Maya", `Decided "${i.title}": ${i.options[k].position}`);
          toast("Decision saved. It goes into the counter-proposal.");
        } else {
          S.status[id] = { state: "pending", lane, finalKey: k, alsoLane: i.options[k].alsoLane };
          logIt("Maya", `Sent "${i.title}" to ${TL.lanes[lane].short}: ${i.options[k].position}`);
          toast(`Sent to ${TL.lanes[lane].who}`);
        }
        S.stage = "review"; S.issueId = null; window.scrollTo(0, 0);
      },
      undo: () => { delete S.status[S.issueId]; TL.keepScroll = true; },
      drawer: () => { S.drawer = { issueId: S.issueId || (S.drawer && S.drawer.issueId), tab: el.dataset.tab }; TL.keepScroll = true; },
      "drawer-close": () => { S.drawer = null; TL.keepScroll = true; },
      reset: () => { S = fresh(); window.scrollTo(0, 0); toast("Demo reset"); },
      tour: () => { TL.startTour(S); },
    };
    if (handlers[a]) { handlers[a](); render(); }
    else if (TL.extraHandlers && TL.extraHandlers[a]) { TL.extraHandlers[a](el, S); render(); }
  });
  document.addEventListener("input", (ev) => {
    if (ev.target.dataset.act === "term") { S.term = +ev.target.value; TL.keepScroll = true; render(); const r = document.querySelector('[data-act="term"]'); if (r) r.focus(); }
  });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && S.drawer) { S.drawer = null; TL.keepScroll = true; render(); } });

  TL.boot = function () { if (TL.startTour) TL.startTour(S); render(); };
})();
