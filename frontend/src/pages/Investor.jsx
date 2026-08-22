import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";
import { X } from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const investSchema = z.object({
    amount: z.number().min(1, "Please enter a valid investment amount.")
});

function Investor() {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const [selectedFounder, setSelectedFounder] = useState(null);
    const [investmentAmount, setInvestmentAmount] = useState(1000);

    const { data: founders = [], isLoading: loading, error: queryError } = useQuery({
        queryKey: ["investorFounders"],
        queryFn: async () => {
            const res = await api.get("/investor/founders");
            return res.data.data;
        },
    });

    const error = queryError ? "Unable to fetch startups. Are you an investor?" : null;

    const investMutation = useMutation({
        mutationFn: async ({ startupId, amount }) => {
            await api.post("/investor/invest", { startup_id: startupId, amount });
        },
        onSuccess: () => {
            addToast("Investment successfully recorded!", "success");
            setSelectedFounder(null);
            queryClient.invalidateQueries({ queryKey: ["investorFounders"] });
        },
        onError: (err) => {
            console.error("Investment failed:", err);
            addToast(err.response?.data?.detail || "Investment failed", "error");
        }
    });

    const handleInvest = async (startupId) => {
        const result = investSchema.safeParse({ amount: investmentAmount });
        if (!result.success) {
            addToast(result.error.errors[0].message, "error");
            return;
        }
        investMutation.mutate({ startupId, amount: investmentAmount });
    };

    const openModal = (founder) => {
        setSelectedFounder(founder);
        setInvestmentAmount(1000);
    };

    const closeModal = () => {
        setSelectedFounder(null);
    };

    // Generate mock historical data based on current revenue for charts
    const generateMockData = (currentRevenue) => {
        const baseRev = currentRevenue || 50000;
        return [
            { name: 'Jan', revenue: Math.round(baseRev * 0.4), profit: Math.round(baseRev * 0.1) },
            { name: 'Feb', revenue: Math.round(baseRev * 0.5), profit: Math.round(baseRev * 0.15) },
            { name: 'Mar', revenue: Math.round(baseRev * 0.45), profit: Math.round(baseRev * 0.12) },
            { name: 'Apr', revenue: Math.round(baseRev * 0.6), profit: Math.round(baseRev * 0.2) },
            { name: 'May', revenue: Math.round(baseRev * 0.8), profit: Math.round(baseRev * 0.25) },
            { name: 'Jun', revenue: Math.round(baseRev), profit: Math.round(baseRev * 0.3) },
        ];
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
                        Discover promising startups and dive deep into their financials.
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {founders.length > 0 ? founders.map(founder => (
                            <div 
                                key={founder.startup_id} 
                                onClick={() => openModal(founder)}
                                className="group relative overflow-hidden bg-card border border-border rounded-xl p-6 cursor-pointer hover:border-primary transition-all duration-300 h-32 flex items-center justify-center text-center shadow-sm hover:shadow-md"
                            >
                                {/* Default State (Startup Name) */}
                                <div className="absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300 group-hover:opacity-0">
                                    <h2 className="text-xl font-bold font-heading">{founder.startup_name}</h2>
                                </div>
                                
                                {/* Hover State (Description & Founder) */}
                                <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <p className="text-xs font-semibold text-primary mb-1">Founder: {founder.founder_name}</p>
                                    <p className="text-xs text-foreground/80 line-clamp-3 leading-snug">
                                        {founder.startup_description || "No description available."}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full p-8 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
                                No founders with startups found.
                            </div>
                        )}
                    </div>
                )}

                {/* Detailed Modal Overlay */}
                {selectedFounder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                            
                            <button 
                                onClick={closeModal}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>

                            <div className="p-6 md:p-8">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-extrabold font-heading mb-1">{selectedFounder.startup_name}</h2>
                                    <p className="text-muted-foreground font-medium mb-4">Founded by {selectedFounder.founder_name}</p>
                                    <div className="flex gap-2 text-xs mb-4">
                                        <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md font-semibold">
                                            {selectedFounder.startup_industry || "Other"}
                                        </span>
                                        <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md font-semibold">
                                            {selectedFounder.startup_stage || "Early"}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/90 max-w-2xl">
                                        {selectedFounder.startup_description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="border border-border rounded-xl p-4 bg-background">
                                        <h3 className="text-sm font-bold text-muted-foreground mb-4 text-center">6-Month Revenue Trend (Mocked)</h3>
                                        <div className="h-48 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={generateMockData(selectedFounder.revenue)}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                                                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                                                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                                        itemStyle={{ color: 'var(--foreground)' }}
                                                    />
                                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="border border-border rounded-xl p-4 bg-background">
                                        <h3 className="text-sm font-bold text-muted-foreground mb-4 text-center">Profit Margins (Mocked)</h3>
                                        <div className="h-48 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={generateMockData(selectedFounder.revenue)}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                                                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                                                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                                        cursor={{fill: 'var(--muted)'}}
                                                    />
                                                    <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-8 mt-4">
                                    <h3 className="text-lg font-bold font-heading mb-4">Make an Investment</h3>
                                    <div className="max-w-md flex flex-col gap-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-semibold text-foreground">
                                                Amount (₹)
                                            </label>
                                            <span className="text-lg font-bold text-primary">₹{investmentAmount.toLocaleString()}</span>
                                        </div>
                                        
                                        <input 
                                            type="range" 
                                            min="1000" 
                                            max="10000000" 
                                            step="1000"
                                            value={investmentAmount}
                                            onChange={(e) => setInvestmentAmount(parseInt(e.target.value) || 0)}
                                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                        />
                                        
                                        <div className="flex gap-2 mt-2">
                                            <span className="inline-flex items-center px-4 rounded-md bg-muted text-muted-foreground border border-border font-semibold">
                                                ₹
                                            </span>
                                            <input 
                                                type="number"
                                                min="0"
                                                className="minimal-input flex-1 text-lg font-semibold"
                                                value={investmentAmount}
                                                onChange={(e) => setInvestmentAmount(parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        
                                        <button 
                                            className="btn-primary w-full mt-4 h-12 text-base shadow-lg"
                                            onClick={() => handleInvest(selectedFounder.startup_id)}
                                        >
                                            Confirm Investment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Investor;
