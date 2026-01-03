# AgentAuth

**Verifiable delegated authority for AI agents**

In a world where AI agents act autonomously, merchants need to verify: who authorized this? what's the limit? who's liable? AgentAuth answers all three with JWT-based signed tokens that encode permissions, spending limits, and expiration times.

## What It Does

AgentAuth enables users to grant AI agents specific, verifiable permissions to act on their behalf. Agents carry signed JWT tokens to merchants, who can verify:

1. **Authorization** - Who granted permission (user principal)
2. **Scope** - What actions are allowed (e.g., "cloud_purchase", "subscription")
3. **Limits** - Maximum spending amount
4. **Expiry** - Time-bound authorization
5. **Integrity** - Cryptographically signed, tamper-proof

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
    │                                  │   - Confirm not expired
    └───────────┬──────────────────────┘
                │
           2. Agent carries
              signed JWT token
```

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

### Try the Demo

1. **Authorize an Agent**
   - Enter a user ID, agent ID, scope, and spending limit
   - Click "Generate Token" to create a signed JWT
   - Copy the token or use it directly in the merchant flow

2. **Merchant Verification**
   - The token auto-fills in the merchant verification form
   - Enter an item name and amount
   - Click "Attempt Purchase" to see verification in action
   - Try the preset buttons: "Try $20 ✓" (success) or "Try $100 ✗" (exceeds limit)

## Demo Flow

```
1. User authorizes agent with $50 limit for "cloud_purchase"
   ↓
2. Agent receives signed JWT token
   ↓
3. Agent attempts $20 purchase → ✓ Approved
4. Agent attempts $100 purchase → ✗ Rejected (exceeds $50 limit)
```

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

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "payload": {
    "principal": "user_123",
    "agent": "agent_shopping_assistant",
    "scope": ["cloud_purchase"],
    "limit": 50,
    "currency": "USD",
    "expiresAt": "2025-01-02T23:00:00.000Z",
    "issuedAt": "2025-01-02T22:00:00.000Z",
    "issuer": "AgentAuth"
  }
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
  "scope": "cloud_purchase"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Purchase authorized",
  "transaction": {
    "item": "Cloud Credits",
    "amount": 20,
    "authorizedBy": "user_123",
    "agent": "agent_shopping_assistant"
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Purchase rejected",
  "reason": "Amount $100 exceeds limit of $50"
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

// Verify a token
const result = verifyToken(token, {
  requiredScope: 'cloud_purchase',
  amount: 20,
});

if (result.valid) {
  console.log('Authorized by:', result.payload.principal);
} else {
  console.log('Rejected:', result.reason);
}
```

## Tech Stack

- **Next.js 14** - App Router, Server Actions
- **TypeScript** - Type-safe SDK
- **JWT** - Industry-standard token format (HS256)
- **Tailwind CSS** - Utility-first styling

## License

MIT © 2025 AgentAuth

---

**Built for AI Build-Off 2025**
