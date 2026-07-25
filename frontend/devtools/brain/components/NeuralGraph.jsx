import React, { useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useBrainStore } from '../store/useBrainStore';

import AgentNode from './nodes/AgentNode';
import DBNode from './nodes/DBNode';
import APINode from './nodes/APINode';
import FrontendNode from './nodes/FrontendNode';

const nodeTypes = {
    agent: AgentNode,
    database: DBNode,
    api: APINode,
    frontend: FrontendNode
};

export default function NeuralGraph() {
    const { nodes: initialNodes, edges: initialEdges } = useBrainStore();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync from store
    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#09090B]"
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#ffffff" gap={16} size={1} opacity={0.05} />
                <Controls className="bg-background border-border fill-foreground" />
                <MiniMap 
                    nodeColor={(n) => {
                        if (n.type === 'agent') return '#5B5FEF';
                        if (n.type === 'database') return '#10B981';
                        if (n.type === 'api') return '#3B82F6';
                        return '#64748B';
                    }} 
                    maskColor="rgba(9, 9, 11, 0.8)" 
                    className="bg-background border border-white/10 rounded-lg"
                />
            </ReactFlow>
        </div>
    );
}
