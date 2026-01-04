"""
Shopping Agent - Gets authorization and makes purchases
Demonstrates successful token usage when agent identity matches
"""

import asyncio
import httpx
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openagents.agents.worker_agent import WorkerAgent
from config import AGENTAUTH_API


class ShoppingAgent(WorkerAgent):
    """
    Shopping Agent that:
    1. Requests an authorization token from AgentAuth
    2. Makes a successful purchase (amount under limit)
    3. Shares token with Analytics Agent to demonstrate security
    """

    default_agent_id = "agent_shopping"
    default_channels = ["#general"]

    def __init__(self):
        super().__init__()
        self.token = None

    async def on_startup(self):
        ws = self.workspace()
        await ws.channel("#general").post("🛒 Shopping Agent is online!")

        # Step 1: Get authorization token from AgentAuth
        await ws.channel("#general").post("📝 Requesting authorization from AgentAuth...")

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
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
                    await ws.channel("#general").post("🔑 Authorization granted!")
                    await ws.channel("#general").post(f"📋 Scope: cloud_purchase | Limit: $50")
                else:
                    await ws.channel("#general").post(f"❌ Authorization failed: {data}")
                    return

        except Exception as e:
            await ws.channel("#general").post(f"❌ Error connecting to AgentAuth: {e}")
            return

        # Step 2: Make a purchase within the limit
        await asyncio.sleep(1)
        await ws.channel("#general").post("🛍️ Attempting to purchase $20 Cloud Credits...")

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
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
                    await ws.channel("#general").post("✅ Purchase APPROVED!")
                    await ws.channel("#general").post(f"   Item: {result['transaction']['item']}")
                    await ws.channel("#general").post(f"   Amount: ${result['transaction']['amount']}")
                else:
                    await ws.channel("#general").post(f"❌ Purchase REJECTED: {result.get('reason')}")

        except Exception as e:
            await ws.channel("#general").post(f"❌ Error making purchase: {e}")
            return

        # Step 3: Share token with Analytics Agent (simulating token leak)
        await asyncio.sleep(2)
        await ws.channel("#general").post("")
        await ws.channel("#general").post("⚠️ [SECURITY TEST] Sharing my token with Analytics Agent...")
        await ws.channel("#general").post("   Let's see if AgentAuth catches the misuse!")

        # Send token to analytics agent via direct message
        await ws.agent("agent_analytics").send(f"STOLEN_TOKEN:{self.token}")

    async def on_direct(self, msg):
        """Handle direct messages"""
        ws = self.workspace()
        await ws.channel("#general").post(f"📨 Shopping Agent received DM: {msg.text[:50]}...")


async def main():
    """Run the Shopping Agent"""
    print("🛒 Starting Shopping Agent...")
    agent = ShoppingAgent()
    await agent.start(
        network_host="localhost",
        network_port=8700,
        network_id="main"
    )


if __name__ == "__main__":
    asyncio.run(main())
