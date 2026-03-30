'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, X, Menu, User, BookOpen, LogOut, Settings, LogIn, List, Heart } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onSearch, onClearSearch, categories = [], selectedCategory, onCategorySelect, onNavigateToMyList }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="px-4 md:px-12 py-3 flex items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
            <BookOpen className="w-8 h-8 text-red-600 transition-transform group-hover:scale-110" />
            <span className="text-xl md:text-2xl font-black text-white tracking-tight">
              Edu<span className="text-red-600">Stream</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-5">
            <li>
              <button
                onClick={() => router.push('/')}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  pathname === '/' && !selectedCategory ? 'text-white font-semibold' : 'text-gray-300'
                }`}
              >
                Home
              </button>
            </li>

            {/* Categories Dropdown */}
            {categories.length > 0 && (
              <li className="relative">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Categories
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
                </button>

                {showCategories && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-[#141414]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto">
                    <button
                      onClick={() => { onCategorySelect && onCategorySelect(null); setShowCategories(false); }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        !selectedCategory ? 'text-white bg-white/10' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { onCategorySelect && onCategorySelect(cat); setShowCategories(false); }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          selectedCategory === cat ? 'text-white bg-white/10' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            )}

            <li>
              <button
                onClick={() => onNavigateToMyList && onNavigateToMyList()}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                My List
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white hover:text-gray-300 transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className={`flex items-center transition-all duration-300 ${
            showSearch ? 'bg-black/80 border border-white/30' : ''
          } rounded`}>
            {showSearch && (
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Titles, channels, categories"
                className="bg-transparent text-white text-sm py-1.5 px-3 w-40 md:w-64 outline-none placeholder-gray-400"
              />
            )}
            <button
              onClick={() => showSearch ? (searchQuery ? clearSearch() : setShowSearch(false)) : setShowSearch(true)}
              className="p-2 text-white hover:text-gray-300 transition-colors"
            >
              {showSearch && searchQuery ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>

          {/* Notifications (only for logged in admin) */}
          {isAuthenticated && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-white hover:text-gray-300 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-10 w-80 bg-[#141414]/95 backdrop-blur-md border border-white/10 rounded-md shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-white text-sm font-medium">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-white/5 cursor-pointer">
                      <p className="text-white text-sm">New course added: &quot;Machine Learning&quot;</p>
                      <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-white/5 cursor-pointer">
                      <p className="text-white text-sm">Continue watching &quot;Justice&quot;</p>
                      <p className="text-gray-500 text-xs mt-1">5 hours ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-white/5 cursor-pointer">
                      <p className="text-white text-sm">Welcome to EduStream! 🎓</p>
                      <p className="text-gray-500 text-xs mt-1">1 day ago</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-white/10">
                    <button className="text-gray-400 text-xs hover:text-white transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My List Button (only for logged in admin) */}
          {isAuthenticated && (
            <button
              onClick={() => onNavigateToMyList && onNavigateToMyList()}
              className="hidden md:flex items-center gap-1 text-white hover:text-gray-300 transition-colors"
              title="My List"
            >
              <Heart className="w-5 h-5" />
            </button>
          )}

          {/* Auth Section */}
          {isLoading ? (
            <div className="w-8 h-8 rounded bg-gray-700 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className={`w-4 h-4 text-white transition-transform ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 top-12 w-56 bg-[#141414]/95 backdrop-blur-md border border-white/10 rounded-md shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white text-sm font-medium truncate">{user?.username || 'Admin'}</p>
                    <p className="text-gray-400 text-xs">Administrator</p>
                  </div>
                  <button
                    onClick={() => { router.push('/edusigninup'); setShowProfile(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </button>
                  <button
                    onClick={() => { onNavigateToMyList && onNavigateToMyList(); setShowProfile(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    My List
                  </button>
                  <button
                    onClick={() => { router.push('/my-courses'); setShowProfile(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    My Courses
                  </button>
                  <button
                    onClick={() => { logout(); setShowProfile(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/edusigninup')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
              data-testid="signin-btn"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-[#141414]/95 backdrop-blur-md border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="px-4 py-4 space-y-2">
            <li>
              <button
                onClick={() => { router.push('/'); setShowMobileMenu(false); }}
                className="block w-full text-left py-2 text-sm font-medium text-white"
              >
                Home
              </button>
            </li>
            {categories.length > 0 && (
              <li>
                <p className="text-gray-500 text-xs uppercase tracking-wider py-2">Categories</p>
                <div className="pl-2 space-y-1 max-h-40 overflow-y-auto">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { onCategorySelect && onCategorySelect(cat); setShowMobileMenu(false); }}
                      className={`block w-full text-left py-1.5 text-sm transition-colors ${
                        selectedCategory === cat ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <button
                  onClick={() => { router.push('/edusigninup'); setShowMobileMenu(false); }}
                  className="block w-full text-left py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  Admin Panel
                </button>
              </li>
            )}
            {!isAuthenticated && (
              <li>
                <button
                  onClick={() => { router.push('/edusigninup'); setShowMobileMenu(false); }}
                  className="block w-full text-left py-2 text-sm font-medium text-red-500"
                >
                  Admin Login
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
