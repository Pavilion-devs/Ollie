import jwt from 'jsonwebtoken';
import type { AgentAuthPayload, VerifyOptions, VerifyResult } from './types';

const SECRET = 'agentauth-demo-secret-key-2024';

export function signToken(
  payload: Omit<AgentAuthPayload, 'issuedAt' | 'issuer'>
): string {
  const fullPayload: AgentAuthPayload = {
    ...payload,
    issuedAt: new Date().toISOString(),
    issuer: 'AgentAuth',
  };

  return jwt.sign(fullPayload, SECRET, { algorithm: 'HS256' });
}

export function verifyToken(token: string, options: VerifyOptions): VerifyResult {
  // Verify JWT signature
  let payload: AgentAuthPayload;
  try {
    payload = jwt.verify(token, SECRET, { algorithms: ['HS256'] }) as AgentAuthPayload;
  } catch {
    return { valid: false, reason: 'Invalid token signature' };
  }

  // Check if token is expired
  if (new Date(payload.expiresAt) < new Date()) {
    return { valid: false, reason: 'Token has expired' };
  }

  // Check if requesting agent matches the token's bound agent
  if (options.requestingAgent && options.requestingAgent !== payload.agent) {
    return {
      valid: false,
      reason: `Agent '${options.requestingAgent}' cannot use token issued to '${payload.agent}'`,
    };
  }

  // Check if requiredScope is in the scope array
  if (!payload.scope.includes(options.requiredScope)) {
    return { valid: false, reason: `Scope '${options.requiredScope}' not authorized` };
  }

  // Check if amount <= limit
  if (options.amount > payload.limit) {
    return {
      valid: false,
      reason: `Amount $${options.amount} exceeds limit of $${payload.limit}`,
    };
  }

  return { valid: true, payload };
}
