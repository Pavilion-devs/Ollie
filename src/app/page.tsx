'use client';

import { useState } from 'react';

export default function Home() {
  const [principal, setPrincipal] = useState('user_123');
  const [agentId, setAgentId] = useState('agent_shopping_assistant');
  const [scope, setScope] = useState('cloud_purchase');
  const [limit, setLimit] = useState(50);
  const [expiresIn, setExpiresIn] = useState(60);
  const [generatedToken, setGeneratedToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [merchantToken, setMerchantToken] = useState('');
  const [itemName, setItemName] = useState('Cloud Credits');
  const [itemAmount, setItemAmount] = useState(20);
  const [requiredScope, setRequiredScope] = useState('cloud_purchase');
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean;
    message: string;
    transaction?: any;
    reason?: string;
  } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // AI Parse states
  const [aiDescription, setAiDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsedByAI, setParsedByAI] = useState(false);

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    setGeneratedToken('');
    try {
      const response = await fetch('/api/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal,
          agent: agentId,
          scope: [scope],
          limit,
          currency: 'USD',
          expiresInMinutes: expiresIn,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedToken(data.token);
        setMerchantToken(data.token);
      }
    } catch (error) {
      console.error('Error generating token:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAttemptPurchase = async () => {
    setIsPurchasing(true);
    setPurchaseResult(null);
    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${merchantToken}`,
        },
        body: JSON.stringify({
          item: itemName,
          amount: itemAmount,
          scope: requiredScope,
        }),
      });
      const data = await response.json();
      setPurchaseResult(data);
    } catch (error) {
      setPurchaseResult({
        success: false,
        message: 'Purchase rejected',
        reason: 'Network error',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const trySuccessfulPurchase = () => {
    setItemName('Cloud Credits');
    setItemAmount(20);
    setRequiredScope('cloud_purchase');
  };

  const tryFailedPurchase = () => {
    setItemName('Premium Storage');
    setItemAmount(100);
    setRequiredScope('cloud_purchase');
  };

  const handleParseWithAI = async (description?: string) => {
    const textToParse = description || aiDescription;
    if (!textToParse.trim()) {
      setParseError('Please enter a description');
      return;
    }

    setIsParsing(true);
    setParseError('');
    setParsedByAI(false);

    try {
      const response = await fetch('/api/parse-authorization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: textToParse }),
      });
      const data = await response.json();

      if (data.success && data.parsed) {
        // Auto-fill the form fields
        setAgentId(`agent_${data.parsed.agent}`);
        setScope(data.parsed.scope[0] || 'general');
        setLimit(data.parsed.limit || 50);
        setExpiresIn(data.parsed.durationMinutes || 60);
        setParsedByAI(true);
        setAiDescription('');

        // Clear success message after 3 seconds
        setTimeout(() => setParsedByAI(false), 3000);
      } else {
        setParseError(data.error || 'Failed to parse description');
      }
    } catch (error) {
      setParseError('Network error - please try again');
    } finally {
      setIsParsing(false);
    }
  };

  const quickFillExamples = {
    shopping: "Let my shopping assistant spend up to $50 on cloud services for the next hour",
    email: "Allow email bot to read and send emails for 24 hours",
    analytics: "Give my analytics agent access to view reports",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Static Grid Overlay */}
      <div className="fixed inset-0 z-0 bg-grid-pattern opacity-40 pointer-events-none" aria-hidden="true"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-900 w-3 h-3"></div>
            <span className="text-sm font-medium text-neutral-900 tracking-tight">AGENTAUTH</span>
          </div>

          <div className="flex items-center gap-3">
            <a href="/demo" className="group relative rounded-sm p-[1px] bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300">
              <div className="relative h-full w-full bg-white/50 rounded-[1px] px-3 sm:px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors">Multi-Agent Demo</span>
              </div>
            </a>
            <a href="#demo" className="group relative rounded-sm p-[1px] bg-gradient-to-b from-neutral-200 to-neutral-300 hover:from-neutral-300 hover:to-neutral-400 transition-all duration-300">
              <div className="relative h-full w-full bg-white/50 rounded-[1px] px-3 sm:px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                <span className="text-xs font-medium text-neutral-600 group-hover:text-black transition-colors">Try It</span>
              </div>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="sm:pt-32 sm:pb-24 sm:px-6 max-w-6xl z-10 mr-auto ml-auto pt-24 pr-4 pb-12 pl-4 relative">
        <div className="flex flex-col md:pl-12 sm:pl-8 sm:gap-8 border-neutral-200 border-l pb-20 pl-6 relative gap-x-6 gap-y-6 items-start">

          {/* Decorator Dots */}
          <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-white border border-neutral-200" aria-hidden="true"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50/80 backdrop-blur-sm border border-neutral-200 rounded-full animate-in animate-in-delay-1 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-emerald"></span>
              <span className="inline-flex bg-emerald-500 w-2 h-2 rounded-full relative"></span>
            </span>
            <span className="text-[10px] uppercase font-medium text-emerald-600 tracking-wide">AI Build-Off 2025</span>
          </div>

          <h1 className="sm:text-5xl md:text-7xl leading-[1.1] animate-in animate-in-delay-2 text-3xl font-medium text-neutral-900 tracking-tighter">
            Trust, But Verify.
          </h1>

          <p className="md:text-base leading-relaxed animate-in animate-in-delay-2 text-sm font-light text-neutral-500 max-w-xl">
            Delegated authority for AI agents. In a world where AI agents act autonomously, merchants need to verify: who authorized this? what&apos;s the limit? who&apos;s liable? AgentAuth answers all three.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 w-full sm:w-auto animate-in animate-in-delay-3">
            <div className="p-[1px] rounded-sm bg-gradient-to-b from-emerald-500 to-emerald-600 w-full sm:w-auto shadow-sm hover:from-emerald-600 hover:to-emerald-700 transition-all">
              <a href="/demo" className="block hover:bg-emerald-700 transition-colors text-xs font-semibold text-white tracking-wide text-center bg-emerald-600 w-full h-full rounded-[1px] pt-3.5 pr-6 pb-3.5 pl-6 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>
                MULTI-AGENT DEMO
              </a>
            </div>

            <div className="p-[1px] rounded-sm bg-gradient-to-b from-neutral-700 to-neutral-900 w-full sm:w-auto shadow-sm">
              <a href="#demo" className="block hover:bg-neutral-800 transition-colors text-xs font-semibold text-white tracking-wide text-center bg-neutral-900 w-full h-full rounded-[1px] pt-3.5 pr-6 pb-3.5 pl-6">
                TRY IT YOURSELF
              </a>
            </div>

            <div className="p-[1px] rounded-sm bg-gradient-to-b from-neutral-200 to-neutral-300 w-full sm:w-auto shadow-sm hover:from-neutral-300 hover:to-neutral-400 transition-all">
              <a href="#docs" className="hover:text-black transition-colors flex items-center justify-center gap-2 text-xs font-medium text-neutral-600 text-center bg-white/90 w-full h-full rounded-[1px] pt-3.5 pr-6 pb-3.5 pl-6 backdrop-blur-sm">
                VIEW DOCS
              </a>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-30 mt-8 sm:mt-16 grid grid-cols-2 md:grid-cols-4 border-y border-neutral-200 animate-in animate-in-delay-3 bg-white/60 backdrop-blur-sm">
          <div className="p-4 sm:p-8 border-r border-neutral-200 text-center">
            <div className="sm:text-2xl md:text-3xl text-xl font-medium text-neutral-900 tracking-tighter mb-1">JWT Signed</div>
            <div className="text-[9px] sm:text-[10px] uppercase text-neutral-500 tracking-widest font-mono">Industry Standard</div>
          </div>
          <div className="p-4 sm:p-8 md:border-r border-neutral-200 text-center">
            <div className="sm:text-2xl md:text-3xl text-xl font-medium text-neutral-900 tracking-tighter mb-1">&lt; 10ms</div>
            <div className="text-[9px] sm:text-[10px] uppercase text-neutral-500 tracking-widest font-mono">Verification Time</div>
          </div>
          <div className="p-4 sm:p-8 border-r border-t md:border-t-0 border-neutral-200 text-center">
            <div className="sm:text-2xl md:text-3xl text-xl font-medium text-neutral-900 tracking-tighter mb-1">Scope-Based</div>
            <div className="text-[9px] sm:text-[10px] uppercase text-neutral-500 tracking-widest font-mono">Fine-Grained Control</div>
          </div>
          <div className="p-4 sm:p-8 text-center border-t md:border-t-0 border-neutral-200">
            <div className="sm:text-2xl md:text-3xl text-xl font-medium text-neutral-900 tracking-tighter mb-1">Open Source</div>
            <div className="text-[9px] sm:text-[10px] uppercase text-neutral-500 tracking-widest font-mono">MIT Licensed</div>
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="sm:py-24 bg-white z-10 pt-16 pb-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 sm:mb-16 gap-4 sm:gap-6 border-b border-neutral-200 pb-6 sm:pb-8">
            <div>
              <h2 className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                How It Works
              </h2>
              <h3 className="text-2xl font-medium text-neutral-900 tracking-tighter sm:text-2xl">Verifiable authority in three steps.</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
            <div className="bg-white p-6 sm:p-10 hover:bg-neutral-50 transition-colors duration-300">
              <div className="inline-block text-xs text-neutral-500 font-mono bg-neutral-50 border-neutral-200 border rounded-sm mb-4 pt-1 pr-2 pb-1 pl-2">01 / AUTHORIZE</div>
              <h4 className="sm:text-lg text-base font-medium text-neutral-900 tracking-tight mb-3">User Grants Permissions</h4>
              <p className="leading-relaxed text-xs font-light text-neutral-500">A user authorizes an AI agent with specific scopes, spending limits, and time bounds. This creates a signed JWT token.</p>
            </div>

            <div className="bg-white p-6 sm:p-10 hover:bg-neutral-50 transition-colors duration-300">
              <div className="inline-block text-xs text-neutral-500 font-mono bg-neutral-50 border-neutral-200 border rounded-sm mb-4 pt-1 pr-2 pb-1 pl-2">02 / ACT</div>
              <h4 className="sm:text-lg text-base font-medium text-neutral-900 tracking-tight mb-3">Agent Carries Token</h4>
              <p className="leading-relaxed text-xs font-light text-neutral-500">The AI agent presents the signed token to merchants when making purchases or taking actions on behalf of the user.</p>
            </div>

            <div className="bg-white p-6 sm:p-10 hover:bg-neutral-50 transition-colors duration-300">
              <div className="inline-block text-xs text-neutral-500 font-mono bg-neutral-50 border-neutral-200 border rounded-sm mb-4 pt-1 pr-2 pb-1 pl-2">03 / VERIFY</div>
              <h4 className="sm:text-lg text-base font-medium text-neutral-900 tracking-tight mb-3">Merchant Validates</h4>
              <p className="leading-relaxed text-xs font-light text-neutral-500">Merchants verify the token signature, check scope permissions, validate limits, and ensure the token hasn&apos;t expired.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 sm:py-24 bg-neutral-50 border-b border-neutral-200 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              Live Demo
            </h2>
            <h3 className="text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tighter">See It In Action</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Quick Authorize Card */}
            <div className="relative p-[1px] rounded-sm bg-gradient-to-b from-emerald-200 to-emerald-300 shadow-sm md:col-span-2">
              <div className="bg-white rounded-[1px] p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <h4 className="text-lg font-medium text-neutral-900 tracking-tight">Quick Authorize with AI</h4>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 ml-auto">BETA</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Describe authorization in plain English</label>
                    <textarea
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      placeholder="e.g., 'Let my shopping assistant spend up to $50 on cloud services for the next hour'"
                      className="w-full input-base px-3 py-3 rounded-sm text-sm min-h-[80px] resize-y"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleParseWithAI()}
                      disabled={isParsing}
                      className="flex-1 bg-emerald-600 text-white px-4 py-3 text-xs font-semibold tracking-wide hover:bg-emerald-700 transition-colors rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isParsing ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Parsing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Parse with AI
                        </>
                      )}
                    </button>

                    {/* Quick-fill examples */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleParseWithAI(quickFillExamples.shopping)}
                        className="px-3 py-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm hover:bg-emerald-100 transition-colors"
                      >
                        Shopping: $50 cloud
                      </button>
                      <button
                        onClick={() => handleParseWithAI(quickFillExamples.email)}
                        className="px-3 py-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm hover:bg-emerald-100 transition-colors"
                      >
                        Email: read & send
                      </button>
                      <button
                        onClick={() => handleParseWithAI(quickFillExamples.analytics)}
                        className="px-3 py-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm hover:bg-emerald-100 transition-colors"
                      >
                        Analytics: view
                      </button>
                    </div>
                  </div>

                  {/* Status messages */}
                  {parsedByAI && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm p-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Parsed by AI - form fields filled below, review and edit as needed</span>
                    </div>
                  )}

                  {parseError && (
                    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm p-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{parseError}</span>
                    </div>
                  )}

                  <p className="text-[9px] text-neutral-400 text-center">Powered by OpenAI • Requires API key in environment variables</p>
                </div>
              </div>
            </div>

            {/* Left Card - Authorize Agent */}
            <div className="relative p-[1px] rounded-sm bg-gradient-to-b from-neutral-200 to-neutral-300 shadow-sm">
              <div className="bg-white rounded-[1px] p-6 sm:p-8">
                <h4 className="text-lg font-medium text-neutral-900 tracking-tight mb-6">1. Authorize Agent</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Principal (User ID)</label>
                    <input
                      type="text"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="w-full input-base px-3 py-3 rounded-sm text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Agent ID</label>
                    <input
                      type="text"
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      className="w-full input-base px-3 py-3 rounded-sm text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Scope</label>
                    <input
                      type="text"
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full input-base px-3 py-3 rounded-sm text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Limit ($)</label>
                      <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="w-full input-base px-3 py-3 rounded-sm text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Expires (min)</label>
                      <input
                        type="number"
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(Number(e.target.value))}
                        className="w-full input-base px-3 py-3 rounded-sm text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-[1px] rounded-sm bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-sm">
                    <button
                      onClick={handleGenerateToken}
                      disabled={isGenerating}
                      className="w-full bg-neutral-900 text-white px-4 py-3 text-xs font-semibold tracking-wide hover:bg-neutral-800 transition-colors rounded-[1px] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? 'GENERATING...' : 'GENERATE TOKEN'}
                    </button>
                  </div>

                  {generatedToken && (
                    <div className="mt-4">
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Generated Token</label>
                      <div
                        onClick={handleCopyToken}
                        className="bg-neutral-50 border border-neutral-200 rounded-sm p-3 max-h-32 overflow-y-auto cursor-pointer hover:border-emerald-300 transition-colors relative group"
                      >
                        <code className="text-[10px] text-neutral-700 break-all font-mono">{generatedToken}</code>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedToClipboard ? (
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-[9px] text-neutral-400 mt-1">{copiedToClipboard ? 'Copied!' : 'Click to copy'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Card - Merchant Verification */}
            <div className="relative p-[1px] rounded-sm bg-gradient-to-b from-neutral-200 to-neutral-300 shadow-sm">
              <div className="bg-white rounded-[1px] p-6 sm:p-8">
                <h4 className="text-lg font-medium text-neutral-900 tracking-tight mb-6">2. Merchant Verification</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Token</label>
                    <textarea
                      value={merchantToken}
                      onChange={(e) => setMerchantToken(e.target.value)}
                      placeholder="Paste token or generate from step 1..."
                      className="w-full input-base px-3 py-3 rounded-sm text-sm min-h-[80px] resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Item</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full input-base px-3 py-3 rounded-sm text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Amount ($)</label>
                      <input
                        type="number"
                        value={itemAmount}
                        onChange={(e) => setItemAmount(Number(e.target.value))}
                        className="w-full input-base px-3 py-3 rounded-sm text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1.5">Required Scope</label>
                      <input
                        type="text"
                        value={requiredScope}
                        onChange={(e) => setRequiredScope(e.target.value)}
                        className="w-full input-base px-3 py-3 rounded-sm text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-[1px] rounded-sm bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-sm">
                    <button
                      onClick={handleAttemptPurchase}
                      disabled={isPurchasing}
                      className="w-full bg-neutral-900 text-white px-4 py-3 text-xs font-semibold tracking-wide hover:bg-neutral-800 transition-colors rounded-[1px] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isPurchasing ? 'VERIFYING...' : 'ATTEMPT PURCHASE'}
                    </button>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={trySuccessfulPurchase}
                      className="flex-1 px-3 py-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm hover:bg-emerald-100 transition-colors"
                    >
                      Try $20 ✓
                    </button>
                    <button
                      onClick={tryFailedPurchase}
                      className="flex-1 px-3 py-2 text-[10px] font-medium text-red-700 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 transition-colors"
                    >
                      Try $100 ✗
                    </button>
                  </div>

                  {purchaseResult && (
                    <div className={`mt-4 p-4 rounded-sm border ${
                      purchaseResult.success
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {purchaseResult.success ? (
                          <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${purchaseResult.success ? 'text-emerald-900' : 'text-red-900'}`}>
                            {purchaseResult.message}
                          </p>
                          {purchaseResult.reason && (
                            <p className="text-xs text-red-700 mt-1">{purchaseResult.reason}</p>
                          )}
                          {purchaseResult.transaction && (
                            <div className="mt-2 text-xs text-emerald-800 bg-emerald-100/50 rounded-sm p-2 font-mono">
                              <div>Item: {purchaseResult.transaction.item}</div>
                              <div>Amount: ${purchaseResult.transaction.amount}</div>
                              <div>Authorized By: {purchaseResult.transaction.authorizedBy}</div>
                              <div>Agent: {purchaseResult.transaction.agent}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 sm:py-12 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neutral-900"></div>
            <span>AgentAuth © 2025</span>
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
