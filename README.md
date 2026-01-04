# AgentAuth

**Verifiable delegated authority for AI agents**

> **Live Demo:** [https://agentauth.zeabur.app](https://agentauth.zeabur.app)

In a world where AI agents act autonomously, merchants need to verify: who authorized this? what's the limit? who's liable? AgentAuth answers all three with JWT-based signed tokens that encode permissions, spending limits, and expiration times.

## Key Features

- **Agent Binding** - Tokens are cryptographically tied to specific agents, preventing token theft
- **Scope-Based Permissions** - Fine-grained control over what actions agents can take
- **Spending Limits** - Set maximum amounts for financial transactions
- **Time-Bound Authorization** - Tokens expire automatically
- **AI-Powered Authorization** - Natural language permission granting via OpenAI
- **Multi-Agent Security** - Tokens cannot be shared or stolen between agents

## Live Demo

- **Main App:** [https://agentauth.zeabur.app](https://agentauth.zeabur.app)
- **Multi-Agent Demo:** [https://agentauth.zeabur.app/demo](https://agentauth.zeabur.app/demo)
- **OpenAgents API:** [https://openagentsauth.zeabur.app](https://openagentsauth.zeabur.app)

## How It Works

```
┌─────────┐      ┌─────────┐      ┌──────────┐
│  USER   │─────▶│  AGENT  │─────▶│ MERCHANT │
│         │      │         │      │          │
└─────────┘      └─────────┘      └──────────┘
    │                                  │
    │ 1. Authorize                     │ 3. Verify Token
    │   - Set scopes                   │   - Check signature
    │   - Set limits                   │   - Validate scope
    │   - Get signed token             │   - Check amount <= limit
    │                                  │   - Verify agent identity
    └───────────┬──────────────────────┘
                │
           2. Agent carries
              signed JWT token
```

## Multi-Agent Security Demo

The `/demo` page showcases AgentAuth's agent binding feature:

1. **Shopping Agent** requests authorization and receives a token
2. **Shopping Agent** makes a $20 purchase → **APPROVED**
3. **Shopping Agent** shares token with **Analytics Agent**
4. **Analytics Agent** tries to use the token → **BLOCKED**

This demonstrates that tokens are bound to the issuing agent's identity - even with a valid token, another agent cannot impersonate the original.

## Quick Start

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

### Run Multi-Agent Demo Locally

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start OpenAgents service
cd openagents-demo
pip install -r requirements.txt
export AGENTAUTH_API=http://localhost:3000
python main.py
```

Then visit [http://localhost:3000/demo](http://localhost:3000/demo)

## API Endpoints

### POST /api/authorize

Generate a signed authorization token for an agent.

**Request:**
```json
{
  "principal": "user_123",
  "agent": "agent_shopping_assistant",
  "scope": ["cloud_purchase"],
  "limit": 50,
  "currency": "USD",
  "expiresInMinutes": 60
}
```

### POST /api/purchase

Verify a token and process a purchase request.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "item": "Cloud Credits",
  "amount": 20,
  "scope": "cloud_purchase",
  "requestingAgent": "agent_shopping_assistant"
}
```

### POST /api/parse-authorization

Parse natural language authorization into structured permissions (AI-powered).

**Request:**
```json
{
  "description": "Let my shopping assistant spend up to $50 on cloud services for the next hour"
}
```

## SDK Usage

```typescript
import { signToken, verifyToken } from '@/lib/agentauth';

// Sign a token
const token = signToken({
  principal: 'user_123',
  agent: 'agent_shopping_assistant',
  scope: ['cloud_purchase'],
  limit: 50,
  currency: 'USD',
  expiresAt: '2025-01-02T23:00:00.000Z',
});

// Verify a token with agent binding
const result = verifyToken(token, {
  requiredScope: 'cloud_purchase',
  amount: 20,
  requestingAgent: 'agent_shopping_assistant', // Must match token's agent
});

if (result.valid) {
  console.log('Authorized by:', result.payload.principal);
} else {
  console.log('Rejected:', result.reason);
}
```

## Architecture

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── authorize/      # Token generation
│   │   │   ├── purchase/       # Token verification
│   │   │   └── parse-authorization/  # AI parsing
│   │   ├── demo/              # Multi-agent demo page
│   │   └── page.tsx           # Landing page
│   └── lib/
│       ├── agentauth.ts       # Core SDK
│       └── types.ts           # TypeScript types
├── openagents-demo/           # Python/OpenAgents service
│   ├── main.py               # FastAPI backend
│   └── requirements.txt
└── zeabur.json               # Deployment config
```

## Tech Stack

- **Next.js 14** - App Router, Server Actions
- **TypeScript** - Type-safe SDK
- **JWT** - Industry-standard token format (HS256)
- **OpenAgents** - Multi-agent framework (Python)
- **FastAPI** - Python API backend
- **OpenAI** - Natural language authorization parsing
- **Tailwind CSS** - Utility-first styling

## License

MIT

---

**Built for AI Build-Off 2025 - OpenAgents Track**
