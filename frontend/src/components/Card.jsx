// Display stat cards with icons and trends

function Card({ title, value, icon, trend, subtext }) {
    return (
        <div className="glass-card p-6 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">{title}</span>
                {icon && <span className="text-2xl">{icon}</span>}
            </div>
            <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-zinc-100">{value}</span>
                {trend && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1.5">
                        ↑ {trend}
                    </span>
                )}
                {subtext && (
                    <span className="text-xs text-zinc-500 mt-1">
                        {subtext}
                    </span>
                )}
            </div>
        </div>
    );
}

export default Card;