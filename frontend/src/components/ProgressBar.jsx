function ProgressBar({ percentage, label, showPercent }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {(label || showPercent) && (
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    {label && <span>{label}</span>}
                    {showPercent && <span>{Math.round(percentage)}%</span>}
                </div>
            )}
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

export default ProgressBar;
