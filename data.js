// Tradeline demo data. Every company, person, deal and number here is synthetic.
// Contract terms are modelled on real supplier contracts read during research (Forte Systems MSA,
// Atrium Staffing terms, Adverity MSA, Watco logistics terms) but the wording is our own.

window.TL = window.TL || {};

TL.company = {
  name: "Halden Systems",
  employees: 3000,
  suppliers: 2500,
  spend: 250000000,
};

TL.people = {
  maya: { name: "Maya Reyes", role: "Senior Procurement Manager", initials: "MR", lane: "maya" },
  legal: { name: "Daniel Okafor", role: "Senior Counsel", initials: "DO", lane: "legal" },
  finance: { name: "Priya Shah", role: "Finance Manager", initials: "PS", lane: "finance" },
  owner: { name: "Tom Becker", role: "IT Director (business owner)", initials: "TB", lane: "owner" },
  cpo: { name: "Ana Lindqvist", role: "Chief Procurement Officer", initials: "AL", lane: "cpo" },
  supplier: { name: "Ridgeline account team", role: "Supplier", initials: "RL", lane: "supplier" },
};

TL.lanes = {
  maya: { label: "You can close", short: "Maya", who: "Maya (Procurement)" },
  legal: { label: "Legal", short: "Legal", who: "Daniel Okafor (Legal)" },
  finance: { label: "Finance", short: "Finance", who: "Priya Shah (Finance)" },
  owner: { label: "Business owner", short: "IT Director", who: "Tom Becker (IT Director)" },
};

// Delegation of authority: by total contract value
TL.doa = [
  { max: 100000, who: "Buyer", lane: "buyer" },
  { max: 1000000, who: "Maya Reyes (Senior Procurement Manager)", lane: "maya" },
  { max: Infinity, who: "Ana Lindqvist (CPO)", lane: "cpo" },
];

TL.deal = {
  id: "ridgeline",
  supplier: "Ridgeline Managed IT",
  type: "Managed IT services",
  annual: 480000,
  defaultTerm: 3,
  leverage: "Medium",
  urgency: "High",
  context: "Renewal plus expansion with the incumbent provider. IT Director wants it signed this month.",
  received: "Mon 9:12 AM",
  documents: [
    { id: "msa", name: "Master Services Agreement", from: "Ridgeline", status: "received", pages: 14 },
    { id: "order", name: "Order Form #RL-2026-07", from: "Ridgeline", status: "received", pages: 3 },
    { id: "guide", name: "Services Guide (v4.2)", from: "Ridgeline", status: "missing", ref: "Referenced in MSA §2(b) and §6.1. Holds service levels, support hours and renewal mechanics." },
  ],
};

// Contexts used for precedent similarity
TL.categoryAffinity = {
  "Managed IT": { "Managed IT": 1, "IT staffing": 0.6, "SaaS": 0.45, "Facilities": 0.2 },
};

