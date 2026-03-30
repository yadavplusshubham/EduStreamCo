'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  RefreshCw,
  Edit,
  Star,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Youtube,
  BookOpen,
  Users,
  Video,
  BarChart3,
  Shield,
  X,
  Lock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UNIVERSITY_OPTIONS = [
  { id: 'mit', name: 'MIT OpenCourseWare' },
  { id: 'stanford', name: 'Stanford Online' },
  { id: 'yale', name: 'Yale Open Courses' },
  { id: 'harvard', name: 'Harvard Online' },
  { id: 'berkeley', name: 'UC Berkeley' },
  { id: 'princeton', name: 'Princeton' },
  { id: 'nptel', name: 'NPTEL (IITs)' },
  { id: 'swayam', name: 'SWAYAM' },
  { id: 'other', name: 'Other' },
];

const CATEGORY_OPTIONS = [
  'Computer Science', 'Mathematics', 'Physics', 'Psychology', 'Economics',
  'Philosophy', 'Biology', 'Engineering', 'Chemistry', 'History',
  'Literature', 'Business', 'General',
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, loginAdmin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Whitelist state
  const [whitelist, setWhitelist] = useState({ default: [], custom: [] });
  const [isLoadingWhitelist, setIsLoadingWhitelist] = useState(false);

  // Add Course Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('other');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Channel Import Modal
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [channelId, setChannelId] = useState('');
  const [resolvedImportChannel, setResolvedImportChannel] = useState(null);
  const [isResolvingImport, setIsResolvingImport] = useState(false);
  const [importResolveError, setImportResolveError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Add Whitelist Modal
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newChannelId, setNewChannelId] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelUniversity, setNewChannelUniversity] = useState('other');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isAddingToWhitelist, setIsAddingToWhitelist] = useState(false);
  const [whitelistError, setWhitelistError] = useState('');
  const [resolvedChannel, setResolvedChannel] = useState(null);

  // Custom Universities & Categories
  const [universities, setUniversities] = useState({ default: [], custom: [] });
  const [categories, setCategories] = useState({ default: [], custom: [] });
  const [newUniversityName, setNewUniversityName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryKeywords, setNewCategoryKeywords] = useState('');
  const [isAddingUniversity, setIsAddingUniversity] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Admin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminLogging, setIsAdminLogging] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      fetchCourses();
      fetchStats();
      fetchWhitelist();
      fetchUniversities();
      fetchCategories();
    }
  }, [isAuthenticated, user]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsAdminLogging(true);
    setAdminLoginError('');

    try {
      const response = await fetch(`${API}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const userData = await response.json();
      loginAdmin({ ...userData, is_admin: true, username: adminUsername });
    } catch (err) {
      setAdminLoginError(err.message);
    } finally {
      setIsAdminLogging(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-[#181818] rounded-xl border border-white/10 p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-600/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
            <p className="text-gray-400 mb-6">
              Sign in with admin credentials to access the admin panel.
            </p>

            {/* Admin Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4 mb-6">
              <div>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  required
                  data-testid="admin-username-input"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  required
                  data-testid="admin-password-input"
                />
              </div>

              {adminLoginError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{adminLoginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isAdminLogging}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                data-testid="admin-login-btn"
              >
                {isAdminLogging && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAdminLogging ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => router.push('/')}
              className="mt-4 text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API}/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchWhitelist = async () => {
    setIsLoadingWhitelist(true);
    try {
      const response = await fetch(`${API}/whitelist`);
      const data = await response.json();
      setWhitelist(data);
    } catch (err) {
      console.error('Failed to fetch whitelist:', err);
    } finally {
      setIsLoadingWhitelist(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await fetch(`${API}/admin/universities`);
      const data = await response.json();
      setUniversities(data);
    } catch (err) {
      console.error('Failed to fetch universities:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API}/admin/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleResolveChannel = async () => {
    if (!newChannelUrl.trim()) return;
    setIsLookingUp(true);
    setWhitelistError('');
    setResolvedChannel(null);
    try {
      const response = await fetch(`${API}/whitelist/resolve?url=${encodeURIComponent(newChannelUrl)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to resolve channel');
      }
      const data = await response.json();
      setResolvedChannel(data);
      setNewChannelId(data.channelId);
      setNewChannelName(data.name);
    } catch (err) {
      setWhitelistError(err.message);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAddUniversity = async () => {
    if (!newUniversityName.trim()) return;
    setIsAddingUniversity(true);
    try {
      const response = await fetch(`${API}/admin/universities?name=${encodeURIComponent(newUniversityName)}`, { method: 'POST' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add university');
      }
      setNewUniversityName('');
      fetchUniversities();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsAddingUniversity(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    try {
      const url = `${API}/admin/categories?name=${encodeURIComponent(newCategoryName)}${newCategoryKeywords ? `&keywords=${encodeURIComponent(newCategoryKeywords)}` : ''}`;
      const response = await fetch(url, { method: 'POST' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add category');
      }
      setNewCategoryName('');
      setNewCategoryKeywords('');
      fetchCategories();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError('');
    setAddSuccess('');
    try {
      const allUniversities = [...UNIVERSITY_OPTIONS, ...(universities.custom || []).map(u => ({ id: u.id, name: u.name }))];
      const university = allUniversities.find(u => u.id === selectedUniversity);
      const response = await fetch(`${API}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistUrl,
          university: selectedUniversity,
          universityName: university?.name || 'Other',
          category: selectedCategory,
          featured: isFeatured,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add course');
      }
      const newCourse = await response.json();
      setCourses(prev => [newCourse, ...prev]);
      setAddSuccess(`Successfully added "${newCourse.title}" with ${newCourse.videoCount} videos!`);
      setPlaylistUrl('');
      fetchStats();
      setTimeout(() => { setShowAddModal(false); setAddSuccess(''); }, 2000);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await fetch(`${API}/courses/${courseId}`, { method: 'DELETE' });
      setCourses(prev => prev.filter(c => c.id !== courseId));
      fetchStats();
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  const handleRefreshCourse = async (courseId) => {
    try {
      const response = await fetch(`${API}/courses/${courseId}/refresh`, { method: 'POST' });
      const updated = await response.json();
      setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
    } catch (err) {
      console.error('Failed to refresh course:', err);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const university = UNIVERSITY_OPTIONS.find(u => u.id === editingCourse.university);
      const response = await fetch(`${API}/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingCourse, universityName: university?.name || editingCourse.universityName }),
      });
      const updated = await response.json();
      setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
      setShowEditModal(false);
      setEditingCourse(null);
    } catch (err) {
      console.error('Failed to update course:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveImportChannel = async () => {
    if (!channelId.trim()) return;
    setIsResolvingImport(true);
    setImportResolveError('');
    setResolvedImportChannel(null);
    try {
      const response = await fetch(`${API}/whitelist/resolve?url=${encodeURIComponent(channelId.trim())}`);
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Could not resolve channel';
        try { errorMessage = JSON.parse(errorText).detail || errorMessage; } catch {}
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setResolvedImportChannel(data);
      setChannelId(data.channelId);
    } catch (err) {
      setImportResolveError(err.message);
    } finally {
      setIsResolvingImport(false);
    }
  };

  const handleImportChannel = async (e) => {
    e.preventDefault();
    setIsImporting(true);
    setImportResult(null);
    try {
      const finalChannelId = resolvedImportChannel?.channelId || channelId;
      const allUniversities = [...UNIVERSITY_OPTIONS, ...(universities.custom || []).map(u => ({ id: u.id, name: u.name }))];
      const university = allUniversities.find(u => u.id === selectedUniversity);
      const response = await fetch(`${API}/channels/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: finalChannelId,
          university: selectedUniversity,
          universityName: university?.name || 'Other',
          category: selectedCategory,
          maxPlaylists: 10,
        }),
      });
      const responseText = await response.text();
      let result;
      try { result = JSON.parse(responseText); } catch { result = { error: responseText || 'Import failed' }; }
      if (!response.ok) {
        setImportResult({ error: result.detail || result.error || 'Import failed' });
      } else {
        setImportResult(result);
        fetchCourses();
        fetchStats();
      }
    } catch (err) {
      setImportResult({ error: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  const handleLookupChannel = async () => {
    if (!newChannelId.trim()) return;
    setIsLookingUp(true);
    setWhitelistError('');
    try {
      const response = await fetch(`${API}/whitelist/resolve?url=${encodeURIComponent(newChannelId.trim())}`);
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Channel not found';
        try { errorMessage = JSON.parse(errorText).detail || errorMessage; } catch {}
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setNewChannelId(data.channelId);
      setNewChannelName(data.name);
    } catch (err) {
      setWhitelistError(err.message);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAddToWhitelist = async (e) => {
    e.preventDefault();
    setIsAddingToWhitelist(true);
    setWhitelistError('');
    try {
      const allUniversities = [...UNIVERSITY_OPTIONS, ...(universities.custom || []).map(u => ({ id: u.id, name: u.name }))];
      const university = allUniversities.find(u => u.id === newChannelUniversity);
      const response = await fetch(`${API}/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: newChannelId.trim(),
          name: newChannelName,
          university: newChannelUniversity,
          universityName: university?.name || 'Other',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add channel');
      }
      await fetchWhitelist();
      setShowWhitelistModal(false);
      resetWhitelistModal();
    } catch (err) {
      setWhitelistError(err.message);
    } finally {
      setIsAddingToWhitelist(false);
    }
  };

  const resetWhitelistModal = () => {
    setNewChannelUrl('');
    setNewChannelId('');
    setNewChannelName('');
    setNewChannelUniversity('other');
    setResolvedChannel(null);
    setWhitelistError('');
  };

  const handleRemoveFromWhitelist = async (channelId) => {
    if (!window.confirm('Remove this channel from whitelist?')) return;
    try {
      await fetch(`${API}/whitelist/${channelId}`, { method: 'DELETE' });
      await fetchWhitelist();
    } catch (err) {
      console.error('Failed to remove channel:', err);
    }
  };

  const handleDeleteUniversity = async (uniId) => {
    if (!window.confirm('Delete this university?')) return;
    try {
      await fetch(`${API}/admin/universities/${uniId}`, { method: 'DELETE' });
      fetchUniversities();
    } catch (err) {
      console.error('Failed to delete university:', err);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await fetch(`${API}/admin/categories/${encodeURIComponent(categoryName)}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const allUniversities = [...UNIVERSITY_OPTIONS, ...(universities.custom || []).map(u => ({ id: u.id, name: u.name }))];
  const allCategories = [...(categories.default || CATEGORY_OPTIONS), ...(categories.custom || [])];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.channelTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#141414] border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-red-600" />
              <h1 className="text-xl font-bold text-white">EduStream Admin</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChannelModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Youtube className="w-4 h-4" />
              Import Channel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Playlist
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1">
          {[
            { id: 'courses', label: 'Courses', icon: null },
            { id: 'whitelist', label: 'Channel Whitelist', icon: <Shield className="w-4 h-4" /> },
            { id: 'settings', label: 'Settings', icon: <BarChart3 className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'text-white border-red-600' : 'text-gray-400 border-transparent hover:text-white'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon ? <span className="flex items-center gap-2">{tab.icon}{tab.label}</span> : tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Courses', value: stats.totalCourses, Icon: BookOpen, color: 'red' },
              { label: 'Videos', value: stats.totalVideos, Icon: Video, color: 'blue' },
              { label: 'Featured', value: stats.featuredCourses, Icon: Star, color: 'yellow' },
              { label: 'Categories', value: stats.totalCategories, Icon: BarChart3, color: 'green' },
              { label: 'Universities', value: stats.totalUniversities, Icon: Users, color: 'purple' },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="bg-[#181818] rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${color}-600/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${color}-500`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-gray-500 text-sm">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-3 bg-[#181818] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">Course</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">University</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">Category</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">Videos</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">Status</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <Loader2 className="w-8 h-8 text-gray-500 animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          {courses.length === 0 ? 'No courses yet. Add your first playlist!' : 'No courses match your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => (
                        <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={course.thumbnail} alt={course.title} className="w-20 h-12 object-cover rounded" />
                              <div className="max-w-xs">
                                <p className="text-white font-medium truncate">{course.title}</p>
                                <p className="text-gray-500 text-sm truncate">{course.channelTitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="text-gray-300">{course.universityName}</span></td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-white/10 rounded text-sm text-gray-300">{course.category}</span>
                          </td>
                          <td className="px-4 py-3"><span className="text-gray-300">{course.videoCount}</span></td>
                          <td className="px-4 py-3">
                            {course.featured && (
                              <span className="px-2 py-1 bg-yellow-600/20 text-yellow-500 rounded text-xs font-medium">Featured</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => window.open(`https://www.youtube.com/playlist?list=${course.playlistId}`, '_blank')}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="View on YouTube"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRefreshCourse(course.id)}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                title="Refresh from YouTube"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setEditingCourse(course); setShowEditModal(true); }}
                                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                                title="Edit course"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete course"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Whitelist Tab */}
        {activeTab === 'whitelist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Whitelisted Channels</h2>
                <p className="text-gray-400 text-sm mt-1">Channels marked as &quot;Verified&quot; in smart search results</p>
              </div>
              <button
                onClick={() => setShowWhitelistModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Channel
              </button>
            </div>

            <div className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Default Channels ({whitelist.default?.length || 0})
                </h3>
                <p className="text-gray-500 text-xs mt-1">These are built-in and cannot be removed</p>
              </div>
              <div className="divide-y divide-white/5">
                {whitelist.default?.map((channel) => (
                  <div key={channel.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                        <Youtube className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{channel.name}</p>
                        <p className="text-gray-500 text-xs">{channel.channelId}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{channel.universityName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Custom Channels ({whitelist.custom?.length || 0})
                </h3>
                <p className="text-gray-500 text-xs mt-1">Channels you&apos;ve added to the whitelist</p>
              </div>
              {whitelist.custom?.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">No custom channels added yet</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {whitelist.custom?.map((channel) => (
                    <div key={channel.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center">
                          <Youtube className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{channel.name}</p>
                          <p className="text-gray-500 text-xs">{channel.channelId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">{channel.universityName}</span>
                        <button
                          onClick={() => handleRemoveFromWhitelist(channel.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Universities */}
            <div className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Universities
                </h3>
                <p className="text-gray-500 text-xs mt-1">Manage available universities for course categorization</p>
              </div>
              <div className="p-4 border-b border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUniversityName}
                    onChange={(e) => setNewUniversityName(e.target.value)}
                    placeholder="Enter university name..."
                    className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                    data-testid="add-university-input"
                  />
                  <button
                    onClick={handleAddUniversity}
                    disabled={isAddingUniversity || !newUniversityName.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    data-testid="add-university-btn"
                  >
                    {isAddingUniversity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                  </button>
                </div>
              </div>
              <div className="p-4 border-b border-white/5">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Default Universities</p>
                <div className="flex flex-wrap gap-2">
                  {universities.default?.map((uni) => (
                    <span key={uni.id} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">{uni.name}</span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Custom Universities ({universities.custom?.length || 0})</p>
                {universities.custom?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No custom universities added yet</p>
                ) : (
                  <div className="space-y-2">
                    {universities.custom?.map((uni) => (
                      <div key={uni.id} className="flex items-center justify-between px-3 py-2 bg-[#0a0a0a] rounded-lg">
                        <span className="text-white text-sm">{uni.name}</span>
                        <button
                          onClick={() => handleDeleteUniversity(uni.id)}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          data-testid={`delete-university-${uni.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-400" />
                  Categories
                </h3>
                <p className="text-gray-500 text-xs mt-1">Manage available categories for course organization</p>
              </div>
              <div className="p-4 border-b border-white/5 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
                    data-testid="add-category-input"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={isAddingCategory || !newCategoryName.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    data-testid="add-category-btn"
                  >
                    {isAddingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                  </button>
                </div>
                <input
                  type="text"
                  value={newCategoryKeywords}
                  onChange={(e) => setNewCategoryKeywords(e.target.value)}
                  placeholder="Optional: keywords for auto-categorization (comma-separated)"
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
                  data-testid="add-category-keywords-input"
                />
              </div>
              <div className="p-4 border-b border-white/5">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Default Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.default?.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">{cat}</span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Custom Categories ({categories.custom?.length || 0})</p>
                {categories.custom?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No custom categories added yet</p>
                ) : (
                  <div className="space-y-2">
                    {categories.custom?.map((cat) => (
                      <div key={cat} className="flex items-center justify-between px-3 py-2 bg-[#0a0a0a] rounded-lg">
                        <span className="text-white text-sm">{cat}</span>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          data-testid={`delete-category-${cat}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-[#181818] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add Course from Playlist</h2>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">YouTube Playlist URL</label>
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">University</label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    {allUniversities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500 bg-[#0a0a0a]"
                />
                <span className="text-gray-300">Feature this course</span>
              </label>
              {addError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{addError}</p>
                </div>
              )}
              {addSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-400 text-sm">{addSuccess}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button
                  type="submit"
                  disabled={isAdding || !playlistUrl}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAdding ? 'Adding...' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-lg bg-[#181818] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit Course</h2>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">University</label>
                  <select
                    value={editingCourse.university}
                    onChange={(e) => setEditingCourse({...editingCourse, university: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    {allUniversities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Quality</label>
                  <select
                    value={editingCourse.quality}
                    onChange={(e) => setEditingCourse({...editingCourse, quality: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="HD">HD</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rating (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingCourse.rating}
                    onChange={(e) => setEditingCourse({...editingCourse, rating: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCourse.featured}
                    onChange={(e) => setEditingCourse({...editingCourse, featured: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500 bg-[#0a0a0a]"
                  />
                  <span className="text-gray-300">Featured</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCourse.isOriginal}
                    onChange={(e) => setEditingCourse({...editingCourse, isOriginal: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500 bg-[#0a0a0a]"
                  />
                  <span className="text-gray-300">E Series</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Channel Import Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowChannelModal(false)} />
          <div className="relative w-full max-w-lg bg-[#181818] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Import from YouTube Channel</h2>
            <form onSubmit={handleImportChannel} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Channel Handle, URL, or ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={channelId}
                    onChange={(e) => { setChannelId(e.target.value); setResolvedImportChannel(null); setImportResolveError(''); }}
                    placeholder="@username or UCxxxxxxx"
                    className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleResolveImportChannel}
                    disabled={isResolvingImport || !channelId.trim()}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {isResolvingImport ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">Supports @handle, youtube.com/@handle, youtube.com/channel/UCxxx, or direct channel ID</p>
              </div>
              {resolvedImportChannel && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <img src={resolvedImportChannel.thumbnail} alt="" className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-green-400 font-medium truncate">{resolvedImportChannel.name}</p>
                    <p className="text-gray-500 text-xs truncate">{resolvedImportChannel.channelId}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              )}
              {importResolveError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{importResolveError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">University</label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {allUniversities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {importResult && (
                <div className={`p-4 rounded-lg border ${importResult.error ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                  {importResult.error ? (
                    <p className="text-red-400">{importResult.error}</p>
                  ) : (
                    <div>
                      <p className="text-green-400 font-medium mb-2">Imported {importResult.imported} playlists!</p>
                      {importResult.skipped > 0 && <p className="text-gray-400 text-sm">Skipped {importResult.skipped} (already added)</p>}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowChannelModal(false); setImportResult(null); }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  {importResult ? 'Close' : 'Cancel'}
                </button>
                {!importResult && (
                  <button
                    type="submit"
                    disabled={isImporting || !channelId}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isImporting ? 'Importing...' : 'Import Playlists'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Whitelist Modal */}
      {showWhitelistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowWhitelistModal(false)} />
          <div className="relative w-full max-w-lg bg-[#181818] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add Channel to Whitelist</h2>
            <form onSubmit={handleAddToWhitelist} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Channel Handle, URL, or ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChannelId}
                    onChange={(e) => { setNewChannelId(e.target.value); setNewChannelName(''); setWhitelistError(''); }}
                    placeholder="@username or UCxxxxxxx"
                    className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleLookupChannel}
                    disabled={isLookingUp || !newChannelId.trim()}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {isLookingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">Supports @handle, youtube.com/@handle, youtube.com/channel/UCxxx, or direct channel ID</p>
              </div>
              {newChannelName && !whitelistError && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-green-400 text-sm font-medium">{newChannelName}</p>
                    <p className="text-gray-500 text-xs">{newChannelId}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Channel Name</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Channel name (auto-filled when resolved)"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">University/Organization</label>
                <select
                  value={newChannelUniversity}
                  onChange={(e) => setNewChannelUniversity(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  {allUniversities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              {whitelistError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{whitelistError}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowWhitelistModal(false); setWhitelistError(''); setNewChannelId(''); setNewChannelName(''); }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingToWhitelist || !newChannelId || !newChannelName}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isAddingToWhitelist && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAddingToWhitelist ? 'Adding...' : 'Add to Whitelist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
