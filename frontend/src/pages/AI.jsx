import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function AI() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    async function loadHistory() {
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/chat/history", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    }

    async function handleSend(e) {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setLoading(true);

        const token = localStorage.getItem("token");
        try {
            const res = await api.post("/chat/chat", { message: currentInput }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
        } catch (err) {
            console.error("Failed to send message:", err);
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    }

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-6 flex flex-col h-full">
                <header className="mb-6 flex-shrink-0">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                        AI Co-Founder ✨
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base">
                        Get instant, practical strategy and metrics feedback from your AI co-founder.
                    </p>
                </header>

                <div className="flex-1 min-h-0 glass-card p-4 md:p-6 flex flex-col rounded-2xl mb-4 relative overflow-hidden border border-zinc-800/60 bg-zinc-950/40">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                                <div className="text-5xl mb-4">🤖</div>
                                <h3 className="text-lg font-bold text-zinc-200 mb-2">Start a conversation</h3>
                                <p className="text-sm text-zinc-400">
                                    Ask me about your startup ideas, strategy moves, marketing plans, or metrics analysis.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base shadow-md transition-all duration-200 ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none"
                                                : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center space-x-1.5 shadow-md">
                                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
                        <input
                            type="text"
                            placeholder="Ask your AI co-founder..."
                            className="flex-1 glass-input py-3 px-4 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="btn-primary px-6 rounded-xl flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            disabled={loading || !input.trim()}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default AI;
