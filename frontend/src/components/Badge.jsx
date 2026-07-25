function Badge({ status, label, icon }) {
    const badgeStyles = {
        completed: "bg-primary/10 text-primary border-primary/20",
        pending: "bg-muted text-muted-foreground border-border",
        active: "bg-primary text-primary-foreground border-primary",
        default: "bg-secondary text-secondary-foreground border-transparent"
    };

    const style = badgeStyles[status] || badgeStyles.default;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${style}`}>
            {icon && <span>{icon}</span>}
            <span>{label}</span>
        </span>
    );
}

export default Badge;
