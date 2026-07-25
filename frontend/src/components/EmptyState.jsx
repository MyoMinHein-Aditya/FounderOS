export default function EmptyState({ title, description, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-muted/50 rounded-2xl border border-border text-muted-foreground max-w-lg mx-auto w-full">
      <h3 className="text-lg font-semibold text-foreground font-heading mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
