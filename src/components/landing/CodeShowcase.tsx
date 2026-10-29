'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, Terminal, ShieldCheck, Zap, Database } from 'lucide-react';

const PYTHON_CODE = `import asyncio
from chatflow_agent import Agent, Runner, SQLiteSessionStore

# 1. Define a specialized conversational agent
support_agent = Agent(
    name="SupportAgent",
    instructions="You are a helpful customer support agent. Answer questions or delegate.",
    model="gemini-2.5-flash",
)

# 2. Initialize Runner with persistent SQLite session store
runner = Runner(
    starting_agent=support_agent,
    session_store=SQLiteSessionStore("chatflow_sessions.db"),
)

# 3. Process conversation turn asynchronously
async def main():
    response = await runner.run_async(
        session_id="user_session_42",
        user_message="Hello! How do I connect this agent to WhatsApp?",
    )
    print(response.content)

if __name__ == "__main__":
    asyncio.run(main())`;

export function CodeShowcase() {
  const t = useTranslations('home');
  const [copiedPip, setCopiedPip] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyPip = async () => {
    try {
      await navigator.clipboard.writeText('pip install chatflow-agent');
      setCopiedPip(true);
      setTimeout(() => setCopiedPip(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section id="quickstart" aria-labelledby="quickstart-title" className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="quickstart-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('installTitle')}
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {t('installSubtitle')}
        </p>

        {/* Pip Install Command Box */}
        <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs max-w-xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto text-left font-mono text-sm text-foreground">
            <Terminal className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-muted-foreground select-none">$</span>
            <code className="font-semibold text-primary">pip install chatflow-agent</code>
          </div>
          <button
            type="button"
            onClick={handleCopyPip}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary cursor-pointer shrink-0 ml-3"
            aria-label={copiedPip ? t('copied') : t('copyCommand')}
          >
            {copiedPip ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                <span className="text-emerald-500 font-semibold">{t('copied')}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span>{t('copyCommand')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Window Showcase */}
      <div className="mt-10 mx-auto max-w-4xl rounded-2xl border border-border bg-slate-950 text-slate-100 shadow-2xl overflow-hidden">
        {/* Editor Window Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" aria-hidden="true" />
            <span className="ml-3 font-mono text-xs text-slate-400">quickstart.py</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              <span>{t('verifiedBadge')}</span>
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
              aria-label={copiedCode ? t('copied') : t('copyCommand')}
            >
              {copiedCode ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400 font-semibold">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span>{t('copyCommand')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-200">
          <pre>
            <code>
              <span className="text-purple-400">import</span> asyncio{'\n'}
              <span className="text-purple-400">from</span> chatflow_agent <span className="text-purple-400">import</span> Agent, Runner, SQLiteSessionStore{'\n\n'}
              <span className="text-slate-500"># 1. Define a specialized conversational agent</span>{'\n'}
              support_agent = Agent({'\n'}
              {'    '}name=<span className="text-emerald-300">&quot;SupportAgent&quot;</span>,{'\n'}
              {'    '}instructions=<span className="text-emerald-300">&quot;You are a helpful customer support agent. Answer questions or delegate.&quot;</span>,{'\n'}
              {'    '}model=<span className="text-emerald-300">&quot;gemini-2.5-flash&quot;</span>,{'\n'}
              ){'\n\n'}
              <span className="text-slate-500"># 2. Initialize Runner with persistent SQLite session store</span>{'\n'}
              runner = Runner({'\n'}
              {'    '}starting_agent=support_agent,{'\n'}
              {'    '}session_store=SQLiteSessionStore(<span className="text-emerald-300">&quot;chatflow_sessions.db&quot;</span>),{'\n'}
              ){'\n\n'}
              <span className="text-slate-500"># 3. Process conversation turn asynchronously</span>{'\n'}
              <span className="text-purple-400">async def</span> <span className="text-blue-400">main</span>():{'\n'}
              {'    '}response = <span className="text-purple-400">await</span> runner.run_async({'\n'}
              {'        '}session_id=<span className="text-emerald-300">&quot;user_session_42&quot;</span>,{'\n'}
              {'        '}user_message=<span className="text-emerald-300">&quot;Hello! How do I connect this agent to WhatsApp?&quot;</span>,{'\n'}
              {'    '}){'\n'}
              {'    '}<span className="text-blue-400">print</span>(response.content){'\n\n'}
              <span className="text-purple-400">if</span> __name__ == <span className="text-emerald-300">&quot;__main__&quot;</span>:{'\n'}
              {'    '}asyncio.run(main()){'\n'}
            </code>
          </pre>
        </div>

        {/* Technical Highlights Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Native asyncio</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-blue-400" />
              <span>SQLite State & Rollback</span>
            </span>
          </div>
          <span className="font-mono text-slate-500">Python &gt;= 3.10</span>
        </div>
      </div>
    </section>
  );
}

