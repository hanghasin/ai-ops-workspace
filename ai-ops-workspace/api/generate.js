export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, country, industry, product, contact } = req.body;

  if (!company || !country) {
    return res.status(400).json({ error: 'Company and country are required' });
  }

  const prompt = `You are an expert partner operations manager. Generate a complete onboarding package for a new distributor partner. Return ONLY valid JSON with no markdown, no backticks, no preamble.

Partner details:
- Company: ${company}
- Country: ${country}
- Industry: ${industry || 'not specified'}
- Product line: ${product || 'not specified'}
- Primary contact: ${contact || 'not specified'}

Return this exact JSON structure:
{
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
    "body": "string (full email body, professional tone, 150-200 words)"
  },
  "brief": {
    "summary": "string (2-3 sentences)",
    "key_details": [
      {"label": "string", "value": "string"},
      {"label": "string", "value": "string"},
      {"label": "string", "value": "string"},
      {"label": "string", "value": "string"}
    ],
    "next_actions": [
      {"team": "string", "action": "string"},
      {"team": "string", "action": "string"},
      {"team": "string", "action": "string"}
    ]
  },
  "risks": [
    {"level": "high", "flag": "string", "mitigation": "string"},
    {"level": "medium", "flag": "string", "mitigation": "string"},
    {"level": "medium", "flag": "string", "mitigation": "string"},
    {"level": "low", "flag": "string", "mitigation": "string"}
  ]
}`;

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'API error' });
    }

    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
