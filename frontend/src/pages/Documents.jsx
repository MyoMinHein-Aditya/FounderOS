import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

const documentSchema = z.object({
    content: z.string(),
    type: z.string()
});

function Documents() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [activeTab, setActiveTab] = useState("Canvas"); // Canvas, PRD, Pitch, Vision
    const [content, setContent] = useState("");

    const tabs = [
        { id: "Canvas", label: "Business Model Canvas" },
        { id: "PRD", label: "Product Requirement Document" },
        { id: "Pitch", label: "Pitch Deck Outline" },
        { id: "Vision", label: "Venture Vision" }
    ];

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

    const { data: documentContent = "" } = useQuery({
        queryKey: ["document", selectedStartupId, activeTab],
        queryFn: async () => {
            const res = await api.get(`/documents/get_document/${selectedStartupId}/${activeTab}`);
            return res.data.content || "";
        },
        enabled: !!selectedStartupId && !!activeTab
    });

    useEffect(() => {
        setContent(documentContent);
    }, [documentContent]);

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            await api.post("/documents/save", { startup_id: Number(selectedStartupId), ...data });
        },
        onSuccess: () => {
            showToast("Document saved successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["document", selectedStartupId, activeTab] });
        },
        onError: () => {
            showToast("Failed to save document", "error");
        }
    });

    function handleSave() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");

        const parsed = documentSchema.safeParse({ content, type: activeTab });
        if (!parsed.success) {
            return showToast("Invalid document data", "warning");
        }

        saveMutation.mutate(parsed.data);
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Venture Documents
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base font-medium">
                            Draft and maintain product blueprints, strategy guides, and pitches.
                        </p>
                    </div>
                    <div>
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

                {/* Tabs selection */}
                <div className="flex flex-wrap gap-2 mb-6 pb-2 border-b border-zinc-900">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-white text-zinc-950"
                                    : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="minimal-card p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-lg font-bold text-foreground font-heading">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <button 
                            className="btn-primary py-2.5 px-6 text-xs"
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                    
                    <textarea 
                        className="minimal-input min-h-[450px] resize-y font-mono text-sm leading-relaxed"
                        placeholder={`Draft document contents here...`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
            </main>
        </div>
    );
}

export default Documents;
