import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../features/authSlice';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Clear any previous errors on mount
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Decorative background grid/gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600 rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-600 rounded-full blur-[120px] opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative z-10"
      >
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <Activity className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">ICSR CPRRMS</h2>
          <p className="text-sm text-slate-400 mt-2">
            Cancer Patient Registry & Research Management System
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-xs font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Staff Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) dispatch(clearError());
                }}
                placeholder="doctor@icsr.org"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) dispatch(clearError());
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In to Registry'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center mt-8 pt-6 border-t border-slate-900">
          <p className="text-xs text-slate-500">
            For security reasons, access is monitored. Please contact Super Admin for new staff logins.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