// ---------- Playbook (owned by Legal) ----------
TL.playbook = [
  {
    id: "liability_cap", name: "Limitation of liability", owner: "Legal",
    standard: "Cap at 12 months' fees", fallback: "Cap at 6 months' fees", walkaway: "Below 6 months' fees, Legal must approve",
    tier: "Procurement can agree standard or fallback. Anything lower goes to Legal.",
    formula: "Unrecovered loss = incident cost minus the cap", full: true,
  },
  {
    id: "exit_fee", name: "Early termination fee", owner: "Legal",
    standard: "Exit for convenience on 90 days' notice, fee up to 3 months' fees", fallback: "Fee up to 6 months' fees, notice up to 120 days", walkaway: "All remaining fees, or notice over 120 days",
    tier: "Procurement can agree standard or fallback. Beyond that, Legal and the business owner approve.",
    formula: "Exit cost = months of fees owed if you leave halfway through", full: true,
  },
  {
    id: "renewal_price", name: "Auto-renewal and price increases", owner: "Finance",
    standard: "No auto-renewal; prices fixed for the term", fallback: "Auto-renewal with 60 days' notice; increases capped at 3% a year", walkaway: "Increases above 8% a year, or notice over 120 days",
    tier: "Procurement can agree standard or fallback. Above the fallback cap, Finance approves.",
    formula: "Extra cost = yearly increases compounded over the term", full: true,
  },
  {
    id: "payment_terms", name: "Payment and invoice disputes", owner: "Finance",
    standard: "120-day dispute window; late fee 0.5% a month", fallback: "90-day dispute window; late fee 1% a month", walkaway: "Dispute window under 45 days",
    tier: "Finance approves any change to payment terms.",
    formula: "Lost money = billing errors found after the dispute window closes", full: true,
  },
  {
    id: "sla_credits", name: "Service levels and credits", owner: "Business owner",
    standard: "Service credits of 5% of the monthly fee per missed month; exit after 3 misses in 6 months", fallback: "Credits of 3% with chronic-failure exit", walkaway: "No service credits and no exit for chronic failure",
    tier: "The business owner decides trade-offs on service quality.",
    formula: "Credits forgone = missed months x credit rate x monthly fee", full: true,
  },
  {
    id: "unilateral_changes", name: "Supplier changes to terms after signing", owner: "Legal",
    standard: "Changes only by signed amendment", fallback: "Changes allowed if not materially adverse, with a right to exit without fee", walkaway: "Supplier can change terms by email with no exit right",
    tier: "Legal approves anything below standard.",
    formula: "Not priced: the impact depends on what the supplier later changes", full: true,
  },
  { id: "confidentiality", name: "Confidentiality", owner: "Legal", standard: "Mutual, 3 years after termination", fallback: "Mutual, 2 years", walkaway: "One-way in supplier's favour", tier: "Procurement can agree standard or fallback.", formula: "Not priced", full: false },
  { id: "governing_law", name: "Governing law", owner: "Legal", standard: "Delaware or New York", fallback: "California", walkaway: "Non-US law", tier: "Procurement can agree standard or fallback.", formula: "Not priced", full: false },
  { id: "data_location", name: "Data location", owner: "Legal", standard: "US data centres only", fallback: "US and EU", walkaway: "Unrestricted", tier: "Procurement can agree standard or fallback.", formula: "Not priced", full: false },
  { id: "assignment", name: "Assignment", owner: "Legal", standard: "Mutual consent, not unreasonably withheld", fallback: "Supplier may assign to affiliates", walkaway: "Supplier may assign freely", tier: "Procurement can agree standard or fallback.", formula: "Not priced", full: false },
];

