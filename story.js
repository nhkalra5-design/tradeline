// Tradeline: the story (brief's mandatory sections), playbook and data view, guided tour.
(function () {
  const fmt = TL.fmt, esc = TL.esc;

  const tag = (t) => `<span class="tag ${t}">${t}</span>`;

  TL.renderStory = function () {
    const stake = [
      ["MR", "", "Maya Reyes · Procurement (primary user)", "Close deals fast and save money, without taking risks she can't see.", "Owns the supplier relationship. Present at every step."],
      ["DO", "legal", "Daniel Okafor · Legal", "Protection, consistency, and seeing only what needs a lawyer.", "Owns the playbook. Approves anything below fallback."],
      ["PS", "finance", "Priya Shah · Finance", "Predictable costs, fair payment terms, time to dispute wrong invoices.", "Approves payment terms and price increases above the cap."],
      ["TB", "owner", "Tom Becker · IT Director (business owner)", "Service live this month; good service levels he can enforce.", "Decides service-quality trade-offs. Owns the budget."],
      ["AL", "cpo", "Ana Lindqvist · CPO", "Savings and control across 2,500 suppliers.", "Signs contracts above $1M total value."],
      ["RL", "", "Ridgeline · Supplier", "Its own paper accepted, a quick close, protection from open-ended risk.", "Gets reasons for every change, so it knows what's firm."],
    ];
    const conflicts = [
      ["Maya wants speed", "Legal wants control", "Tradeline lets Maya close what's inside the playbook; Legal sees everything she closed and can reopen it."],
      ["IT Director wants it signed this month", "Halden needs protection", "Urgency is a visible input. The two biggest past losses (Brightpath, P-102 and P-202) came from one deal accepted under a go-live deadline."],
      ["Maya is measured on savings", "Savings can hide risk", "Every trade shows the price gained next to the risk accepted. Trades that move legal risk need Legal and the IT Director."],
      ["Finance wants long dispute windows", "Ridgeline wants fast, final invoices", "Finance approves payment terms; the dispute window becomes an obligation with an owner."],
      ["Halden wants better terms", "Ridgeline wants a fair deal too", "Same playbook for every managed IT supplier, reasons attached, firm vs open points stated."],
    ];
    const week = [
      ["Mon 9:12 AM", "Ridgeline's MSA arrives without the Services Guide it relies on."],
      ["Mon 2:30 PM", "A liability cap of the greater of 3 months' fees or $10K. Normal? She can't tell, so the whole contract goes to Legal."],
      ["Mon to Thu", "4 working days in Legal's queue. The IT Director chases 3 times."],
      ["Thu 11:00 AM", "14 Legal comments, plus separate Finance flags on the late fee and dispute window."],
      ["Fri 4:45 PM", "She merges 3 marked-up Word versions into one reply, with no reasons."],
      ["Week 3", "Ridgeline edits the exit-fee clause without tracked changes."],
      ["Week 7", "She trades the exit fee for a 6% price cut on a call. Nothing is recorded."],
      ["Total", "About 35 working days from supplier paper to signature-ready."],
    ];
    return `<div class="story-hero">
      <div class="eyebrow">A prototype for the Sirion case · Stage chosen: Negotiation</div>
      <h1 style="margin:14px 0 16px">Every supplier change gets a price tag and an owner.</h1>
      <p class="principle" style="color:var(--ink-2)">AI reads and writes. The math decides. People approve.</p>
      <p class="muted" style="max-width:680px">Tradeline helps a procurement manager review supplier changes and agree fair terms faster. It sits on top of Sirion's IssueDetection and Redline Agents, which find the issues and catch supplier edits, and adds the judgment Procurement needs: what each change could cost, what Halden accepted before and how it turned out, and who is allowed to say yes.</p>
      <div class="row wrap-row" style="margin-top:18px"><button class="btn primary" data-act="view" data-v="deal">Open the Ridgeline deal</button><button class="btn" data-act="tour">Take the 1-minute tour</button></div>
    </div>

    <div class="story-sec"><div class="sec-num">01 · Why this stage</div>
      <h2 style="margin:8px 0 14px">The brief's after-signature failures are written at the negotiating table.</h2>
      <div class="grid2">
        <div><p>The brief names three costly outcomes: unreviewed auto-renewals, missed service levels and invoices that don't match agreed prices. Post-signature tools catch them after the fact. In the 4 contracts we read, each of these outcomes traced back to a clause agreed at signing:</p>
          <ul class="small" style="color:var(--ink-2)"><li>A SaaS contract where the first-year discount reverts to list price, plus up to 7% a year, with 90 days' notice to stop auto-renewal ${tag("observed")}</li><li>A managed IT contract where leaving early means paying every remaining month ${tag("observed")}</li><li>Invoice dispute windows of 15 to 180 days, after which the right to dispute is lost ${tag("observed")}</li><li>Service levels with wide exclusions and no credits ${tag("observed")}</li></ul>
          <p>Fixing them at negotiation prevents the leak instead of tracking it.</p></div>
        <div class="card pad"><div class="eyebrow">Why not the other two stages</div>
          <p class="small" style="margin:8px 0"><b>Intake</b> fixes lost requests, but not the brief's three named outcomes.</p>
          <p class="small" style="margin:8px 0"><b>Repository</b> finds problems in signed contracts, when they can no longer be changed.</p>
          <p class="small" style="margin:8px 0"><b>Negotiation</b> is the last point where terms can still be changed, and where Legal becomes the bottleneck for 2,500 suppliers.</p></div>
      </div>
    </div>

    <div class="story-sec"><div class="sec-num">02 · Stakeholder map</div>
      <h2 style="margin:8px 0 14px">Six parties, five real conflicts</h2>
      <div class="grid3">${stake.map((s) => `<div class="card stake"><div class="who"><div class="avatar ${s[1]}">${s[0]}</div><b class="small">${s[2]}</b></div><div class="small"><span class="muted">Wants:</span> ${s[3]}</div><div class="small" style="margin-top:4px"><span class="muted">Role in Tradeline:</span> ${s[4]}</div></div>`).join("")}</div>
      <div class="card pad" style="margin-top:16px"><div class="eyebrow">Where they conflict, and how Tradeline handles it</div>
        ${conflicts.map((c) => `<div class="conflict"><div><b>${c[0]}</b></div><div class="vs">vs</div><div><b>${c[1]}</b></div></div><div class="small muted" style="padding:0 0 10px;border-bottom:1px solid var(--line)">${c[2]}</div>`).join("")}
        <p class="tiny muted" style="margin:12px 0 0">Out of scope, stated openly: IT security and privacy review (a separate approval track for managed IT), and Maya's oversight of her junior buyers. Buyers' deals up to $100K would use the same lanes.</p>
      </div>
    </div>

    <div class="story-sec"><div class="sec-num">03 · The problem</div>
      <h2 style="margin:8px 0 14px">Maya negotiates legal terms without legal training, and every unclear term waits for Legal.</h2>
      <div class="grid2" style="align-items:start">
        <div class="card pad"><div class="eyebrow">Maya's week on one deal, today ${tag("synthetic")}</div>
          ${week.map((w) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line);align-items:flex-start"><span class="small mono" style="width:110px;flex:none;color:var(--muted)">${w[0]}</span><span class="small">${w[1]}</span></div>`).join("")}
        </div>
        <div class="card pad"><div class="eyebrow">How we know it's real</div>
          <table class="simple">
            <tr><td>${tag("observed")}</td><td>4 real supplier contracts read clause by clause (managed IT, staffing, SaaS, logistics): one-sided caps, full-term exit fees, short dispute windows, terms hidden in order forms and service guides, suppliers able to change terms after signing.</td></tr>
            <tr><td>${tag("sourced")}</td><td>Job descriptions: senior procurement managers own sourcing and negotiation with Legal and Finance, in roles that rarely list legal training as a requirement.</td></tr>
            <tr><td>${tag("sourced")}</td><td>Practitioners describe waiting on Legal, incomplete supplier packets, and "redline wars" from redlines without commercial context.</td></tr>
            <tr><td>${tag("sourced")}</td><td>Ironclad's 2025 benchmark: supplier agreements and MSAs take roughly 50 to 70 days to execute, with high Legal involvement.</td></tr>
            <tr><td>${tag("sourced")}</td><td>World Commerce &amp; Contracting: poor contract management erodes close to 9% of value.</td></tr>
            <tr><td>${tag("sourced")}</td><td>CCM Institute, Most Negotiated Terms 2026 (released by Sirion): only 16% of respondents believe they negotiate the right terms.</td></tr>
            <tr><td>${tag("inferred")}</td><td>Maya's week and the cost of each step are built from the sources above, not observed at a real company.</td></tr>
          </table>
        </div>
      </div>
    </div>

    <div class="story-sec"><div class="sec-num">04 · How it works</div>
      <h2 style="margin:8px 0 14px">Builds on Sirion. Adds the judgment Procurement needs.</h2>
      <div class="grid4">
        <div class="card pad"><div class="eyebrow">Foundation · Sirion</div><h3 style="margin:6px 0">Review</h3><p class="small muted">Finds issues against the playbook and catches supplier edits, including untracked ones. In production, Sirion's IssueDetection and Redline Agents handle this step.</p></div>
        <div class="card pad"><div class="eyebrow">New</div><h3 style="margin:6px 0">Price tag</h3><p class="small muted">Dollar exposure per issue, with the formula shown. Costs and risks kept separate. Combination traps flagged.</p></div>
        <div class="card pad"><div class="eyebrow">New</div><h3 style="margin:6px 0">Owner</h3><p class="small muted">Three checks: inside the playbook? Enough evidence? Inside Maya's signing limit? The last one decides who signs the final contract, not who settles the issue.</p></div>
        <div class="card pad"><div class="eyebrow">New</div><h3 style="margin:6px 0">Evidence</h3><p class="small muted">Past deals scored for similarity, shown with n and how they turned out. Two clicks from any recommendation.</p></div>
      </div>
      <div class="card pad" style="margin-top:16px"><div class="grid3">
        <div><div class="eyebrow">AI reads</div><p class="small">Extracts clause type and values from the supplier's text. Maya confirms before anything is routed.</p></div>
        <div><div class="eyebrow">AI writes</div><p class="small">Explains why past deals apply and where they differ; drafts reasons for the supplier and briefs for approvers.</p></div>
        <div><div class="eyebrow">Math decides, people approve</div><p class="small">Dollars, similarity and authority are transparent code, so they give the same answer every time and show their inputs. Every decision is a person's, and logged.</p></div>
      </div></div>
      <p class="tiny muted" style="margin-top:12px">Patterns adopted from industry tools rather than invented: standard / fallback / walk-away playbooks and escalation tiers (Ironclad, Spellbook, LegalOn), traffic-light status (Luminance), side-by-side clause and rule (LegalOn), confidence per item (Icertis). In production Tradeline would run inside Microsoft Word like those tools; this prototype runs on the web.</p>
    </div>

    <div class="story-sec"><div class="sec-num">05 · Success metrics</div>
      <h2 style="margin:8px 0 14px">Faster, without accepting worse terms</h2>
      <div class="grid3">
        <div class="card pad"><div class="eyebrow">North star</div><h3 style="margin:6px 0">Days from supplier paper to agreed terms</h3><p class="small muted">Median and 75th percentile, clock starting when the full packet arrives. Baseline about 35 working days ${tag("synthetic")}.</p></div>
        <div class="card pad"><div class="eyebrow">Guardrail</div><h3 style="margin:6px 0">Realized cost on terms Tradeline advised</h3><p class="small muted">Disputes, unrecovered losses and leakage on accepted terms, checked at 6 and 12 months. Speed must not come from accepting more risk.</p></div>
        <div class="card pad"><div class="eyebrow">Signals it's working</div><p class="small" style="margin-top:8px">Share of issues closed by Procurement · Legal queue time · rounds per deal · decision-log completeness · recommendation acceptance.</p></div>
      </div>
      <div class="card pad" style="margin-top:16px"><div class="eyebrow">What would make us rethink ${tag("synthetic")}</div>
        <table class="simple"><tr><th>Signal</th><th>Rethink if (proposed threshold)</th><th>Because</th></tr>
          <tr><td>Overrides of recommendations</td><td>Above 40%, or below 5%, in a quarter</td><td>Too high: not trusted. Too low: rubber-stamping.</td></tr>
          <tr><td>Guardrail cost</td><td>Above 1% of contract value on advised terms</td><td>Faster deals are costing money later.</td></tr>
          <tr><td>Legal escalations</td><td>Not down 30% after two quarters</td><td>The playbook or evidence isn't strong enough to let Procurement close.</td></tr>
          <tr><td>Rounds per deal</td><td>Not falling</td><td>Reasons aren't helping suppliers respond.</td></tr>
        </table>
      </div>
    </div>

    <div class="story-sec"><div class="sec-num">06 · Assumptions and definitions</div>
      <div class="grid2">
        <div class="card pad"><div class="eyebrow">Assumptions</div><ul class="small" style="margin:8px 0 0;padding-left:18px;color:var(--ink-2)">
          <li>Halden Systems, its people and every number are synthetic. Ridgeline's terms are modelled on a real managed IT services MSA.</li>
          <li>Halden has no contract tool today, so history would be built by extracting past signed contracts and redline versions from email and drives (for example with Sirion's Extraction Agent). Until it exists, Tradeline relies on the playbook and says the evidence is thin.</li>
          <li>Outcomes come from post-signature records (disputes, credits, exits). They are correlations from similar deals, not proof a clause caused a loss.</li>
          <li>Dollar figures are "if it happens" exposures with stated inputs, not forecasts.</li>
          <li>US company, US law. Approval limits by total contract value.</li></ul></div>
        <div class="card pad"><div class="eyebrow">What "fair" means here</div><p class="small" style="margin-top:8px">Every position sits inside Halden's playbook or is approved by its owner, applied the same way to every supplier in the category; every change goes to the supplier with a reason; and the give-and-get ledger shows what Halden gained against what it gave up.</p>
          <div class="eyebrow" style="margin-top:16px">Why one primary user</div><p class="small" style="margin-top:8px">Maya is the only person present at every step of a negotiation. Legal, Finance and the IT Director get focused approval views; the supplier gets reasoned proposals. Going deep on one user is what the brief asks for.</p></div>
      </div>
    </div>`;
  };

  TL.renderPlaybook = function () {
    const weights = [["Category", "40%"], ["Deal size", "30%"], ["Supplier leverage", "20%"], ["Urgency", "10%"]];
    return `<div class="row between wrap-row" style="margin-bottom:16px"><div><div class="eyebrow">Maintained by Legal, with Finance and IT owning their clauses · read-only in this prototype</div><h1 style="margin-top:8px">Playbook and data</h1></div><span class="synthetic">Synthetic seed data</span></div>
    <div class="card pad"><div class="eyebrow">Halden's playbook</div>
      <table class="simple" style="margin-top:8px"><tr><th>Clause</th><th>Standard</th><th>Fallback</th><th>Walk-away</th><th>Who decides</th></tr>
      ${TL.playbook.map((p) => `<tr><td><b>${p.name}</b>${p.full ? "" : `<br><span class="tiny muted">matched only</span>`}</td><td>${esc(p.standard)}</td><td>${esc(p.fallback)}</td><td>${esc(p.walkaway)}</td><td class="small">${esc(p.tier)}</td></tr>`).join("")}</table></div>
    <div class="grid3" style="margin-top:16px">
      <div class="card pad"><div class="eyebrow">Approval limits</div><table class="simple" style="margin-top:8px"><tr><td>Buyers</td><td>Up to $100K total</td></tr><tr><td>Maya (Senior Procurement Manager)</td><td>Up to $1M total</td></tr><tr><td>CPO</td><td>Above $1M</td></tr></table><p class="tiny muted" style="margin-top:8px">Halden's playbook applies at any value.</p></div>
      <div class="card pad"><div class="eyebrow">How similarity is scored</div><table class="simple" style="margin-top:8px">${weights.map((w) => `<tr><td>${w[0]}</td><td>${w[1]}</td></tr>`).join("")}</table><p class="tiny muted" style="margin-top:8px">70% or more counts as similar. Evidence: 4+ similar deals = strong, 2 to 3 = some, 0 to 1 = thin (Legal by default).</p></div>
      <div class="card pad"><div class="eyebrow">Negotiation history</div><div class="kpi" style="margin-top:8px"><div class="label">Past clause outcomes in this demo</div><div class="val">${TL.precedents.length}</div><div class="sub">Records from 8 past supplier deals, with notes, approvers and outcomes (some unknown, ongoing or disputed).</div></div></div>
    </div>`;
  };

  // ---------- Guided walkthrough: spotlights real UI, one step at a time ----------
  const go = (S, patch) => Object.assign(S, patch);
  const steps = [
    { t: "Tradeline in two minutes", b: "Maya Reyes, Senior Procurement Manager at Halden Systems, has Ridgeline Managed IT's contract: $480K a year for 3 years. Today every unclear term waits for Legal. Tradeline, a concept on Sirion's CLM, changes that.", before: (S) => go(S, { view: "deal", stage: "packet", issueId: null, drawer: null }) },
    { target: '[data-tour="packet"]', t: "First, check the whole packet", b: "Tradeline reads every document Ridgeline sent, not just the main agreement. The Order Form holds 2 of the 6 issues, and the missing Services Guide makes the service-level issue provisional.", before: (S) => go(S, { view: "deal", stage: "packet" }) },
    { target: '[data-tour="kpis"]', t: "Cost and risk, kept apart", b: "Left: cost exposure in the terms as written. Right: the biggest single risk if things go wrong. The two are never added. Crossed out is Ridgeline's draft; bold uses Maya's choices, preset to Tradeline's recommendations.", before: (S) => go(S, { view: "deal", stage: "review", laneFilter: null }) },
    { target: '[data-tour="lanes"]', t: "Every issue gets an owner", b: "Following Tradeline's recommendations, Maya closes 12 of 14 items herself: 4 issues plus 8 clauses that match the playbook. Legal gets one (thin evidence, below standard), Finance one (it owns payment terms).", before: (S) => go(S, { view: "deal", stage: "review" }) },
    { target: '[data-tour="slider"]', t: "Who signs depends on the total", b: "At 3 years the deal totals $1.44M, above Maya's $1M limit, so the CPO signs the final contract. Maya still settles the issues. Drag the slider after the tour: at 2 years ($960K) she signs.", before: (S) => go(S, { view: "deal", stage: "review" }) },
    { target: '[data-tour="issues"]', t: "Issues ranked by what they could cost", b: "Ranked by exposure as written, biggest first. Red marks the most serious terms, amber less serious. Each row shows its evidence and who can decide it. Next: Limitation of liability.", before: (S) => go(S, { view: "deal", stage: "review" }) },
    { target: '[data-tour="ai-read"]', t: "The AI reads, Maya checks", b: "AI pulls out the key terms and states the effect in plain English: Ridgeline's cap is $120K. Nothing is routed until Maya confirms the reading. If she flags it, the issue goes to Legal.", before: (S) => go(S, { view: "deal", stage: "issue", issueId: "liability_cap" }) },
    { target: '[data-tour="rec"]', t: "A recommendation, with its evidence", b: "Tradeline recommends 12 months' fees, based on 4 similar past Halden deals. The one that accepted 3 months, Brightpath, was left with $210K unrecovered after an outage. Each full record is one click away.", before: (S) => go(S, { view: "deal", stage: "issue", issueId: "liability_cap" }) },
    { target: '[data-tour="options"]', t: "Maya decides", b: "Four options, each with its exposure if things go wrong and who must approve it. Accepting as written needs Legal; the other three Maya can close herself. Exposure and routing follow fixed rules, not AI.", before: (S) => go(S, { view: "deal", stage: "issue", issueId: "liability_cap" }) },
    { target: '[data-tour="authority"]', t: "Who approves this, and why", b: "Two checks route the issue: is the position inside Halden's playbook, and is there enough evidence? With thin evidence, anything short of standard goes to Legal. The third check sets who signs the contract.", before: (S) => go(S, { view: "deal", stage: "issue", issueId: "liability_cap" }) },
    { target: '[data-tour="roles"]', t: "Approvers see only what needs them", b: "Legal, Finance and the IT Director each see only the items routed to them, with Maya's proposal, the exposure, the evidence and a short AI brief. Legal can also reopen any issue Maya closed.", before: (S) => { go(S, { view: "approvals", role: "legal" }); if (!S.status.unilateral_changes) { S.status.unilateral_changes = { state: "pending", lane: "legal", finalKey: "fallback" }; S.tourDemo = true; } } },
    { t: "Your turn", b: "Now you play Maya: decide the issues, approve as Legal and Finance, send the counter-proposal, handle Ridgeline's reply, including one untracked edit, and agree terms. All data is synthetic. Guided tour reopens this.", before: (S) => { clearDemo(S); go(S, { view: "deal", stage: "packet", issueId: null }); }, last: true },
  ];

  TL.renderTour = function () {
    const S = TL.S();
    if (S.tourStep === null || S.tourStep === undefined) return "";
    const s = steps[S.tourStep];
    const n = S.tourStep + 1;
    const nav = `<div class="row between" style="margin-top:16px"><button class="btn ghost small" data-act="tour-skip">Exit tour</button>
      <div class="row">${S.tourStep > 0 ? `<button class="btn small" data-act="tour-prev">Back</button>` : ""}<button class="btn primary small" data-act="tour-next">${s.last ? "Start negotiating" : "Next"}</button></div></div>`;
    const head = `<div class="row between"><span class="tl-count">Step ${n} of ${steps.length}</span><span class="tl-bar"><span style="width:${Math.round((n / steps.length) * 100)}%"></span></span></div>`;
    if (!s.target) {
      return `<div class="tl-block"></div><div class="tl-center"><div class="tl-tip tl-tip-center">${head}<h3 style="margin:12px 0 8px">${s.t}</h3><p class="small" style="margin:0;color:var(--ink-2)">${s.b}</p>${nav}</div></div>`;
    }
    return `<div class="tl-block"></div><div class="tl-spot" id="tl-spot"></div><div class="tl-tip" id="tl-tip" style="visibility:hidden">${head}<h3 style="margin:10px 0 6px">${s.t}</h3><p class="small" style="margin:0;color:var(--ink-2)">${s.b}</p>${nav}</div>`;
  };

  function place() {
    const S = TL.S();
    if (S.tourStep === null || S.tourStep === undefined) return;
    const s = steps[S.tourStep];
    if (!s.target) return;
    const el = document.querySelector(s.target), spot = document.getElementById("tl-spot"), tip = document.getElementById("tl-tip");
    if (!el || !spot || !tip) return;
    const r = el.getBoundingClientRect(), pad = 8, vw = window.innerWidth, vh = window.innerHeight;
    const top = Math.max(r.top - pad, 4), height = Math.min(r.height + pad * 2, vh - 8);
    Object.assign(spot.style, { top: top + "px", left: r.left - pad + "px", width: r.width + pad * 2 + "px", height: height + "px" });
    const tw = Math.min(360, vw - 24), th = tip.offsetHeight;
    let tt, tl;
    if (top + height + 14 + th < vh) { tt = top + height + 14; tl = r.left; }
    else if (top - 14 - th > 0) { tt = top - 14 - th; tl = r.left; }
    else if (r.right + 14 + tw < vw) { tt = Math.max(12, Math.min(vh - th - 12, r.top)); tl = r.right + 14; }
    else { tt = vh - th - 16; tl = vw - tw - 16; }
    tl = Math.max(12, Math.min(tl, vw - tw - 12));
    Object.assign(tip.style, { top: tt + "px", left: tl + "px", width: tw + "px", visibility: "visible" });
  }
  TL.afterRender = function () {
    const S = TL.S();
    if (S.tourStep === null || S.tourStep === undefined) return;
    const s = steps[S.tourStep];
    if (!s.target) return;
    const el = document.querySelector(s.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const fits = r.height < window.innerHeight * 0.55;
    if (r.top < 70 || r.bottom > window.innerHeight - 20) {
      const y = window.scrollY + r.top - (fits ? window.innerHeight * 0.18 : 80);
      window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
    }
    requestAnimationFrame(place);
  };
  window.addEventListener("resize", () => requestAnimationFrame(place));
  window.addEventListener("scroll", () => requestAnimationFrame(place), { passive: true });

  const show = (S, i) => { S.tourStep = i; steps[i].before && steps[i].before(S); };
  const clearDemo = (S) => { if (S.tourDemo) { delete S.status.unilateral_changes; S.tourDemo = false; } };
  const endTour = (S) => { clearDemo(S); S.tourStep = null; S.view = "deal"; S.stage = "packet"; S.issueId = null; };
  TL.startTour = (S) => { S.drawer = null; show(S, 0); window.scrollTo(0, 0); };
  Object.assign(TL.extraHandlers, {
    "tour-next": (el, S) => { if (S.tourStep >= steps.length - 1) { endTour(S); window.scrollTo(0, 0); } else show(S, S.tourStep + 1); },
    "tour-prev": (el, S) => { const to = Math.max(0, S.tourStep - 1); if (steps[to].target !== '[data-tour="roles"]') clearDemo(S); show(S, to); },
    "tour-skip": (el, S) => { endTour(S); },
  });
})();
