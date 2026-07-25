import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Bot } from 'lucide-react';

function AgentNode({ data }) {
    return (
        <div className="min-w-[150px] bg-background border border-indigo-500/30 rounded-lg shadow-sm shadow-indigo-500/10 flex items-center p-3 gap-3">
            <div className="bg-indigo-500/10 p-1.5 rounded-md text-indigo-400">
                <Bot size={16} />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{data.label}</span>
                <span className="text-[10px] text-muted-foreground">{data.file}</span>
            </div>
            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-indigo-500 border-none" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-indigo-500 border-none" />
        </div>
    );
}

export default memo(AgentNode);
