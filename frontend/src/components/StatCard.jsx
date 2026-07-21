// Display analytics data with icon and description

function StatCard({ title, value, icon, description, trend, trendIcon }) {
    return (
        <div className="minimal-card p-6 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-extrabold text-white font-heading">
                        {value}
                    </p>
                </div>
                {icon && <span className="text-3xl">{icon}</span>}
            </div>
            
            {description && (
                <p className="text-xs text-zinc-400 mb-2">{description}</p>
            )}
            
            {trend && (
                <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    {trendIcon && <span>{trendIcon}</span>}
                    {trend}
                </p>
            )}
        </div>
    );
}

export default StatCard;
