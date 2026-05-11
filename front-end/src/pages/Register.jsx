// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/api.js';
import { User, AtSign, Mail, Lock, Image as ImageIcon, Eye, EyeOff, UserPlus, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    otp: '',
    avatar: null,
    coverImage: null,
  });
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
    if (error) setError(null);
  };

  const handleSendOtp = async () => {
    if (!formData.username) {
      setError("Please enter a username first.");
      return;
    }
    if (!formData.email) {
      setError("Please enter an email address first.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setSendingOtp(true);
    try {
      await authApi.sendOtp({ email: formData.email, username: formData.username });
      setIsOtpSent(true);
      setSuccessMsg("OTP sent successfully! Please check your email.");
    } catch (err) {
      console.error('Failed to send OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!isOtpSent) {
      setError('Please confirm your email by sending an OTP first.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      }
      await authApi.register(data);
      // Auto-login after successful registration
      const credentials = formData.email
        ? { email: formData.email, password: formData.password }
        : { username: String(formData.username || '').toLowerCase(), password: formData.password };
      await login(credentials);
      navigate('/home');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-zinc-50 dark:bg-zinc-950 min-h-screen relative overflow-hidden z-0 flex items-center justify-center py-12">
      {/* Background glowing blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>
      <div className="flex flex-col items-center justify-center px-6 mx-auto w-full max-w-lg">
        <Link
          to="/"
          className="flex items-center mb-8 text-3xl font-bold text-zinc-900 dark:text-white group tracking-tight"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-md">VT</span>
          </div>
          VideoTube
        </Link>
        <div className="w-full bg-white/70 rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-800/50 xl:p-0 dark:bg-zinc-900/70 backdrop-blur-xl">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-10">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-zinc-900 md:text-2xl dark:text-white">
              Create an account
            </h1>
            
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 text-sm text-red-700 bg-red-50 rounded-xl dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-4 mb-4 text-sm text-emerald-700 bg-emerald-100 rounded-lg dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {successMsg}
              </div>
            )}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="fullname" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="fullname"
                      id="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3 dark:bg-zinc-800/50 dark:border-zinc-700 dark:placeholder-zinc-500 dark:text-white transition-all duration-300"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3 dark:bg-zinc-800/50 dark:border-zinc-700 dark:placeholder-zinc-500 dark:text-white transition-all duration-300"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                    Email
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isOtpSent}
                        className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3 dark:bg-zinc-800/50 dark:border-zinc-700 dark:placeholder-zinc-500 dark:text-white transition-all duration-300 disabled:opacity-50"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || isOtpSent || !formData.email}
                      className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 focus:ring-4 focus:outline-none focus:ring-violet-300 dark:bg-violet-600 dark:hover:bg-violet-700 dark:focus:ring-violet-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingOtp ? 'Sending...' : isOtpSent ? 'OTP Sent' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {isOtpSent && (
                  <div className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="otp" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                      Verification Code (OTP)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="otp"
                        id="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        maxLength={6}
                        className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3 dark:bg-zinc-800/50 dark:border-zinc-700 dark:placeholder-zinc-500 dark:text-white transition-all duration-300"
                        placeholder="123456"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={formData.password}
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

                <div>
                  <label htmlFor="avatar" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                    Avatar
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="file"
                      name="avatar"
                      id="avatar"
                      onChange={handleChange}
                      className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3 dark:bg-zinc-800/50 dark:border-zinc-700 dark:placeholder-zinc-500 dark:text-white transition-all duration-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-600 file:text-white hover:file:bg-violet-700 file:cursor-pointer file:transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="coverImage" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                    Cover Image <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="file"
                      name="coverImage"
                      id="coverImage"
                      onChange={handleChange}
                      className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent block w-full pl-11 p-3 dark:bg-zinc-800/50 dark:border-zinc-700 dark:placeholder-zinc-500 dark:text-white transition-all duration-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer file:transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 mt-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-violet-500/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create account
                  </>
                )}
              </button>
              
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center mt-4">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors px-1 py-0.5 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/30"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;