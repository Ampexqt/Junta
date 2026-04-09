import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';


export function AuthNavigation() {
  return (
    <Link
      to="/"
      className="absolute top-8 left-8 z-50 flex items-center gap-2.5 text-sm font-medium text-slate-500 hover:text-primary transition-all duration-200 group"
    >
      <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 shadow-sm transition-all shadow-slate-200/50">
        <ArrowLeft className="w-4 h-4" />
      </div>
      <span className="hidden sm:inline font-semibold">Back to Home</span>
    </Link>
  );
}
