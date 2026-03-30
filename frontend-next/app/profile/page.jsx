'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Save, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/edusigninup');
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-[#181818] rounded-xl border border-white/10 p-6 md:p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border-4 border-red-600">
              <User className="w-12 h-12 text-white" />
            </div>
            <p className="text-white font-semibold text-lg mt-3">{user?.username || 'Admin'}</p>
            <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mt-2">
              Administrator
            </span>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-white">{user?.username || 'Admin'}</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">Username cannot be changed here</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Account Type
              </label>
              <div className="px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg">
                <span className="text-white">Administrator</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="text-green-500 text-sm">Saved!</span>
            )}
          </div>
        </div>

        {/* Admin Panel Link */}
        <div className="mt-6 bg-[#181818] rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Admin Panel</h2>
          <p className="text-gray-400 text-sm mb-4">
            Manage courses, whitelist, and platform settings.
          </p>
          <button
            onClick={() => router.push('/edusigninup')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Go to Admin Panel
          </button>
        </div>

        {/* Sign Out */}
        <div className="mt-6 mb-12">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/40 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
