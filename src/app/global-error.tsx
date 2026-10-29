'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

type SupportedLocale = 'en' | 'es' | 'pt-BR';

const MESSAGES: Record<
  SupportedLocale,
  {
    badge: string;
    title: string;
    description: string;
    retry: string;
    reloadHome: string;
    referenceCode: string;
    reportIssue: string;
    language: string;
  }
> = {
  en: {
    badge: 'HTTP 500 • Critical Layout Error',
    title: 'A critical system error occurred',
    description:
      'The root application layout encountered an unexpected exception. The error boundary contained the failure to protect application integrity.',
    retry: 'Try Again',
    reloadHome: 'Reload Application',
    referenceCode: 'Reference code',
    reportIssue: 'Report an issue on GitHub',
    language: 'Language',
  },
  es: {
    badge: 'HTTP 500 • Error Crítico de Layout',
    title: 'Ocurrió un error crítico del sistema',
    description:
      'El layout raíz de la aplicación encontró una excepción inesperada. El límite de error contuvo el fallo para proteger la integridad de la aplicación.',
    retry: 'Reintentar',
    reloadHome: 'Recargar Aplicación',
    referenceCode: 'Código de referencia',
    reportIssue: 'Reportar un problema en GitHub',
    language: 'Idioma',
  },
  'pt-BR': {
    badge: 'HTTP 500 • Erro Crítico de Layout',
    title: 'Ocorreu um erro crítico no sistema',
    description:
      'O layout raiz da aplicação encontrou uma exceção inesperada. O limite de erro conteve a falha para proteger a integridade da aplicação.',
    retry: 'Tentar Novamente',
    reloadHome: 'Recarregar Aplicação',
    referenceCode: 'Código de referência',
    reportIssue: 'Relatar um problema no GitHub',
    language: 'Idioma',
  },
};

function resolveLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  const htmlLang = document.documentElement.lang?.toLowerCase();
  if (htmlLang === 'es' || htmlLang.startsWith('es-')) return 'es';
  if (htmlLang === 'pt-br' || htmlLang.startsWith('pt')) return 'pt-BR';
  const navLang = navigator.language?.toLowerCase() || '';
  if (navLang.startsWith('es')) return 'es';
  if (navLang.startsWith('pt')) return 'pt-BR';
  return 'en';
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [locale, setLocale] = useState<SupportedLocale>('en');

  useEffect(() => {
    setLocale(resolveLocale());
    console.error('[GlobalErrorBoundary]', error);
  }, [error]);

  const copy = MESSAGES[locale] ?? MESSAGES.en;

  return (
    <html lang={locale} className="h-full">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <main
          id="main-content"
          role="alert"
          aria-live="assertive"
          className="relative flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24"
        >
          {/* Ambient background lighting */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            <div className="h-90 w-90 rounded-full bg-destructive/15 blur-3xl sm:h-120 sm:w-120" />
          </div>

          {/* Official Isotype Badge */}
          <div className="relative mb-6 flex items-center justify-center">
            <div
              className="absolute -inset-4 rounded-3xl bg-linear-to-r from-red-500/20 via-amber-500/20 to-violet-500/20 blur-xl motion-safe:animate-pulse"
              aria-hidden="true"
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border/80 bg-card/90 p-3.5 shadow-xl backdrop-blur-md sm:h-24 sm:w-24">
              <Image
                src="/brand/logo-symbol.svg"
                alt="chatflow-agent official isotype"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-destructive">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
            <span>{copy.badge}</span>
          </div>

          {/* 500 Watermark & Title */}
          <div className="relative mb-3">
            <span
              className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none text-7xl font-black tracking-tighter text-muted/20 sm:-top-12 sm:text-9xl dark:text-muted/10"
              aria-hidden="true"
            >
              500
            </span>
            <h1 className="relative text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
              {copy.title}
            </h1>
          </div>

          {/* Description */}
          <p className="max-w-lg text-balance text-sm text-muted-foreground sm:text-base leading-relaxed">
            {copy.description}
          </p>

          {/* Optional Digest */}
          {error?.digest && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-mono text-muted-foreground">
              <span className="font-semibold text-foreground/80">{copy.referenceCode}:</span>
              <span>{error.digest}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-98 cursor-pointer"
            >
              {copy.retry}
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/${locale}`;
                }
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-background/80 px-6 text-sm font-semibold text-foreground backdrop-blur-xs transition-all hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-98 cursor-pointer"
            >
              {copy.reloadHome}
            </button>
          </div>

          {/* Self-contained flagless language selector */}
          <div className="mt-12 flex flex-col items-center gap-2 border-t border-border/60 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.language}
            </span>
            <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-1" role="group" aria-label={copy.language}>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-background font-semibold text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLocale('es')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  locale === 'es'
                    ? 'bg-background font-semibold text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => setLocale('pt-BR')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  locale === 'pt-BR'
                    ? 'bg-background font-semibold text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Português (Brasil)
              </button>
            </div>
          </div>

          {/* GitHub Issue Reporting Link */}
          <div className="mt-6">
            <a
              href="https://github.com/GustavoBaranda/chatflow-agent/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {copy.reportIssue} →
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
