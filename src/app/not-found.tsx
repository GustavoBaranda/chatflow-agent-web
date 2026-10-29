import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 text-center antialiased selection:bg-primary/20"
        suppressHydrationWarning
      >
        <div className="max-w-md space-y-4">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            404
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-primary"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

