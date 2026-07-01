# AI Operations Workspace

AI-native operations product for partner lifecycle management.

**Current release:** Partner Onboarding Assistant — generates qualification checklists, onboarding plans, welcome emails, internal briefs, and risk flags from a single input.

**In development:** Operations Dashboard · Knowledge Generator

---

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ai-ops-workspace.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. No build settings needed (static + serverless)

### 3. Add environment variable

In Vercel project settings → Environment Variables:

```
ANTHROPIC_API_KEY = your_key_here
```

Get your key from [console.anthropic.com](https://console.anthropic.com)

### 4. Deploy

Click Deploy. Done.

---

## Project structure

```
ai-ops-workspace/
├── api/
│   └── generate.js       # Serverless function (Claude API proxy)
├── public/
│   └── index.html        # Frontend
├── vercel.json           # Routing config
└── package.json
```

---

## Built by

Haoran (Ran) Song · [ran-song.com](https://ran-song.com)
