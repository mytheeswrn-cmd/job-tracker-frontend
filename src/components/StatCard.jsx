// BUG FIX: File was completely empty.
import { motion } from 'framer-motion';

function StatCard({ label, value, icon, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
    >
      <div className="text-indigo-400 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value ?? 0}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </motion.div>
  );
}

export default StatCard;