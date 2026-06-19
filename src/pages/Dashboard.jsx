import { useEffect, useRef, useState } from 'react';
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
  // BUG FIX 1 (minor): ref to auto-scroll chat to bottom on new messages
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          api.get('/jobs/stats'),
          api.get('/jobs'),
        ]);
        setStats(statsRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // 401 is now handled globally by the api.js interceptor.
        // We only need to handle non-auth errors here.
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Auto-scroll chat to bottom whenever messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSend = async () => {
    if (!input.trim() || thinking) return;

    // BUG FIX 2: Capture the message text BEFORE clearing input.
    // The original code set setInput('') then used `input` in the API call.
    // In React, state updates are async so `input` could already be '' by
    // the time the api.post runs, sending an empty message to the backend.
    const messageText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setInput('');
    setThinking(true);

    try {
      const context = jobs.length > 0
        ? jobs.map(j => `${j.jobRole} at ${j.companyName} (${j.status})`).join(', ')
        : 'No job applications yet.';
      const res = await api.post('/ai/chat', { message: messageText, context });
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
            {/* BUG FIX 3: Was "/job/new" — missing 's'. The route in App.jsx is "/jobs/new".
                This caused the Add Job button to match the wildcard route and redirect
                straight back to /login instead of opening the form. */}
            onClick={() => navigate('/jobs/new')}
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
            // BUG FIX 4: Was stats.total — the backend key is "totalJobs", not "total".
            // This caused the Total Jobs stat card to always show undefined.
            { label: 'Total Jobs',  value: stats.totalJobs,  icon: <Briefcase className="w-5 h-5" /> },
            { label: 'Applied',     value: stats.applied,    icon: <CheckCircle className="w-5 h-5" /> },
            { label: 'Interview',   value: stats.interview,  icon: <Calendar className="w-5 h-5" /> },
            { label: 'Offer',       value: stats.offer,      icon: <CheckCircle className="w-5 h-5 text-green-400" /> },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
            >
              <div className="text-indigo-400 mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value ?? 0}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Jobs List */}
      <h2 className="text-white font-bold text-lg mb-4">Applications</h2>
      <div className="space-y-3">
        {/* BUG FIX 5: No empty state — when jobs is [] the section was just blank
            with no feedback. Added a prompt to encourage adding the first job. */}
        {jobs.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-12">
            No applications yet.{' '}
            <button
              onClick={() => navigate('/jobs/new')}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Add your first job
            </button>
          </div>
        ) : (
          jobs.map((job, i) => (
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
          ))
        )}
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
              {/* Auto-scroll anchor */}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-xl outline-none placeholder-slate-500"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={thinking}
                className="bg-indigo-600 p-2 rounded-xl disabled:opacity-50"
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