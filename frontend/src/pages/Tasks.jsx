import { useEffect, useState } from "react";
import api from "../api/axios";
import Badge from "../components/Badge";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";
import { useToast } from "../context/ToastContext";

function Tasks() {
    const { showToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [startups, setStartups] = useState([]);
    const [goals, setGoals] = useState([]);
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

    async function loadStartups() {
        const res = await api.get("/startup/get_startups");
        setStartups(res.data);
    }

    async function loadGoals() {
        const res = await api.get("/goal/get_my_goals");
        setGoals(res.data);
    }

    async function loadTasks(startupId, querySearch = search, queryStatus = statusFilter, queryPage = page) {
        if (!startupId) return setTasks([]);
        try {
            const res = await api.get(`/task/get_tasks/${startupId}`, {
                params: {
                    search: querySearch || undefined,
                    status: queryStatus || undefined,
                    page: queryPage,
                    limit: 6
                }
            });
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStartups();
        loadGoals();

        // Setup real-time WebSocket connection for activity ticker
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = window.location.hostname === "localhost" ? "localhost:8000" : window.location.host;
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

    useEffect(() => {
        if (form.startup_id) {
            loadTasks(form.startup_id);
        }
    }, [search, statusFilter, page]);

    async function createTask() {
        if (!form.startup_id) return showToast("Select a startup before creating a task.", "warning");
        if (!form.goal_id) return showToast("Select a goal before creating a task.", "warning");
        if (!form.title.trim()) return showToast("Task title is required", "warning");

        try {
            await api.post("/task/create", {
                title: form.title,
                startup_id: Number(form.startup_id),
                goal_id: Number(form.goal_id)
            });
            setForm({ ...form, title: "", goal_id: "" });
            showToast("Task created successfully", "success");
            loadTasks(form.startup_id);
        } catch (err) {
            showToast("Failed to create task", "error");
        }
    }

    async function finishTask(taskId) {
        try {
            await api.patch(`/task/${taskId}/finish_task`);
            showToast("Task marked completed!", "success");
            loadTasks(form.startup_id);
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(prev => ({ ...prev, status: "Completed" }));
            }
        } catch (err) {
            showToast("Failed to complete task", "error");
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
            await api.post(`/collaboration/tasks/${selectedTask.id}/comments`, { content: newComment });
            setNewComment("");
        } catch (err) {
            showToast("Failed to send comment", "error");
        }
    }

    const filteredGoals = goals.filter(g => g.startup_id === Number(form.startup_id));

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Venture Tasks
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base font-medium">
                        Execute key milestones and collaborate with teammates.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left creation panel */}
                    <div className="flex flex-col gap-6">
                        <section className="minimal-card p-6 md:p-8 h-fit">
                            <h2 className="text-lg font-bold text-white font-heading mb-6">Create Task</h2>
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
                                    <option value="" className="bg-zinc-950 text-zinc-400">Select Startup</option>
                                    {startups.map(s => (
                                        <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-100">{s.name}</option>
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
                                    <option value="" className="bg-zinc-950 text-zinc-400">Select Goal</option>
                                    {filteredGoals.map(g => (
                                        <option key={g.id} value={g.id} className="bg-zinc-950 text-zinc-100">{g.title}</option>
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
                            <h2 className="text-lg font-bold text-white font-heading">Tasks List</h2>
                            
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
                                        <option value="" className="bg-zinc-950 text-zinc-100">All</option>
                                        <option value="Pending" className="bg-zinc-950 text-zinc-100">Pending</option>
                                        <option value="Completed" className="bg-zinc-950 text-zinc-100">Completed</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {!form.startup_id ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                                <p className="mb-2 font-medium">Select a startup</p>
                                <p className="text-xs">to view and create tasks</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
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
                                                    ? "border-white bg-zinc-900"
                                                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/60"
                                            }`}
                                        >
                                            <div className="mb-4">
                                                <h3 className="text-lg md:text-xl font-bold text-white font-heading mb-2">{task.title}</h3>
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
                    <div className="fixed inset-0 z-50 bg-black/80 flex justify-end">
                        <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 flex flex-col p-6 shadow-2xl">
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white font-heading truncate max-w-[280px]">
                                        {selectedTask.title}
                                    </h3>
                                    <span className="text-[10px] text-zinc-500 font-semibold">Discussion thread</span>
                                </div>
                                <button 
                                    className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer font-bold"
                                    onClick={() => setSelectedTask(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Comments Log */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                                {comments.length === 0 ? (
                                    <p className="text-zinc-500 text-xs text-center py-12">No comments written yet. Start the conversation below!</p>
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

export default Tasks;