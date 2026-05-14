import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function getInitial(name) {
  if (!name) return '?';
  const trimmed = String(name).trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const displayName = user?.fullName || user?.username || 'User';
  const initial = getInitial(user?.fullName || user?.username);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-800">
        Quản lý vật tư nội thất
      </h1>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-medium">{displayName}</span>
          {user?.role && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-500">
              {user.role}
            </span>
          )}
        </div>
        <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold">
          {initial}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