// ---------- Precedents: ~30 past Halden negotiations (synthetic) ----------
// leverage = supplier's leverage over Halden; outcome.type: none | loss | recovered | unknown | ongoing | disputed
TL.precedents = [
  // Liability cap
  { id: "P-101", issue: "liability_cap", supplier: "Northwall Systems", category: "Managed IT", year: 2023, annual: 420000, term: 3, leverage: "Medium", urgency: "High", ask: "Greater of 3 months' fees or $25K", agreed: "6 months' fees", rounds: 3, approver: "Maya Reyes", outcome: { type: "none", label: "No claims in 3 years" }, note: "Supplier moved to 6 months once we showed it was our fallback for every managed IT deal." },
  { id: "P-102", issue: "liability_cap", supplier: "Brightpath Cloud Ops", category: "Managed IT", year: 2022, annual: 610000, term: 3, leverage: "High", urgency: "High", ask: "3 months' fees", agreed: "3 months' fees (exception)", rounds: 1, approver: "Daniel Okafor (exception under deadline)", outcome: { type: "loss", amount: 210000, label: "2024 outage: $210K unrecovered above the cap" }, note: "Accepted to meet a go-live date. Exception email from Legal, no trade recorded." },
  { id: "P-103", issue: "liability_cap", supplier: "Keystone Network Services", category: "Managed IT", year: 2024, annual: 350000, term: 2, leverage: "Medium", urgency: "Low", ask: "6 months' fees", agreed: "12 months' fees", rounds: 2, approver: "Maya Reyes", outcome: { type: "none", label: "No claims to date" }, note: "Competitive bid with two alternatives. Supplier conceded quickly." },
  { id: "P-104", issue: "liability_cap", supplier: "Halvard Managed Services", category: "Managed IT", year: 2025, annual: 500000, term: 3, leverage: "Medium", urgency: "High", ask: "3 months' fees", agreed: "9 months' fees plus a 2x cap for data breaches", rounds: 4, approver: "Daniel Okafor", outcome: { type: "ongoing", label: "Signed 2025, too early to judge" }, note: "Data-breach super-cap was the unlock. Took four rounds." },
  { id: "P-105", issue: "liability_cap", supplier: "Corbel IT Staffing", category: "IT staffing", year: 2022, annual: 900000, term: 2, leverage: "Low", urgency: "Medium", ask: "30% of fees paid", agreed: "6 months' fees", rounds: 2, approver: "Maya Reyes", outcome: { type: "disputed", label: "Claim open; unclear if the cap applies" }, note: "Claim relates to a contractor error. Attribution to the cap is disputed." },
  { id: "P-106", issue: "liability_cap", supplier: "Arcturus Data", category: "SaaS", year: 2023, annual: 180000, term: 1, leverage: "Low", urgency: "Medium", ask: "12 months' fees", agreed: "12 months' fees", rounds: 1, approver: "Buyer (J. Ortiz)", outcome: { type: "unknown", label: "No outcome data recorded" }, note: "Standard paper. No negotiation needed." },

  // Exit fee
  { id: "P-201", issue: "exit_fee", supplier: "Northwall Systems", category: "Managed IT", year: 2023, annual: 420000, term: 3, leverage: "Medium", urgency: "High", ask: "All remaining fees", agreed: "6 months' fees, 90 days' notice", rounds: 3, approver: "Maya Reyes", outcome: { type: "none", label: "Still in contract, no exit" }, note: "Traded against a 12-month minimum commitment." },
  { id: "P-202", issue: "exit_fee", supplier: "Brightpath Cloud Ops", category: "Managed IT", year: 2022, annual: 610000, term: 3, leverage: "High", urgency: "High", ask: "All remaining fees", agreed: "All remaining fees", rounds: 1, approver: "Daniel Okafor (exception)", outcome: { type: "loss", amount: 540000, label: "Exited 2024 after outages: paid $540K in remaining fees" }, note: "Same deal as P-102. Accepted under the same go-live deadline." },
  { id: "P-203", issue: "exit_fee", supplier: "Lumen Desk Support", category: "Managed IT", year: 2021, annual: 280000, term: 3, leverage: "Medium", urgency: "Medium", ask: "All remaining fees", agreed: "6 months' fees", rounds: 2, approver: "Maya Reyes", outcome: { type: "none", label: "Exited 2023 and paid $140K, as planned" }, note: "Exit fee worked as designed when we consolidated vendors." },
  { id: "P-204", issue: "exit_fee", supplier: "Halvard Managed Services", category: "Managed IT", year: 2025, annual: 500000, term: 3, leverage: "Medium", urgency: "High", ask: "9 months' fees", agreed: "3 months' fees, 90 days' notice", rounds: 4, approver: "Maya Reyes", outcome: { type: "ongoing", label: "Signed 2025" }, note: "Gave a longer notice period in exchange for the lower fee." },
  { id: "P-205", issue: "exit_fee", supplier: "Keystone Network Services", category: "Managed IT", year: 2024, annual: 350000, term: 2, leverage: "Medium", urgency: "Low", ask: "6 months' fees", agreed: "3 months' fees", rounds: 2, approver: "Maya Reyes", outcome: { type: "none", label: "No exit" }, note: "" },
  { id: "P-206", issue: "exit_fee", supplier: "Vantage Analytics", category: "SaaS", year: 2022, annual: 150000, term: 2, leverage: "High", urgency: "Medium", ask: "No exit for convenience", agreed: "No exit for convenience", rounds: 1, approver: "Buyer (J. Ortiz)", outcome: { type: "unknown", label: "No outcome data recorded" }, note: "" },

  // Renewal and price
  { id: "P-301", issue: "renewal_price", supplier: "Arcturus Data", category: "SaaS", year: 2023, annual: 180000, term: 1, leverage: "Low", urgency: "Medium", ask: "7% yearly, 90 days' notice", agreed: "3% cap, 60 days' notice", rounds: 2, approver: "Maya Reyes", outcome: { type: "none", label: "Renewed at +3% after review" }, note: "" },
  { id: "P-302", issue: "renewal_price", supplier: "Vantage Analytics", category: "SaaS", year: 2022, annual: 150000, term: 2, leverage: "High", urgency: "High", ask: "7% yearly, 90 days' notice", agreed: "As written", rounds: 1, approver: "Buyer (J. Ortiz)", outcome: { type: "loss", amount: 64000, label: "Missed the notice date: renewed at +7% for a tool being replaced" }, note: "Notice date lived in one buyer's inbox." },
  { id: "P-303", issue: "renewal_price", supplier: "Northwall Systems", category: "Managed IT", year: 2023, annual: 420000, term: 3, leverage: "Medium", urgency: "High", ask: "6% yearly, 90 days' notice", agreed: "3% cap, 60 days' notice", rounds: 3, approver: "Maya Reyes", outcome: { type: "none", label: "Increases applied as agreed" }, note: "" },
  { id: "P-304", issue: "renewal_price", supplier: "Keystone Network Services", category: "Managed IT", year: 2024, annual: 350000, term: 2, leverage: "Medium", urgency: "Low", ask: "5% yearly", agreed: "Capped at US CPI", rounds: 2, approver: "Priya Shah (Finance)", outcome: { type: "none", label: "No issues" }, note: "" },
  { id: "P-305", issue: "renewal_price", supplier: "Halvard Managed Services", category: "Managed IT", year: 2025, annual: 500000, term: 3, leverage: "Medium", urgency: "High", ask: "7% yearly, 90 days' notice", agreed: "4% cap, 60 days' notice", rounds: 4, approver: "Priya Shah (Finance)", outcome: { type: "ongoing", label: "Signed 2025" }, note: "Finance approved 4% because Halvard matched competitor pricing." },

  // Payment terms
  { id: "P-401", issue: "payment_terms", supplier: "Northwall Systems", category: "Managed IT", year: 2023, annual: 420000, term: 3, leverage: "Medium", urgency: "High", ask: "60-day dispute window", agreed: "90-day dispute window", rounds: 2, approver: "Priya Shah (Finance)", outcome: { type: "recovered", amount: 11000, label: "Disputed $11K of duplicate charges in time" }, note: "" },
  { id: "P-402", issue: "payment_terms", supplier: "Corbel IT Staffing", category: "IT staffing", year: 2022, annual: 900000, term: 2, leverage: "Low", urgency: "Medium", ask: "15-day dispute window", agreed: "30-day dispute window", rounds: 2, approver: "Priya Shah (Finance)", outcome: { type: "loss", amount: 18000, label: "$18K of overtime errors found after the window" }, note: "Weekly invoices made 30 days too short." },
  { id: "P-403", issue: "payment_terms", supplier: "Brightpath Cloud Ops", category: "Managed IT", year: 2022, annual: 610000, term: 3, leverage: "High", urgency: "High", ask: "60-day dispute window", agreed: "As written", rounds: 1, approver: "Priya Shah (Finance)", outcome: { type: "unknown", label: "No outcome data recorded" }, note: "" },
  { id: "P-404", issue: "payment_terms", supplier: "Keystone Network Services", category: "Managed IT", year: 2024, annual: 350000, term: 2, leverage: "Medium", urgency: "Low", ask: "45-day dispute window", agreed: "90-day dispute window", rounds: 1, approver: "Priya Shah (Finance)", outcome: { type: "none", label: "No disputes needed" }, note: "" },

  // SLA credits
  { id: "P-501", issue: "sla_credits", supplier: "Northwall Systems", category: "Managed IT", year: 2023, annual: 420000, term: 3, leverage: "Medium", urgency: "High", ask: "No service credits", agreed: "5% credits, chronic-failure exit", rounds: 3, approver: "IT Director", outcome: { type: "recovered", amount: 12600, label: "$12.6K in credits claimed in 2024" }, note: "" },
  { id: "P-502", issue: "sla_credits", supplier: "Brightpath Cloud Ops", category: "Managed IT", year: 2022, annual: 610000, term: 3, leverage: "High", urgency: "High", ask: "No service credits", agreed: "As written", rounds: 1, approver: "IT Director", outcome: { type: "loss", amount: 0, label: "2024 outages: no credits and no exit right" }, note: "Led to the costly exit in P-202." },
  { id: "P-503", issue: "sla_credits", supplier: "Lumen Desk Support", category: "Managed IT", year: 2021, annual: 280000, term: 3, leverage: "Medium", urgency: "Medium", ask: "3% credits", agreed: "3% credits", rounds: 1, approver: "IT Director", outcome: { type: "none", label: "No misses recorded" }, note: "" },
  { id: "P-504", issue: "sla_credits", supplier: "Halvard Managed Services", category: "Managed IT", year: 2025, annual: 500000, term: 3, leverage: "Medium", urgency: "High", ask: "45-day exclusion, no credits", agreed: "3% credits, 30-day exclusion", rounds: 4, approver: "IT Director", outcome: { type: "ongoing", label: "Signed 2025" }, note: "" },

  // Unilateral changes (deliberately thin)
  { id: "P-601", issue: "unilateral_changes", supplier: "Brightpath Cloud Ops", category: "Managed IT", year: 2022, annual: 610000, term: 3, leverage: "High", urgency: "High", ask: "Changes to service guide by email", agreed: "As written", rounds: 1, approver: "Daniel Okafor (exception)", outcome: { type: "disputed", label: "2024: support hours cut by a guide update; disputed" }, note: "" },
  { id: "P-602", issue: "unilateral_changes", supplier: "Arcturus Data", category: "SaaS", year: 2023, annual: 180000, term: 1, leverage: "Low", urgency: "Medium", ask: "Changes by notice", agreed: "Changes allowed with exit right", rounds: 1, approver: "Daniel Okafor", outcome: { type: "none", label: "No adverse changes" }, note: "" },
];

