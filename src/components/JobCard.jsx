// BUG FIX: File was completely empty. Dashboard renders jobs inline so this
// component isn't wired in yet, but it's implemented here ready to use.
import { Briefcase, CheckCircle, Calendar, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig = {
  Offer:     { icon: <CheckCircle className="w-4 h-4 text-green-400" />,  color: 'text-green-300',  bg: 'bg-green-500/20'  },
  Interview: { icon: <Calendar    className="w-4 h-4 text-yellow-400" />, color: 'text-yellow-300', bg: 'bg-yellow-500/20' },
  Rejected:  { icon: <XCircle     className="w-4 h-4 text-red-400" />,    color: 'text-red-300',    bg: 'bg-red-500/20'    },
  Applied:   { icon: <Briefcase   className="w-4 h-4 text-blue-400" />,   color: 'text-indigo-300', bg: 'bg-indigo-500/20' },
};

function JobCard({ job, index = 0 }) {
  const cfg = statusConfig[job.status] || statusConfig.Applied;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 flex justify-between items-center"
    >
      <div className="flex items-center gap-3">
        {cfg.icon}
        <div>
          <p className="text-white font-medium">{job.companyName}</p>
          <p className="text-slate-400 text-sm">{job.jobRole}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
        {job.status}
      </span>
    </motion.div>
  );
}

export default JobCard;