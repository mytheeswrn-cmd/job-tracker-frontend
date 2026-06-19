// BUG FIX: File was completely empty.
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-2">
      <Briefcase className="w-5 h-5 text-indigo-400" />
      <Link to="/dashboard" className="text-white font-semibold text-lg">
        JobTracker
      </Link>
    </nav>
  );
}

export default Navbar;