// ---------- The live deal's issues ----------
// lane = who must approve the chosen position. 'as written' approver shown for comparison.
TL.issues = [
  {
    id: "exit_fee", clause: "exit_fee", title: "Early termination fee",
    source: { doc: "order", section: "§4" }, light: "red",
    text: "If Client ends this Order before the end of the Term for any reason other than Provider's uncured material breach, Client shall pay all fees that would have been payable for the rest of the Term.",
    extract: { type: "Early termination fee", fields: [["Exit for convenience", "Not allowed without fee"], ["Fee owed", "100% of remaining fees"], ["Notice", "Not stated"]] },
    plain: "If Halden leaves early for any reason except Ridgeline's own breach, Halden pays every remaining month of the contract.",
    hiddenIn: "This term is in the Order Form, not the MSA. A review of the MSA alone would miss it.",
    kind: "risk",
    asWrittenLane: "legal",
    recommended: "fallback",
    options: {
      accept: { label: "Accept as written", position: "All remaining fees", lane: "legal", alsoLane: "owner", months: (term) => term * 6 },
      standard: { label: "Counter with our standard", position: "Exit on 90 days' notice, fee of 3 months' fees", lane: "maya", months: () => 3 },
      fallback: { label: "Counter with our fallback", position: "Exit on 120 days' notice, fee of 6 months' fees", lane: "maya", months: () => 6 },
      trade: { label: "Offer a trade", position: "Accept 9 months' fee in exchange for a 3% price cut", lane: "legal", alsoLane: "owner", months: () => 9, priceCut: 0.03 },
    },
    scenario: "If Halden leaves halfway through the term",
  },
  {
    id: "liability_cap", clause: "liability_cap", title: "Limitation of liability",
    source: { doc: "msa", section: "§9.2" }, light: "red",
    text: "Provider's total liability arising out of or relating to this Agreement shall not exceed the greater of (a) the fees paid by Client in the three (3) months before the claim, or (b) ten thousand dollars ($10,000).",
    extract: { type: "Limitation of liability", fields: [["Cap basis", "Greater of two amounts"], ["Amount A", "3 months' fees ($120K)"], ["Amount B", "$10,000"], ["Effective cap", "$120K"]] },
    plain: "The most Ridgeline would ever pay Halden for any failure is $120K, three months of fees.",
    kind: "risk",
    asWrittenLane: "legal",
    recommended: "standard",
    incident: 1000000,
    options: {
      accept: { label: "Accept as written", position: "3 months' fees ($120K)", lane: "legal", months: () => 3 },
      standard: { label: "Counter with our standard", position: "12 months' fees", lane: "maya", months: () => 12 },
      fallback: { label: "Counter with our fallback", position: "6 months' fees", lane: "maya", months: () => 6 },
      trade: { label: "Offer a trade", position: "9 months' fees plus a 2x cap for data breaches", lane: "maya", months: () => 9 },
    },
    scenario: "If a serious incident costs Halden $1M (assumed)",
  },
  {
    id: "renewal_price", clause: "renewal_price", title: "Auto-renewal and price increases",
    source: { doc: "order", section: "§2" }, light: "amber",
    text: "This Order renews automatically for successive twelve (12) month terms unless either party gives written notice of non-renewal at least ninety (90) days before the end of the then-current term. Provider may increase fees on each anniversary by up to seven percent (7%).",
    extract: { type: "Auto-renewal and price increase", fields: [["Renewal", "Automatic, 12 months"], ["Notice to stop it", "90 days"], ["Yearly increase", "Up to 7%"]] },
    plain: "Prices can rise 7% every year, and unless someone sends notice 90 days before the end, Halden is locked into another year at the higher price.",
    combo: "Harmless one by one, costly together: a yearly 7% rise, a 90-day notice window and a 12-month auto-renewal.",
    kind: "cost",
    asWrittenLane: "finance",
    recommended: "fallback",
    options: {
      accept: { label: "Accept as written", position: "7% a year, 90 days' notice", lane: "finance", rate: 0.07 },
      standard: { label: "Counter with our standard", position: "No auto-renewal; prices fixed for the term", lane: "maya", rate: 0 },
      fallback: { label: "Counter with our fallback", position: "3% cap a year, 60 days' notice, renewal reminder", lane: "maya", rate: 0.03 },
      trade: { label: "Offer a trade", position: "Accept 5% a year in exchange for a 3-year price lock on add-ons", lane: "finance", rate: 0.05 },
    },
    scenario: "Extra cost from yearly increases over the term",
  },
  {
    id: "payment_terms", clause: "payment_terms", title: "Payment and invoice disputes",
    source: { doc: "msa", section: "§5.3" }, light: "amber",
    text: "Client must notify Provider in writing of any disputed fees within sixty (60) days of the invoice date; fees not so disputed are deemed accepted. Late payments accrue interest at one percent (1%) per month.",
    extract: { type: "Payment terms", fields: [["Dispute window", "60 days"], ["After the window", "Charges deemed accepted"], ["Late fee", "1% a month"]] },
    plain: "Halden has 60 days to spot and dispute a wrong invoice. After that, the money is gone.",
    kind: "cost",
    asWrittenLane: "finance",
    recommended: "fallback",
    errorRate: 0.02,
    options: {
      accept: { label: "Accept as written", position: "60-day dispute window", lane: "finance", lostShare: 0.5 },
      standard: { label: "Counter with our standard", position: "120-day dispute window, 0.5% late fee", lane: "finance", lostShare: 0.1 },
      fallback: { label: "Counter with our fallback", position: "90-day dispute window, 1% late fee", lane: "finance", lostShare: 0.25 },
    },
    scenario: "If 2% of invoices carry errors (assumed) and errors found after the window are lost",
  },
  {
    id: "sla_credits", clause: "sla_credits", title: "Service levels and credits",
    source: { doc: "msa", section: "§6.1" }, light: "amber",
    provisional: true,
    text: "Provider will use commercially reasonable efforts to meet the response times in the Services Guide. Response obligations do not apply during scheduled maintenance, outages caused by Client or third parties, or the first forty-five (45) days of service. No service credits apply.",
    extract: { type: "Service levels", fields: [["Commitment", "Commercially reasonable efforts"], ["Exclusions", "Maintenance, client or third-party outages, first 45 days"], ["Service credits", "None"], ["Exit for chronic failure", "None"]] },
    plain: "If Ridgeline misses its response times, Halden gets no money back and no right to leave.",
    kind: "cost",
    asWrittenLane: "owner",
    recommended: "standard",
    missedMonths: 4,
    options: {
      accept: { label: "Accept as written", position: "No credits, no exit right", lane: "owner", credit: 0 },
      standard: { label: "Counter with our standard", position: "5% credits per missed month, exit after 3 misses in 6 months", lane: "maya", credit: 0.05 },
      fallback: { label: "Counter with our fallback", position: "3% credits, chronic-failure exit", lane: "maya", credit: 0.03 },
      trade: { label: "Offer a trade", position: "3% credits if Ridgeline drops the 45-day exclusion", lane: "owner", credit: 0.03 },
    },
    scenario: "If Ridgeline misses 4 months a year (assumed)",
  },
  {
    id: "unilateral_changes", clause: "unilateral_changes", title: "Supplier can change terms by email",
    source: { doc: "msa", section: "§2(c)" }, light: "red",
    text: "Provider may update the Services Guide from time to time by notice to Client by email. Updates take effect thirty (30) days after notice.",
    extract: { type: "Unilateral changes", fields: [["Who can change", "Ridgeline alone"], ["How", "Email notice"], ["Effective", "30 days after notice"], ["Halden's exit right", "None"]] },
    plain: "Ridgeline can change service levels or support hours after signing just by emailing Halden.",
    kind: "unpriced",
    asWrittenLane: "legal",
    recommended: "fallback",
    options: {
      accept: { label: "Accept as written", position: "Changes by email, no exit right", lane: "legal" },
      standard: { label: "Counter with our standard", position: "Changes only by signed amendment", lane: "maya" },
      fallback: { label: "Counter with our fallback", position: "Changes allowed if not materially adverse, with exit right", lane: "legal" },
    },
    scenario: "Not priced: the impact depends on what Ridgeline later changes",
  },
];

