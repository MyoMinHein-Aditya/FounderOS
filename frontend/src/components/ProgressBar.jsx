function ProgressBar({ percentage, label, showPercent }) {
    return (
        <div className="flex flex-col gap-2">
            {(label || showPercent) && (
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    {label && <span>{label}</span>}
                    {showPercent && <span>{Math.round(percentage)}%</span>}
                </div>
            )}
            <div className="progress-bar">
                <div
                    className="progress-fill transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

export default ProgressBar;
