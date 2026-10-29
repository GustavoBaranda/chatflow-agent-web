import Image from 'next/image';
import Link from 'next/link';
import { Home, BookOpen, ArrowUpRight, Info, Users } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center p-4 text-center antialiased">
      {/* Ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl sm:h-[480px] sm:w-[480px]" />
      </div>

      <main id="main-content" className="mx-auto flex max-w-2xl flex-col items-center py-16">
        {/* Official Isotype Badge */}
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className="absolute -inset-4 rounded-3xl bg-linear-to-r from-blue-500/20 via-violet-500/20 to-teal-500/20 blur-xl motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border/80 bg-card/90 p-3.5 shadow-xl backdrop-blur-md sm:h-24 sm:w-24">
            <Image
              src="/brand/logo-symbol.svg"
              alt="chatflow-agent official isotype"
              width={64}
              height={64}
              className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span>HTTP 404 • Unmapped Route</span>
        </div>

        {/* 404 Watermark & Title */}
        <div className="relative mb-3">
          <span
            className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none text-7xl font-black tracking-tighter text-muted/20 sm:-top-12 sm:text-9xl dark:text-muted/10"
            aria-hidden="true"
          >
            404
          </span>
          <h1 className="relative text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
            Conversation flow reached an unmapped route
          </h1>
        </div>

        {/* Conversational Agent-themed Description */}
        <p className="max-w-lg text-balance text-sm text-muted-foreground sm:text-base leading-relaxed">
          The agent attempted a context handoff, but this path does not exist in the session graph. It may have been moved, renamed, or is currently under active development.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/en"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-98"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Return to Home</span>
          </Link>
          <a
            href="https://github.com/GustavoBaranda/chatflow-agent#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-6 text-sm font-semibold text-foreground backdrop-blur-xs transition-all hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-98"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Read Official Documentation</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </a>
        </div>

        {/* Quick Links Section */}
        <div className="mt-12 w-full max-w-md border-t border-border/60 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Or explore these sections:
          </p>
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/en/about"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-card hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              <span>About the Project</span>
            </Link>
            <a
              href="https://github.com/GustavoBaranda/chatflow-agent/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-card hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Community & Discussions</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