// In-playbook items: batch approve, each inspectable
TL.greens = [
  { id: "g1", title: "Confidentiality", source: "MSA §11", text: "Mutual confidentiality for 3 years after termination.", match: "Matches standard" },
  { id: "g2", title: "Governing law", source: "MSA §14.1", text: "Laws of the State of Delaware.", match: "Matches standard" },
  { id: "g3", title: "Data location", source: "MSA §8.4", text: "Client data stored in US data centres only.", match: "Matches standard" },
  { id: "g4", title: "Assignment", source: "MSA §14.3", text: "Neither party may assign without consent, not to be unreasonably withheld.", match: "Matches standard" },
  { id: "g5", title: "Notices", source: "MSA §14.5", text: "Notices by email with copy to the legal contact named in the Order.", match: "Matches standard" },
  { id: "g6", title: "Subcontracting", source: "MSA §3.4", text: "Provider remains responsible for subcontractors; Client notified of new ones.", match: "Matches standard" },
  { id: "g7", title: "Publicity", source: "MSA §14.8", text: "No use of Client's name or logo without written consent.", match: "Matches standard" },
  { id: "g8", title: "Force majeure", source: "MSA §13", text: "Mutual relief for events beyond reasonable control; termination after 30 days.", match: "Matches fallback" },
];

