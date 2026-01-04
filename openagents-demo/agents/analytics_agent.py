"""
Analytics Agent - Tries to use another agent's token
Demonstrates token security: tokens are bound to specific agents
"""

import asyncio
import httpx
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openagents.agents.worker_agent import WorkerAgent
from config import AGENTAUTH_API


class AnalyticsAgent(WorkerAgent):
    """
    Analytics Agent that:
    1. Waits to receive a token from another agent
    2. Attempts to use that token (should be REJECTED)
    3. Demonstrates multi-agent security boundaries
    """

    default_agent_id = "agent_analytics"
    default_channels = ["#general"]

    async def on_startup(self):
        ws = self.workspace()
        await ws.channel("#general").post("📊 Analytics Agent is online!")
        await ws.channel("#general").post("👀 Waiting for tokens to... analyze...")

    async def on_direct(self, msg):
        """Handle direct messages - specifically looking for stolen tokens"""
        ws = self.workspace()

        if msg.text.startswith("STOLEN_TOKEN:"):
            token = msg.text.replace("STOLEN_TOKEN:", "")

            await ws.channel("#general").post("")
            await ws.channel("#general").post("📨 Analytics Agent received a token!")
            await ws.channel("#general").post("🔓 Attempting to use Shopping Agent's token...")

            # Try to use the stolen token
            try:
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
                        # This should NOT happen if security is working
                        await ws.channel("#general").post("⚠️ Purchase APPROVED - Security vulnerability!")
                    else:
                        # This is the expected behavior
                        await ws.channel("#general").post("❌ Purchase REJECTED!")
                        await ws.channel("#general").post(f"   Reason: {result.get('reason')}")
                        await ws.channel("#general").post("")
                        await ws.channel("#general").post("🔒 AgentAuth BLOCKED the token misuse!")
                        await ws.channel("#general").post("✨ Multi-agent security is working!")
                        await ws.channel("#general").post("")
                        await ws.channel("#general").post("═" * 50)
                        await ws.channel("#general").post("DEMO COMPLETE: Tokens are bound to their agents")
                        await ws.channel("#general").post("═" * 50)

            except Exception as e:
                await ws.channel("#general").post(f"❌ Error: {e}")

        else:
            await ws.channel("#general").post(f"📨 Received message: {msg.text[:50]}...")


async def main():
    """Run the Analytics Agent"""
    print("📊 Starting Analytics Agent...")
    agent = AnalyticsAgent()
    await agent.start(
        network_host="localhost",
        network_port=8700,
        network_id="main"
    )


if __name__ == "__main__":
    asyncio.run(main())
