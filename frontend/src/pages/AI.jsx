import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

const chatSchema = z.object({
    message: z.string().min(1, "Message cannot be empty")
});

const meetingSchema = z.object({
    notes: z.string().min(1, "Please input raw meeting notes")
});

function AI() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("Chat"); // Chat, Strategy, Meetings, Writer
    
    // Chat Tab States
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // Common/Shared States
    const [selectedStartupId, setSelectedStartupId] = useState("");

    // Strategy SWOT States
    const [swotReport, setSwotReport] = useState("");

    // Meeting Extractor States
    const [rawNotes, setRawNotes] = useState("");
    const [meetingReport, setMeetingReport] = useState("");

    // Doc Writer States
    const [docType, setDocType] = useState("PRD"); // PRD, Pitch, Vision, Canvas
    const [draftedContent, setDraftedContent] = useState("");

    // Helper to format raw markdown into beautiful React elements
    function renderMarkdown(text) {
        if (!text) return null;
        const lines = text.split("\n");
        return lines.map((line, lineIndex) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("### ")) {
                return <h3 key={lineIndex} className="text-sm font-bold text-foreground mt-4 mb-2 font-heading">{parseInline(trimmed.substring(4))}</h3>;
            }
            if (trimmed.startsWith("## ")) {
                return <h2 key={lineIndex} className="text-base font-bold text-foreground mt-5 mb-2.5 font-heading">{parseInline(trimmed.substring(3))}</h2>;
            }
            if (trimmed.startsWith("# ")) {
                return <h1 key={lineIndex} className="text-lg font-extrabold text-foreground mt-6 mb-3 font-heading">{parseInline(trimmed.substring(2))}</h1>;
            }
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                    <ul key={lineIndex} className="list-disc pl-5 mb-1.5 space-y-1">
                        <li className="text-xs md:text-sm text-muted-foreground">{parseInline(trimmed.substring(2))}</li>
                    </ul>
                );
            }
            const matchNum = trimmed.match(/^(\d+)\.\s(.*)/);
            if (matchNum) {
                return (
                    <ol key={lineIndex} className="list-decimal pl-5 mb-1.5 space-y-1">
                        <li className="text-xs md:text-sm text-muted-foreground">{parseInline(matchNum[2])}</li>
                    </ol>
                );
            }
            if (trimmed === "") {
                return <div key={lineIndex} className="h-2"></div>;
            }
            return <p key={lineIndex} className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-2">{parseInline(line)}</p>;
        });
    }

    function parseInline(text) {
        if (!text) return "";
        const parts = text.split(/\*\*([^*]+)\*\*/g);
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return <strong key={index} className="font-bold text-foreground html.light:text-zinc-950">{part}</strong>;
            }
            return part;
        });
    }

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

    const { data: history = [] } = useQuery({
        queryKey: ["chatHistory"],
        queryFn: async () => {
            const res = await api.get("/chat/history");
            return res.data;
        }
    });

    useEffect(() => {
        if (history.length > 0 && messages.length === 0) {
            setMessages(history);
        }
    }, [history]);

    const chatMutation = useMutation({
        mutationFn: async (msg) => {
            const res = await api.post("/chat/chat", { message: msg });
            return res.data.response;
        },
        onSuccess: (response) => {
            setMessages(prev => [...prev, { role: "assistant", content: response }]);
        },
        onError: () => {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        }
    });

    const loadingChat = chatMutation.isPending;

    async function handleSend(e) {
        if (e) e.preventDefault();
        const currentInput = input;
        
        const result = chatSchema.safeParse({ message: currentInput });
        if (!result.success || loadingChat) return;

        setMessages(prev => [...prev, { role: "user", content: currentInput }]);
        setInput("");
        chatMutation.mutate(currentInput);
    }

    const swotMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/ai-features/strategy/${selectedStartupId}`);
            return res.data.analysis;
        },
        onSuccess: (analysis) => {
            setSwotReport(analysis);
            showToast("SWOT analysis generated", "success");
        },
        onError: () => {
            showToast("Failed to generate SWOT", "error");
        }
    });

    const loadingSwot = swotMutation.isPending;

    async function generateSWOT() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        swotMutation.mutate();
    }

    const extractMinutesMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post("/ai-features/meetings/extract", null, { params: { notes_text: rawNotes } });
            return res.data.analysis;
        },
        onSuccess: (analysis) => {
            setMeetingReport(analysis);
            showToast("Meeting minutes extracted successfully", "success");
        },
        onError: () => {
            showToast("Failed to extract minutes", "error");
        }
    });

    const loadingMeetings = extractMinutesMutation.isPending;

    async function extractMinutes() {
        const result = meetingSchema.safeParse({ notes: rawNotes });
        if (!result.success) return showToast(result.error.errors[0].message, "warning");
        extractMinutesMutation.mutate();
    }

    const writeDocMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post("/ai-features/writer/generate", null, { params: { doc_type: docType, startup_id: Number(selectedStartupId) } });
            return res.data.content;
        },
        onSuccess: (content) => {
            setDraftedContent(content);
            showToast("Document drafted successfully", "success");
        },
        onError: () => {
            showToast("Failed to draft document", "error");
        }
    });

    const loadingWriter = writeDocMutation.isPending;

    async function handleWriteDocument() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        writeDocMutation.mutate();
    }

    const exportDocMutation = useMutation({
        mutationFn: async () => {
            await api.post("/documents/save", { startup_id: Number(selectedStartupId), type: docType, content: draftedContent });
        },
        onSuccess: () => {
            showToast(`Exported successfully to documents workspace!`, "success");
        },
        onError: () => {
            showToast("Failed to export document", "error");
        }
    });

    const isExporting = exportDocMutation.isPending;

    async function handleExportToDocs() {
        if (!selectedStartupId || !draftedContent.trim()) return;
        exportDocMutation.mutate();
    }

    useEffect(() => {
        if (activeTab === "Chat") {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loadingChat, activeTab]);

    return (
        <div className="min-h-screen bg-background text-foreground flex h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-6 flex flex-col h-full">
                <header className="mb-6 flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            AI Workspace
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base font-medium">
                            Co-founder chat, strategy SWOT matrices, meeting planners, and document writers.
                        </p>
                    </div>
                    {activeTab !== "Meetings" && startups.length > 0 && (
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
                    )}
                </header>

                {/* Sub tabs */}
                <div className="flex flex-wrap gap-2 mb-6 pb-2 border-b border-zinc-900 flex-shrink-0">
                    {["Chat", "Strategy & SWOT", "Meetings", "Doc Writer"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTab === tab
                                    ? "bg-white text-zinc-950"
                                    : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Workspace Content Panels */}
                <div className="flex-1 min-h-0 minimal-card p-4 md:p-6 flex flex-col rounded-2xl relative overflow-hidden border border-border bg-background mb-4">
                    {activeTab === "Chat" && (
                        <>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                                        <h3 className="text-lg font-bold text-foreground font-heading mb-2">Start a conversation</h3>
                                        <p className="text-sm text-muted-foreground font-medium">
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
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 transition-all duration-200 ${
                                                    msg.role === "user"
                                                        ? "bg-white text-zinc-950 font-medium rounded-br-none"
                                                        : "bg-muted border border-border text-foreground rounded-bl-none"
                                                }`}
                                            >
                                                <div className="leading-relaxed">{renderMarkdown(msg.content)}</div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {loadingChat && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted border border-border text-muted-foreground rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center space-x-1.5 shadow-md">
                                            <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
                                <input
                                    type="text"
                                    placeholder="Ask your AI co-founder..."
                                    className="flex-1 minimal-input py-3 px-4 rounded-xl text-foreground placeholder-zinc-500"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loadingChat}
                                />
                                <button
                                    type="submit"
                                    className="btn-primary px-6 rounded-xl flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    disabled={loadingChat || !input.trim()}
                                >
                                    Send
                                </button>
                            </form>
                        </>
                    )}

                    {activeTab === "Strategy & SWOT" && (
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                            <div className="flex justify-between items-center gap-4 flex-shrink-0">
                                <h3 className="font-bold text-foreground text-sm">Venture Strategy SWOT Report</h3>
                                <button
                                    className="btn-primary py-2 px-4 text-xs"
                                    onClick={generateSWOT}
                                    disabled={loadingSwot}
                                >
                                    {loadingSwot ? "Generating SWOT..." : "Generate SWOT"}
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-muted border border-zinc-900 p-4 rounded-xl">
                                {loadingSwot ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                                        <div className="w-8 h-8 border-4 border-t-white border-border rounded-full animate-spin mb-3"></div>
                                        <p className="animate-pulse text-xs">Assembling SWOT matrices...</p>
                                    </div>
                                ) : swotReport ? (
                                    <div className="leading-relaxed">{renderMarkdown(swotReport)}</div>
                                ) : (
                                    <p className="text-muted-foreground text-xs text-center py-12">Click Generate SWOT to compile strategic venture analysis.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "Meetings" && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                            <div className="flex-1 flex flex-col gap-3 min-w-0">
                                <span className="font-bold text-foreground text-sm">Raw Meeting Notes</span>
                                <textarea
                                    className="flex-1 minimal-input resize-none p-4 text-sm leading-relaxed"
                                    placeholder="Paste notes, raw summaries, or chat logs here..."
                                    value={rawNotes}
                                    onChange={(e) => setRawNotes(e.target.value)}
                                    disabled={loadingMeetings}
                                />
                                <button
                                    className="btn-primary py-3 font-bold text-sm w-full mt-2"
                                    onClick={extractMinutes}
                                    disabled={loadingMeetings}
                                >
                                    {loadingMeetings ? "Extracting..." : "Parse Meeting Notes"}
                                </button>
                            </div>
                            <div className="flex-1 flex flex-col gap-3 min-w-0">
                                <span className="font-bold text-foreground text-sm">Parsed Action Items</span>
                                <div className="flex-1 overflow-y-auto bg-muted border border-zinc-900 p-4 rounded-xl">
                                    {loadingMeetings ? (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                                            <div className="w-8 h-8 border-4 border-t-white border-border rounded-full animate-spin mb-3"></div>
                                            <p className="animate-pulse text-xs">Parsing transcripts...</p>
                                        </div>
                                    ) : meetingReport ? (
                                        <div className="leading-relaxed">{renderMarkdown(meetingReport)}</div>
                                    ) : (
                                        <p className="text-muted-foreground text-xs text-center py-12">Action items, decisions, and deadlines will render here.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Doc Writer" && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                            <div className="w-full lg:w-1/3 flex flex-col gap-4 flex-shrink-0">
                                <span className="font-bold text-foreground text-sm">Document Target</span>
                                <select 
                                    className="minimal-input cursor-pointer text-sm"
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    disabled={loadingWriter}
                                >
                                    <option value="PRD" className="bg-background text-foreground">Product Requirement Document (PRD)</option>
                                    <option value="Pitch" className="bg-background text-foreground">Pitch Deck Outline</option>
                                    <option value="Vision" className="bg-background text-foreground">Venture Vision statement</option>
                                    <option value="Canvas" className="bg-background text-foreground">Business Model Canvas (BMC)</option>
                                </select>
                                <button
                                    className="btn-primary py-3 font-bold text-sm w-full mt-2"
                                    onClick={handleWriteDocument}
                                    disabled={loadingWriter}
                                >
                                    {loadingWriter ? "Writing Draft..." : "AI Write Document"}
                                </button>
                                {draftedContent && (
                                    <button
                                        className="btn-secondary py-3 font-bold text-sm w-full"
                                        onClick={handleExportToDocs}
                                        disabled={isExporting}
                                    >
                                        {isExporting ? "Exporting..." : "Export to Documents Workspace"}
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col gap-3 min-w-0">
                                <span className="font-bold text-foreground text-sm">Draft Preview</span>
                                <div className="flex-1 overflow-y-auto bg-muted border border-zinc-900 p-4 rounded-xl">
                                    {loadingWriter ? (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                                            <div className="w-8 h-8 border-4 border-t-white border-border rounded-full animate-spin mb-3"></div>
                                            <p className="animate-pulse text-xs">Writing document blueprint...</p>
                                        </div>
                                    ) : draftedContent ? (
                                        <div className="leading-relaxed">{renderMarkdown(draftedContent)}</div>
                                    ) : (
                                        <p className="text-muted-foreground text-xs text-center py-12">Drafted document preview will load here.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AI;
