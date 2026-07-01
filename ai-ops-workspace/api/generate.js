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
    "reasons": ["string", "string", "string"],
    "confidence": <integer 0-100>,
    "confidence_note": "string (one sentence explaining confidence level)"
  },
  "internal_summary": {
    "legal": {
      "items": [
        {"label": "string", "value": "string", "status": "ok" | "warning" | "required"}
      ]
    },
    "accounting": {
      "items": [
        {"label": "string", "value": "string", "status": "ok" | "warning" | "required"}
      ]
    },
    "logistics": {
      "items": [
        {"label": "string", "value": "string", "status": "ok" | "warning" | "required"}
      ]
    },
    "sales": {
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
      {"phase": "Phase 1 — Qualification (Week 1–2)", "tasks": ["string", "string", "string"]},
      {"phase": "Phase 2 — Contract & setup (Week 3–4)", "tasks": ["string", "string", "string"]},
      {"phase": "Phase 3 — Training & integration (Week 5–6)", "tasks": ["string", "string", "string"]},
      {"phase": "Phase 4 — Go-live & review (Week 7–8)", "tasks": ["string", "string", "string"]}
    ]
  },
  "email": {
    "subject": "string",
    "body": "string (full professional email body, 150-200 words)"
  },
  "risks": [
    {"level": "high", "flag": "string", "mitigation": "string"},
    {"level": "medium", "flag": "string", "mitigation": "string"},
    {"level": "medium", "flag": "string", "mitigation": "string"},
    {"level": "low", "flag": "string", "mitigation": "string"}
  ]
}

Scoring guidance:
- qualification: based on how verifiable the business details are given the country/industry context
- compliance: based on regulatory complexity of the country and industry
- operations: based on how operationally ready a typical partner in this segment would be
- overall: weighted average (qualification 30%, compliance 35%, operations 35%)
- confidence: how confident you are in this assessment given the information provided (lower if sparse details)
- recommendation: "approve" if overall >= 80, "review" if 60-79, "reject" if below 60

Internal summary guidance: generate 3 specific, actionable items per team based on the partner context. Use "ok" for standard items, "warning" for items needing attention, "required" for blockers.`;

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
        max_tokens: 3500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'API error' });
    }

    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    parsed._meta = {
      generated_at: new Date().toISOString(),
      model: 'claude-sonnet-4-6',
      status: 'awaiting_human_approval'
    };

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
