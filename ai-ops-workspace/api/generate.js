export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const type = req.query.type || 'generate';

  if (type === 'package') {
    return handlePackage(req, res);
  }

  return handleGenerate(req, res);
}

async function handleGenerate(req, res) {
  const { company, country, industry, product, contact } = req.body;

  if (!company || !country) {
    return res.status(400).json({ error: 'Company and country are required' });
  }

  const prompt = `You are a senior partner operations manager evaluating a potential distributor partner. Analyse the partner details and generate a complete onboarding package with AI-assisted decision support. Return ONLY valid JSON with no markdown, no backticks, no preamble.

Partner details:
- Company: ${company}
- Country: ${country}
- Industry: ${industry || 'not specified'}
- Product line: ${product || 'not specified'}
- Primary contact: ${contact || 'not specified'}

Return this exact JSON structure:

{
  "decision_support": {
    "scores": {
      "qualification": <integer 0-100>,
      "compliance": <integer 0-100>,
      "operations": <integer 0-100>,
      "overall": <integer 0-100>
    },
    "recommendation": "approve" | "review" | "reject",
    "recommendation_text": "string (one action-oriented sentence starting with a verb)",
    "reasons": [
      {"flag": "string (5-8 words max)", "impact": "string (one short sentence)"},
      {"flag": "string", "impact": "string"},
      {"flag": "string", "impact": "string"}
    ],
    "confidence": <integer 0-100>,
    "confidence_note": "string (max 8 words)",
    "time_saved_minutes": <integer 90-180>
  },
  "internal_summary": {
    "legal": {
      "owner": "Legal",
      "status": "Pending" | "Action Required" | "Cleared",
      "items": [
        {"label": "string", "value": "string", "status": "ok" | "warning" | "required"}
      ]
    },
    "accounting": {
      "owner": "Accounting",
      "status": "Pending" | "Action Required" | "Cleared",
      "items": [
        {"label": "string", "value": "string", "status": "ok" | "warning" | "required"}
      ]
    },
    "logistics": {
      "owner": "Logistics",
      "status": "Pending" | "Action Required" | "Cleared",
      "items": [
        {"label": "string", "value": "string", "status": "ok" | "warning" | "required"}
      ]
    },
    "sales": {
      "owner": "Sales",
      "status": "Pending" | "Action Required" | "Cleared",
      "items": [
        {"label": "string", "value": "string", "status": "ok" | "warning" | "required"}
      ]
    }
  },
  "qualification": {
    "items": [
      {"section": "Business verification", "checks": ["string", "string", "string"]},
      {"section": "Financial standing", "checks": ["string", "string", "string"]},
      {"section": "Compliance & regulatory", "checks": ["string", "string", "string"]},
      {"section": "Distribution capacity", "checks": ["string", "string", "string"]}
    ]
  },
  "onboarding": {
    "phases": [
      {"phase": "Phase 1 — Qualification (Week 1–2)", "owner": "Partner Operations", "tasks": ["string", "string", "string"]},
      {"phase": "Phase 2 — Contract & setup (Week 3–4)", "owner": "Legal", "tasks": ["string", "string", "string"]},
      {"phase": "Phase 3 — Training & integration (Week 5–6)", "owner": "Partner Success", "tasks": ["string", "string", "string"]},
      {"phase": "Phase 4 — Go-live & review (Week 7–8)", "owner": "Sales", "tasks": ["string", "string", "string"]}
    ]
  },
  "email": {
    "subject": "string",
    "body": "string (full professional email body, 150-200 words)"
  },
  "risks": [
    {"level": "high", "flag": "string (4-6 words)", "impact": "string (one sentence)", "mitigation": "string (one sentence)", "owner": "Accounting" | "Legal" | "Logistics" | "Sales" | "Partner Operations" | "Partner Success", "priority": "Today" | "This week" | "Before go-live"},
    {"level": "medium", "flag": "string", "impact": "string", "mitigation": "string", "owner": "string", "priority": "string"},
    {"level": "medium", "flag": "string", "impact": "string", "mitigation": "string", "owner": "string", "priority": "string"},
    {"level": "low", "flag": "string", "impact": "string", "mitigation": "string", "owner": "string", "priority": "string"}
  ]
}

Scoring: qualification=business verifiability, compliance=regulatory complexity, operations=operational readiness. overall=weighted avg (qual 30%, compliance 35%, ops 35%). recommendation: approve>=80, review 60-79, reject<60. Internal summary status: "Action Required" if any item is required/warning, "Cleared" if all ok, else "Pending".`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'API error' });

    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    parsed._meta = {
      generated_at: new Date().toISOString(),
      model: 'claude-sonnet-4-6',
      version: '1.0',
      status: 'pending_review'
    };

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function handlePackage(req, res) {
  const { company, country, data } = req.body;
  if (!data) return res.status(400).json({ error: 'No package data provided' });

  const d = data;
  const ds = d.decision_support || {};
  const sc = ds.scores || {};
  const now = new Date();
  const timeStr = now.toISOString().replace('T',' ').substring(0,16) + ' UTC';
  const safeCompany = (company||'partner').replace(/[^a-zA-Z0-9\s]/g,' ').trim();

  const frontmatter = (title) =>
`---
Partner: ${safeCompany}
Country: ${country||''}
Document: ${title}
Generated by: AI Operations Workspace
Model: claude-sonnet-4-6
Date: ${timeStr}
Status: Approved
---

`;

  const recLabel = ds.recommendation === 'approve' ? 'Approve Recommended'
    : ds.recommendation === 'review' ? 'Review Required' : 'Reject Recommended';

  const readme =
`# Partner Package — ${safeCompany}

| | |
|---|---|
| **Partner** | ${safeCompany} |
| **Country** | ${country||''} |
| **Generated** | ${timeStr} |
| **AI Assessment** | ${sc.overall||'--'} / 100 |
| **Recommendation** | ${recLabel} |
| **Status** | Approved |

## What's in this package

| File | Contents |
|---|---|
| \`01_AI_Assessment.md\` | Readiness scores, confidence rating, and key findings |
| \`02_Qualification_Checklist.md\` | Due diligence checklist by category |
| \`03_Onboarding_Plan.md\` | Phased 8-week onboarding plan with owners |
| \`04_Internal_Brief.md\` | Team-level action items for Legal, Accounting, Logistics, Sales |
| \`05_Risk_Report.md\` | Risk register with impact, action, owner, and timeline |
| \`06_Welcome_Email.md\` | Draft welcome email ready for review and dispatch |

## Architecture

\`\`\`
Partner Information
        ↓
AI Assessment (claude-sonnet-4-6)
        ↓
Operational Review (Approve / Review / Reject)
        ↓
Partner Package Generated
        ↓
Implementation
\`\`\`

---
*This package was generated by AI Operations Workspace to support partner onboarding. Final onboarding decisions remain subject to organisational review and approval. All documents should be reviewed before external distribution.*

*AI Operations Workspace — [ai-ops-workspace.vercel.app](https://ai-ops-workspace.vercel.app)*
`;

  const assessment = frontmatter('AI Assessment Report') +
`# AI Assessment Report

## Readiness Score

| Dimension | Score | |
|---|---|---|
| Qualification | ${sc.qualification||'--'} / 100 | Business verifiability |
| Compliance | ${sc.compliance||'--'} / 100 | Regulatory complexity |
| Operations | ${sc.operations||'--'} / 100 | Operational readiness |
| **Overall** | **${sc.overall||'--'} / 100** | Weighted average |

**AI Confidence:** ${ds.confidence||'--'}%
**Reason:** ${ds.confidence_note||''}

## Recommendation

> ${ds.recommendation_text||''}

## Key Findings

${(ds.reasons||[]).map(r => {
  const flag = typeof r === 'string' ? r : (r.flag||'');
  const impact = typeof r === 'object' ? (r.impact||'') : '';
  return `### ⚠ ${flag}\n${impact ? `**Impact:** ${impact}` : ''}`;
}).join('\n\n')}

