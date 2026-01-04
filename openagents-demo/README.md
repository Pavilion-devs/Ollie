# AgentAuth + OpenAgents Demo

Multi-agent security demonstration using the **OpenAgents framework**.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Next.js App (UI)                         │
│                                                          │
│    [Run Multi-Agent Demo] button                        │
│                 │                                        │
└─────────────────┼────────────────────────────────────────┘
                  │ calls
                  ▼
┌─────────────────────────────────────────────────────────┐
│           Python FastAPI + OpenAgents                    │
│                                                          │
│   ┌─────────────────┐     ┌─────────────────┐           │
│   │ ShoppingAgent   │     │ AnalyticsAgent  │           │
│   │ (WorkerAgent)   │────▶│ (WorkerAgent)   │           │
│   └────────┬────────┘     └────────┬────────┘           │
│            │                       │                     │
│            │ shares token          │ tries to use        │
│            │                       │                     │
└────────────┼───────────────────────┼─────────────────────┘
             │                       │
             │ calls                 │ calls
             ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│              AgentAuth API (Next.js)                     │
│                                                          │
│   /api/authorize  →  Issues token to agent_shopping     │
│   /api/purchase   →  Verifies agent identity            │
└─────────────────────────────────────────────────────────┘
```

## How It Works

1. **ShoppingAgent** (OpenAgents WorkerAgent) requests authorization from AgentAuth
2. **ShoppingAgent** makes a $20 purchase → **APPROVED** (agent identity matches)
3. **ShoppingAgent** shares token with **AnalyticsAgent**
4. **AnalyticsAgent** tries to use the token → **REJECTED** (wrong agent identity)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /agents/demo/run` | Run complete multi-agent demo |
| `GET /agents/shopping/authorize` | Shopping agent gets token & purchases |
| `GET /agents/analytics/attempt?token=xxx` | Analytics agent tries stolen token |
| `GET /agents/logs` | Get agent activity logs |
| `GET /health` | Health check |

## Running Locally

```bash
cd openagents-demo
pip install -r requirements.txt
export AGENTAUTH_API=http://localhost:3000  # Your Next.js app
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

## Testing

```bash
# Run the complete demo
curl http://localhost:8000/agents/demo/run
```

Expected response shows:
- Shopping agent authorized: ✅
- Shopping agent purchase: ✅ APPROVED
- Analytics agent attempt: ❌ BLOCKED

## Deploy to Zeabur

1. Create new Python service in Zeabur
2. Connect this directory
3. Set environment variable:
   ```
   AGENTAUTH_API=https://your-nextjs-app.zeabur.app
   ```
4. Deploy

## Calling from Next.js

```typescript
const AGENTS_API = process.env.NEXT_PUBLIC_AGENTS_API;

async function runMultiAgentDemo() {
  const response = await fetch(`${AGENTS_API}/agents/demo/run`);
  const result = await response.json();

  // result.logs contains step-by-step agent activity
  // result.security_test_passed indicates if token misuse was blocked
  return result;
}
```

## Built With

- **OpenAgents** - Multi-agent framework
- **FastAPI** - API backend
- **AgentAuth** - Token verification

Built for AI Build-Off 2025 - OpenAgents Track
