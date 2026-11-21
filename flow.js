// Tradeline: approvals, counter-proposal, supplier round 2, agreed summary.
(function () {
  const fmt = TL.fmt, esc = TL.esc;
  const D = TL.deal;
  const monthly = D.annual / 12;

  const stepperAt = (stage) => { const S = TL.S(); const s = S.stage; S.stage = stage; const h = TL.stepper(); S.stage = s; return h; };
  const laneName = (l) => TL.lanes[l].who;

  // ---------- Approvals inbox ----------
  TL.renderApprovals = function () {
    const S = TL.S();
    const role = S.role;
    const pending = TL.issues.filter((i) => {
      const st = S.status[i.id];
      if (!st || st.state !== "pending") return false;
      const need = [st.lane].concat(st.alsoLane ? [st.alsoLane] : []);
      return need.includes(role) && !(st.approvals && st.approvals[role]);
    });
    const r2pending = TL.round2.filter((r) => S.r2[r.issue] === "pending" && r.lane === role);
    const closedByMaya = TL.issues.filter((i) => S.status[i.id] && S.status[i.id].state === "decided");
    const anyPending = Object.values(S.status).some((s) => s.state === "pending");
    const counts = ["legal", "finance", "owner"].map((l) => {
      const n = TL.issues.filter((i) => { const st = S.status[i.id]; return st && st.state === "pending" && [st.lane, st.alsoLane].includes(l) && !(st.approvals && st.approvals[l]); }).length + TL.round2.filter((r) => S.r2[r.issue] === "pending" && r.lane === l).length;
      return [l, n];
    });
    const person = { legal: TL.people.legal, finance: TL.people.finance, owner: TL.people.owner }[role];

    const item = (i) => {
      const st = S.status[i.id];
      const k = st.finalKey;
      const e = TL.exposure(i, k);
      const ew = TL.exposure(i, "accept");
      const ai = TL.aiFor(i.id);
      const ev = TL.evidence(i.id);
      const dual = st.alsoLane ? `<div class="callout blue" style="margin-top:10px">Trades legal protection for price: needs both ${laneName(st.lane)} and ${laneName(st.alsoLane)}. ${st.approvals ? Object.keys(st.approvals).map((l) => `✓ ${TL.lanes[l].short} approved.`).join(" ") : ""}</div>` : "";
      return `<div class="inbox-item">
        <div class="row between wrap-row"><div class="row"><span class="dot ${i.light}"></span><b>${i.title}</b><span class="tiny muted">${D.supplier}</span></div>${TL.strength(ev)}</div>
        <div class="grid3" style="margin-top:12px">
          <div><div class="tiny muted">Ridgeline asked</div><div class="small">${esc(i.options.accept.position)}</div></div>
          <div><div class="tiny muted">Maya proposes</div><div class="small"><b>${esc(i.options[k].position)}</b></div></div>
          <div><div class="tiny muted">Exposure</div><div class="small">${e.value === null ? "Not priced" : `${fmt(ew.value)} → <b>${fmt(e.value)}</b>`}</div></div>
        </div>
        <div class="plain" style="margin-top:12px"><span class="tiny muted">AI brief for you</span><br>${esc(ai.brief)}</div>
        ${dual}
        <div class="row wrap-row" style="margin-top:12px">
          <button class="btn primary small" data-act="approve" data-id="${i.id}">Approve</button>
          <button class="btn small" data-act="sendback" data-id="${i.id}">Send back to Maya</button>
          <button class="btn small ghost" data-act="evidence" data-id="${i.id}">See evidence</button>
        </div>
      </div>`;
    };
    const r2item = (r) => {
      const i = TL.issueById(r.issue);
      return `<div class="inbox-item">
        <div class="row between wrap-row"><div class="row"><span class="chip ${r.response === "untracked" ? "red" : "amber"}">${r.response === "untracked" ? "Untracked change in round 2" : "Supplier counter in round 2"}</span><b>${i.title}</b></div></div>
        <p class="small" style="margin:10px 0 4px">${esc(r.text)}</p>
        <p class="tiny muted" style="margin:0">${esc(r.note)}</p>
        <div class="row wrap-row" style="margin-top:12px">
          ${r.issue === "exit_fee" ? `<button class="btn primary small" data-act="r2-legal" data-v="hold">Reject 180 days, hold at 120</button><button class="btn small" data-act="r2-legal" data-v="accept">Accept 180 days as an exception</button>` : ""}
          ${r.issue === "sla_credits" ? `<button class="btn primary small" data-act="r2-owner" data-v="accept">Accept 3% with the exclusion</button><button class="btn small" data-act="r2-owner" data-v="hold">Hold at 5% credits</button>` : ""}
        </div>
      </div>`;
    };

    return `${stepperAt("approvals")}
    <div class="row between wrap-row" style="margin-bottom:16px">
      <div><h1>Approvals</h1><p class="muted" style="margin:6px 0 0">Each approver sees only what needs them, with Maya's proposal, the exposure and the evidence.</p></div>
      <div class="role-switch" data-tour="roles">${counts.map(([l, n]) => `<button class="${role === l ? "on" : ""}" data-act="role" data-r="${l}"><span class="avatar ${l}" style="width:20px;height:20px;font-size:9px">${TL.people[l].initials}</span>${TL.lanes[l].label}${n ? ` · ${n}` : ""}</button>`).join("")}</div>
    </div>
    <div class="grid2" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);align-items:start">
      <div class="card">
        <div class="pad" style="padding-bottom:6px"><div class="row"><div class="avatar ${role}">${person.initials}</div><div><b>${person.name}</b><div class="tiny muted">${person.role} · viewing as ${TL.lanes[role].label}</div></div></div></div>
        ${pending.length + r2pending.length ? pending.map(item).join("") + r2pending.map(r2item).join("") : `<div class="pad"><h3>Nothing waiting for ${TL.lanes[role].label}</h3><p class="small muted">Items appear here when Maya sends them, or when Ridgeline's reply needs this approver.</p></div>`}
      </div>
      <div class="stack">
        ${role === "legal" ? `<div class="card pad"><div class="eyebrow">Closed by Procurement without you</div><p class="small muted" style="margin:6px 0 10px">Legal stays in control: every decision Maya made inside the playbook is visible, and can be reopened.</p>
          ${closedByMaya.length || S.greensApproved ? closedByMaya.map((i) => `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="small"><b>${i.title}</b><br><span class="muted">${esc(i.options[S.status[i.id].finalKey].position)}</span></div><button class="btn small" data-act="reopen" data-id="${i.id}">Reopen</button></div>`).join("") + (S.greensApproved ? `<div class="small muted" style="padding:8px 0">${TL.greens.length} in-playbook clauses approved in one batch, each shown before approval.</div>` : "") : `<p class="small muted">Nothing closed yet.</p>`}
        </div>` : ""}
        <div class="card pad"><div class="eyebrow">Where Maya is</div>
          <p class="small" style="margin:8px 0 12px">${anyPending ? "Waiting on approvals before the counter-proposal can go out." : S.counterSent ? "Counter-proposal sent. Ridgeline's reply is in." : "Everything is approved or decided. Maya can send the counter-proposal."}</p>
          <button class="btn ${anyPending ? "" : "primary"}" data-act="to-counter">${S.counterSent ? "Back to supplier's reply →" : "Back to Maya: counter-proposal →"}</button>
        </div>
      </div>
    </div>`;
  };

  // ---------- Counter-proposal ----------
  TL.renderCounter = function () {
    const S = TL.S();
    const missing = TL.issues.filter((i) => !S.status[i.id] || !["decided", "approved"].includes(S.status[i.id].state));
    if (missing.length || !S.greensApproved) {
      return `<div class="card pad"><h2>Not ready to send yet</h2><p class="muted">The counter-proposal is built from decided and approved issues.</p>
        ${missing.map((i) => `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span>${i.title}</span><span>${S.status[i.id] ? TL.statusChip(S.status[i.id]) : `<span class="chip outline">No decision yet</span>`}</span></div>`).join("")}
        ${!S.greensApproved ? `<div class="row between" style="padding:10px 0"><span>${TL.greens.length} in-playbook clauses</span><span class="chip outline">Not approved yet</span></div>` : ""}
        <div class="row" style="margin-top:16px"><button class="btn primary" data-act="stage" data-s="review">Back to issues</button><button class="btn" data-act="stage" data-s="approvals">Open approvals</button></div></div>`;
    }
    const rows = TL.issues.map((i) => {
      const k = S.status[i.id].finalKey;
      const firm = k === "fallback" || k === "trade";
      return `<div style="padding:16px 0;border-bottom:1px solid var(--line)">
        <div class="row between wrap-row"><b>${i.title} <span class="tiny muted">${D.documents.find((d) => d.id === i.source.doc).name.split(" #")[0]} ${i.source.section}</span></b><span class="chip ${firm ? "red" : "blue"}">${firm ? "Firm" : "Open to discussion"}</span></div>
        <div class="small" style="margin-top:6px"><span class="muted">Halden proposes:</span> <b>${esc(i.options[k].position)}</b></div>
        <div class="small" style="margin-top:6px;color:var(--ink-2)"><span class="muted">Why:</span> ${k === i.recommended ? esc(TL.ai[i.id].supplierReason) : k === "accept" ? "Accepted as Ridgeline wrote it." : "<i>Maya adds the reason for this position before sending. The demo pre-writes reasons only for recommended positions.</i>"}</div>
      </div>`;
    }).join("");
    return `<div class="grid2" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);align-items:start">
      <div class="card pad">
        <div class="row between"><div class="eyebrow">Counter-proposal to Ridgeline · round 1</div><span class="cached-badge">Reasons drafted by AI for Maya to review</span></div>
        <h2 style="margin:8px 0 4px">Each change comes with a reason</h2>
        <p class="small muted" style="margin:0 0 6px">Redlines without commercial context drive extra rounds. Ridgeline sees what's firm and what's open.</p>
        ${rows}
        <div class="small muted" style="padding-top:14px">Plus ${TL.greens.length} clauses accepted as written.</div>
      </div>
      <div class="stack">
        <div class="card pad"><div class="eyebrow">Fair to both sides</div>
          <p class="small" style="margin:8px 0 0">"Fair" here means two things: every position is inside Halden's playbook or approved by its owner, applied the same way to every managed IT supplier, and each request has a reason Ridgeline can respond to.</p></div>
        <div class="card pad">${S.counterSent ? `<div class="callout green">Sent to Ridgeline. Their reply is in.</div><button class="btn primary" style="margin-top:12px" data-act="stage" data-s="round2">See Ridgeline's reply →</button>` : `<p class="small" style="margin:0 0 12px">Sending logs every position and reason in the deal history.</p><button class="btn primary" data-act="send-counter">Send to Ridgeline</button>`}</div>
      </div>
    </div>`;
  };

  // ---------- Round 2 ----------
  function finalFor(issueId) {
    const S = TL.S();
    const i = TL.issueById(issueId);
    const r = S.r2[issueId];
    const base = S.status[issueId] ? S.status[issueId].finalKey : i.recommended;
    const map = {
      liability_cap: r === "accepted" ? { key: "fallback", position: "6 months' fees" } : { key: base, position: i.options[base].position },
      exit_fee: r === "exception" ? { key: "fallback", override: { months: () => 6 }, position: "6 months' fees, 180 days' notice (exception)" } : { key: "fallback", position: "6 months' fees, 120 days' notice" },
      renewal_price: { key: "fallback", position: "3% cap, 60 days' notice" },
      payment_terms: { key: "fallback", position: "90-day dispute window, 1% late fee" },
      sla_credits: r === "accepted" ? { key: "fallback", override: { credit: 0.03 }, position: "3% credits, 45-day exclusion stays" } : { key: "standard", position: "5% credits, chronic-failure exit" },
      unilateral_changes: { key: "fallback", position: "Changes if not adverse, with exit right" },
    };
    return map[issueId];
  }
  TL.finalFor = finalFor;

  TL.renderRound2 = function () {
    const S = TL.S();
    const resolved = TL.round2.every((r) => ["accepted", "held", "approved", "exception"].includes(S.r2[r.issue]));
    const row = (r) => {
      const i = TL.issueById(r.issue);
      const st = S.r2[r.issue];
      const changed = r.response !== "accepted";
      const chip = r.response === "accepted" ? `<span class="chip green">Accepted</span>` : r.response === "untracked" ? `<span class="chip red">Untracked change</span>` : `<span class="chip amber">Countered</span>`;
      let action = "";
      if (r.response === "accepted") action = `<span class="status-done">✓ Agreed</span>`;
      else if (st === "accepted" || st === "held" || st === "approved" || st === "exception") action = `<span class="status-done">✓ Settled</span>`;
      else if (st === "pending") action = `<span class="chip ${r.lane === "legal" ? "purple" : "green"}">Waiting: ${TL.lanes[r.lane].short}</span>`;
      else if (r.lane === "maya") action = `<button class="btn small primary" data-act="r2-maya" data-id="${r.issue}" data-v="accept">Accept 6 months</button> <button class="btn small" data-act="r2-maya" data-id="${r.issue}" data-v="hold">Hold at 12</button>`;
      else action = `<button class="btn small primary" data-act="r2-route" data-id="${r.issue}">Send to ${TL.lanes[r.lane].short}</button>`;
      return `<div style="padding:16px 0;border-bottom:1px solid var(--line)">
        <div class="row between wrap-row"><div class="row">${chip}<b>${i.title}</b>${changed ? `<span class="chip blue">Re-judged</span>` : ""}</div><div class="row">${action}</div></div>
        <div class="small" style="margin-top:8px">${esc(r.text)}</div>
        ${changed ? `<div class="tiny muted" style="margin-top:4px">${esc(r.note)}${r.lane !== "maya" ? ` Owner: ${laneName(r.lane)}.` : ""}</div>` : ""}
      </div>`;
    };
    return `<div class="grid2" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);align-items:start">
      <div class="card pad">
        <div class="eyebrow">Ridgeline's reply · round 2</div>
        <h2 style="margin:8px 0 4px">Only what changed gets judged again</h2>
        <p class="tiny muted" style="margin:0 0 6px">Demo note: Ridgeline's reply is scripted against Tradeline's recommended positions.</p>
        <p class="small muted" style="margin:0 0 6px">Sirion's Redline Agent spots the supplier's edits, tracked or not. Tradeline re-prices and re-routes only those items.</p>
        ${TL.round2.map(row).join("")}
        <div class="row between" style="margin-top:16px"><span class="small muted">${resolved ? "Every item is settled." : "Settle each changed item. Some need an approver."}</span><button class="btn ${resolved ? "primary" : ""}" data-act="agree">Agree terms →</button></div>
      </div>
      <div class="card pad">${ledger()}</div>
    </div>`;
  };

  function ledger() {
    const S = TL.S();
    let given = 0, gained = 0, riskW = 0, riskF = 0;
    const rows = TL.issues.map((i) => {
      const f = finalFor(i.id);
      const ew = TL.exposure(i, "accept");
      const es = TL.exposure(i, "standard");
      const ef = TL.exposure(i, f.key, f.override);
      if (ew.value !== null) { if (ew.kind === "cost") { gained += ew.value - ef.value; given += Math.max(ef.value - es.value, 0); } else { riskW = Math.max(riskW, ew.value); riskF = Math.max(riskF, ef.value); } }
      return `<div class="ledger-row" style="grid-template-columns:minmax(0,1.3fr) 1fr 1fr">
        <div><b>${i.title}</b><div class="tiny muted">${esc(f.position)}</div></div>
        <div class="mono" style="color:var(--green)">${ew.value === null ? "Not priced" : "+" + fmt(ew.value - ef.value)}</div>
        <div class="mono" style="color:var(--red)">${ew.value === null ? "Not priced" : ef.value - es.value > 0 ? "−" + fmt(ef.value - es.value) : "None"}</div>
      </div>`;
    }).join("");
    return `<div class="eyebrow">Give and get</div>
      <h3 style="margin:6px 0 4px">What Halden gained and gave up</h3>
      <p class="tiny muted" style="margin:0 0 8px">Gained = exposure removed versus Ridgeline's first draft. Given = exposure accepted beyond Halden's own standard. Risks are "if it happens" scenarios, so they are never added to costs.</p>
      <div class="ledger-row ledger-head" style="grid-template-columns:minmax(0,1.3fr) 1fr 1fr"><div>Issue · current position</div><div>Gained</div><div>Given up</div></div>
      ${rows}
      <div class="grid2" style="margin-top:14px"><div class="kpi"><div class="label">Cost exposure removed</div><div class="val" style="color:var(--green)">${fmt(gained)}</div><div class="sub">Cost rows only. ${given > 0 ? fmt(given) + " accepted beyond standard." : "Nothing accepted beyond standard."}</div></div><div class="kpi"><div class="label">Biggest single risk</div><div class="val"><span class="strike">${fmt(riskW)}</span>${fmt(riskF)}</div><div class="sub">Not added to costs</div></div></div>
      <div class="small muted" style="margin-top:10px">Every agreed position is inside Halden's playbook or approved by its owner${S.r2.exit_fee === "exception" ? ", except one Legal exception (exit notice)" : ""}.</div>`;
  }

  // ---------- Agreed ----------
  TL.renderAgreed = function () {
    const S = TL.S();
    let costW = 0, costF = 0, riskW = 0, riskF = 0;
    TL.issues.forEach((i) => {
      const f = finalFor(i.id);
      const ew = TL.exposure(i, "accept"), ef = TL.exposure(i, f.key, f.override);
      if (ew.kind === "cost") { costW += ew.value; costF += ef.value; }
      if (ew.kind === "risk") { riskW = Math.max(riskW, ew.value); riskF = Math.max(riskF, ef.value); }
    });
    const appr = TL.dealApprover();
    const start = new Date(2027, 0, 1);
    const end = new Date(start); end.setFullYear(start.getFullYear() + S.term); end.setDate(end.getDate() - 1);
    const notice = new Date(end); notice.setDate(notice.getDate() - 60);
    const d = (x) => x.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const obligations = [
      ["Send non-renewal notice or renew on purpose", `By ${d(notice)} (60 days before term ends)`, "Maya Reyes"],
      ["Check each invoice against agreed prices", "Dispute within 90 days of each invoice", "Priya Shah (Finance)"],
      ["Confirm any price increase is 3% or less", "Each anniversary from Jan 2028", "Priya Shah (Finance)"],
      ["Claim service credits for missed months", "Monthly service review", "Tom Becker (IT Director)"],
      ["Review Services Guide updates; exit if adverse", "Within 30 days of each update", "Daniel Okafor (Legal)"],
    ];
    return `<div class="card pad" style="margin-bottom:16px">
      <div class="row between wrap-row"><div><div class="eyebrow">Agreed with Ridgeline · ready for signature</div><h1 style="margin-top:8px">Terms agreed in 9 working days (illustrative)</h1><p class="muted" style="margin:6px 0 0">Versus about 35 working days for a comparable deal today (synthetic baseline). Every decision was made by a person, with evidence.</p></div><span class="synthetic">Synthetic demo data</span></div>
      <div class="grid4" style="margin-top:18px">
        <div class="kpi"><div class="label">Cost exposure</div><div class="val"><span class="strike">${fmt(costW)}</span>${fmt(costF)}</div><div class="sub">Ridgeline's draft → agreed</div></div>
        <div class="kpi"><div class="label">Biggest single risk</div><div class="val"><span class="strike">${fmt(riskW)}</span>${fmt(riskF)}</div><div class="sub">Not added to costs</div></div>
        <div class="kpi"><div class="label">Issues closed by Procurement</div><div class="val">${TL.issues.filter((i) => S.status[i.id] && S.status[i.id].state === "decided").length + TL.greens.length} of ${TL.issues.length + TL.greens.length}</div><div class="sub">Legal saw only what needed Legal</div></div>
        <div class="kpi"><div class="label">Final signature</div><div class="val" style="font-size:20px;margin-top:8px">${appr.who.split(" (")[0]}</div><div class="sub">${fmt(TL.total())} total · ${appr.lane === "cpo" ? "above Maya's $1M limit" : "within Maya's limit"}</div></div>
      </div>
      <div class="row" style="margin-top:16px">${S.cpoSent ? `<div class="callout green">Sent to ${appr.who} for signature, with the decision log attached.</div>` : `<button class="btn primary" data-act="cpo">Send for signature</button>`}</div>
    </div>
    <div class="grid2" style="align-items:start">
      <div class="card pad"><div class="eyebrow">Obligations to watch · handed to the contract record</div>
        <p class="small muted" style="margin:6px 0 8px">The brief's after-signature failures (missed renewals, invoices that don't match, missed service levels) start here. Each obligation leaves the negotiation with a date and an owner.</p>
        <table class="simple"><tr><th>Obligation</th><th>When</th><th>Owner</th></tr>${obligations.map((o) => `<tr><td>${o[0]}</td><td>${o[1]}</td><td>${o[2]}</td></tr>`).join("")}</table>
        <div class="callout blue" style="margin-top:12px">Added to Halden's negotiation history as <b>P-701</b>, outcome pending. Outcomes are checked at 6 and 12 months, so future recommendations learn whether these terms held up.</div>
      </div>
      <div class="card pad"><div class="eyebrow">Decision log</div><p class="small muted" style="margin:6px 0 8px">Who decided what, and when. Nothing agreed on a call goes unrecorded.</p>
        ${S.log.map((l) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line);align-items:flex-start"><span class="tiny muted mono" style="width:58px;flex:none">${l.at}</span><span class="small"><b>${esc(l.who)}</b> · ${esc(l.what)}</span></div>`).join("")}
      </div>
    </div>`;
  };

  // ---------- Handlers ----------
  TL.extraHandlers = {
    role: (el, S) => { S.role = el.dataset.r; },
    approve: (el, S) => {
      const st = S.status[el.dataset.id];
      const i = TL.issueById(el.dataset.id);
      st.approvals = st.approvals || {};
      st.approvals[S.role] = true;
      const need = [st.lane].concat(st.alsoLane ? [st.alsoLane] : []);
      TL.logIt(TL.people[S.role].name, `Approved "${i.title}": ${i.options[st.finalKey].position}`);
      if (need.every((l) => st.approvals[l])) { st.state = "approved"; TL.toast(`Approved. Maya has been notified.`); }
      else TL.toast(`Approved by ${TL.lanes[S.role].short}. Waiting for ${need.filter((l) => !st.approvals[l]).map((l) => TL.lanes[l].short).join(", ")}.`);
    },
    sendback: (el, S) => {
      const st = S.status[el.dataset.id];
      const i = TL.issueById(el.dataset.id);
      st.state = "rejected"; st.lane = S.role;
      TL.logIt(TL.people[S.role].name, `Sent "${i.title}" back to Maya`);
      TL.toast("Sent back. Maya will choose another position.");
    },
    evidence: (el, S) => { S.drawer = { issueId: el.dataset.id, tab: "precedents" }; TL.keepScroll = true; },
    reopen: (el, S) => {
      const i = TL.issueById(el.dataset.id);
      delete S.status[el.dataset.id];
      TL.logIt("Daniel Okafor", `Reopened "${i.title}" for another look`);
      TL.toast("Reopened. It's back in Maya's list.");
    },
    "to-counter": (el, S) => {
      if (S.counterSent) { S.view = "deal"; S.stage = "round2"; window.scrollTo(0, 0); return; }
      S.view = "deal"; S.stage = "counter"; window.scrollTo(0, 0);
    },
    "send-counter": (el, S) => {
      S.counterSent = true;
      TL.logIt("Maya", "Sent the counter-proposal to Ridgeline with reasons for each change");
      TL.round2.forEach((r) => { if (r.response === "accepted") S.r2[r.issue] = "accepted"; });
      TL.logIt("Ridgeline", "Replied: 3 accepted, 2 countered, 1 changed without tracking");
      S.stage = "round2"; window.scrollTo(0, 0);
      TL.toast("Sent. Ridgeline replied.");
    },
    "r2-maya": (el, S) => {
      S.r2[el.dataset.id] = el.dataset.v === "accept" ? "accepted" : "held";
      TL.logIt("Maya", el.dataset.v === "accept" ? "Accepted Ridgeline's 6 months' fees liability cap (inside fallback)" : "Held the liability cap at 12 months' fees");
      TL.keepScroll = true;
    },
    "r2-route": (el, S) => {
      const r = TL.round2.find((x) => x.issue === el.dataset.id);
      S.r2[el.dataset.id] = "pending";
      TL.logIt("Maya", `Routed round-2 change on "${TL.issueById(r.issue).title}" to ${TL.lanes[r.lane].short}`);
      TL.toast(`Sent to ${TL.lanes[r.lane].who}. Switch to Approvals to act as them.`);
      TL.keepScroll = true;
    },
    "r2-legal": (el, S) => {
      S.r2.exit_fee = el.dataset.v === "hold" ? "approved" : "exception";
      TL.logIt("Daniel Okafor", el.dataset.v === "hold" ? "Rejected the untracked 180-day notice; held at 120 days" : "Accepted 180 days' notice as a logged exception");
      TL.toast("Decision sent back to Maya.");
    },
    "r2-owner": (el, S) => {
      S.r2.sla_credits = el.dataset.v === "accept" ? "accepted" : "held";
      TL.logIt("Tom Becker", el.dataset.v === "accept" ? "Accepted 3% credits with the 45-day exclusion" : "Held at 5% service credits");
      TL.toast("Decision sent back to Maya.");
    },
    agree: (el, S) => {
      const resolved = TL.round2.every((r) => ["accepted", "held", "approved", "exception"].includes(S.r2[r.issue]));
      if (!resolved) { TL.toast("Settle every changed item first."); TL.keepScroll = true; return; }
      S.agreed = true;
      TL.logIt("Maya", "Agreed final terms with Ridgeline");
      S.stage = "agreed"; window.scrollTo(0, 0);
    },
    cpo: (el, S) => { S.cpoSent = true; TL.logIt("Maya", `Sent the final contract to ${TL.dealApprover().who} for signature`); TL.keepScroll = true; },
  };
})();
