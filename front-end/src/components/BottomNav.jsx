// src/components/BottomNav.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const BottomNav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // Hide bottom nav on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const isActive = (path) => {
    if (path === '/home' && (location.pathname === '/' || location.pathname === '/home')) return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const navItemBase = 'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200';
  const activeColor = 'text-violet-600 dark:text-violet-400';
  const inactiveColor = 'text-zinc-500 dark:text-zinc-400';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <div className="flex justify-around items-center h-16 px-1 max-w-screen-sm mx-auto">

        {/* Home */}
        <Link
          to="/home"
          className={`${navItemBase} ${isActive('/home') ? activeColor : inactiveColor}`}
        >
          <Home
            className={`w-6 h-6 transition-all ${isActive('/home') ? 'scale-110' : ''}`}
            strokeWidth={isActive('/home') ? 2.5 : 1.75}
          />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>

        {/* Search */}
        <Link
          to="/search"
          className={`${navItemBase} ${isActive('/search') ? activeColor : inactiveColor}`}
        >
          <Search
            className={`w-6 h-6 transition-all ${isActive('/search') ? 'scale-110' : ''}`}
            strokeWidth={isActive('/search') ? 2.5 : 1.75}
          />
          <span className="text-[10px] font-semibold">Search</span>
        </Link>

        {/* Upload — only for authenticated users, center prominent CTA */}
        {user && (
          <Link
            to="/upload"
            className={`${navItemBase} ${isActive('/upload') ? activeColor : inactiveColor}`}
          >
            <div className={`rounded-xl p-1.5 transition-all ${isActive('/upload') ? 'bg-violet-100 dark:bg-violet-900/30' : ''}`}>
              <PlusSquare
                className="w-6 h-6"
                strokeWidth={isActive('/upload') ? 2.5 : 1.75}
              />
            </div>
            <span className="text-[10px] font-semibold">Upload</span>
          </Link>
        )}

        {/* Profile (authenticated) */}
        {user ? (
          <Link
            to="/profile"
            className={`${navItemBase} ${isActive('/profile') ? activeColor : inactiveColor}`}
          >
            <img
              src={user.avatar}
              alt="Profile"
              className={`w-7 h-7 rounded-full object-cover transition-all ${isActive('/profile') ? 'ring-2 ring-violet-500 scale-110' : 'ring-1 ring-zinc-300 dark:ring-zinc-700'}`}
            />
            <span className="text-[10px] font-semibold">Profile</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`${navItemBase} ${isActive('/login') ? activeColor : inactiveColor}`}
          >
            <LogIn className="w-6 h-6" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold">Login</span>
          </Link>
        )}

        {/* Logout — only for authenticated users */}
        {user && (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`${navItemBase} ${inactiveColor} hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50`}
          >
            <LogOut
              className={`w-6 h-6 transition-all ${loggingOut ? 'animate-pulse' : ''}`}
              strokeWidth={1.75}
            />
            <span className="text-[10px] font-semibold">{loggingOut ? '...' : 'Logout'}</span>
          </button>
        )}

        {/* Register — only for guests */}
        {!user && (
          <Link
            to="/register"
            className={`${navItemBase} ${isActive('/register') ? activeColor : 'text-violet-500 dark:text-violet-400'}`}
          >
            <div className="bg-violet-600 rounded-lg p-1.5">
              <User className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-semibold">Sign Up</span>
          </Link>
        )}

      </div>
    </div>
  );
};

export default BottomNav;
