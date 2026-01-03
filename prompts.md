# AgentAuth — Claude Code Prompts

Copy-paste these prompts in order. Each builds on the previous.

---

## Prompt 1: Project Setup (0:00)

```
Create a new Next.js 14 project with TypeScript and Tailwind CSS using the App Router.

Project name: agentauth

After setup:
1. Install jsonwebtoken and @types/jsonwebtoken
2. Create the folder structure:
   - src/lib/ (for SDK code)
   - src/app/api/authorize/ (for authorize endpoint)
   - src/app/api/purchase/ (for purchase endpoint)
3. Verify it runs with npm run dev
```

---

## Prompt 2: Token Types (0:10)

```
Create src/lib/types.ts with the following TypeScript interfaces:

AgentAuthPayload:
- principal: string (the user ID, e.g., "user_123")
- agent: string (the agent ID, e.g., "agent_shopping_assistant")
- scope: string[] (allowed actions, e.g., ["cloud_purchase", "subscription"])
- limit: number (max spend amount)
- currency: string (e.g., "USD")
- issuedAt: string (ISO timestamp)
- expiresAt: string (ISO timestamp)
- issuer: string (always "AgentAuth")

VerifyOptions:
- requiredScope: string (the scope to check for)
- amount: number (the transaction amount to validate against limit)

VerifyResult:
- valid: boolean
- reason?: string (only present if valid is false)
- payload?: AgentAuthPayload (only present if valid is true)

Export all interfaces.
```

---

## Prompt 3: Core SDK Functions (0:20)

```
Create src/lib/agentauth.ts with two functions:

1. signToken(payload: Omit<AgentAuthPayload, 'issuedAt' | 'issuer'>): string
   - Adds issuedAt (now) and issuer ("AgentAuth") automatically
   - Signs with JWT using HS256
   - Use a hardcoded secret: "agentauth-demo-secret-key-2024" (fine for demo)
   - Returns the signed JWT string

2. verifyToken(token: string, options: VerifyOptions): VerifyResult
   - Verifies JWT signature
   - Checks if token is expired (compare expiresAt to now)
   - Checks if requiredScope is in the scope array
   - Checks if amount <= limit
   - Returns { valid: true, payload } if all checks pass
   - Returns { valid: false, reason: "..." } with specific reason if any check fails:
     - "Invalid token signature"
     - "Token has expired"
     - "Scope 'X' not authorized"
     - "Amount $X exceeds limit of $Y"

Import types from ./types. Export both functions.
```

---

## Prompt 4: Authorize Endpoint (0:50)

```
Create src/app/api/authorize/route.ts

POST /api/authorize

Request body:
{
  "principal": "user_123",
  "agent": "agent_shopping_assistant",
  "scope": ["cloud_purchase"],
  "limit": 50,
  "currency": "USD",
  "expiresInMinutes": 60
}

Response:
{
  "success": true,
  "token": "<jwt_string>",
  "payload": { ...the full payload that was signed }
}

Implementation:
- Parse the request body
- Calculate expiresAt from expiresInMinutes
- Call signToken() from our SDK
- Return the token and payload

Handle errors with proper JSON responses and 400 status codes.
```

---

## Prompt 5: Purchase Endpoint (1:05)

```
Create src/app/api/purchase/route.ts

POST /api/purchase

Request headers:
- Authorization: Bearer <token>

Request body:
{
  "item": "Cloud Credits",
  "amount": 20,
  "scope": "cloud_purchase"
}

Response (success):
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

Response (failure):
{
  "success": false,
  "message": "Purchase rejected",
  "reason": "Amount $100 exceeds limit of $50"
}

Implementation:
- Extract token from Authorization header (remove "Bearer " prefix)
- Parse request body
- Call verifyToken() with the scope and amount from the request
- Return appropriate response based on verification result

Return 401 for missing token, 403 for rejected verification, 200 for success.
```

---

## Prompt 6: Landing Page + Demo UI (1:40)

