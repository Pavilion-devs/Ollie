import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/agentauth';

export async function POST(request: NextRequest) {
  // Extract token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Purchase rejected', reason: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '');

  // Parse request body
  const body = await request.json();
  const { item, amount, scope } = body;

  // Verify token
  const result = verifyToken(token, { requiredScope: scope, amount });

  if (!result.valid) {
    return NextResponse.json(
      { success: false, message: 'Purchase rejected', reason: result.reason },
      { status: 403 }
    );
  }

  // Success response
  return NextResponse.json({
    success: true,
    message: 'Purchase authorized',
    transaction: {
      item,
      amount,
      authorizedBy: result.payload!.principal,
      agent: result.payload!.agent,
    },
  });
}