---
*AI-assisted assessment. Decision required before onboarding proceeds.*
`;

  let qual = frontmatter('Qualification Checklist') + '# Qualification Checklist\n\n';
  if (d.qualification && d.qualification.items) {
    d.qualification.items.forEach(section => {
      qual += `## ${section.section}\n\n`;
      (section.checks||[]).forEach(c => { qual += `- [ ] ${c}\n`; });
      qual += '\n';
    });
  }
  qual += '---\n*Complete all items before proceeding to contract stage.*\n';

  let plan = frontmatter('Onboarding Plan') + '# Onboarding Plan\n\n';
  if (d.onboarding && d.onboarding.phases) {
    d.onboarding.phases.forEach(phase => {
      plan += `## ${phase.phase}\n`;
      if (phase.owner) plan += `**Owner:** ${phase.owner}\n\n`;
      (phase.tasks||[]).forEach(t => { plan += `- [ ] ${t}\n`; });
      plan += '\n';
    });
  }
  plan += '---\n*Timeline subject to completion of qualification checklist.*\n';

  const teamLabels = { legal:'Legal', accounting:'Accounting', logistics:'Logistics', sales:'Sales' };
  const statusIcon = { ok:'✓', warning:'⚠', required:'!' };
  let brief = frontmatter('Internal Brief') + '# Internal Brief\n\n**For internal distribution only.**\n\n';
  if (d.internal_summary) {
    ['legal','accounting','logistics','sales'].forEach(t => {
      const team = d.internal_summary[t];
      if (!team) return;
      brief += `## ${teamLabels[t]}\n**Status:** ${team.status||'Pending'}\n\n`;
      (team.items||[]).forEach(item => {
        const icon = statusIcon[item.status] || '·';
        brief += `- ${icon} **${item.label}:** ${item.value}\n`;
      });
      brief += '\n';
    });
  }
  brief += '---\n*Distribute to team leads before onboarding kickoff.*\n';

  let risk = frontmatter('Risk Report') + '# Risk Report\n\n';
  if (d.risks && d.risks.length) {
    ['high','medium','low'].forEach(level => {
      const levelRisks = d.risks.filter(r => r.level === level);
      if (!levelRisks.length) return;
      risk += `## ${level.charAt(0).toUpperCase()+level.slice(1)} Priority\n\n`;
      levelRisks.forEach(r => {
        risk += `### ${r.flag}\n\n`;
        risk += `| | |\n|---|---|\n`;
        risk += `| **Impact** | ${r.impact||''} |\n`;
        risk += `| **Recommended action** | ${r.mitigation||''} |\n`;
        risk += `| **Owner** | ${r.owner||''} |\n`;
        risk += `| **Timeline** | ${r.priority||''} |\n\n`;
      });
    });
  }
  risk += '---\n*All high-priority risks must be resolved before contract stage.*\n';

  let email = frontmatter('Welcome Email') + '# Welcome Email\n\n';
  if (d.email) {
    email += `**Subject:** ${d.email.subject}\n\n---\n\n${d.email.body}\n`;
  }
  email += '\n---\n*Review and personalise before sending.*\n';

  res.status(200).json({
    company: safeCompany,
    generated_at: now.toISOString(),
    files: {
      'README.md': readme,
      '01_AI_Assessment.md': assessment,
      '02_Qualification_Checklist.md': qual,
      '03_Onboarding_Plan.md': plan,
      '04_Internal_Brief.md': brief,
      '05_Risk_Report.md': risk,
      '06_Welcome_Email.md': email,
    }
  });
}
