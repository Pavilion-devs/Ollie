'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LogEntry {
  agent: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface DemoResult {
  success: boolean;
  security_test_passed: boolean;
  logs: LogEntry[];
  conclusion: string;
  error?: string;
}

export default function DemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentsApiUrl, setAgentsApiUrl] = useState(
    process.env.NEXT_PUBLIC_AGENTS_API || 'http://localhost:8000'
  );

  const runDemo = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${agentsApiUrl}/agents/demo/run`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to connect to OpenAgents API. Make sure the Python service is running.'
      );
    } finally {
      setIsRunning(false);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'agent_shopping':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'agent_analytics':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'system':
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Static Grid Overlay */}
      <div className="fixed inset-0 z-0 bg-grid-pattern opacity-40 pointer-events-none" aria-hidden="true"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-neutral-900 w-3 h-3"></div>
            <span className="text-sm font-medium text-neutral-900 tracking-tight">AGENTAUTH</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <div className="group relative rounded-sm p-[1px] bg-gradient-to-b from-emerald-400 to-emerald-500">
              <div className="relative h-full w-full bg-white/50 rounded-[1px] px-3 sm:px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-emerald-700">Multi-Agent Demo</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50/80 backdrop-blur-sm border border-neutral-200 rounded-full mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="inline-flex bg-emerald-500 w-2 h-2 rounded-full relative"></span>
            </span>
            <span className="text-[10px] uppercase font-medium text-emerald-600 tracking-wide">OpenAgents Integration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-neutral-900 tracking-tighter mb-4">
            Multi-Agent Security Demo
          </h1>
          <p className="text-sm sm:text-base font-light text-neutral-500 max-w-2xl">
            Watch how AgentAuth prevents token theft between AI agents. A Shopping Agent gets authorized,
            then an Analytics Agent tries to steal and use that token.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="mb-8 p-6 bg-neutral-50 border border-neutral-200 rounded-sm">
          <h3 className="text-xs font-mono uppercase text-neutral-500 tracking-widest mb-4">Demo Flow</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <div className="flex-1 p-4 bg-blue-50 border border-blue-200 rounded-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">1</span>
              </div>
              <div className="text-sm font-medium text-blue-800">Shopping Agent</div>
              <div className="text-xs text-blue-600 mt-1">Gets authorization</div>
            </div>
            <svg className="w-6 h-6 text-neutral-400 rotate-90 sm:rotate-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex-1 p-4 bg-emerald-50 border border-emerald-200 rounded-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">2</span>
              </div>
              <div className="text-sm font-medium text-emerald-800">Makes Purchase</div>
              <div className="text-xs text-emerald-600 mt-1">$20 cloud credits</div>
            </div>
            <svg className="w-6 h-6 text-neutral-400 rotate-90 sm:rotate-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex-1 p-4 bg-purple-50 border border-purple-200 rounded-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">3</span>
              </div>
              <div className="text-sm font-medium text-purple-800">Analytics Agent</div>
              <div className="text-xs text-purple-600 mt-1">Tries stolen token</div>
            </div>
            <svg className="w-6 h-6 text-neutral-400 rotate-90 sm:rotate-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-sm">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">4</span>
              </div>
              <div className="text-sm font-medium text-red-800">BLOCKED</div>
              <div className="text-xs text-red-600 mt-1">Token bound to agent</div>
            </div>
          </div>
        </div>

        {/* API URL Config */}
        <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-sm">
          <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">OpenAgents API URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={agentsApiUrl}
              onChange={(e) => setAgentsApiUrl(e.target.value)}
              className="flex-1 bg-white border border-neutral-200 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-400"
              placeholder="http://localhost:8000"
            />
            <button
              onClick={() => setAgentsApiUrl('http://localhost:8000')}
              className="px-3 py-2 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-sm hover:bg-neutral-50 transition-colors"
            >
              Reset
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            Set NEXT_PUBLIC_AGENTS_API environment variable in production
          </p>
        </div>

        {/* Run Demo Button */}
        <div className="mb-8">
          <div className="p-[1px] rounded-sm bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-lg inline-block">
            <button
              onClick={runDemo}
              disabled={isRunning}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-sm font-semibold tracking-wide transition-colors rounded-[1px] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running Multi-Agent Demo...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Multi-Agent Security Demo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Connection Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <p className="text-xs text-red-500 mt-2">
                  Make sure the OpenAgents service is running: <code className="bg-red-100 px-1 py-0.5 rounded">python openagents-demo/main.py</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className={`p-6 rounded-sm border ${
              result.security_test_passed
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-4">
                {result.security_test_passed ? (
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className={`text-lg font-medium ${
                    result.security_test_passed ? 'text-emerald-900' : 'text-red-900'
                  }`}>
                    {result.security_test_passed
                      ? 'Security Test Passed!'
                      : 'Security Vulnerability Detected'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    result.security_test_passed ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {result.conclusion}
                  </p>
                </div>
              </div>
            </div>

            {/* Agent Activity Log */}
            <div className="border border-neutral-200 rounded-sm overflow-hidden">
              <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                <h3 className="text-xs font-mono uppercase text-neutral-600 tracking-widest">Agent Activity Log</h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {result.logs.map((log, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 flex items-start gap-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm border ${getAgentColor(log.agent)}`}>
                          {log.agent}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Details */}
            <div className="border border-neutral-200 rounded-sm overflow-hidden">
              <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                <h3 className="text-xs font-mono uppercase text-neutral-600 tracking-widest">How It Works</h3>
              </div>
              <div className="p-4 space-y-3 text-sm text-neutral-600">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">1.</span>
                  <span><strong>Agent Binding:</strong> When a token is issued, it includes the agent ID (<code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">agent_shopping</code>) in the JWT payload.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">2.</span>
                  <span><strong>Identity Verification:</strong> When a purchase is attempted, the requesting agent must provide their ID.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">3.</span>
                  <span><strong>Mismatch Detection:</strong> AgentAuth compares the token&apos;s agent with the requesting agent. If they don&apos;t match, the request is rejected.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">4.</span>
                  <span><strong>Result:</strong> Even with a valid token, <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">agent_analytics</code> cannot impersonate <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">agent_shopping</code>.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neutral-900"></div>
            <span>AgentAuth + OpenAgents</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Built for AI Build-Off 2025
          </div>
        </div>
      </footer>
    </div>
  );
}