```
I have a reference HTML template at high-performanc-71.aura.build-content.html in the repo root. Extract the styling and create a landing page + demo for AgentAuth.

Use these exact styles from the template:
- Light theme with white background
- Emerald green accents (#10b981, emerald-500/600)
- Inter font for body, JetBrains Mono for code/labels
- Gradient bordered cards (from-neutral-200 to-neutral-300)
- Input styling with .input-base pattern
- The grid background pattern (.bg-grid-pattern)

Page Structure:

1. NAVIGATION (fixed top)
   - Left: Black square logo + "AGENTAUTH" text
   - Right: "Try Demo" button with emerald dot indicator

2. HERO SECTION
   - Small badge: "AI Build-Off 2025" with pulsing emerald dot
   - Main headline: "Trust, But Verify."
   - Subheadline in lighter gray: "Delegated authority for AI agents"
   - Description: "In a world where AI agents act autonomously, merchants need to verify: who authorized this? what's the limit? who's liable? AgentAuth answers all three."
   - Two CTA buttons:
     - Primary (dark): "AUTHORIZE AN AGENT" - scrolls to demo section
     - Secondary (light with border): "VIEW DOCS" - placeholder link

3. STATS BAR (like the template)
   - 4 columns showing:
     - "JWT Signed" / "Industry Standard"
     - "< 10ms" / "Verification Time"
     - "Scope-Based" / "Fine-Grained Control"
     - "Open Source" / "MIT Licensed"

4. HOW IT WORKS SECTION (3-step process like template)
   - Step 01: "User Authorizes" - User grants agent specific permissions
   - Step 02: "Agent Acts" - Agent carries signed token to merchant
   - Step 03: "Merchant Verifies" - SDK validates scope, limits, expiry

5. DEMO SECTION (id="demo") - This is the interactive part
   - Section header: "See It In Action"
   - Two-column card layout with gradient borders:

   LEFT CARD - "1. Authorize Agent"
   - Form fields (use the input-base styling):
     - Principal (user ID) - default "user_123"
     - Agent ID - default "agent_shopping_assistant"
     - Scope - default "cloud_purchase"
     - Spending Limit ($) - default 50
     - Expires in (minutes) - default 60
   - Dark "GENERATE TOKEN" button
   - Result area: show generated JWT in monospace, scrollable box

   RIGHT CARD - "2. Merchant Verification"
   - Token textarea (auto-filled from left side)
   - Item name - default "Cloud Credits"
   - Amount ($) - default 20
   - Required Scope - default "cloud_purchase"
   - Dark "ATTEMPT PURCHASE" button
   - Result area:
     - Success: green background, checkmark, transaction details
     - Failure: red background, X icon, rejection reason

6. FOOTER
   - "Built for AI Build-Off 2025"
   - "AgentAuth © 2025"

Make it responsive. Use the same animation classes from the template (animate-in, etc).
Store generated token in React state to auto-fill the merchant side.
```

---

## Prompt 7: Wire Up API Calls (1:55)

```
Update src/app/page.tsx to connect the forms to the API:

1. "Generate Token" button should:
   - POST to /api/authorize with form data
   - Display the returned token in the result area
   - Auto-fill the token textarea on the right side
   - Show loading state while processing

2. "Attempt Purchase" button should:
   - POST to /api/purchase with Authorization header and form data
   - Show success state (green checkmark + transaction details) if approved
   - Show failure state (red X + rejection reason) if rejected
   - Show loading state while processing

Add proper error handling for network failures.
Make the results visually distinct - use green backgrounds for success, red for failure.
```

---

## Prompt 8: Polish + README (2:35)

```
1. Add visual polish to the UI:
   - Add icons or emojis for success (checkmark) and failure (X)
   - Add a subtle animation when results appear
   - Ensure the token display is copyable (click to copy)
   - Add preset buttons: "Try $20 purchase" and "Try $100 purchase" to quickly demo both scenarios

2. Update README.md with:
   - Project title: AgentAuth
   - One-liner: "Verifiable delegated authority for AI agents"
   - What it does (2-3 sentences)
   - How to run locally (npm install, npm run dev)
   - Live demo link (placeholder for now)
   - The demo flow (authorize → purchase approved → purchase rejected)
```

---

## Prompt 9: Deploy to Zeabur (2:40)

```
Help me deploy this Next.js app to Zeabur:
1. What files do I need to configure (if any)?
2. Walk me through the Zeabur deployment steps
3. What environment variables do I need to set (if any)?
```

---

## Prompt 10: AI-Powered Natural Language Authorization

