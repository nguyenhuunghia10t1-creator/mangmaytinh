export default function PagePlaceholder({ title, description }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      )}
      <div className="mt-6 rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        Nội dung sẽ được bổ sung ở Phase tiếp theo.
      </div>
    </div>
  );
}
