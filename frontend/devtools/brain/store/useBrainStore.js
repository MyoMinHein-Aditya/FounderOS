import { create } from 'zustand';

export const useBrainStore = create((set, get) => ({
    isOpen: false,
    toggleOpen: () => set(state => ({ isOpen: !state.isOpen })),
    nodes: [],
    edges: [],
    traces: [],
    
    setGraph: (nodes, edges) => set({ nodes, edges }),
    
    addTrace: (trace) => set(state => {
        const newTraces = [...state.traces, trace];
        // Keep only last 100 traces
        if (newTraces.length > 100) newTraces.shift();
        return { traces: newTraces };
    })
}));
