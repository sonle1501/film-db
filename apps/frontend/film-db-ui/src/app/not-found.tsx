import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center bg-surface-dark text-white text-center px-4">
      <h2 className="text-6xl font-display font-bold text-primary-500 mb-4">404</h2>
      <h3 className="text-2xl font-semibold mb-6">Page Not Found</h3>
      <p className="text-text-muted-dark mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/"
        className="rounded-full bg-primary-600 px-6 py-3 text-sm font-medium hover:bg-primary-500 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
