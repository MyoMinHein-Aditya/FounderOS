import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";
import Badge from "../components/Badge";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";
import { useToast } from "../context/ToastContext";

const createTaskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    startup_id: z.string().min(1, "Select a startup before creating a task."),
    goal_id: z.string().min(1, "Select a goal before creating a task.")
});

const commentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty")
});

function Tasks() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [form, setForm] = useState({ title: "", goal_id: "", startup_id: "" });

    // Search, Filters & Pagination States
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);

    // Collaboration comments States
    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [ws, setWs] = useState(null);

    const { data: startups = [] } = useQuery({
        queryKey: ["startups"],
        queryFn: async () => {
            const res = await api.get("/startup/get_startups");
            return res.data;
        }
    });

    const { data: goals = [] } = useQuery({
        queryKey: ["goals"],
        queryFn: async () => {
            const res = await api.get("/goal/get_my_goals");
            return res.data;
        }
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ["tasks", form.startup_id, search, statusFilter, page],
        queryFn: async () => {
            if (!form.startup_id) return [];
            const res = await api.get(`/task/get_tasks/${form.startup_id}`, {
                params: {
                    search: search || undefined,
                    status: statusFilter || undefined,
                    page: page,
                    limit: 6
                }
            });
            return res.data;
        },
        enabled: !!form.startup_id
    });

    useEffect(() => {
        // Setup real-time WebSocket connection for activity ticker
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const envUrl = import.meta.env.VITE_API_URL;
        const wsHost = envUrl 
            ? envUrl.replace("http://", "").replace("https://", "")
            : (window.location.hostname === "localhost" ? "localhost:8000" : window.location.host);
        const socket = new WebSocket(`${wsProtocol}//${wsHost}/ws`);
        
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "new_comment") {
                    setSelectedTask(current => {
                        if (current && current.id === data.task_id) {
                            setComments(prev => [...prev, data.comment]);
                        }
                        return current;
                    });
                }
            } catch (err) {
                // Ignore test text echo messages
            }
        };

        setWs(socket);
        return () => socket.close();
    }, []);

    const createTaskMutation = useMutation({
        mutationFn: async (data) => {
            await api.post("/task/create", {
                title: data.title,
                startup_id: Number(data.startup_id),
                goal_id: Number(data.goal_id)
            });
        },
        onSuccess: () => {
            setForm({ ...form, title: "", goal_id: "" });
            showToast("Task created successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["tasks", form.startup_id] });
        },
        onError: () => {
            showToast("Failed to create task", "error");
        }
    });

    async function createTask() {
        const result = createTaskSchema.safeParse(form);
        if (!result.success) {
            showToast(result.error.errors[0].message, "warning");
            return;
        }
        createTaskMutation.mutate(form);
    }

    const finishTaskMutation = useMutation({
        mutationFn: async (taskId) => {
            await api.patch(`/task/${taskId}/finish_task`);
            return taskId;
        },
        onSuccess: (taskId) => {
            showToast("Task marked completed!", "success");
            queryClient.invalidateQueries({ queryKey: ["tasks", form.startup_id] });
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(prev => ({ ...prev, status: "Completed" }));
            }
        },
        onError: () => {
            showToast("Failed to complete task", "error");
        }
    });

    async function finishTask(taskId) {
        finishTaskMutation.mutate(taskId);
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

    const addCommentMutation = useMutation({
        mutationFn: async (content) => {
            await api.post(`/collaboration/tasks/${selectedTask.id}/comments`, { content });
        },
        onSuccess: () => {
            setNewComment("");
        },
        onError: () => {
            showToast("Failed to send comment", "error");
        }
    });

    async function handleAddComment(e) {
        e.preventDefault();
        const result = commentSchema.safeParse({ content: newComment });
        if (!result.success || !selectedTask) return;
        addCommentMutation.mutate(newComment);
    }

    const filteredGoals = goals.filter(g => g.startup_id === Number(form.startup_id));

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Venture Tasks
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Execute key milestones and collaborate with teammates.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left creation panel */}
                    <div className="flex flex-col gap-6">
                        <section className="minimal-card p-6 md:p-8 h-fit">
                            <h2 className="text-lg font-bold text-foreground font-heading mb-6">Create Task</h2>
                            <div className="flex flex-col gap-4">
                                <select 
                                    className="minimal-input cursor-pointer"
                                    value={form.startup_id} 
                                    onChange={(e) => {
                                        setForm({ ...form, startup_id: e.target.value, goal_id: "" });
                                        setPage(1);
                                        loadTasks(e.target.value, search, statusFilter, 1);
                                    }}
                                >
                                    <option value="" className="bg-background text-muted-foreground">Select Startup</option>
                                    {startups.map(s => (
                                        <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>
                                    ))}
                                </select>
                                
                                <input 
                                    className="minimal-input"
                                    placeholder="Task Title" 
                                    value={form.title} 
                                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                                />
                                
                                <select 
                                    className="minimal-input cursor-pointer"
                                    value={form.goal_id} 
                                    onChange={(e) => setForm({ ...form, goal_id: e.target.value })}
                                >
                                    <option value="" className="bg-background text-muted-foreground">Select Goal</option>
                                    {filteredGoals.map(g => (
                                        <option key={g.id} value={g.id} className="bg-background text-foreground">{g.title}</option>
                                    ))}
                                </select>
                                
                                <button 
                                    className="btn-primary w-full font-bold"
                                    onClick={createTask}
                                >
                                    Create Task
                                </button>
                            </div>
                        </section>
                    </div>
                    
                    {/* Middle list panel */}
                    <section className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-foreground font-heading">Tasks List</h2>
                            
                            {form.startup_id && (
                                <div className="flex items-center gap-2.5">
                                    <input 
                                        className="minimal-input py-1.5 px-3 text-xs w-40"
                                        placeholder="Search tasks..." 
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    />
                                    <select 
                                        className="minimal-input py-1.5 px-2.5 text-xs cursor-pointer"
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    >
                                        <option value="" className="bg-background text-foreground">All</option>
                                        <option value="Pending" className="bg-background text-foreground">Pending</option>
                                        <option value="Completed" className="bg-background text-foreground">Completed</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {!form.startup_id ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-muted rounded-2xl border  border-border text-muted-foreground text-sm">
                                <p className="mb-2 font-medium">Select a startup</p>
                                <p className="text-xs">to view and create tasks</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-muted rounded-2xl border  border-border text-muted-foreground text-sm">
                                <p className="mb-2 font-medium">No matching tasks found</p>
                                <p className="text-xs">Refine your filters or create a new task</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {tasks.map(task => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => handleSelectTask(task)}
                                            className={`minimal-card p-6 md:p-8 flex flex-col justify-between cursor-pointer border transition-all duration-200 ${
                                                selectedTask && selectedTask.id === task.id
                                                    ? "border-white bg-muted"
                                                    : "border-border hover:border-border bg-muted"
                                            }`}
                                        >
                                            <div className="mb-4">
                                                <h3 className="text-lg md:text-xl font-bold text-foreground font-heading mb-2">{task.title}</h3>
                                                <Badge status={task.status === "Completed" ? "completed" : "pending"} label={task.status === "Completed" ? "Complete" : "Pending"} />
                                            </div>
                                            
                                            {task.status !== "Completed" && (
                                                <button 
                                                    className="btn-primary w-full mt-4 text-xs font-bold py-2"
                                                    onClick={(e) => { e.stopPropagation(); finishTask(task.id); }}
                                                >
                                                    Complete Task
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
                            </div>
                        )}
                    </section>
                </div>

                {/* Collaboration Task Comments Slide-over drawer */}
                {selectedTask && (
                    <div className="fixed inset-0 z-50 bg-background/80 flex justify-end">
                        <div className="w-full max-w-md h-full bg-background border-l border-zinc-900 flex flex-col p-6 shadow-2xl">
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground font-heading truncate max-w-[280px]">
                                        {selectedTask.title}
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground font-semibold">Discussion thread</span>
                                </div>
                                <button 
                                    className="text-muted-foreground hover:text-muted-foreground text-lg cursor-pointer font-bold"
                                    onClick={() => setSelectedTask(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Comments Log */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                                {comments.length === 0 ? (
                                    <p className="text-muted-foreground text-xs text-center py-12">No comments written yet. Start the conversation below!</p>
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

export default Tasks;