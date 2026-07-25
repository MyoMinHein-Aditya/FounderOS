import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { LayoutTemplate } from 'lucide-react';

function FrontendNode({ data }) {
    return (
        <div className="min-w-[150px] bg-background border border-slate-500/30 rounded-lg shadow-sm shadow-slate-500/10 flex items-center p-3 gap-3">
            <div className="bg-slate-500/10 p-1.5 rounded-md text-slate-400">
                <LayoutTemplate size={16} />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{data.label}</span>
                <span className="text-[10px] text-muted-foreground">{data.file}</span>
            </div>
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-500 border-none" />
        </div>
    );
}

export default memo(FrontendNode);
