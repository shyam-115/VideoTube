import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VideoUpload from './pages/VideoUpload.jsx';
import VideoDetail from './pages/VideoDetail.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import ChannelProfile from './pages/ChannelProfile.jsx';
import Profile from './pages/Profile.jsx';
import Navbar from './components/Navbar.jsx';
import AuthProvider from './context/AuthContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-violet-600 dark:border-zinc-800 dark:border-t-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-violet-600 dark:border-zinc-800 dark:border-t-violet-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/home" /> : children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <ErrorBoundary>
          <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 font-sans selection:bg-violet-500/30">
            <Navbar />
            <main className="min-h-[calc(100vh-80px)]">
              <Routes>
              {/* Default route - login page (redirects to home if already logged in) */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              
              {/* Public Routes */}
              <Route path="/home" element={<Home />} />
              <Route path="/video/:id" element={<VideoDetail />} />
              <Route path="/channel/:username" element={<ChannelProfile />} />
              <Route path="/search" element={<Search />} />
              
              {/* Auth Routes - redirect to home if already logged in */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              
              {/* Protected Routes - require authentication */}
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <VideoUpload />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;