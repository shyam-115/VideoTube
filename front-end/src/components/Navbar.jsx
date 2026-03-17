// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Menu, X, Search as SearchIcon, Upload, LogOut, UserPlus, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Hide search bar on login and register pages
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
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle navigation"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to={user ? "/home" : "/login"} className="flex items-center space-x-2 text-zinc-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 group">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-sm">VT</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight">VideoTube</span>
            </Link>
          </div>

          {/* Search */}
          {!hideSearch && (
            <div className="hidden md:block flex-1 max-w-xl mx-6">
              <form onSubmit={handleSearch} className="relative">
                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos, channels..."
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-zinc-400 bg-zinc-100/50 text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-100 dark:border-zinc-800 transition-all duration-300"
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

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/upload"
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all duration-300"
                >
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0">
                    <Upload className="w-4 h-4 mr-2 inline" />
                    Upload
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 transition-all duration-300"
                >
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0">
                    <LogOut className="w-4 h-4 mr-2 inline" />
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-zinc-900 dark:text-white rounded-xl group bg-gradient-to-br from-zinc-200 to-zinc-300 hover:from-zinc-300 hover:to-zinc-400 dark:from-zinc-800 dark:to-zinc-700 dark:hover:from-zinc-700 dark:hover:to-zinc-600 transition-all duration-300 shadow-sm"
                >
                  <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-zinc-900 rounded-[10px] group-hover:bg-opacity-0">
                    <LogIn className="w-4 h-4 mr-2 inline" />
                    Login
                  </span>
                </Link>
                <Link 
                  to="/register" 
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-sm hover:shadow-violet-500/25"
                >
                  <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-transparent rounded-[10px] group-hover:bg-opacity-0">
                    <UserPlus className="w-4 h-4 mr-2 inline" />
                    Register
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile search */}
        {!hideSearch && (
          <div className="md:hidden mt-3">
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, channels..."
                className="w-full pl-10 pr-12 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 bg-gray-50 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-3 border-t border-gray-200 dark:border-gray-800 pt-3 space-y-2">
            {user ? (
              <>
                <Link
                  to="/upload"
                  onClick={() => setIsOpen(false)}
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all duration-300 w-full"
                >
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 w-full text-center">
                    <Upload className="w-4 h-4 mr-2 inline" />
                    Upload
                  </span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-2 py-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  <span className="font-medium">{user.fullname}</span>
                </Link>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 transition-all duration-300 w-full"
                >
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 w-full text-center">
                    <LogOut className="w-4 h-4 mr-2 inline" />
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-gray-900 dark:text-white rounded-lg group bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 w-full"
                >
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 w-full text-center">
                    <LogIn className="w-4 h-4 mr-2 inline" />
                    Login
                  </span>
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 transition-all duration-300 w-full"
                >
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-transparent rounded-md group-hover:bg-opacity-0 w-full text-center">
                    <UserPlus className="w-4 h-4 mr-2 inline" />
                    Register
                  </span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;