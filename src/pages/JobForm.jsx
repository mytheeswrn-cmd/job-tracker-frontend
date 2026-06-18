import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Briefcase, FileText, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function JobForm() {
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const statusOptions = ['Applied', 'Interview', 'Offer', 'Rejected'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/jobs', { companyName, jobRole, status, notes });
      navigate('/dashboard');
    } catch (err) {
      setError('Could not save this job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
      >
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </motion.button>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white mb-1"
        >
          Add Application
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 mb-8 text-sm"
        >
          Track a new job you've applied to
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:scale-[1.02] transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="relative"
          >
            <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Job role"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:scale-[1.02] transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <ListChecks className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 z-10" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all duration-200 appearance-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-800">
                  {opt}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="relative"
          >
            <FileText className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all duration-200 resize-none"
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
            transition={{ delay: 0.5 }}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Application'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default JobForm;