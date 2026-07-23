import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

function Kanban() {
    const { showToast } = useToast();
    const [startups, setStartups] = useState([]);
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    async function loadStartups() {
        try {
            const res = await api.get("/startup/get_startups");
            setStartups(res.data);
            if (res.data.length > 0) {
                setSelectedStartupId(res.data[0].id.toString());
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function loadTasks(startupId) {
        if (!startupId) return;
        try {
            const res = await api.get(`/task/get_tasks/${startupId}`);
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStartups();
    }, []);

    useEffect(() => {
        loadTasks(selectedStartupId);
    }, [selectedStartupId]);

    async function moveTask(taskId, newStatus) {
        if (newStatus === "Completed") {
            try {
                await api.patch(`/task/${taskId}/finish_task`);
                showToast("Task completed!", "success");
                loadTasks(selectedStartupId);
            } catch (err) {
                showToast("Failed to update task", "error");
            }
        }
    }

    async function handleSelectTask(task) {
        setSelectedTask(task);
        try {
            const res = await api.get(`/collaboration/tasks/${task.id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleAddComment(e) {
        e.preventDefault();
        if (!newComment.trim() || !selectedTask) return;
        try {
            const res = await api.post(`/collaboration/tasks/${selectedTask.id}/comments`, { content: newComment });
            setComments(prev => [...prev, res.data]);
            setNewComment("");
        } catch (err) {
            showToast("Failed to send comment", "error");
        }
    }

    const pendingTasks = tasks.filter(t => t.status !== "Completed");
    const completedTasks = tasks.filter(t => t.status === "Completed");

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Kanban Board
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
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
                                <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-100">{s.name}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pending Column */}
                    <div className="minimal-card p-6 md:p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                            <h2 className="text-lg font-bold text-white font-heading">Pending ({pendingTasks.length})</h2>
                        </div>
                        <div className="flex flex-col gap-4 min-h-[300px]">
                            {pendingTasks.map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => handleSelectTask(t)}
                                    className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 cursor-pointer transition-all duration-200"
                                >
                                    <h3 className="font-bold text-sm text-zinc-200 mb-4">{t.title}</h3>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); moveTask(t.id, "Completed"); }}
                                        className="btn-primary py-1.5 px-4 text-[10px] w-full"
                                    >
                                        Complete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Column */}
                    <div className="minimal-card p-6 md:p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                            <h2 className="text-lg font-bold text-white font-heading">Completed ({completedTasks.length})</h2>
                        </div>
                        <div className="flex flex-col gap-4 min-h-[300px]">
                            {completedTasks.map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => handleSelectTask(t)}
                                    className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 opacity-70 hover:opacity-100 cursor-pointer transition-all duration-200"
                                >
                                    <h3 className="font-bold text-sm text-zinc-300 line-through">{t.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details / Comments Drawer */}
                {selectedTask && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex justify-end">
                        <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 flex flex-col p-6 shadow-2xl">
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white font-heading truncate max-w-[280px]">
                                        {selectedTask.title}
                                    </h3>
                                    <span className="text-[10px] text-zinc-500 font-semibold">Kanban comments</span>
                                </div>
                                <button 
                                    className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer font-bold"
                                    onClick={() => setSelectedTask(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                                {comments.length === 0 ? (
                                    <p className="text-zinc-500 text-xs text-center py-12">No comments written yet.</p>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-white">{c.username}</span>
                                                <span className="text-[9px] text-zinc-500 font-semibold">
                                                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-300 leading-relaxed font-medium">{c.content}</p>
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
                                />
                                <button
                                    type="submit"
                                    className="btn-primary px-4 text-xs font-bold"
                                    disabled={!newComment.trim()}
                                >
                                    Send
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
