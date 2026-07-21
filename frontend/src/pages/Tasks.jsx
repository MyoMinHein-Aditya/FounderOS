import {useEffect, useState} from "react";
import api from "../api/axios"
import Badge from "../components/Badge"
import Navbar from "../components/Navbar"

// Creating and managing startup milestone tasks

function Tasks(){
    const [tasks,setTasks] = useState([]);
    const [startups,setStartups] = useState([]);
    const [goals,setGoals] = useState([]);
    const [form, setForm] = useState({title:"",goal_id:"",startup_id:""});

    async function loadStartups(){
        const res = await api.get("/startup/get_startups",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        setStartups(res.data);
    }

    async function loadGoals(){
        const res = await api.get("/goal/get_my_goals",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        setGoals(res.data);
    }

    async function loadTasks(startupId){
        if(!startupId) return setTasks([]);
        const res = await api.get(`/task/get_tasks/${startupId}`,{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        setTasks(res.data);
    }

    useEffect(()=>{
        loadStartups();
        loadGoals();
    },[])

    async function createTask(){
        if(!form.startup_id){
            alert("Please select a startup before creating a task.");
            return;
        }
        if(!form.goal_id){
            alert("Please select a goal before creating a task.");
            return;
        }
        await api.post("/task/create",{title: form.title, startup_id: Number(form.startup_id), goal_id: Number(form.goal_id)},{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        setForm({...form, title:"",goal_id:""});
        loadTasks(form.startup_id);
    }

    async function finishTask(taskId){
        await api.patch(`/task/${taskId}/finish_task`, {}, {headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
        loadTasks(form.startup_id);
    }

    const filteredGoals = goals.filter(g => g.startup_id === Number(form.startup_id));

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar/>
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Venture Tasks 📋
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base font-medium">
                        Execute key milestones and track progress.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="minimal-card p-6 md:p-8 h-fit sticky top-20">
                        <h2 className="text-lg font-bold text-white font-heading mb-6">Create Task</h2>
                        <div className="flex flex-col gap-4">
                            <select 
                                className="minimal-input cursor-pointer"
                                value={form.startup_id} 
                                onChange={(e)=>{setForm({...form,startup_id:e.target.value, goal_id:""}); loadTasks(e.target.value);}}
                            >
                                <option value="" className="bg-zinc-950 text-zinc-400">Select Startup</option>
                                {startups.map(s=> (
                                    <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-100">{s.name}</option>
                                ))}
                            </select>
                            
                            <input 
                                className="minimal-input"
                                placeholder="Task Title" 
                                value={form.title} 
                                onChange={(e)=>setForm({...form,title:e.target.value})} 
                            />
                            
                            <select 
                                className="minimal-input cursor-pointer"
                                value={form.goal_id} 
                                onChange={(e)=>setForm({...form,goal_id:e.target.value})}
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
                    
                    <section className="lg:col-span-2">
                        <h2 className="text-lg font-bold text-white font-heading mb-6">Tasks List</h2>
                        {!form.startup_id ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                                <p className="mb-2 font-medium">Select a startup</p>
                                <p className="text-xs">to view and create tasks</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                                <p className="mb-2 font-medium">No tasks yet</p>
                                <p className="text-xs">Create your first task above</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tasks.map(task=>(
                                    <div key={task.id} className="minimal-card p-6 md:p-8 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="text-lg md:text-xl font-bold text-white font-heading mb-2">{task.title}</h3>
                                            <Badge status={task.status === "Completed" ? "completed" : "pending"} label={task.status === "Completed" ? "Complete" : "Pending"} icon={task.status === "Completed" ? "✅" : "⏳"} />
                                        </div>
                                        
                                        {task.status !== "Completed" && (
                                            <button 
                                                className="btn-primary w-full mt-auto text-sm font-bold"
                                                onClick={()=>finishTask(task.id)}
                                            >
                                                Complete Task
                                            </button>
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

export default Tasks;