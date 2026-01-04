import os
from dotenv import load_dotenv

load_dotenv()

# Your deployed AgentAuth API URL
AGENTAUTH_API = os.getenv("AGENTAUTH_API", "https://your-app.zeabur.app")
