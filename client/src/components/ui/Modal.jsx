export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card w-full max-w-md p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <button className="btn-ghost h-8 w-8 p-0 text-lg" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
