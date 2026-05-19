'use client'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center bg-surface-dark text-white">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <button
            onClick={() => reset()}
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium hover:bg-primary-500"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
