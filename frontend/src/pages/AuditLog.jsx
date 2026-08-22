import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function AuditLog() {
    const { data: logs, isLoading, error } = useQuery({
        queryKey: ["auditLogs"],
        queryFn: async () => {
            const res = await api.get("/audit/my_logs");
            return res.data;
        },
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-24 px-6 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Audit Trail
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        View a timeline of your activities and changes within the workspace.
                    </p>
                </header>

                {error && (
                    <div className="minimal-card p-6 mb-8 border-destructive bg-destructive/10">
                        <p className="text-sm font-semibold text-destructive">Failed to load audit logs.</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center p-8">Loading logs...</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {logs && logs.length > 0 ? (
                            logs.map((log) => (
                                <div key={log.id} className="p-4 bg-muted rounded-lg border border-border text-sm flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-foreground">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">Resource: {log.resource_type} (ID: {log.resource_id})</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm py-4 text-center">No activity found.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default AuditLog;
