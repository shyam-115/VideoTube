// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const isEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Determine if input is email or username
      const loginData = isEmail(credentials.usernameOrEmail)
        ? { email: credentials.usernameOrEmail, password: credentials.password }
        : { username: credentials.usernameOrEmail, password: credentials.password };
      
      await login(loginData);
      navigate('/home');
    } catch (err) {
      setError(err?.message || 'Login failed. Invalid username or password.');
    }
  };

  return (
    <section className="bg-zinc-50 dark:bg-zinc-950 min-h-screen relative overflow-hidden z-0 flex items-center justify-center">
      {/* Background glowing blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full max-w-md">
        <a href="/" className="flex items-center mb-8 text-3xl font-bold text-zinc-900 dark:text-white group tracking-tight">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-md">VT</span>
          </div>
          VideoTube
        </a>
        <div className="w-full bg-white/70 rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-800/50 sm:max-w-md xl:p-0 dark:bg-zinc-900/70 backdrop-blur-xl">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-10">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-zinc-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            
            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="usernameOrEmail" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                  Username or Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="usernameOrEmail"
                    id="usernameOrEmail"
                    value={credentials.usernameOrEmail}
                    onChange={handleChange}
                    className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3 dark:bg-zinc-800/50 dark:border-zinc-700 dark:placeholder-zinc-500 dark:text-white transition-all duration-300"
                    placeholder="username or email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 pr-11 p-3 dark:bg-zinc-800/50 dark:border-zinc-700 dark:placeholder-zinc-500 dark:text-white transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="relative inline-flex items-center justify-center p-[2px] overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 w-full shadow-lg shadow-violet-500/25 active:scale-[0.98]"
              >
                <span className="relative px-5 py-3 transition-all ease-in duration-75 bg-transparent rounded-[10px] group-hover:bg-opacity-0 w-full text-center flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in
                </span>
              </button>
              
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center">
                Don't have an account?{' '}
                <a href="/register" className="text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors px-1 py-0.5 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/30">
                  Sign up here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;