// ---------- Cached AI outputs (used when live AI is unavailable) ----------
TL.ai = {
  exit_fee: {
    precedentNote: "The closest deals are other managed IT contracts with medium supplier leverage. In 3 of 4 we moved the supplier from 'all remaining fees' to 3 to 6 months. The one time we accepted all remaining fees (Brightpath, P-202) we later exited after outages and paid $540K. That deal had higher supplier leverage and a go-live deadline, so it is similar but not identical.",
    supplierReason: "We need the ability to exit if the service doesn't work for us. We can accept a fee of six months' fees with 120 days' notice, which protects your planning while keeping the commitment fair for both sides.",
    brief: "Maya proposes a 9-month exit fee in exchange for a 3% price cut ($43K over 3 years). This is beyond the playbook fallback (6 months). Exit cost if Halden leaves halfway: $360K versus $240K at fallback.",
  },
  liability_cap: {
    precedentNote: "Of 5 comparable deals, 4 ended at 6 months' fees or higher. The only deal that accepted 3 months (Brightpath, P-102) later left $210K unrecovered after an outage. Keystone (P-103) got 12 months, but that was a competitive bid with low urgency, which is less like this deal.",
    supplierReason: "A cap of three months' fees doesn't reflect the impact a serious outage would have on our operations. Our standard for managed IT services is twelve months' fees, which we apply to all providers in this category.",
    brief: "Ridgeline wants a cap at 3 months' fees ($120K). Maya proposes our standard of 12 months. No Legal approval needed unless Ridgeline refuses to go above 6 months.",
  },
  renewal_price: {
    precedentNote: "In 3 of 5 comparable deals we capped increases at 3 to 4% with 60 days' notice. One SaaS deal accepted 7% and 90 days as written and later renewed by mistake for a tool being replaced, costing $64K (P-302).",
    supplierReason: "We can accept automatic renewal if increases are capped at 3% a year and the notice period is 60 days, with a reminder from your team 30 days before the date.",
    brief: "Ridgeline asks for up to 7% a year. Maya proposes a 3% cap and 60 days' notice, within the playbook fallback.",
  },
  payment_terms: {
    precedentNote: "Finance moved 3 of 4 comparable suppliers to a 90-day window. With Northwall (P-401), the longer window let us recover $11K of duplicate charges.",
    supplierReason: "Our accounts payable process reconciles invoices quarterly, so we need a 90-day window to raise any disputes. We're happy to keep your 1% late fee.",
    brief: "Ridgeline offers a 60-day dispute window. Maya proposes our fallback of 90 days and accepts the 1% late fee. Finance approves all payment-term changes.",
  },
  sla_credits: {
    precedentNote: "Every comparable managed IT deal that later had outages either had credits or regretted not having them. Brightpath (P-502) had no credits and no exit right, which led to the costly exit in P-202.",
    supplierReason: "Response times only matter if there's a consequence for missing them. We're asking for 5% service credits per missed month and a right to exit after 3 misses in 6 months.",
    brief: "Ridgeline offers no service credits. Maya recommends our standard. If you prefer, 3% credits are acceptable if the 45-day exclusion is dropped.",
  },
  unilateral_changes: {
    precedentNote: "Evidence is thin: only 2 past deals, and one of them is disputed. With so little to go on, Tradeline defaults to Legal.",
    supplierReason: "We can accept updates to the Services Guide if they don't reduce the service, with a right for us to exit without a fee if they do.",
    brief: "Ridgeline can change the Services Guide by email with no exit right. Only 2 precedents, one disputed, so this goes to Legal by default.",
  },
};