```
Add an AI-powered natural language authorization feature to AgentAuth. Keep the existing form intact - the AI will parse natural language and auto-fill the form fields.

1. Install OpenAI SDK:
   npm install openai

2. Create src/app/api/parse-authorization/route.ts:

   POST /api/parse-authorization

   Request body:
   {
     "description": "Let my shopping assistant spend up to $50 on cloud services for the next hour"
   }

   Response:
   {
     "success": true,
     "parsed": {
       "principal": "user_123",
       "agent": "shopping_assistant",
       "scope": ["cloud_purchase", "cloud_services"],
       "limit": 50,
       "currency": "USD",
       "durationMinutes": 60
     }
   }

   Implementation:
   - Use OpenAI's gpt-4o-mini model (fast and cheap)
   - Use environment variable OPENAI_API_KEY
   - System prompt for the AI:

   "You are an authorization parser for AgentAuth. Extract structured data from natural language authorization requests.

   Return ONLY valid JSON with these fields:
   - agent: string (the agent being authorized, e.g., 'shopping_assistant', 'email_bot')
   - scope: string[] (permission scopes, e.g., ['cloud_purchase', 'email_read', 'email_send'])
   - limit: number or null (spending limit if mentioned, null if not applicable)
   - currency: string (default 'USD')
   - durationMinutes: number (how long authorization lasts, default 60)

   Examples:
   Input: 'Let my shopping assistant spend up to $50 on cloud services for the next hour'
   Output: {\"agent\": \"shopping_assistant\", \"scope\": [\"cloud_purchase\"], \"limit\": 50, \"currency\": \"USD\", \"durationMinutes\": 60}

   Input: 'Allow email bot to read and send emails for 24 hours'
   Output: {\"agent\": \"email_bot\", \"scope\": [\"email_read\", \"email_send\"], \"limit\": null, \"currency\": \"USD\", \"durationMinutes\": 1440}

   Input: 'Give my analytics agent access to view reports'
   Output: {\"agent\": \"analytics_agent\", \"scope\": [\"reports_view\"], \"limit\": null, \"currency\": \"USD\", \"durationMinutes\": 60}

   Always return valid JSON only, no markdown or explanation."

   - Handle errors gracefully, return { success: false, error: "message" }

3. Update the UI (src/app/page.tsx):

   Add a new section ABOVE the existing "1. Authorize Agent" form card:

   Structure:
   - A collapsible/expandable card titled "Quick Authorize with AI"
   - Textarea (3-4 rows) with placeholder: "Describe authorization in plain English... e.g., 'Let my shopping assistant spend up to $50 on cloud services'"
   - "Parse with AI" button with sparkle/magic icon
   - Example quick-fill buttons below the textarea:
     - "Shopping: $50 cloud"
     - "Email: read & send"
     - "Analytics: view reports"

   Behavior:
   - Clicking "Parse with AI":
     - Shows loading state ("Parsing...")
     - POSTs to /api/parse-authorization with the textarea content
     - On success: auto-fill the form fields below (agent, scope, limit, etc.)
     - Show indicator: "Parsed by AI - review and edit below"
     - On error: show error message, user can fill manually

   - Clicking example buttons:
     - Fills textarea with that example text
     - Automatically triggers the parse

   Styling:
   - Use emerald accent for the AI section to make it stand out
   - Add subtle sparkle/AI icon
   - Match existing gradient border card style
   - Add a small "Powered by OpenAI" note at bottom of the AI section

4. The existing form must still work independently - users can ignore the AI section and fill manually.

5. After implementing, set OPENAI_API_KEY in environment variables (Zeabur dashboard for production).
```

---

## Emergency Prompts

### If JWT library has issues:
```
The jsonwebtoken library is causing issues. Create a simpler signing mechanism:
- Use Node's built-in crypto to create an HMAC-SHA256 signature
- Encode payload as base64, append signature
- For verification, recalculate signature and compare
Keep the same function signatures (signToken, verifyToken).
```

### If styling is broken:
```
Simplify the UI to bare minimum:
- Remove all Tailwind classes
- Use basic inline styles
- Just make it functional: two forms, two result areas
- We need it working, not pretty
```

### If API routes don't work:
```
Debug the API route at /api/authorize. It's returning [describe error].
Check:
1. Is the route file in the correct location?
2. Is the request body being parsed correctly?
3. Are the imports correct?
Show me what's wrong and fix it.
```

---

## Quick Test Commands

Test authorize endpoint:
```bash
curl -X POST http://localhost:3000/api/authorize \
  -H "Content-Type: application/json" \
  -d '{"principal":"user_123","agent":"test_agent","scope":["cloud_purchase"],"limit":50,"currency":"USD","expiresInMinutes":60}'
```

Test purchase endpoint (replace TOKEN):
```bash
curl -X POST http://localhost:3000/api/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"item":"Cloud Credits","amount":20,"scope":"cloud_purchase"}'
```
