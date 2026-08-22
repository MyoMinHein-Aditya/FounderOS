import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

const commentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty")
});

function Kanban() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [newComment, setNewComment] = useState("");

    const { data: startups = [] } = useQuery({
        queryKey: ["startups"],
        queryFn: async () => {
            const res = await api.get("/startup/get_startups");
            return res.data;
        }
    });

    useEffect(() => {
        if (startups.length > 0 && !selectedStartupId) {
            setSelectedStartupId(startups[0].id.toString());
        }
    }, [startups, selectedStartupId]);

    const { data: tasks = [] } = useQuery({
        queryKey: ["tasks", selectedStartupId],
        queryFn: async () => {
            const res = await api.get(`/task/get_tasks/${selectedStartupId}`);
            return res.data;
        },
        enabled: !!selectedStartupId
    });

    const { data: comments = [] } = useQuery({
        queryKey: ["comments", selectedTask?.id],
        queryFn: async () => {
            const res = await api.get(`/collaboration/tasks/${selectedTask.id}/comments`);
            return res.data;
        },
        enabled: !!selectedTask
    });

    const completeTaskMutation = useMutation({
        mutationFn: async (taskId) => {
            return await api.patch(`/task/${taskId}/finish_task`);
        },
        onSuccess: () => {
            showToast("Task completed!", "success");
            queryClient.invalidateQueries({ queryKey: ["tasks", selectedStartupId] });
        },
        onError: () => {
            showToast("Failed to update task", "error");
        }
    });

    const addCommentMutation = useMutation({
        mutationFn: async ({ taskId, content }) => {
            const res = await api.post(`/collaboration/tasks/${taskId}/comments`, { content });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", selectedTask?.id] });
            setNewComment("");
        },
        onError: () => {
            showToast("Failed to send comment", "error");
        }
    });

    function moveTask(taskId, newStatus) {
        if (newStatus === "Completed") {
            completeTaskMutation.mutate(taskId);
        }
    }

    function handleSelectTask(task) {
        setSelectedTask(task);
    }

    function handleAddComment(e) {
        e.preventDefault();
        try {
            commentSchema.parse({ content: newComment });
            if (selectedTask) {
                addCommentMutation.mutate({ taskId: selectedTask.id, content: newComment });
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                showToast(err.errors[0].message, "error");
            }
        }
    }

    const pendingTasks = tasks.filter(t => t.status !== "Completed");
    const completedTasks = tasks.filter(t => t.status === "Completed");

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Kanban Board
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base font-medium">
                            Visualize tasks, manage execution flow, and monitor comments.
                        </p>
                    </div>
                    <div>
                        <select
                            className="minimal-input py-2 px-3 cursor-pointer text-sm"
                            value={selectedStartupId}
                            onChange={(e) => setSelectedStartupId(e.target.value)}
                        >
                            {startups.map(s => (
                                <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pending Column */}
                    <div className="minimal-card p-6 md:p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                            <h2 className="text-lg font-bold text-foreground font-heading">Pending ({pendingTasks.length})</h2>
                        </div>
                        <div className="flex flex-col gap-4 min-h-[300px]">
                            {pendingTasks.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => handleSelectTask(t)}
                                    className="p-5 rounded-2xl border border-border bg-muted hover:border-border cursor-pointer transition-all duration-200"
                                >
                                    <h3 className="font-bold text-sm text-foreground mb-4">{t.title}</h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveTask(t.id, "Completed"); }}
                                        className="btn-primary py-1.5 px-4 text-[10px] w-full"
                                        disabled={completeTaskMutation.isPending && completeTaskMutation.variables === t.id}
                                    >
                                        {completeTaskMutation.isPending && completeTaskMutation.variables === t.id ? "Completing..." : "Complete"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Column */}
                    <div className="minimal-card p-6 md:p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                            <h2 className="text-lg font-bold text-foreground font-heading">Completed ({completedTasks.length})</h2>
                        </div>
                        <div className="flex flex-col gap-4 min-h-[300px]">
                            {completedTasks.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => handleSelectTask(t)}
                                    className="p-5 rounded-2xl border border-border bg-muted opacity-70 hover:opacity-100 cursor-pointer transition-all duration-200"
                                >
                                    <h3 className="font-bold text-sm text-muted-foreground line-through">{t.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details / Comments Drawer */}
                {selectedTask && (
                    <div className="fixed inset-0 z-50 bg-background/80 flex justify-end">
                        <div className="w-full max-w-md h-full bg-background border-l border-zinc-900 flex flex-col p-6 shadow-2xl">
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground font-heading truncate max-w-[280px]">
                                        {selectedTask.title}
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground font-semibold">Kanban comments</span>
                                </div>
                                <button
                                    className="text-muted-foreground hover:text-muted-foreground text-lg cursor-pointer font-bold"
                                    onClick={() => setSelectedTask(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                                {comments.length === 0 ? (
                                    <p className="text-muted-foreground text-xs text-center py-12">No comments written yet.</p>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="p-3 bg-muted rounded-xl border border-border flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-foreground">{c.username}</span>
                                                <span className="text-[9px] text-muted-foreground font-semibold">
                                                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{c.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="flex-1 minimal-input py-2.5 px-3 text-xs"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={addCommentMutation.isPending}
                                />
                                <button
                                    type="submit"
                                    className="btn-primary px-4 text-xs font-bold"
                                    disabled={!newComment.trim() || addCommentMutation.isPending}
                                >
                                    {addCommentMutation.isPending ? "Sending..." : "Send"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Kanban;
