import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken } from '../features/authSlice';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Activity, Lock, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage('Password updated successfully. Logging you in...');
      
      // Store token directly in state to authenticate the user
      const jwtToken = response.data.token;
      const user = response.data.data.user;
      
      // Save session
      localStorage.setItem('cprrms_user', JSON.stringify(user));
      dispatch(setToken(jwtToken));
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create New Password</h2>
          <p className="text-sm text-slate-400 mt-2">
            Please enter your new registry staff password below
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="•••••••• (Min 8 characters)"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Save & Log In'
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-900">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-3 w-3" />
            Back to Login Screen
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
