import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, CheckCircle, Calendar, XCircle, LogOut, Plus, Sparkles, X, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          api.get('/jobs/stats'),
          api.get('/jobs'),
        ]);
        setStats(statsRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGenerateCoverLetter = async (job) => {
    setSelectedJob(job);
    setCoverLetter('');
    setCopied(false);
    setGenerating(true);

    try {
      const response = await api.post('/ai/cover-letter', {
        companyName: job.companyName,
        jobRole: job.jobRole,
      });
      setCoverLetter(response.data.coverLetter);
    } catch (err) {
      setCoverLetter('Could not generate a cover letter right now. Please try again in a moment.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setCoverLetter('');
  };

  const statCards = [
    { label: 'Total Jobs', value: stats?.totalJobs, icon: Briefcase, color: 'text-indigo-400' },
    { label: 'Applied', value: stats?.applied, icon: Calendar, color: 'text-blue-400' },
    { label: 'Interview', value: stats?.interview, icon: CheckCircle, color: 'text-yellow-400' },
    { label: 'Offer', value: stats?.offer, icon: CheckCircle, color: 'text-green-400' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Your Dashboard</h1>
          <p className="text-slate-400 text-sm">Track every application in one place</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/jobs/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Job
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800"
          >
            <card.icon className={`w-6 h-6 mb-3 ${card.color}`} />
            <p className="text-3xl font-bold text-white">{card.value ?? 0}</p>
            <p className="text-slate-400 text-sm">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Job List */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg font-semibold text-white mb-4"
      >
        Applications
      </motion.h2>

      {jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-500 text-center py-20 border border-dashed border-slate-800 rounded-2xl"
        >
          No job applications yet. Add your first one!
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center"
            >
              <div>
                <p className="text-white font-medium">{job.companyName}</p>
                <p className="text-slate-400 text-sm">{job.jobRole}</p>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGenerateCoverLetter(job)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Cover Letter
                </motion.button>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                  {job.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cover Letter Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Cover Letter
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {selectedJob.jobRole} at {selectedJob.companyName}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {generating ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-[3px] border-purple-500 border-t-transparent rounded-full"
                  />
                  <p className="text-slate-400 text-sm">Gemini is writing...</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-h-72 overflow-y-auto">
                    <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                      {coverLetter}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy to clipboard
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;