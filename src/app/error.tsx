"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error(error);
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page couldn&apos;t be loaded. This is usually a temporary problem reaching the database.
        </p>
        <button type="button" className="btn btn-primary mt-5" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
