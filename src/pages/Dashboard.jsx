import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, CheckCircle, Calendar, XCircle, LogOut, Plus, X, MessageCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am your career assistant. Ask me anything about your job search, interview prep, or career advice!' }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
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

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    try {
      const context = jobs.map(j => `${j.jobRole} at ${j.companyName} (${j.status})`).join(', ');
      const res = await api.post('/ai/chat', { message: input, context });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not respond right now.' }]);
    } finally {
      setThinking(false);
    }
  };

  const statusIcon = (status) => {
    if (status === 'Offer') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'Interview') return <Calendar className="w-4 h-4 text-yellow-400" />;
    if (status === 'Rejected') return <XCircle className="w-4 h-4 text-red-400" />;
    return <Briefcase className="w-4 h-4 text-blue-400" />;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 relative">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track every application in one place</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add-job')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Job
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: stats.total, icon: <Briefcase className="w-5 h-5" /> },
            { label: 'Applied', value: stats.applied, icon: <CheckCircle className="w-5 h-5" /> },
            { label: 'Interview', value: stats.interview, icon: <Calendar className="w-5 h-5" /> },
            { label: 'Offer', value: stats.offer, icon: <CheckCircle className="w-5 h-5 text-green-400" /> },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
            >
              <div className="text-indigo-400 mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Jobs List */}
      <h2 className="text-white font-bold text-lg mb-4">Applications</h2>
      <div className="space-y-3">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              {statusIcon(job.status)}
              <div>
                <p className="text-white font-medium">{job.companyName}</p>
                <p className="text-slate-400 text-sm">{job.jobRole}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
              {job.status}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Floating AI Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col z-50 shadow-2xl"
          >
            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                <span className="text-white font-medium text-sm">Career Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 px-3 py-2 rounded-xl text-xs">Thinking...</div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-xl outline-none placeholder-slate-500"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                className="bg-indigo-600 p-2 rounded-xl"
              >
                <Send className="w-3 h-3 text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;