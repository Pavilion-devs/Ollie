import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const SYSTEM_PROMPT = `You are an authorization parser for AgentAuth. Extract structured data from natural language authorization requests.

Return ONLY valid JSON with these fields:
- agent: string (the agent being authorized, e.g., 'shopping_assistant', 'email_bot')
- scope: string[] (permission scopes, e.g., ['cloud_purchase', 'email_read', 'email_send'])
- limit: number or null (spending limit if mentioned, null if not applicable)
- currency: string (default 'USD')
- durationMinutes: number (how long authorization lasts, default 60)

Examples:
Input: 'Let my shopping assistant spend up to $50 on cloud services for the next hour'
Output: {"agent": "shopping_assistant", "scope": ["cloud_purchase"], "limit": 50, "currency": "USD", "durationMinutes": 60}

Input: 'Allow email bot to read and send emails for 24 hours'
Output: {"agent": "email_bot", "scope": ["email_read", "email_send"], "limit": null, "currency": "USD", "durationMinutes": 1440}

Input: 'Give my analytics agent access to view reports'
Output: {"agent": "analytics_agent", "scope": ["reports_view"], "limit": null, "currency": "USD", "durationMinutes": 60}

Always return valid JSON only, no markdown or explanation.`;

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: description },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsed = JSON.parse(content);

    // Normalize the parsed data
    const normalized = {
      agent: parsed.agent || 'agent_' + Date.now(),
      scope: Array.isArray(parsed.scope) ? parsed.scope : ['general'],
      limit: parsed.limit ?? null,
      currency: parsed.currency || 'USD',
      durationMinutes: parsed.durationMinutes || 60,
    };

    return NextResponse.json({
      success: true,
      parsed: normalized,
    });
  } catch (error) {
    console.error('Parse authorization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse authorization',
      },
      { status: 500 }
    );
  }
}
