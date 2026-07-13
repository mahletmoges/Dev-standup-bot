import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
          active
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Dev Standup Bot
            </Link>
            <div className="hidden sm:flex items-center gap-1 ml-4">
              {navLink('/', 'Dashboard')}
              {navLink('/standup', 'My Standup')}
              {navLink('/digests', 'Digests')}
              {navLink('/history', 'History')}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-md hover:bg-red-50 transition"
            >
              Log out
            </button>
          </div>
        </div>
        <div className="flex sm:hidden gap-1 pb-2 overflow-x-auto">
          {navLink('/', 'Dashboard')}
          {navLink('/standup', 'My Standup')}
          {navLink('/digests', 'Digests')}
          {navLink('/history', 'History')}
        </div>
      </div>
    </nav>
  );
}
