function Card({ title, value, icon, trend, subtext }) {
    return (
        <div className="minimal-card p-6 transition-all duration-200 hover:shadow-md hover:border-foreground/20">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</span>
                {icon && <span className="text-2xl text-muted-foreground">{icon}</span>}
            </div>
            <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-foreground font-heading">{value}</span>
                {trend && (
                    <span className="text-xs font-medium text-primary flex items-center gap-1 mt-2">
                        <span aria-hidden="true">↑</span>
                        <span className="sr-only">Trend up: </span>
                        {trend}
                    </span>
                )}
                {subtext && (
                    <span className="text-xs text-muted-foreground mt-1.5">
                        {subtext}
                    </span>
                )}
            </div>
        </div>
    );
}

export default Card;