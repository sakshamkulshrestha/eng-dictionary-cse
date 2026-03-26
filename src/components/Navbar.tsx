import { Link, useLocation } from 'react-router-dom';
import { Search, Network, LayoutGrid } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItem = (path, Icon, label) => {
    const active = location.pathname === path;

    return (
      <Link
        to={path}
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors
        ${active
            ? 'text-[var(--accent)]'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold
              bg-[var(--accent)] text-[var(--bg)]
              transition-transform group-hover:scale-105">
              E
            </div>

            <span className="text-xl font-semibold tracking-tight text-[var(--text)] hidden sm:block">
              EngiDict
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {navItem('/', Search, 'Search')}
            {navItem('/graph', Network, 'Graph')}
            {navItem('/compare', LayoutGrid, 'Compare')}
          </div>
        </div>
      </div>
    </nav>
  );
}