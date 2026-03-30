'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/60" />

      {/* Header */}
      <header className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <BookOpen className="w-8 h-8 text-red-600" />
          <span className="text-2xl font-bold text-white">
            Edu<span className="text-red-600">Stream</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-8 md:p-10 border border-white/10">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
            <p className="text-gray-400 mb-8">
              Browse courses freely or sign in as admin to manage content
            </p>

            {/* Browse as Guest */}
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all"
              data-testid="browse-guest-btn"
            >
              Browse Courses
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-black/70 text-gray-500">or</span>
              </div>
            </div>

            {/* Admin Login */}
            <button
              onClick={() => router.push('/edusigninup')}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-transparent border border-white/20 hover:border-white/40 text-white font-medium rounded-lg transition-all"
            >
              Admin Login
            </button>

            {/* Back to Home Link */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 mx-auto mt-6 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl font-bold text-white">900+</div>
              <div className="text-xs text-gray-500">Videos</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-white">14</div>
              <div className="text-xs text-gray-500">Courses</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-white">Free</div>
              <div className="text-xs text-gray-500">Forever</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
