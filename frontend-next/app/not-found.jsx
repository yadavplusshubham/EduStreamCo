import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4">
      <BookOpen className="w-16 h-16 text-red-600 mb-6" />
      <h1 className="text-6xl font-black text-white mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
