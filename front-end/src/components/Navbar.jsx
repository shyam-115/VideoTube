// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Search as SearchIcon, Upload, LogOut, UserPlus, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Hide search bar on auth pages
  const hideSearch = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/70 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/70 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Brand */}
          <Link
            to={user ? '/home' : '/login'}
            className="flex items-center space-x-2 text-zinc-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 group flex-shrink-0"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-sm">VT</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">VideoTube</span>
          </Link>

          {/* Desktop Search */}
          {!hideSearch && (
            <div className="hidden md:block flex-1 max-w-xl">
              <form onSubmit={handleSearch} className="relative">
                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos, channels..."
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-zinc-400 bg-zinc-100/50 text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-100 dark:border-zinc-800 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-violet-600 text-white hover:bg-violet-700 active:scale-95 shadow-sm hover:shadow-violet-500/25"
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {user ? (
              <>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all duration-300 shadow-sm hover:shadow-green-500/25 active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  <span className="hidden lg:inline font-medium">{user.fullname}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-br from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 transition-all duration-300 shadow-sm active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-zinc-900 dark:text-white rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-sm hover:shadow-violet-500/25 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {!hideSearch && (
          <div className="md:hidden mt-3">
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, channels..."
                className="w-full pl-10 pr-16 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-zinc-400 bg-zinc-100/50 text-zinc-900 border-zinc-200 dark:bg-zinc-900/50 dark:text-white dark:border-zinc-800"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-violet-600 text-white hover:bg-violet-700 active:scale-95"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;