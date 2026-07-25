import React, { useEffect, useState } from 'react';
import { useBrainStore } from './store/useBrainStore';
import NeuralGraph from './components/NeuralGraph';
import MetricsPanel from './components/MetricsPanel';
import Timeline from './components/Timeline';

export default function BrainOverlay() {
    const { isOpen, toggleOpen, setGraph, addTrace } = useBrainStore();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleOpen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleOpen]);

    useEffect(() => {
        if (import.meta.hot) {
            import.meta.hot.on('founderos:trace', (data) => {
                addTrace(data);
            });
        }
    }, [addTrace]);

    useEffect(() => {
        if (isOpen) {
            import('virtual:founder-brain-graph').then((module) => {
                const graph = module.default;
                
                const rfNodes = graph.nodes.map((n, i) => ({
                    id: n.id,
                    type: n.type.toLowerCase(),
                    position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 150 },
                    data: { label: n.label, file: n.data.file }
                }));
                
                setGraph(rfNodes, graph.edges || []);
            });
        }
    }, [isOpen, setGraph]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#09090B] text-slate-200">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    FounderOS Brain
                </h1>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Dev Mode</span>
            </div>
            
            <MetricsPanel />
            <Timeline />
            <NeuralGraph />
        </div>
    );
}
