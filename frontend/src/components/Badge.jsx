// Styling status indicators with colors

function Badge({ status, label, icon }) {
    const badgeStyles = {
        completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        active: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        default: "bg-zinc-800/50 text-zinc-300 border border-zinc-700/50"
    };

    const style = badgeStyles[status] || badgeStyles.default;

    return (
        <span className={`badge ${style}`}>
            {icon && <span>{icon}</span>}
            <span>{label}</span>
        </span>
    );
}

export default Badge;
