function StatCard({ title, value, icon, description, trend, trendIcon }) {
    return (
        <div className="minimal-card p-6 transition-all duration-200 hover:shadow-md hover:border-foreground/20">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-extrabold text-foreground font-heading">
                        {value}
                    </p>
                </div>
                {icon && <span className="text-3xl text-muted-foreground">{icon}</span>}
            </div>
            
            {description && (
                <p className="text-xs text-muted-foreground mb-2">{description}</p>
            )}
            
            {trend && (
                <p className="text-xs font-medium text-primary flex items-center gap-1">
                    {trendIcon && <span>{trendIcon}</span>}
                    {trend}
                </p>
            )}
        </div>
    );
}

export default StatCard;
