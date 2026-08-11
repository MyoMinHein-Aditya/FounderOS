import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

function Investor() {
    const [founders, setFounders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [investmentAmounts, setInvestmentAmounts] = useState({});
    const { addToast } = useToast();

    async function loadFounders() {
        try {
            setLoading(true);
            const res = await api.get("/investor/founders");
            setFounders(res.data.data);
            
            // Initialize investment amounts to 0 or 1000
            const initialAmounts = {};
            res.data.data.forEach(f => {
                initialAmounts[f.startup_id] = 1000;
            });
            setInvestmentAmounts(initialAmounts);
            
            setError(null);
        } catch (err) {
            console.error("Failed to load founders:", err);
            setError("Unable to fetch startups. Are you an investor?");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFounders();
    }, []);

    const handleAmountChange = (startupId, value) => {
        setInvestmentAmounts(prev => ({
            ...prev,
            [startupId]: parseInt(value) || 0
        }));
    };

    const handleInvest = async (startupId) => {
        const amount = investmentAmounts[startupId];
        if (amount <= 0) {
            addToast("Please enter a valid investment amount.", "error");
            return;
        }

        try {
            await api.post("/investor/invest", { startup_id: startupId, amount });
            addToast("Investment successfully recorded!", "success");
        } catch (err) {
            console.error("Investment failed:", err);
            addToast(err.response?.data?.detail || "Investment failed", "error");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-24 px-6 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Investor Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Discover promising startups, view their metrics, and make investments.
                    </p>
                </header>

                {error && (
                    <div className="minimal-card p-6 flex flex-col items-center justify-center gap-3 mb-8 border-destructive bg-destructive/10 text-center">
                        <span className="text-2xl" aria-hidden="true">⚠️</span>
                        <p className="text-sm font-semibold text-destructive max-w-md">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-t-white border-border rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {founders.length > 0 ? founders.map(founder => (
                            <div key={founder.startup_id} className="minimal-card p-6 flex flex-col gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground font-heading">{founder.startup_name}</h2>
                                    <p className="text-sm text-muted-foreground font-medium">by {founder.founder_name}</p>
                                </div>
                                
                                <p className="text-sm text-foreground/80 line-clamp-3">
                                    {founder.startup_description || "No description provided."}
                                </p>
                                
                                <div className="flex gap-2 text-xs">
                                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md font-semibold">
                                        {founder.startup_industry || "Other"}
                                    </span>
                                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md font-semibold">
                                        {founder.startup_stage || "Early"}
                                    </span>
                                </div>

                                <div className="mt-2 pt-4 border-t border-border grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold">Revenue</p>
                                        <p className="text-lg font-bold">₹{founder.revenue || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold">Stats</p>
                                        <p className="text-sm font-medium">{founder.stats ? JSON.stringify(founder.stats) : "N/A"}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-4">
                                    <label className="text-sm font-bold text-foreground">
                                        Investment Amount (₹)
                                    </label>
                                    
                                    <input 
                                        type="range" 
                                        min="1000" 
                                        max="10000000" 
                                        step="1000"
                                        value={investmentAmounts[founder.startup_id]}
                                        onChange={(e) => handleAmountChange(founder.startup_id, e.target.value)}
                                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                    
                                    <div className="flex gap-2">
                                        <span className="inline-flex items-center px-3 rounded-md bg-muted text-muted-foreground border border-border text-sm">
                                            ₹
                                        </span>
                                        <input 
                                            type="number"
                                            min="0"
                                            className="minimal-input flex-1"
                                            value={investmentAmounts[founder.startup_id]}
                                            onChange={(e) => handleAmountChange(founder.startup_id, e.target.value)}
                                        />
                                    </div>
                                    
                                    <button 
                                        className="btn-primary w-full mt-2"
                                        onClick={() => handleInvest(founder.startup_id)}
                                    >
                                        Invest Now
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full p-8 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
                                No founders with startups found.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Investor;
