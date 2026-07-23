import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

function Documents() {
    const { showToast } = useToast();
    const [startups, setStartups] = useState([]);
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [activeTab, setActiveTab] = useState("Canvas"); // Canvas, PRD, Pitch, Vision
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const tabs = [
        { id: "Canvas", label: "Business Model Canvas" },
        { id: "PRD", label: "Product Requirement Document" },
        { id: "Pitch", label: "Pitch Deck Outline" },
        { id: "Vision", label: "Venture Vision" }
    ];

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

    async function loadDocument(startupId, type) {
        if (!startupId || !type) return;
        try {
            const res = await api.get(`/documents/get_document/${startupId}/${type}`);
            setContent(res.data.content || "");
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStartups();
    }, []);

    useEffect(() => {
        loadDocument(selectedStartupId, activeTab);
    }, [selectedStartupId, activeTab]);

    async function handleSave() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        setIsSaving(true);
        try {
            await api.post("/documents/save", { startup_id: Number(selectedStartupId), type: activeTab, content });
            showToast("Document saved successfully", "success");
        } catch (err) {
            showToast("Failed to save document", "error");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Venture Documents
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
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
                                <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-100">{s.name}</option>
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
                                    : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="minimal-card p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-lg font-bold text-white font-heading">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <button 
                            className="btn-primary py-2.5 px-6 text-xs"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
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
