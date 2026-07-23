import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

function Financials() {
    const { showToast } = useToast();
    const [startups, setStartups] = useState([]);
    const [selectedStartupId, setSelectedStartupId] = useState("");
    
    // Financial inputs
    const [cash, setCash] = useState(100000);
    const [mrr, setMrr] = useState(5000);
    const [burn, setBurn] = useState(12000);
    const [cac, setCac] = useState(150);
    const [ltv, setLtv] = useState(900);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiFeedback, setAiFeedback] = useState("");

    // Helper to format raw **text** into bold tags
    function formatMessageContent(content) {
        if (!content) return "";
        const parts = content.split(/\*\*([^*]+)\*\*/g);
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return <strong key={index} className="font-bold text-white html.light:text-zinc-950">{part}</strong>;
            }
            return part;
        });
    }

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

    useEffect(() => {
        loadStartups();
    }, []);

    const runway = burn > 0 ? (cash / burn).toFixed(1) : "Unlimited";
    const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(1) : "0";

    async function handleRunAIAnalysis() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        setIsAnalyzing(true);
        try {
            const metricsText = `Cash: $${cash}, MRR: $${mrr}, Burn Rate: $${burn}, CAC: $${cac}, LTV: $${ltv}`;
            const res = await api.post(`/ai-features/analyst/${selectedStartupId}`, null, {
                params: { metrics_data: metricsText }
            });
            setAiFeedback(res.data.analysis);
            showToast("AI financial analysis completed!", "success");
        } catch (err) {
            showToast("Failed to compile AI analysis", "error");
        } finally {
            setIsAnalyzing(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Financial Dashboard
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
                            Manage runways, compute customer retention unit economics, and consult AI.
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Metrics inputs */}
                    <section className="minimal-card p-6 md:p-8 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-white font-heading">Venture Ledger</h2>
                        <div className="flex flex-col gap-3">
                            <label className="text-xs text-zinc-400 font-semibold">Cash Balance ($)</label>
                            <input 
                                className="minimal-input"
                                type="number" 
                                value={cash} 
                                onChange={(e) => setCash(Number(e.target.value))}
                            />
                            
                            <label className="text-xs text-zinc-400 font-semibold">Monthly MRR ($)</label>
                            <input 
                                className="minimal-input"
                                type="number" 
                                value={mrr} 
                                onChange={(e) => setMrr(Number(e.target.value))}
                            />
                            
                            <label className="text-xs text-zinc-400 font-semibold">Monthly Burn ($)</label>
                            <input 
                                className="minimal-input"
                                type="number" 
                                value={burn} 
                                onChange={(e) => setBurn(Number(e.target.value))}
                            />
                            
                            <label className="text-xs text-zinc-400 font-semibold">CAC ($)</label>
                            <input 
                                className="minimal-input"
                                type="number" 
                                value={cac} 
                                onChange={(e) => setCac(Number(e.target.value))}
                            />
                            
                            <label className="text-xs text-zinc-400 font-semibold">LTV ($)</label>
                            <input 
                                className="minimal-input"
                                type="number" 
                                value={ltv} 
                                onChange={(e) => setLtv(Number(e.target.value))}
                            />
                        </div>
                    </section>

                    {/* Output indicators */}
                    <section className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="minimal-card p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Runway Projection</span>
                                <h3 className="text-5xl font-extrabold text-white mt-4 font-heading">{runway}</h3>
                                <p className="text-xs text-zinc-400 font-medium mt-2">months of cash remaining</p>
                            </div>
                            <div className="text-xs text-zinc-500 font-medium leading-relaxed pt-4 border-t border-zinc-900 mt-4">
                                Keep runway above 12-18 months for fundraising cycles.
                            </div>
                        </div>

                        <div className="minimal-card p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">LTV to CAC Ratio</span>
                                <h3 className="text-5xl font-extrabold text-white mt-4 font-heading">{ltvCacRatio}x</h3>
                                <p className="text-xs text-zinc-400 font-medium mt-2">customer acquisition return</p>
                            </div>
                            <div className="text-xs text-zinc-500 font-medium leading-relaxed pt-4 border-t border-zinc-900 mt-4">
                                Healthy startups target an LTV:CAC ratio exceeding 3.0x.
                            </div>
                        </div>
                    </section>
                </div>

                {/* AI Analyst Feedback */}
                <div className="minimal-card p-6 md:p-8">
                    <div className="flex justify-between items-center gap-4 mb-6">
                        <h2 className="text-lg font-bold text-white font-heading">AI Financial Analysis</h2>
                        <button 
                            className="btn-primary py-2 px-5 text-xs"
                            onClick={handleRunAIAnalysis}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? "Analyzing..." : "Generate report"}
                        </button>
                    </div>
                    <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 text-sm leading-relaxed text-zinc-300 font-mono">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
                                <div className="w-8 h-8 border-4 border-t-white border-zinc-800 rounded-full animate-spin mb-2"></div>
                                <p className="animate-pulse text-xs">Computing MRR & cash projections...</p>
                            </div>
                        ) : aiFeedback ? (
                            <p className="whitespace-pre-wrap">{formatMessageContent(aiFeedback)}</p>
                        ) : (
                            <p className="text-zinc-500 text-xs text-center py-6">Request a dynamic AI Runway and CAC audit report.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Financials;
