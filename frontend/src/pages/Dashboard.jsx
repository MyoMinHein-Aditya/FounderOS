import { useState, useEffect } from "react";
import api from "../api/axios";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import Navbar from "../components/Navbar";

function Dashboard() {
    const [data, setData] = useState(null);
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadStats() {
        try {
            setLoading(true);
            const res = await api.get("/dashboard/get_stats");
            setData(res.data);
            setError(null);
        } catch (err) {
            console.error("Dashboard statistics loading failed:", err);
            setError("Unable to sync database metrics. Ensure your backend is active and database is connected.");
        } finally {
            setLoading(false);
        }
    }

    async function loadUser() {
        try {
            const res = await api.get("/auth/me");
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
        try {
            await api.patch(`/task/${taskId}/finish_task`);
            loadStats();
        } catch (err) {
            console.error("Task completion failed:", err);
        }
    }

    const stats = data || {
        total_startups: 0,
        total_goals: 0,
        completed_goals: 0,
        total_tasks: 0,
        completed_tasks: 0,
        recent_stuff: [],
        todos: [],
        pending_goals_list: [],
        events_list: []
    };

    const goalProgress = stats.total_goals > 0 ? Math.round((stats.completed_goals / stats.total_goals) * 100) : 0;
    const taskProgress = stats.total_tasks > 0 ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0;

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-24 px-6 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Hey <span>{userName || "Founder"}</span>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Here's your venture command center. Track progress, manage goals, and execute milestones.
                    </p>
                </header>

                {error && (
                    <div className="minimal-card p-6 flex flex-col items-center justify-center gap-3 mb-8 border-destructive bg-destructive/10 text-center">
                        <span className="text-2xl" aria-hidden="true">⚠️</span>
                        <p className="text-sm font-semibold text-destructive max-w-md">{error}</p>
                        <button 
                            onClick={loadStats}
                            className="mt-2 btn-secondary text-xs"
                        >
                            Retry connection
                        </button>
                    </div>
                )}

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card title="Total Startups" value={stats.total_startups} subtext="Active companies" />
                    <Card title="Goals Completed" value={`${stats.completed_goals}/${stats.total_goals}`} subtext="Strategic milestones" />
                    <Card title="Tasks Completed" value={`${stats.completed_tasks}/${stats.total_tasks}`} subtext="Actionable tasks" />
                    <Card title="Overall Progress" value={`${Math.round((goalProgress + taskProgress) / 2)}%`} subtext="Venture velocity" />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="minimal-card p-6 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-foreground font-heading">Daily Focus</h2>
                        <div className="flex flex-col gap-4">
                            {stats.pending_goals_list && stats.pending_goals_list.length > 0 ? (
                                stats.pending_goals_list.map(goal => (
                                    <div key={goal.id} className="p-4 bg-muted rounded-lg border border-border text-sm">
                                        <p className="font-semibold text-foreground mb-1">{goal.title}</p>
                                        <span className="text-xs text-muted-foreground">{goal.startup_name}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm py-4 text-center">No active goals. Set one to start your focus!</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="minimal-card p-6 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-foreground font-heading">Upcoming Milestones</h2>
                        <div className="flex flex-col gap-4">
                            {stats.events_list && stats.events_list.length > 0 ? (
                                stats.events_list.map(event => (
                                    <div key={event.id} className="p-4 bg-muted rounded-lg border border-border text-sm flex justify-between items-center gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-foreground truncate mb-1">{event.title}</p>
                                            <span className="text-xs text-muted-foreground">{event.startup_name}</span>
                                        </div>
                                        <span className="text-xs text-secondary-foreground bg-secondary border border-border px-2.5 py-1 rounded font-semibold whitespace-nowrap">
                                            {event.date}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm py-4 text-center">No upcoming dates scheduled.</p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="minimal-card p-6 mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-foreground font-heading mb-6">Completion Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <ProgressBar percentage={goalProgress} showPercent={true} label="Goals Progress" />
                        </div>
                        <div>
                            <ProgressBar percentage={taskProgress} showPercent={true} label="Tasks Progress" />
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="minimal-card p-6">
                        <h2 className="text-lg md:text-xl font-bold text-foreground font-heading mb-6 flex items-center gap-2">
                            Recent Activity
                        </h2>
                        <div className="flex flex-col gap-4">
                            {stats.recent_stuff && stats.recent_stuff.length > 0 ? (
                                stats.recent_stuff.slice(0, 5).map((activity) => (
                                    <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between p-4 bg-muted hover:bg-muted/80 rounded-lg border border-border transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-foreground truncate">{activity.title}</span>
                                                <span className="text-xs text-muted-foreground mt-0.5">
                                                    {activity.type === "goal" ? "Goal" : "Task"}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ml-3 ${
                                            activity.status === "Completed" 
                                                ? "bg-primary text-primary-foreground border-primary" 
                                                : "bg-secondary text-secondary-foreground border-transparent"
                                        }`}>
                                            {activity.status === "Completed" ? "Done" : "Pending"}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-xl border border-border text-muted-foreground text-sm">
                                    No recent activity. Start creating goals!
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="minimal-card p-6">
                        <h2 className="text-lg md:text-xl font-bold text-foreground font-heading mb-6 flex items-center gap-2">
                            Pending Tasks
                        </h2>
                        <div className="flex flex-col gap-4">
                            {stats.todos && stats.todos.length > 0 ? (
                                stats.todos.slice(0, 5).map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 bg-muted hover:bg-muted/80 rounded-lg border border-border transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-foreground truncate">{task.title}</span>
                                                <span className="text-xs text-muted-foreground mt-0.5">Milestone pending</span>
                                            </div>
                                        </div>
                                        <button 
                                            className="btn-secondary text-xs ml-3 h-8 px-3"
                                            onClick={() => finishTask(task.id)}
                                        >
                                            Complete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-xl border border-border text-muted-foreground text-sm">
                                    All tasks completed.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;