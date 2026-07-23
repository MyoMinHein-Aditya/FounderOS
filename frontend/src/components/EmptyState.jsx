export default function EmptyState({ title, description, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 max-w-lg mx-auto w-full">
      <h3 className="text-lg font-bold text-white font-heading mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-6 font-medium max-w-sm">{description}</p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="btn-primary py-2.5 px-5 text-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
