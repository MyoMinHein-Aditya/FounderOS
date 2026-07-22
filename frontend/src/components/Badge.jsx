function Badge({ status, label, icon }) {
    const badgeStyles = {
        completed: "bg-zinc-900 text-zinc-200 border-zinc-700",
        pending: "bg-zinc-900/80 text-zinc-400 border-zinc-800",
        active: "bg-white text-zinc-950 font-bold border-white",
        default: "bg-zinc-900 text-zinc-300 border-zinc-800"
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
