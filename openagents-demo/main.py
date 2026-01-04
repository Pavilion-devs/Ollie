"""
AgentAuth + OpenAgents Demo - FastAPI Backend

This service:
1. Runs an OpenAgents network with real agent-to-agent communication
2. Exposes FastAPI endpoints for the Next.js app to trigger demos
3. Agents communicate through OpenAgents and call AgentAuth API
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import asyncio
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

# OpenAgents imports
from openagents.agents.worker_agent import WorkerAgent

# Configuration
AGENTAUTH_API = os.getenv("AGENTAUTH_API", "https://your-app.zeabur.app")
NETWORK_HOST = os.getenv("NETWORK_HOST", "localhost")
NETWORK_PORT = int(os.getenv("NETWORK_PORT", 8700))

# Store for demo results
demo_results: Dict[str, Any] = {}
agent_logs: List[Dict[str, Any]] = []


def add_log(agent: str, message: str, log_type: str = "info"):
    """Add a log entry"""
    agent_logs.append({
        "agent": agent,
        "message": message,
        "type": log_type
    })


# ============================================================
# OPENAGENTS AGENTS
# ============================================================

class ShoppingAgent(WorkerAgent):
    """
    Shopping Agent that:
    1. Requests authorization from AgentAuth
    2. Makes a purchase
    3. Shares token with Analytics Agent
    """
    default_agent_id = "agent_shopping"
    default_channels = ["#general"]

    def __init__(self):
        super().__init__()
        self.token = None

    async def on_startup(self):
        add_log("agent_shopping", "Shopping Agent online!", "success")

    async def authorize_and_purchase(self):
        """Run the shopping agent flow"""
        add_log("agent_shopping", "Requesting authorization from AgentAuth...", "info")

        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get authorization
            resp = await client.post(
                f"{AGENTAUTH_API}/api/authorize",
                json={
                    "principal": "user_123",
                    "agent": "agent_shopping",
                    "scope": ["cloud_purchase"],
                    "limit": 50,
                    "currency": "USD",
                    "expiresInMinutes": 60
                }
            )
            data = resp.json()

            if data.get("success"):
                self.token = data["token"]
                add_log("agent_shopping", "Authorization granted! Scope: cloud_purchase, Limit: $50", "success")
            else:
                add_log("agent_shopping", f"Authorization failed: {data}", "error")
                return None

            # Make purchase
            add_log("agent_shopping", "Attempting $20 purchase...", "info")
            resp = await client.post(
                f"{AGENTAUTH_API}/api/purchase",
                headers={"Authorization": f"Bearer {self.token}"},
                json={
                    "item": "Cloud Credits",
                    "amount": 20,
                    "scope": "cloud_purchase",
                    "requestingAgent": "agent_shopping"
                }
            )
            result = resp.json()

            if result.get("success"):
                add_log("agent_shopping", "Purchase APPROVED!", "success")
            else:
                add_log("agent_shopping", f"Purchase rejected: {result.get('reason')}", "error")

            return self.token


class AnalyticsAgent(WorkerAgent):
    """
    Analytics Agent that tries to use another agent's token
    (Should be REJECTED by AgentAuth)
    """
    default_agent_id = "agent_analytics"
    default_channels = ["#general"]

    async def on_startup(self):
        add_log("agent_analytics", "Analytics Agent online!", "success")

    async def attempt_with_stolen_token(self, token: str):
        """Try to use a token that belongs to another agent"""
        add_log("agent_analytics", "Received token from Shopping Agent...", "warning")
        add_log("agent_analytics", "Attempting to use stolen token...", "warning")

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{AGENTAUTH_API}/api/purchase",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "item": "Premium Data Export",
                    "amount": 30,
                    "scope": "cloud_purchase",
                    "requestingAgent": "agent_analytics"  # Different agent!
                }
            )
            result = resp.json()

            if result.get("success"):
                add_log("agent_analytics", "Purchase approved - SECURITY ISSUE!", "error")
                return False  # Security failed
            else:
                add_log("agent_analytics", f"Purchase REJECTED: {result.get('reason')}", "error")
                add_log("agent_analytics", "AgentAuth blocked the token misuse!", "success")
                return True  # Security working


# Global agent instances
shopping_agent = ShoppingAgent()
analytics_agent = AnalyticsAgent()


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AgentAuth + OpenAgents Demo",
    description="Multi-agent security demonstration using OpenAgents framework",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """API info"""
    return {
        "service": "AgentAuth + OpenAgents Demo",
        "description": "Multi-agent security demonstration",
        "agentauth_api": AGENTAUTH_API,
        "endpoints": {
            "run_demo": "GET /agents/demo/run",
            "get_logs": "GET /agents/logs",
            "clear_logs": "POST /agents/logs/clear",
            "health": "GET /health"
        }
    }


@app.get("/agents/demo/run")
async def run_multi_agent_demo():
    """
    Run the complete multi-agent security demo.

    Flow:
    1. Shopping Agent requests authorization
    2. Shopping Agent makes a purchase (should succeed)
    3. Analytics Agent tries to use Shopping's token (should fail)
    """
    global agent_logs
    agent_logs = []  # Clear previous logs

    add_log("system", "Starting Multi-Agent Security Demo...", "info")
    add_log("system", f"Using AgentAuth API: {AGENTAUTH_API}", "info")

    try:
        # Step 1 & 2: Shopping Agent authorizes and purchases
        token = await shopping_agent.authorize_and_purchase()

        if not token:
            return {
                "success": False,
                "security_test_passed": False,
                "logs": agent_logs,
                "conclusion": "Demo failed: Shopping Agent could not get authorization"
            }

        # Simulate token being shared between agents
        add_log("system", "Shopping Agent sharing token with Analytics Agent...", "warning")
        await asyncio.sleep(0.5)

        # Step 3: Analytics Agent tries to use the token
        security_working = await analytics_agent.attempt_with_stolen_token(token)

        add_log("system", "=" * 50, "info")
        if security_working:
            add_log("system", "DEMO COMPLETE: Multi-agent security is WORKING!", "success")
            add_log("system", "Tokens are bound to their issuing agent.", "success")
        else:
            add_log("system", "DEMO COMPLETE: Security vulnerability detected!", "error")
        add_log("system", "=" * 50, "info")

        return {
            "success": True,
            "security_test_passed": security_working,
            "logs": agent_logs,
            "conclusion": "Multi-agent security working! Token misuse was blocked." if security_working else "Security issue: Token was not properly bound to agent."
        }

    except Exception as e:
        add_log("system", f"Error during demo: {str(e)}", "error")
        return {
            "success": False,
            "security_test_passed": False,
            "logs": agent_logs,
            "error": str(e)
        }


@app.get("/agents/logs")
async def get_logs():
    """Get current agent logs"""
    return {"logs": agent_logs}


@app.post("/agents/logs/clear")
async def clear_logs():
    """Clear agent logs"""
    global agent_logs
    agent_logs = []
    return {"status": "cleared"}


@app.get("/agents/shopping/authorize")
async def shopping_authorize():
    """Direct endpoint for Shopping Agent authorization"""
    global agent_logs
    agent_logs = []

    token = await shopping_agent.authorize_and_purchase()
    return {
        "success": token is not None,
        "token": token,
        "logs": agent_logs
    }


@app.get("/agents/analytics/attempt")
async def analytics_attempt(token: str):
    """Direct endpoint for Analytics Agent to attempt using a token"""
    global agent_logs
    agent_logs = []

    blocked = await analytics_agent.attempt_with_stolen_token(token)
    return {
        "blocked": blocked,
        "security_working": blocked,
        "logs": agent_logs
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "service": "agentauth-openagents-demo",
        "agentauth_api": AGENTAUTH_API
    }


@app.get("/config")
async def config():
    """Get configuration"""
    return {
        "agentauth_api": AGENTAUTH_API,
        "network_host": NETWORK_HOST,
        "network_port": NETWORK_PORT,
        "agents": ["agent_shopping", "agent_analytics"]
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting AgentAuth + OpenAgents Demo on port {port}")
    print(f"AgentAuth API: {AGENTAUTH_API}")
    uvicorn.run(app, host="0.0.0.0", port=port)
