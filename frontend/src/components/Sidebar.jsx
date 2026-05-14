import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/materials', label: 'Vật tư' },
  { to: '/categories', label: 'Loại vật tư' },
  { to: '/suppliers', label: 'Nhà cung cấp' },
  { to: '/users', label: 'Nhân sự' },
];

export default function Sidebar() {
  const baseClass =
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors';
  const inactive = 'text-slate-300 hover:bg-slate-800 hover:text-white';
  const active = 'bg-brand-600 text-white';

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col bg-slate-900 text-slate-100">
      <div className="flex h-16 items-center justify-center border-b border-slate-800 px-4">
        <span className="text-base font-semibold tracking-wide">
          Vật tư nội thất
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${baseClass} ${isActive ? active : inactive}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3 text-xs text-slate-400">
        Phase 1 - Frontend skeleton
      </div>
    </aside>
  );
}
