# AgentAuth — 3-Hour Hackathon Execution Plan

## The One-Liner
"Verifiable delegated authority for AI agents — OAuth for the agentic era."

---

## Pre-Flight Checklist (Before Timer Starts)
- [ ] Have this plan open in a separate tab
- [ ] Have prompts.md open and ready to copy
- [ ] Have schema.md open for reference
- [ ] Know your Zeabur login

---

## Phase 1: Core SDK (0:00 - 0:50)

### Goal: Working `signToken()` and `verifyToken()` functions

| Time | Task | Output |
|------|------|--------|
| 0:00 | Scaffold Next.js project | Empty project running |
| 0:10 | Create types + token schema | `src/lib/types.ts` |
| 0:20 | Implement `signToken()` | Function that creates JWT |
| 0:35 | Implement `verifyToken()` | Function that validates + checks constraints |
| 0:45 | Test in isolation | Console logs showing sign → verify flow |

### Checkpoint @ 0:50
You should have:
- `npm run dev` working
- `src/lib/types.ts` with token interface
- `src/lib/agentauth.ts` with sign + verify functions
- A quick test proving sign → verify works

**If behind:** Skip tests, move to Phase 2. You can test via API.

---

## Phase 2: API Routes (0:50 - 1:40)

### Goal: Two working endpoints

| Time | Task | Output |
|------|------|--------|
| 0:50 | Create `/api/authorize` | Issues signed token |
| 1:05 | Create `/api/purchase` | Merchant endpoint using SDK |
| 1:20 | Test with curl/Postman | Both endpoints working |
| 1:30 | Add proper error responses | Clear rejection reasons |

### Checkpoint @ 1:40
You should have:
- `POST /api/authorize` — returns signed JWT
- `POST /api/purchase` — validates token, returns allowed/rejected
- Both tested manually

**If behind:** Minimal error handling is fine. Move to UI.

---

## Phase 3: Demo UI + Deploy (1:40 - 2:50)

### Goal: Visual demo + deployed app

| Time | Task | Output |
|------|------|--------|
| 1:40 | Create main page layout | Basic UI structure |
| 1:55 | Build "Authorize Agent" section | Form → calls /api/authorize → shows token |
| 2:10 | Build "Agent Action" section | Form → calls /api/purchase → shows result |
| 2:25 | Add success/failure states | Green checkmark / red X with reasons |
| 2:35 | Deploy to Zeabur | Live URL |
| 2:45 | Test deployed version | End-to-end flow works |

### Checkpoint @ 2:50
You should have:
- Working UI showing the full flow
- Deployed and accessible via URL
- Two demo scenarios work:
  1. Authorized action (under limit) → ✅
  2. Rejected action (over limit) → ❌

---

## Phase 4: Polish + Submit (2:50 - 3:00)

| Time | Task |
|------|------|
| 2:50 | Update README with one-liner + demo link |
| 2:55 | Screenshot/record a quick demo |
| 3:00 | Submit |

---

## Emergency Fallbacks

### If Phase 1 takes too long (>60 min)
- Simplify: use a basic HMAC instead of JWT library issues
- Or hardcode a working token for demo purposes

### If API routes break
- Debug for max 10 min, then simplify
- A working demo with hardcoded responses > broken "real" implementation

### If UI takes too long
- Minimal UI is fine: two buttons, two result boxes
- No styling > broken styling

### If deployment fails
- Spend max 10 min debugging
- Fallback: localhost demo with screen recording

---

## The Demo Script (Practice This)

> "In a world where AI agents act autonomously, merchants have no way to verify: who authorized this agent? What's the spending limit? Who's liable?
>
> AgentAuth solves this. Watch:
>
> 1. User authorizes an agent to spend up to $50 on cloud tools
> 2. Agent gets a signed token with that exact scope
> 3. Agent tries to make a $20 purchase — approved
> 4. Agent tries to make a $100 purchase — rejected, over limit
>
> I didn't build a smart agent. I built a system that doesn't trust agents at all. It just verifies their authority."

---

## File Checklist (What You'll Create)

```
agentauth/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Demo UI
│   │   ├── layout.tsx            # Layout
│   │   ├── globals.css           # Tailwind
│   │   └── api/
│   │       ├── authorize/
│   │       │   └── route.ts      # Issues token
│   │       └── purchase/
│   │           └── route.ts      # Merchant endpoint
│   └── lib/
│       ├── agentauth.ts          # Core: sign + verify
│       └── types.ts              # Token types
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## Remember

- **Done > Perfect**
- **Working demo > Feature-complete**
- **Clear rejection reasons = craftsmanship signal**
- **Two scenarios (pass + fail) = complete story**
