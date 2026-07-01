# AI Operations Workspace

**AI-assisted decision support for partner operations**

Live demo: [ai-ops-workspace.vercel.app](https://ai-ops-workspace.vercel.app)

---

## Problem

Manual partner onboarding is fragmented across Legal, Finance, Logistics, and Sales. Each team works from different documents, timelines, and criteria. There is no shared structure, no visibility into risk, and no clear record of who decided what and why.

The result: onboarding that should take four weeks takes eight. Risks surface late. Decisions get made without context.

---

## Solution

AI Operations Workspace structures the partner qualification and onboarding process into a single, consistent workflow. For each partner, it generates:

- An **AI readiness assessment** — scored across qualification, compliance, and operational dimensions, with an explicit confidence level and reasoning
- A **team-level internal brief** — Legal, Accounting, Logistics, and Sales each receive a specific action list with status
- A **risk register** — with impact, recommended action, owner, and timeline for each flag
- An **onboarding plan** — phased across eight weeks with team ownership per phase
- A **welcome email** — editable and ready to send on approval

The human makes the final call. The AI structures the information, surfaces the risks, and routes the next action to the right team.

---

## Design principles

**Human-in-the-loop.** Every package requires a human Approve / Review / Reject decision before any action is taken. The system is designed to support judgment, not replace it.

**Explainable AI.** Every score comes with a breakdown. Every recommendation includes a reason. Confidence is shown explicitly so reviewers know how much weight to give the assessment.

**Decision support, not decision replacement.** The output is not a chatbot response. It is a structured brief that mirrors how a senior operations manager would prepare a partner file for internal review.

**Operational transparency.** Every package carries an audit trail: generation time, model version, and current approval status. This reflects responsible AI practices for high-stakes operational decisions.

---

## Why I built this

This project draws directly from eight years of work across three roles:

**TradeBeyond (2019–2022):** Onboarded 5,000+ supplier organisations globally. Built the enablement programme — user guides, training materials, 60+ workshops — from scratch. Every output in this tool maps to something I did manually in that role.

**Sensible Lab (2022–present):** Delivered 15+ digital transformation projects for enterprise clients. Evaluated AI use cases for feasibility and business value. Led grant applications and regulatory documentation.

**ESCP thesis (2026):** *Algorithmic Shoving and Digital Power* — how platform governance and algorithmic design reshape user behaviour. The human-in-the-loop design and confidence transparency in this tool are a direct application of that research.

The tool is not a demo built for a job application. It is what I would have wanted at TradeBeyond.

---

## How to demo (5-minute walkthrough)

1. **Open the Partner tab.** Enter a company, country, and industry. Generate.

2. **Walk through AI Assessment.** Point to the four score bars. Explain: *"These aren't magic numbers. Qualification measures how verifiable the business is. Compliance reflects the regulatory complexity of the market. Confidence tells the reviewer how much to trust the assessment given what was provided."*

3. **Show Internal Summary.** Four team cards, each with a status badge and specific action items. Say: *"This is the first thing an ops manager would want to see — not a checklist, but a brief for each team."*

4. **Open Risk flags.** Walk through one card: impact, recommended action, owner, timeline. Say: *"The AI doesn't just identify the risk. It routes it — Legal owns this, Accounting owns that, and it needs to be resolved before go-live."*

5. **Show the Approve / Review / Reject buttons.** Say: *"The AI recommends, but the human decides. When you click Review, it routes you to the risk flags. When you click Approve, it routes you to the welcome email. The audit trail updates with the decision."*

6. **If asked why you didn't automate the approval:** *"Because onboarding decisions involve compliance, legal, and commercial risk. The system is designed to help humans make better decisions — not to remove humans from the process."*

---

## Technical stack

- **Frontend:** HTML / CSS / Vanilla JS — no framework, deployed on Vercel
- **API:** Vercel serverless function proxying Anthropic Claude API
- **Model:** claude-sonnet-4-6
- **Data:** No database — stateless, session-only

---

## Roadmap

- **Operations Dashboard** — partner health monitoring, order status, AI-generated daily briefings from CSV or CRM data
- **Knowledge Generator** — SOP, user guide, FAQ, and training material generation from project inputs
- **Approve & Send** — direct email dispatch on approval with delivery confirmation
- **Audit log persistence** — decision history stored per partner across sessions

---

Built by [Haoran (Ran) Song](https://ran-song.com) · June 2026
