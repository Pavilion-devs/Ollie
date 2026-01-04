"""
Run the complete OpenAgents demo locally

This script:
1. Starts the OpenAgents network
2. Launches both agents
3. Shows the security demo in action
"""

import asyncio
import subprocess
import sys
import os
import time

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


async def run_simple_demo():
    """Run a simple demo without the full OpenAgents network"""
    import httpx
    from config import AGENTAUTH_API

    print("=" * 60)
    print("AgentAuth Multi-Agent Security Demo")
    print("=" * 60)
    print(f"\nUsing API: {AGENTAUTH_API}\n")

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Shopping Agent gets authorization
        print("🛒 [SHOPPING AGENT] Requesting authorization...")
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
        auth_data = resp.json()

        if auth_data.get("success"):
            token = auth_data["token"]
            print("🔑 [SHOPPING AGENT] Authorization granted!")
            print(f"   Scope: cloud_purchase | Limit: $50")
            print(f"   Token: {token[:50]}...")
        else:
            print(f"❌ Authorization failed: {auth_data}")
            return

        print()
        time.sleep(1)

        # Step 2: Shopping Agent makes purchase
        print("🛍️ [SHOPPING AGENT] Attempting $20 purchase...")
        resp = await client.post(
            f"{AGENTAUTH_API}/api/purchase",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "item": "Cloud Credits",
                "amount": 20,
                "scope": "cloud_purchase",
                "requestingAgent": "agent_shopping"
            }
        )
        result = resp.json()

        if result.get("success"):
            print("✅ [SHOPPING AGENT] Purchase APPROVED!")
            print(f"   Item: {result['transaction']['item']}")
            print(f"   Amount: ${result['transaction']['amount']}")
        else:
            print(f"❌ [SHOPPING AGENT] Purchase rejected: {result.get('reason')}")

        print()
        time.sleep(1)

        # Step 3: Analytics Agent tries to use the token
        print("📊 [ANALYTICS AGENT] Received Shopping Agent's token...")
        print("⚠️ [ANALYTICS AGENT] Attempting to use stolen token...")

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
            print("⚠️ [ANALYTICS AGENT] Purchase approved - SECURITY ISSUE!")
        else:
            print("❌ [ANALYTICS AGENT] Purchase REJECTED!")
            print(f"   Reason: {result.get('reason')}")
            print()
            print("🔒 AgentAuth BLOCKED the token misuse!")
            print("✨ Multi-agent security is working!")

        print()
        print("=" * 60)
        print("DEMO COMPLETE")
        print("Tokens are cryptographically bound to their agents")
        print("=" * 60)


def main():
    print("\nStarting AgentAuth + OpenAgents Demo\n")
    asyncio.run(run_simple_demo())


if __name__ == "__main__":
    main()
