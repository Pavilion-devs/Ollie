# AgentAuth — Token Schema & Verification Logic

Reference document. Keep open during the build.

---

## Token Structure (JWT Payload)

```typescript
interface AgentAuthPayload {
  // Who authorized this agent
  principal: string;        // "user_123"

  // Which agent is authorized
  agent: string;            // "agent_shopping_assistant"

  // What actions are allowed
  scope: string[];          // ["cloud_purchase", "subscription"]

  // Spending constraint
  limit: number;            // 50
  currency: string;         // "USD"

  // Temporal validity
  issuedAt: string;         // "2024-01-15T10:00:00Z"
  expiresAt: string;        // "2024-01-15T18:00:00Z"

  // Issuer identification
  issuer: string;           // "AgentAuth"
}
```

---

## Example Tokens

### Valid Token Payload
```json
{
  "principal": "user_123",
  "agent": "agent_shopping_assistant",
  "scope": ["cloud_purchase", "subscription"],
  "limit": 50,
  "currency": "USD",
  "issuedAt": "2024-01-15T10:00:00Z",
  "expiresAt": "2024-01-15T18:00:00Z",
  "issuer": "AgentAuth"
}
```

### Encoded (what the agent carries)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcmluY2lwYWwiOiJ1c2VyXzEyMyIsImFnZW50IjoiYWdlbnRfc2hvcHBpbmdfYXNzaXN0YW50Iiwic2NvcGUiOlsiY2xvdWRfcHVyY2hhc2UiLCJzdWJzY3JpcHRpb24iXSwibGltaXQiOjUwLCJjdXJyZW5jeSI6IlVTRCIsImlzc3VlZEF0IjoiMjAyNC0wMS0xNVQxMDowMDowMFoiLCJleHBpcmVzQXQiOiIyMDI0LTAxLTE1VDE4OjAwOjAwWiIsImlzc3VlciI6IkFnZW50QXV0aCJ9.SIGNATURE
```

---

## Verification Rules

When a merchant calls `verifyToken(token, options)`:

### 1. Signature Check
```
IF signature invalid → REJECT "Invalid token signature"
```

### 2. Expiration Check
```
IF now > expiresAt → REJECT "Token has expired"
```

### 3. Scope Check
```
IF requiredScope NOT IN token.scope → REJECT "Scope '{scope}' not authorized"
```

### 4. Limit Check
```
IF amount > token.limit → REJECT "Amount ${amount} exceeds limit of ${limit}"
```

### 5. All Passed
```
→ ALLOW with payload
```

---

## Verification Options

```typescript
interface VerifyOptions {
  requiredScope: string;    // The scope this action requires
  amount: number;           // The transaction amount
}
```

---

## Verification Result

```typescript
// Success
{
  valid: true,
  payload: AgentAuthPayload
}

// Failure
{
  valid: false,
  reason: "Amount $100 exceeds limit of $50"
}
```

---

## Demo Scenarios

### Scenario 1: Approved Purchase
```
Token: limit=$50, scope=["cloud_purchase"]
Request: amount=$20, scope="cloud_purchase"
Result: ✅ APPROVED
```

### Scenario 2: Over Limit
```
Token: limit=$50, scope=["cloud_purchase"]
Request: amount=$100, scope="cloud_purchase"
Result: ❌ REJECTED - "Amount $100 exceeds limit of $50"
```

### Scenario 3: Wrong Scope
```
Token: limit=$50, scope=["cloud_purchase"]
Request: amount=$20, scope="bank_transfer"
Result: ❌ REJECTED - "Scope 'bank_transfer' not authorized"
```

### Scenario 4: Expired Token
```
Token: expiresAt="2024-01-15T10:00:00Z" (in the past)
Request: any
Result: ❌ REJECTED - "Token has expired"
```

---

## API Contracts

### POST /api/authorize

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
  "token": "eyJhbGci...",
  "payload": {
    "principal": "user_123",
    "agent": "agent_shopping_assistant",
    "scope": ["cloud_purchase"],
    "limit": 50,
    "currency": "USD",
    "issuedAt": "2024-01-15T10:00:00Z",
    "expiresAt": "2024-01-15T11:00:00Z",
    "issuer": "AgentAuth"
  }
}
```

---

### POST /api/purchase

**Request:**
```
Headers:
  Authorization: Bearer eyJhbGci...

Body:
{
  "item": "Cloud Credits",
  "amount": 20,
  "scope": "cloud_purchase"
}
```

**Response (Approved):**
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

**Response (Rejected):**
```json
{
  "success": false,
  "message": "Purchase rejected",
  "reason": "Amount $100 exceeds limit of $50"
}
```

---

## Signing Configuration

```typescript
const SECRET = "agentauth-demo-secret-key-2024";
const ALGORITHM = "HS256";
```

Note: Hardcoded secret is fine for hackathon demo. In production, this would be:
- Environment variable
- Rotatable keys
- Asymmetric (RS256) for distributed verification

---

## Error HTTP Status Codes

| Situation | Status Code |
|-----------|-------------|
| Token missing | 401 Unauthorized |
| Token invalid/expired/scope mismatch/over limit | 403 Forbidden |
| Success | 200 OK |
| Bad request format | 400 Bad Request |
