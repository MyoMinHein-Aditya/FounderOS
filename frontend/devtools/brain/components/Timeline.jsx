import React from 'react';
import { useBrainStore } from '../store/useBrainStore';

export default function Timeline() {
    const traces = useBrainStore(state => state.traces);

    return (
        <div className="absolute bottom-4 left-4 right-4 bg-background border border-white/10 rounded-lg shadow-xl p-4 h-48 overflow-y-auto z-50">
            <h3 className="text-sm font-semibold text-white mb-3 sticky top-0 bg-background pb-2">Timeline</h3>
            <div className="flex flex-col gap-1">
                {traces.slice().reverse().map((t, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-mono py-1 border-b border-white/5 last:border-0">
                        <span className="text-slate-500 w-24">Trace {t.traceId}</span>
                        <span className="text-indigo-400 w-24">{t.source}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-emerald-400 flex-1 truncate">{t.target}</span>
                        <span className="text-slate-400">{t.duration ? `${t.duration.toFixed(1)}ms` : 'Pending...'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