// ---------- Round 2: Ridgeline's reply (scripted) ----------
TL.round2 = [
  { issue: "liability_cap", response: "countered", text: "Ridgeline offers 6 months' fees.", newPosition: "6 months' fees", lane: "maya", note: "Within our fallback. You can accept." , months: 6},
  { issue: "exit_fee", response: "untracked", text: "Ridgeline accepted a 6-month fee, but the notice period was changed from 120 to 180 days without tracked changes.", newPosition: "6 months' fees, 180 days' notice", lane: "legal", note: "Untracked edit caught by the review foundation (Sirion Redline Agent). 180 days is beyond our walk-away, so this goes to Legal.", months: 6 },
  { issue: "renewal_price", response: "accepted", text: "Ridgeline accepted a 3% cap and 60 days' notice.", newPosition: "3% cap, 60 days' notice", lane: "maya", note: "Agreed." },
  { issue: "payment_terms", response: "accepted", text: "Ridgeline accepted a 90-day dispute window.", newPosition: "90-day dispute window", lane: "finance", note: "Agreed." },
  { issue: "sla_credits", response: "countered", text: "Ridgeline offers 3% credits if the 45-day exclusion stays.", newPosition: "3% credits, 45-day exclusion stays", lane: "owner", note: "A service trade-off. The IT Director decides." , credit: 0.03},
  { issue: "unilateral_changes", response: "accepted", text: "Ridgeline accepted changes only if not materially adverse, with Halden's exit right.", newPosition: "Changes if not adverse, with exit right", lane: "maya", note: "Agreed, as Legal approved." },
];
