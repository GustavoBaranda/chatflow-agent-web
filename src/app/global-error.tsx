'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}

