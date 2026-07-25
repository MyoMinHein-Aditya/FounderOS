import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Webhook } from 'lucide-react';

function APINode({ data }) {
    return (
        <div className="min-w-[150px] bg-background border border-blue-500/30 rounded-lg shadow-sm shadow-blue-500/10 flex items-center p-3 gap-3">
            <div className="bg-blue-500/10 p-1.5 rounded-md text-blue-400">
                <Webhook size={16} />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{data.label}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{data.file}</span>
            </div>
            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500 border-none" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500 border-none" />
        </div>
    );
}

export default memo(APINode);
