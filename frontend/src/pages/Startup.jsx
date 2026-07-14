import {useState, useEffect} from "react";
import api from "../api/axios";
import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";
import Navbar from "../components/Navbar";

// Managing startup portfolio with creation and tracking

function Startup(){
    const [startups, setStartups] = useState([]);
    const [form, setForm] = useState({name:"", description:"", stage:"", industry:""});
    const [stats, setStats] = useState({});
    const [modal, setModal] = useState({ isOpen: false, title: "", content: "", loading: false });
    
    async function loadStartups(){
        const res = await api.get(
            "/startup/get_startups",
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        setStartups(res.data);
        
        const token = localStorage.getItem("token");
        const dashRes = await api.get("/dashboard/get_stats", {headers:{Authorization:`Bearer ${token}`}});
        setStats(dashRes.data);
    }

    useEffect(() => {
        loadStartups();
    }, []);

    async function createStartup(){
        if(!form.name) {
            alert("Startup Name is required.");
            return;
        }
        await api.post(
            "/startup/create",
            form,
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }
        );
        alert("Startup Created 🚀");
        setForm({name:"", description:"", stage:"", industry:""});
        loadStartups();
    }

    async function handleAnalyze(startupId, type) {
        setModal({ isOpen: true, title: type === "metrics" ? "AI Venture Metrics Analysis" : "AI Strategic Recommendations", content: "", loading: true });
        try {
            const token = localStorage.getItem("token");
            const endpoint = type === "metrics" ? `/startup/${startupId}/analyze` : `/startup/${startupId}/strategy`;
            const res = await api.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const content = type === "metrics" ? res.data.analysis : res.data.strategy;
            setModal(prev => ({ ...prev, content, loading: false }));
        } catch (err) {
            console.error(err);
            setModal(prev => ({ ...prev, content: "⚠️ Failed to fetch AI recommendations. Please check your connection and API key configuration.", loading: false }));
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                        My Startups 🚀
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base">
                        Build and manage your portfolio of ventures.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="glass-card p-6 md:p-8 h-fit sticky top-20">
                        <h2 className="text-lg font-bold text-zinc-100 mb-6">Create Startup</h2>
                        <div className="flex flex-col gap-4">
                            <input 
                                className="glass-input"
                                placeholder="Startup Name" 
                                value={form.name} 
                                onChange={(e)=>setForm({...form, name:e.target.value})}
                            />
                            <input 
                                className="glass-input"
                                placeholder="Description" 
                                value={form.description} 
                                onChange={(e)=>setForm({...form, description:e.target.value})}
                            />
                            <input 
                                className="glass-input"
                                placeholder="Stage (Idea, Seed, Series A)" 
                                value={form.stage} 
                                onChange={(e)=>setForm({...form, stage:e.target.value})}
                            />
                            <input 
                                className="glass-input"
                                placeholder="Industry" 
                                value={form.industry} 
                                onChange={(e)=>setForm({...form, industry:e.target.value})}
                            />
                            <button 
                                className="btn-primary w-full mt-2" 
                                onClick={createStartup}
                            >
                                Create Startup
                            </button>
                        </div>
                    </section>

                    <section className="lg:col-span-2">
                        <h2 className="text-lg font-bold text-zinc-100 mb-6">Your Portfolio</h2>
                        {startups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800 text-zinc-500">
                                <p className="mb-2">No startups yet</p>
                                <p className="text-xs">Create your first venture on the left</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {startups.map((startup) => {
                                    const goalsProgress = startup.goal_pct || 0;
                                    const tasksProgress = startup.task_pct || 0;
                                    
                                    return (
                                        <div key={startup.id} className="glass-card p-6 md:p-8 hover:shadow-2xl">
                                            <div className="mb-4">
                                                <h3 className="text-lg md:text-xl font-bold text-zinc-100 mb-2">{startup.name}</h3>
                                                <p className="text-sm text-zinc-400 mb-3">{startup.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {startup.stage && (
                                                        <Badge status="active" label={startup.stage} />
                                                    )}
                                                    {startup.industry && (
                                                        <Badge status="default" label={startup.industry} />
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-zinc-800/60 pt-4 mt-4">
                                                <div className="mb-4">
                                                    <p className="text-xs font-semibold text-zinc-300 mb-2">Goals Progress</p>
                                                    <ProgressBar percentage={goalsProgress} showPercent={true} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-zinc-300 mb-2">Tasks Progress</p>
                                                    <ProgressBar percentage={tasksProgress} showPercent={true} />
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-zinc-800/60 pt-4 mt-4 flex gap-2">
                                                <button 
                                                    className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 bg-zinc-900/60 hover:bg-violet-900/10 border border-zinc-800 hover:border-violet-800/50 rounded-lg transition-all flex-1 cursor-pointer"
                                                    onClick={() => handleAnalyze(startup.id, "metrics")}
                                                >
                                                    📊 Metrics Analysis
                                                </button>
                                                <button 
                                                    className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 bg-zinc-900/60 hover:bg-violet-900/10 border border-zinc-800 hover:border-violet-800/50 rounded-lg transition-all flex-1 cursor-pointer"
                                                    onClick={() => handleAnalyze(startup.id, "strategy")}
                                                >
                                                    💡 Strategy Move
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {modal.isOpen && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card max-w-2xl w-full max-h-[85vh] flex flex-col p-6 md:p-8 border border-zinc-800/80 bg-zinc-950/95 shadow-2xl rounded-2xl">
                        <header className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                {modal.title}
                            </h3>
                            <button 
                                className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer"
                                onClick={() => setModal({ ...modal, isOpen: false })}
                            >
                                ✕
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto pr-2 text-sm md:text-base leading-relaxed text-zinc-300 space-y-4">
                            {modal.loading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                                    <div className="w-10 h-10 border-4 border-t-violet-500 border-zinc-800 rounded-full animate-spin mb-4"></div>
                                    <p className="animate-pulse text-sm">AI co-founder is analyzing details...</p>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{modal.content}</div>
                            )}
                        </div>
                        
                        <footer className="mt-6 pt-4 border-t border-zinc-900 flex justify-end">
                            <button 
                                className="px-5 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-zinc-950 hover:text-white font-bold rounded-xl transition-all duration-200 text-sm cursor-pointer"
                                onClick={() => setModal({ ...modal, isOpen: false })}
                            >
                                Close Report
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Startup;