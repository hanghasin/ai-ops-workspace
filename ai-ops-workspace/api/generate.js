export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    "recommendation_text": "string (one action-oriented sentence starting with a verb, e.g. 'Complete VAT verification before proceeding to legal review.' or 'Schedule compliance review before contract negotiation.')",
    "reasons": [
      {"flag": "string (5-8 words max)", "impact": "string (one short sentence)"},
      {"flag": "string", "impact": "string"},
      {"flag": "string", "impact": "string"}
    ],
    "confidence": <integer 0-100>,
    "confidence_note": "string (max 8 words, e.g. 'Limited operational data available.' or 'Strong market context, sparse financials.')",
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
    {
      "level": "high",
      "flag": "string (short title, 4-6 words)",
      "impact": "string (one sentence: what cannot proceed)",
      "mitigation": "string (one sentence: specific action)",
      "owner": "Accounting" | "Legal" | "Logistics" | "Sales" | "Partner Operations" | "Partner Success",
      "priority": "Today" | "This week" | "Before go-live"
    },
    {"level": "medium", "flag": "string", "impact": "string", "mitigation": "string", "owner": "string", "priority": "string"},
    {"level": "medium", "flag": "string", "impact": "string", "mitigation": "string", "owner": "string", "priority": "string"},
    {"level": "low", "flag": "string", "impact": "string", "mitigation": "string", "owner": "string", "priority": "string"}
  ]
}

Scoring: qualification=business verifiability, compliance=regulatory complexity, operations=operational readiness. overall=weighted avg (qual 30%, compliance 35%, ops 35%). recommendation: approve>=80, review 60-79, reject<60. confidence=how certain given info provided. time_saved_minutes=realistic estimate 90-180.
Internal summary status: "Action Required" if any item is required/warning, "Cleared" if all ok, else "Pending".
Reasons: short flag labels + one-line impact only. No paragraphs.`;

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
