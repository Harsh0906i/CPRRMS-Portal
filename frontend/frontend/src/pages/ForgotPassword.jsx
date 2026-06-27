import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Activity, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetURL, setResetURL] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');
    setResetURL('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      if (response.data.resetURL) {
        // Save URL locally for testing convenience
        setResetURL(response.data.resetURL);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            <Activity className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-sm text-slate-400 mt-2">
            Enter your registered email and we'll generate a reset link
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-955/50 border border-red-800/50 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
            {message}
          </div>
        )}

        {/* Temporary Developer Link for Testing Convenience */}
        {resetURL && (
          <div className="mb-6 p-4 rounded-lg bg-blue-950/40 border border-blue-800/50 text-blue-300 text-xs">
            <p className="font-bold mb-1">Development Mode Helper:</p>
            <p className="mb-2 truncate">{resetURL}</p>
            <a
              href={`/reset-password/${resetURL.split('/').pop()}`}
              className="inline-block px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold transition-colors"
            >
              Go to Reset Screen
            </a>
          </div>
        )}

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
                onChange={e => setEmail(e.target.value)}
                placeholder="doctor@icsr.org"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
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
              'Generate Reset Link'
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
