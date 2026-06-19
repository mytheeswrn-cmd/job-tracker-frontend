import { useState } from 'react';
import { motion } from 'framer-motion';
// BUG FIX 1: Removed massive block of unused imports (useEffect, AnimatePresence,
// Briefcase, CheckCircle, Calendar, XCircle, LogOut, Plus, Sparkles, X, Copy, Check).
// These were all leftover from copy-paste and added ~15 unused variables.
// More critically: 'Link' was imported from 'lucide-react' (an icon library),
// not from 'react-router-dom'. Lucide's Link is an SVG icon, not a router component.
// Using it as <Link to="/login"> renders nothing / throws a runtime error,
// so the "Sign in" link at the bottom of the register page was completely broken.
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// BUG FIX 2: Removed unused state variables leftover from copy-paste:
// selectedJob, coverLetter, generating, copied — none of them were used in the JSX.
// They were just dead weight causing lint warnings.
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      // BUG FIX 3: Backend now returns { error: "..." } not { message: "..." }.
      // Was: err.response?.data?.message → always undefined → always showed generic text.
      setError(
        err.response?.data?.error || 'Could not create account. Try a different email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">

      {/* Animated background glow */}
      <motion.div
        className="absolute w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, -100, 0], y: [0, 60, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Register card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Create your account
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-slate-400 mb-8"
        >
          Start tracking your job applications today
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="relative"
          >
            <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:scale-[1.02] transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="relative"
          >
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:scale-[1.02] transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="relative"
          >
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:scale-[1.02] transition-all duration-200"
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-center text-slate-400 text-sm mt-6"
        >
          Already have an account?{' '}
          {/* This now correctly uses react-router-dom's Link */}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Register;