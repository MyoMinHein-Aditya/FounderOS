import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

const leadSchema = z.object({
    name: z.string().min(1, "Lead name is required"),
    amount: z.number().min(0, "Amount must be a non-negative number"),
    stage: z.string()
});

function CRM() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [name, setName] = useState("");
    const [amount, setAmount] = useState(0);
    const [stage, setStage] = useState("Lead");

    const stages = ["Lead", "Contacted", "Term Sheet", "Closed"];

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

    const { data: leads = [] } = useQuery({
        queryKey: ["leads", selectedStartupId],
        queryFn: async () => {
            const res = await api.get(`/crm/get_leads/${selectedStartupId}`);
            return res.data;
        },
        enabled: !!selectedStartupId
    });

    const addLeadMutation = useMutation({
        mutationFn: async (data) => {
            await api.post("/crm/create", { ...data, startup_id: Number(selectedStartupId) });
        },
        onSuccess: () => {
            showToast("Lead added successfully!", "success");
            setName("");
            setAmount(0);
            setStage("Lead");
            queryClient.invalidateQueries({ queryKey: ["leads", selectedStartupId] });
        },
        onError: () => {
            showToast("Failed to add lead", "error");
        }
    });

    const moveLeadMutation = useMutation({
        mutationFn: async ({ leadId, newStage }) => {
            await api.patch(`/crm/${leadId}/stage`, { stage: newStage });
        },
        onSuccess: () => {
            showToast("Lead pipeline stage updated", "success");
            queryClient.invalidateQueries({ queryKey: ["leads", selectedStartupId] });
        },
        onError: () => {
            showToast("Failed to update lead", "error");
        }
    });

    const deleteLeadMutation = useMutation({
        mutationFn: async (leadId) => {
            await api.delete(`/crm/${leadId}/delete`);
        },
        onSuccess: () => {
            showToast("Lead deleted", "success");
            queryClient.invalidateQueries({ queryKey: ["leads", selectedStartupId] });
        },
        onError: () => {
            showToast("Failed to delete lead", "error");
        }
    });

    function handleAddLead() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");

        const parsed = leadSchema.safeParse({ name, amount: Number(amount), stage });
        if (!parsed.success) {
            return showToast(parsed.error.errors[0].message, "warning");
        }

        addLeadMutation.mutate(parsed.data);
    }

    function handleMoveLead(leadId, newStage) {
        moveLeadMutation.mutate({ leadId, newStage });
    }

    function handleDeleteLead(leadId) {
        if (!window.confirm("Delete this lead?")) return;
        deleteLeadMutation.mutate(leadId);
    }

    const totalPipeline = leads.reduce((acc, lead) => acc + lead.amount, 0);

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Investor CRM
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base font-medium">
                            Track fundraise rounds, pipeline stages, and capital commitments.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-3.5 py-2.5 rounded-xl border border-border">
                            Pipeline Target: ${totalPipeline.toLocaleString()}
                        </span>
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left form panel */}
                    <section className="minimal-card p-6 md:p-8 h-fit flex flex-col gap-5">
                        <h2 className="text-lg font-bold text-foreground font-heading">Add Lead</h2>
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
                                    <option key={s} value={s} className="bg-background text-foreground">{s}</option>
                                ))}
                            </select>
                            <button 
                                className="btn-primary w-full font-bold mt-2"
                                onClick={handleAddLead}
                                disabled={addLeadMutation.isPending}
                            >
                                {addLeadMutation.isPending ? "Adding..." : "Add Lead"}
                            </button>
                        </div>
                    </section>

                    {/* Columns board */}
                    <section className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {stages.map(colStage => {
                            const stageLeads = leads.filter(l => l.stage === colStage);
                            return (
                                <div key={colStage} className="minimal-card p-4 flex flex-col gap-4 bg-background border border-zinc-900 rounded-2xl">
                                    <h3 className="font-bold text-sm text-muted-foreground pb-2 border-b border-zinc-900">{colStage}</h3>
                                    <div className="flex flex-col gap-3 min-h-[250px]">
                                        {stageLeads.map(lead => (
                                            <div key={lead.id} className="p-3 bg-muted rounded-xl border border-border flex flex-col gap-2">
                                                <div>
                                                    <p className="font-bold text-xs text-foreground">{lead.name}</p>
                                                    <span className="text-[10px] text-muted-foreground font-semibold">${lead.amount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex gap-1.5 mt-1 pt-1.5 border-t border-zinc-900/40">
                                                    <select 
                                                        className="bg-background border border-border text-muted-foreground text-[9px] rounded p-1 cursor-pointer font-bold w-full"
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
