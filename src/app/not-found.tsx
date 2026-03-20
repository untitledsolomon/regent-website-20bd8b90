import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Page not found
      </p>
      <Link href="/" className="text-blue-600 hover:underline font-medium">
        ← Back to home
      </Link>
    </div>
  )
}