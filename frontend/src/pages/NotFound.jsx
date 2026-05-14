import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-300">404</p>
        <p className="mt-2 text-slate-600">Trang không tồn tại.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-sm text-brand-600 hover:underline"
        >
          Quay về Dashboard
        </Link>
      </div>
    </div>
  );
}
