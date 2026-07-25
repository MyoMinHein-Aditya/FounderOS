import React from 'react';
import { useBrainStore } from '../store/useBrainStore';

export default function MetricsPanel() {
    const traces = useBrainStore(state => state.traces);
    const activeRequests = traces.filter(t => t.duration === undefined).length;
    const avgLatency = traces.length ? (traces.reduce((acc, t) => acc + (t.duration || 0), 0) / traces.length).toFixed(1) : 0;

    return (
        <div className="absolute top-4 right-4 bg-background border border-white/10 rounded-lg shadow-xl p-4 min-w-[200px] z-50">
            <h3 className="text-sm font-semibold text-white mb-3">Live Metrics</h3>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Active Requests</span>
                    <span className="font-mono text-indigo-400">{activeRequests}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg Latency</span>
                    <span className="font-mono text-emerald-400">{avgLatency}ms</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Traces</span>
                    <span className="font-mono text-slate-300">{traces.length}</span>
                </div>
            </div>
        </div>
    );
}
