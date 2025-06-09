import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Not Found</h2>
      <p>Could not find the requested resource</p>
      <Link href="/" className="mt-4 text-blue-500 hover:underline">
        Return Home
      </Link>
    </div>
  )
} 