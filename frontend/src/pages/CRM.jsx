import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

function CRM() {
    const { showToast } = useToast();
    const [startups, setStartups] = useState([]);
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [leads, setLeads] = useState([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState(0);
    const [stage, setStage] = useState("Lead");
    const [isSaving, setIsSaving] = useState(false);

    const stages = ["Lead", "Contacted", "Term Sheet", "Closed"];

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

    async function loadLeads(startupId) {
        if (!startupId) return;
        try {
            const res = await api.get(`/crm/get_leads/${startupId}`);
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStartups();
    }, []);

    useEffect(() => {
        loadLeads(selectedStartupId);
    }, [selectedStartupId]);

    async function handleAddLead() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        if (!name.trim()) return showToast("Lead name is required", "warning");

        setIsSaving(true);
        try {
            await api.post("/crm/create", {
                startup_id: Number(selectedStartupId),
                name,
                stage,
                amount: Number(amount)
            });
            showToast("Lead added successfully!", "success");
            setName("");
            setAmount(0);
            setStage("Lead");
            loadLeads(selectedStartupId);
        } catch (err) {
            showToast("Failed to add lead", "error");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleMoveLead(leadId, newStage) {
        try {
            await api.patch(`/crm/${leadId}/stage`, { stage: newStage });
            showToast("Lead pipeline stage updated", "success");
            loadLeads(selectedStartupId);
        } catch (err) {
            showToast("Failed to update lead", "error");
        }
    }

    async function handleDeleteLead(leadId) {
        if (!window.confirm("Delete this lead?")) return;
        try {
            await api.delete(`/crm/${leadId}/delete`);
            showToast("Lead deleted", "success");
            loadLeads(selectedStartupId);
        } catch (err) {
            showToast("Failed to delete lead", "error");
        }
    }

    const totalPipeline = leads.reduce((acc, lead) => acc + lead.amount, 0);

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Investor CRM
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
                            Track fundraise rounds, pipeline stages, and capital commitments.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-3.5 py-2.5 rounded-xl border border-zinc-800">
                            Pipeline Target: ${totalPipeline.toLocaleString()}
                        </span>
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left form panel */}
                    <section className="minimal-card p-6 md:p-8 h-fit flex flex-col gap-5">
                        <h2 className="text-lg font-bold text-white font-heading">Add Lead</h2>
                        <div className="flex flex-col gap-4">
                            <input 
                                className="minimal-input"
                                placeholder="Investor/Firm Name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                            />
                            <input 
                                className="minimal-input"
                                type="number" 
                                placeholder="Target Amount ($)" 
                                value={amount} 
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                            <select 
                                className="minimal-input cursor-pointer"
                                value={stage} 
                                onChange={(e) => setStage(e.target.value)}
                            >
                                {stages.map(s => (
                                    <option key={s} value={s} className="bg-zinc-950 text-zinc-100">{s}</option>
                                ))}
                            </select>
                            <button 
                                className="btn-primary w-full font-bold mt-2"
                                onClick={handleAddLead}
                                disabled={isSaving}
                            >
                                {isSaving ? "Adding..." : "Add Lead"}
                            </button>
                        </div>
                    </section>

                    {/* Columns board */}
                    <section className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {stages.map(colStage => {
                            const stageLeads = leads.filter(l => l.stage === colStage);
                            return (
                                <div key={colStage} className="minimal-card p-4 flex flex-col gap-4 bg-zinc-950 border border-zinc-900 rounded-2xl">
                                    <h3 className="font-bold text-sm text-zinc-300 pb-2 border-b border-zinc-900">{colStage}</h3>
                                    <div className="flex flex-col gap-3 min-h-[250px]">
                                        {stageLeads.map(lead => (
                                            <div key={lead.id} className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex flex-col gap-2">
                                                <div>
                                                    <p className="font-bold text-xs text-zinc-200">{lead.name}</p>
                                                    <span className="text-[10px] text-zinc-500 font-semibold">${lead.amount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex gap-1.5 mt-1 pt-1.5 border-t border-zinc-900/40">
                                                    <select 
                                                        className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-[9px] rounded p-1 cursor-pointer font-bold w-full"
                                                        value={lead.stage}
                                                        onChange={(e) => handleMoveLead(lead.id, e.target.value)}
                                                    >
                                                        {stages.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                    <button 
                                                        className="text-[9px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
                                                        onClick={() => handleDeleteLead(lead.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default CRM;
