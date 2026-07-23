export default function Toast({ message, type, onClose }) {
  const typeStyles = {
    success: "border-l-4 border-white html.light:border-l-4 html.light:border-zinc-950",
    error: "border-l-4 border-red-800 html.light:border-red-600",
    warning: "border-l-4 border-amber-800 html.light:border-amber-600",
    info: "border-l-4 border-zinc-700 html.light:border-zinc-400"
  };

  return (
    <div className={`minimal-card p-4 flex items-center justify-between gap-4 pointer-events-auto min-w-[280px] max-w-sm shadow-lg ${typeStyles[type] || typeStyles.info}`}>
      <span className="text-sm font-semibold text-zinc-200">{message}</span>
      <button 
        onClick={onClose}
        className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer text-xs font-bold"
      >
        ✕
      </button>
    </div>
  );
}
