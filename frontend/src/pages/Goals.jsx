import {useEffect, useState} from "react";
import api from "../api/axios"
import Badge from "../components/Badge"
import Navbar from "../components/Navbar"

// Creating and tracking strategic startup goals

function Goals(){
    const [goals,setGoals] = useState([]);
    const [startups,setStartups] = useState([]);
    const [form, setForm] = useState({title:"",description:"",startup_id:""});
    const [loadingGoalId, setLoadingGoalId] = useState(null);
    
    async function loadGoals(){
        const res = await api.get("/goal/get_my_goals",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        setGoals(res.data);
    }

    async function loadStartups(){
        const res = await api.get("/startup/get_startups",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        setStartups(res.data);
    }

    useEffect(()=>{loadGoals(); loadStartups();},[])
    
    async function createGoal(){
        if(!form.startup_id){
            alert("Please select a startup before creating a goal.");
            return;
        }
        await api.post("/goal/create",{...form, startup_id: Number(form.startup_id)},{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        setForm({title:"",description:"",startup_id:""});
        loadGoals();
    }

    async function finishGoal(goalId){
        await api.patch(`/goal/${goalId}/finish_goal`, {}, {headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        loadGoals();
    }

    async function generateTasks(goalId) {
        setLoadingGoalId(goalId);
        try {
            const token = localStorage.getItem("token");
            const res = await api.post(`/task/generate_from_goal/${goalId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`✨ AI Co-founder broke down this goal: Created ${res.data.tasks.length} new tasks! Go to the Tasks page to view them.`);
        } catch (err) {
            console.error(err);
            alert("⚠️ Failed to generate tasks. Please ensure your Groq API key is valid.");
        } finally {
            setLoadingGoalId(null);
        }
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar/>
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Strategic Goals 🎯
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base font-medium">
                        Define and validate goals for your startups.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="minimal-card p-6 md:p-8 h-fit sticky top-20">
                        <h2 className="text-lg font-bold text-white font-heading mb-6">Create Goal</h2>
                        <div className="flex flex-col gap-4">
                            <input 
                                className="minimal-input"
                                placeholder="Goal Title" 
                                value={form.title} 
                                onChange={(e)=>setForm({...form,title:e.target.value})} 
                            />
                            <input 
                                className="minimal-input"
                                placeholder="Goal Description" 
                                value={form.description} 
                                onChange={(e)=>setForm({...form,description:e.target.value})} 
                            />
                            <select 
                                className="minimal-input cursor-pointer"
                                value={form.startup_id} 
                                onChange={(e)=>setForm({...form,startup_id:e.target.value})}
                            >
                                <option value="" className="bg-zinc-950 text-zinc-400">Select Startup</option>
                                {startups.map(s=> (
                                    <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-100">{s.name}</option>
                                ))}
                            </select>
                            <button 
                                className="btn-primary w-full mt-2 font-bold"
                                onClick={createGoal}
                            >
                                Create Goal
                            </button>
                        </div>
                    </section>

                    <section className="lg:col-span-2">
                        <h2 className="text-lg font-bold text-white font-heading mb-6">Active Goals</h2>
                        {goals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                                <p className="mb-2 font-medium">No goals yet</p>
                                <p className="text-xs">Create your first strategic goal</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {goals.map(goal=>(
                                    <div key={goal.id} className="minimal-card p-6 md:p-8 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="text-lg md:text-xl font-bold text-white font-heading mb-2">{goal.title}</h3>
                                            <p className="text-sm text-zinc-400 mb-3">{goal.description}</p>
                                            <Badge status={goal.status === "Completed" ? "completed" : "pending"} label={goal.status === "Completed" ? "Completed" : "Pending"} icon={goal.status === "Completed" ? "✅" : "⏳"} />
                                        </div>
                                        
                                        {goal.status !== "Completed" && (
                                            <div className="mt-auto flex flex-col gap-2">
                                                <button 
                                                    className="w-full px-3 py-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 hover:from-zinc-200 hover:to-zinc-400 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                    onClick={() => generateTasks(goal.id)}
                                                    disabled={loadingGoalId === goal.id}
                                                >
                                                    {loadingGoalId === goal.id ? (
                                                        <>
                                                            <div className="w-3 h-3 border-2 border-t-zinc-950 border-zinc-500 rounded-full animate-spin"></div>
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>✨ AI Generate Tasks</>
                                                    )}
                                                </button>
                                                <button 
                                                    className="btn-secondary w-full text-xs font-semibold"
                                                    onClick={()=>finishGoal(goal.id)}
                                                >
                                                    Complete Goal
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    )
}

export default Goals;