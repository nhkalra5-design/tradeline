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
      ["IT Director wants it signed this month", "Halden needs protection", "Urgency is a visible input. The two worst past deals (Brightpath) were accepted under go-live deadlines."],
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
      <p class="principle" style="color:var(--ink-2)">AI reads and writes. The maths decides. People approve.</p>
      <p class="muted" style="max-width:680px">Tradeline helps a procurement manager review supplier changes and agree fair terms faster. It sits on top of Sirion's IssueDetection and Redline Agents, which find the issues and catch supplier edits, and adds the judgement procurement needs: what each change could cost, what Halden accepted before and how it turned out, and who is allowed to say yes.</p>
      <div class="row wrap-row" style="margin-top:18px"><button class="btn primary" data-act="view" data-v="deal">Open the Ridgeline deal</button><button class="btn" data-act="tour">Take the 1-minute tour</button></div>
    </div>

    <div class="story-sec"><div class="sec-num">01 · Why this stage</div>
      <h2 style="margin:8px 0 14px">The brief's after-signature failures are written at the negotiating table.</h2>
      <div class="grid2">
        <div><p>The brief names three costly outcomes: unreviewed auto-renewals, missed service levels and invoices that don't match agreed prices. Repository tools catch them after the fact. In every contract we read, the cause was a clause someone agreed to:</p>
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
            <tr><td>${tag("sourced")}</td><td>Job descriptions: senior procurement managers own sourcing and negotiation with Legal and Finance, usually without legal training.</td></tr>
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
      <h2 style="margin:8px 0 14px">Built on Sirion. Adds the judgement Procurement needs.</h2>
      <div class="grid4">
        <div class="card pad"><div class="eyebrow">Foundation · Sirion</div><h3 style="margin:6px 0">Review</h3><p class="small muted">Finds issues against the playbook and catches supplier edits, including untracked ones. Sirion's IssueDetection and Redline Agents do this today.</p></div>
        <div class="card pad"><div class="eyebrow">New</div><h3 style="margin:6px 0">Price tag</h3><p class="small muted">Dollar exposure per issue, with the formula shown. Costs and risks kept separate. Combination traps flagged.</p></div>
        <div class="card pad"><div class="eyebrow">New</div><h3 style="margin:6px 0">Owner</h3><p class="small muted">Two questions: inside Legal's playbook? Inside Maya's commercial limit? Thin evidence goes to Legal by default.</p></div>
        <div class="card pad"><div class="eyebrow">New</div><h3 style="margin:6px 0">Evidence</h3><p class="small muted">Past deals scored for similarity, shown with n and how they turned out. Two clicks from any recommendation.</p></div>
      </div>
      <div class="card pad" style="margin-top:16px"><div class="grid3">
        <div><div class="eyebrow">AI reads</div><p class="small">Extracts clause type and values from the supplier's text. Maya confirms before anything is routed.</p></div>
        <div><div class="eyebrow">AI writes</div><p class="small">Explains why past deals apply and where they differ; drafts reasons for the supplier and briefs for approvers.</p></div>
        <div><div class="eyebrow">Maths decides, people approve</div><p class="small">Dollars, similarity and authority are transparent code, so they're explainable and can't hallucinate. Every decision is a person's, and logged.</p></div>
      </div></div>
      <p class="tiny muted" style="margin-top:12px">Patterns adopted from industry tools rather than invented: standard / fallback / walk-away playbooks and escalation tiers (Ironclad, Spellbook, LegalOn), traffic-light status (Luminance), side-by-side clause and rule (LegalOn), confidence per item (Icertis). In production Tradeline would run inside Microsoft Word like those tools; this prototype runs on the web.</p>
    </div>

    <div class="story-sec"><div class="sec-num">05 · Success metrics</div>
      <h2 style="margin:8px 0 14px">Faster, without accepting worse terms</h2>
      <div class="grid3">
        <div class="card pad"><div class="eyebrow">North star</div><h3 style="margin:6px 0">Days from supplier paper to agreed terms</h3><p class="small muted">Median and 75th percentile, clock starting when the full packet arrives. Baseline about 35 working days ${tag("synthetic")}.</p></div>
        <div class="card pad"><div class="eyebrow">Guardrail</div><h3 style="margin:6px 0">Realised cost on terms Tradeline advised</h3><p class="small muted">Disputes, unrecovered losses and leakage on accepted terms, checked at 6 and 12 months. Speed must not come from accepting more risk.</p></div>
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
        <div class="card pad"><div class="eyebrow">What "fair" means here</div><p class="small" style="margin-top:8px">Every position sits inside Halden's playbook, applied the same way to every supplier in the category; every change goes to the supplier with a reason; and the give-and-get ledger shows what Halden gained against what it gave up.</p>
          <div class="eyebrow" style="margin-top:16px">Why one primary user</div><p class="small" style="margin-top:8px">Maya is the only person present at every step of a negotiation. Legal, Finance and the IT Director get focused approval views; the supplier gets reasoned proposals. Going deep on one user is what the brief asks for.</p></div>
      </div>
    </div>`;
  };

  TL.renderPlaybook = function () {
    const weights = [["Category", "40%"], ["Deal size", "30%"], ["Supplier leverage", "20%"], ["Urgency", "10%"]];
    return `<div class="row between wrap-row" style="margin-bottom:16px"><div><div class="eyebrow">Owned by Legal · read-only in this prototype</div><h1 style="margin-top:8px">Playbook and data</h1></div><span class="synthetic">Synthetic seed data</span></div>
    <div class="card pad"><div class="eyebrow">Halden's playbook</div>
      <table class="simple" style="margin-top:8px"><tr><th>Clause</th><th>Standard</th><th>Fallback</th><th>Walk-away</th><th>Who decides</th></tr>
      ${TL.playbook.map((p) => `<tr><td><b>${p.name}</b>${p.full ? "" : `<br><span class="tiny muted">matched only</span>`}</td><td>${esc(p.standard)}</td><td>${esc(p.fallback)}</td><td>${esc(p.walkaway)}</td><td class="small">${esc(p.tier)}</td></tr>`).join("")}</table></div>
    <div class="grid3" style="margin-top:16px">
      <div class="card pad"><div class="eyebrow">Approval limits</div><table class="simple" style="margin-top:8px"><tr><td>Buyers</td><td>Up to $100K total</td></tr><tr><td>Maya (Senior Procurement Manager)</td><td>Up to $1M total</td></tr><tr><td>CPO</td><td>Above $1M</td></tr></table><p class="tiny muted" style="margin-top:8px">Legal's playbook applies at any value.</p></div>
      <div class="card pad"><div class="eyebrow">How similarity is scored</div><table class="simple" style="margin-top:8px">${weights.map((w) => `<tr><td>${w[0]}</td><td>${w[1]}</td></tr>`).join("")}</table><p class="tiny muted" style="margin-top:8px">70% or more counts as similar. Evidence: 4+ similar deals = strong, 2 to 3 = some, 0 to 1 = thin (Legal by default).</p></div>
      <div class="card pad"><div class="eyebrow">Negotiation history</div><div class="kpi" style="margin-top:8px"><div class="label">Past negotiations in this demo</div><div class="val">${TL.precedents.length}</div><div class="sub">Rich records with notes, approvers and messy outcomes: some unknown, some ongoing, some disputed.</div></div></div>
    </div>`;
  };

  // ---------- Guided tour ----------
  const steps = [
    { t: "Meet Maya", b: "Senior Procurement Manager at Halden Systems. It's Monday. Ridgeline has sent a $1.44M managed IT contract, and the IT Director wants it signed this month. Maya isn't a lawyer, so today every unclear term goes to Legal and waits.", v: `<b>Today:</b> about 35 working days from supplier paper to agreed terms, and decisions made on calls that nobody records.` },
    { t: "First, check the whole packet", b: "Key terms often sit outside the main agreement. Tradeline reads every document Ridgeline sent and flags what's missing.", v: `<span class="chip red">Missing</span> Services Guide, referenced in the MSA<br><span class="chip amber" style="margin-top:6px">Found outside the MSA</span> The early termination fee is in the Order Form` },
    { t: "Every issue gets a price tag", b: "Issues are ranked by what they could cost, with the formula shown. Costs Halden locks in and risks if things go wrong are kept separate, never added together.", v: `<div class="row between"><span>Early termination fee</span><span class="money risk">$720K</span></div><div class="row between"><span>Liability cap</span><span class="money risk">$880K</span></div><div class="row between"><span>Price increases</span><span class="money cost">$103.2K</span></div>` },
    { t: "…and an owner", b: "Two questions decide who approves: is the position inside Legal's playbook, and inside Maya's commercial limit? Most issues Maya can close herself. Legal sees only what needs Legal. Try the term slider: at 3 years the deal goes to the CPO.", v: `<b>12 of 14</b> issues Maya can close herself · <b>1</b> Legal · <b>1</b> Finance<br><span class="small muted">As written, 3 would need Legal, 2 Finance and 1 the IT Director.</span>` },
    { t: "The evidence is two clicks away", b: "Each recommendation shows the playbook clause and similar past Halden deals: how similar, what was agreed, and how it turned out. When evidence is thin, Tradeline sends the issue to Legal instead of guessing.", v: `<b>4 similar deals</b>, 1 later cost money · Strong evidence<br><span class="small muted">The one deal that accepted a 3-month cap later left $210K unrecovered.</span>` },
    { t: "Then the whole negotiation, connected", b: "Approvals from Legal, Finance and the IT Director, a counter-proposal with reasons, Ridgeline's reply (including an untracked edit), a give-and-get ledger, and agreed terms with obligations handed on. Every demo figure is synthetic.", v: `<span class="principle" style="font-size:19px">AI reads and writes. The maths decides. People approve.</span>` },
  ];
  TL.renderTour = function () {
    const S = TL.S();
    if (S.tourStep === null || S.tourStep === undefined) return "";
    const s = steps[S.tourStep];
    const last = S.tourStep === steps.length - 1;
    return `<div class="tour-bg"><div class="tour">
      <div class="tour-top"><div class="row between"><div class="tour-dots">${steps.map((_, i) => `<span class="${i <= S.tourStep ? "on" : ""}"></span>`).join("")}</div><span class="tiny" style="opacity:.7">${S.tourStep + 1} of ${steps.length}</span></div>
        <div class="tiny" style="opacity:.7;margin-top:18px;letter-spacing:.08em;text-transform:uppercase">Tradeline · guided tour</div>
        <h2 style="margin-top:6px">${s.t}</h2></div>
      <div class="tour-body"><p style="margin:0">${s.b}</p><div class="tour-visual">${s.v}</div>
        <div class="row between" style="margin-top:18px"><button class="btn ghost small" data-act="tour-skip">Skip tour</button>
          <div class="row">${S.tourStep > 0 ? `<button class="btn small" data-act="tour-prev">Back</button>` : ""}<button class="btn primary" data-act="tour-next">${last ? "Start with Ridgeline's paper" : "Next"}</button></div></div>
      </div></div></div>`;
  };

  Object.assign(TL.extraHandlers, {
    "tour-next": (el, S) => { if (S.tourStep >= steps.length - 1) { S.tourStep = null; S.view = "deal"; S.stage = "packet"; window.scrollTo(0, 0); } else S.tourStep++; },
    "tour-prev": (el, S) => { S.tourStep = Math.max(0, S.tourStep - 1); },
    "tour-skip": (el, S) => { S.tourStep = null; },
  });
})();
