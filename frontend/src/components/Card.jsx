function Card({ title, value, icon, trend, subtext }) {
    return (
        <div className="minimal-card p-6 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">{title}</span>
                {icon && <span className="text-2xl">{icon}</span>}
            </div>
            <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-white font-heading">{value}</span>
                {trend && (
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1 mt-1.5">
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