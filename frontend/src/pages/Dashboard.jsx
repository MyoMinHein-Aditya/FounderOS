import {useState, useEffect} from "react";
import api from "../api/axios";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import Navbar from "../components/Navbar";

// Loading dashboard stats and managing data

function Dashboard(){
    const [data, setData] = useState(null);
    const [userName, setUserName] = useState("");

    async function loadStats(){
        const token = localStorage.getItem("token");
        const res = await api.get("/dashboard/get_stats", {headers:{Authorization:`Bearer ${token}`}});
        setData(res.data);
    }

    async function loadUser(){
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/auth/me", {headers:{Authorization:`Bearer ${token}`}});
            setUserName(res.data.name);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStats();
        loadUser();
    }, []);

    async function finishTask(taskId) {
        const token = localStorage.getItem("token");
        await api.patch(`/task/${taskId}/finish_task`, {}, {headers:{Authorization:`Bearer ${token}`}});
        loadStats();
    }

    const goalProgress = data ? (data.total_goals > 0 ? Math.round((data.completed_goals / data.total_goals) * 100) : 0) : 0;
    const taskProgress = data ? (data.total_tasks > 0 ? Math.round((data.completed_tasks / data.total_tasks) * 100) : 0) : 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                        Hey {userName || "Founder"}! 👋
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base">
                        Here's your venture dashboard. Track progress, manage goals, and execute milestones.
                    </p>
                </header>

                {data && (
                    <>
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                            <Card title="Total Startups" value={data.total_startups} icon="🚀" description="Active companies" />
                            <Card title="Goals Completed" value={`${data.completed_goals}/${data.total_goals}`} icon="🎯" description="Strategic milestones" />
                            <Card title="Tasks Completed" value={`${data.completed_tasks}/${data.total_tasks}`} icon="📋" description="Actionable tasks" />
                            <Card title="Overall Progress" value={`${Math.round((goalProgress + taskProgress) / 2)}%`} icon="📈" description="Venture velocity" />
                        </section>

                        <section className="glass-card p-6 md:p-8 mb-10">
                            <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-8">Completion Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-300 mb-2">Goals Progress</p>
                                    <ProgressBar percentage={goalProgress} showPercent={true} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-300 mb-2">Tasks Progress</p>
                                    <ProgressBar percentage={taskProgress} showPercent={true} />
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            <section className="glass-card p-6 md:p-8">
                                <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                                    📋 Recent Activity
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {data.recent_stuff && data.recent_stuff.length > 0 ? (
                                        data.recent_stuff.slice(0, 5).map((activity) => (
                                            <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between p-3.5 bg-zinc-800/20 hover:bg-zinc-800/40 rounded-xl border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-lg">{activity.type === "goal" ? "🎯" : "📋"}</span>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-zinc-200 truncate">{activity.title}</span>
                                                        <span className="text-xs text-zinc-500">
                                                            {activity.type === "goal" ? "Goal" : "Task"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ml-2 ${
                                                    activity.status === "Completed" 
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                    {activity.status === "Completed" ? "Done" : "Pending"}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                                            No recent activity. Start creating goals! 🚀
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="glass-card p-6 md:p-8">
                                <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                                    ✅ Pending Tasks
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {data.todos && data.todos.length > 0 ? (
                                        data.todos.slice(0, 5).map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-3.5 bg-zinc-800/20 hover:bg-zinc-800/40 rounded-xl border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-lg">📌</span>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-zinc-200 truncate">{task.title}</span>
                                                        <span className="text-xs text-zinc-500">Milestone pending</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-lg transition-all duration-200 whitespace-nowrap ml-2"
                                                    onClick={() => finishTask(task.id)}
                                                >
                                                    Complete
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                                            All tasks done! Great job! 🎉
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Dashboard;