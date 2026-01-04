export interface AgentAuthPayload {
  principal: string;
  agent: string;
  scope: string[];
  limit: number;
  currency: string;
  issuedAt: string;
  expiresAt: string;
  issuer: string;
}

export interface VerifyOptions {
  requiredScope: string;
  amount: number;
  requestingAgent?: string; // The agent attempting to use the token
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
  payload?: AgentAuthPayload;
}
