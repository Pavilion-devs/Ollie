import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/agentauth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { principal, agent, scope, limit, currency, expiresInMinutes } = body;

    // Validate required fields
    if (!principal || !agent || !scope || !limit || !currency || !expiresInMinutes) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate expiresAt
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    // Sign the token
    const token = signToken({
      principal,
      agent,
      scope,
      limit,
      currency,
      expiresAt,
    });

    // Get the payload (decode without verification for display)
    const payload = {
      principal,
      agent,
      scope,
      limit,
      currency,
      expiresAt,
      issuedAt: new Date().toISOString(),
      issuer: 'AgentAuth',
    };

    return NextResponse.json({
      success: true,
      token,
      payload,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
