import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

function AI() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("Chat"); // Chat, Strategy, Meetings, Writer
    
    // Chat Tab States
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loadingChat, setLoadingChat] = useState(false);
    const messagesEndRef = useRef(null);

    // Common/Shared States
    const [startups, setStartups] = useState([]);
    const [selectedStartupId, setSelectedStartupId] = useState("");

    // Strategy SWOT States
    const [swotReport, setSwotReport] = useState("");
    const [loadingSwot, setLoadingSwot] = useState(false);

    // Meeting Extractor States
    const [rawNotes, setRawNotes] = useState("");
    const [meetingReport, setMeetingReport] = useState("");
    const [loadingMeetings, setLoadingMeetings] = useState(false);

    // Doc Writer States
    const [docType, setDocType] = useState("PRD"); // PRD, Pitch, Vision, Canvas
    const [draftedContent, setDraftedContent] = useState("");
    const [loadingWriter, setLoadingWriter] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

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

    // Chat Functions
    async function loadHistory() {
        try {
            const res = await api.get("/chat/history");
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    }

    async function handleSend(e) {
        if (e) e.preventDefault();
        if (!input.trim() || loadingChat) return;

        const currentInput = input;
        setMessages(prev => [...prev, { role: "user", content: currentInput }]);
        setInput("");
        setLoadingChat(true);

        try {
            const res = await api.post("/chat/chat", { message: currentInput });
            setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoadingChat(false);
        }
    }

    // Strategy functions
    async function generateSWOT() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        setLoadingSwot(true);
        try {
            const res = await api.post(`/ai-features/strategy/${selectedStartupId}`);
            setSwotReport(res.data.analysis);
            showToast("SWOT analysis generated", "success");
        } catch (err) {
            showToast("Failed to generate SWOT", "error");
        } finally {
            setLoadingSwot(false);
        }
    }

    // Meeting Minutes functions
    async function extractMinutes() {
        if (!rawNotes.trim()) return showToast("Please input raw meeting notes", "warning");
        setLoadingMeetings(true);
        try {
            const res = await api.post("/ai-features/meetings/extract", null, { params: { notes_text: rawNotes } });
            setMeetingReport(res.data.analysis);
            showToast("Meeting minutes extracted successfully", "success");
        } catch (err) {
            showToast("Failed to extract minutes", "error");
        } finally {
            setLoadingMeetings(false);
        }
    }

    // Doc Writer functions
    async function handleWriteDocument() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        setLoadingWriter(true);
        try {
            const res = await api.post("/ai-features/writer/generate", null, { params: { doc_type: docType, startup_id: Number(selectedStartupId) } });
            setDraftedContent(res.data.content);
            showToast("Document drafted successfully", "success");
        } catch (err) {
            showToast("Failed to draft document", "error");
        } finally {
            setLoadingWriter(false);
        }
    }

    async function handleExportToDocs() {
        if (!selectedStartupId || !draftedContent.trim()) return;
        setIsExporting(true);
        try {
            await api.post("/documents/save", { startup_id: Number(selectedStartupId), type: docType, content: draftedContent });
            showToast(`Exported successfully to documents workspace!`, "success");
        } catch (err) {
            showToast("Failed to export document", "error");
        } finally {
            setIsExporting(false);
        }
    }

    useEffect(() => {
        loadStartups();
        loadHistory();
    }, []);

    useEffect(() => {
        if (activeTab === "Chat") {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loadingChat, activeTab]);

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-6 flex flex-col h-full">
                <header className="mb-6 flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            AI Workspace
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
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
                                    <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-100">{s.name}</option>
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
                                    : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Workspace Content Panels */}
                <div className="flex-1 min-h-0 minimal-card p-4 md:p-6 flex flex-col rounded-2xl relative overflow-hidden border border-zinc-800 bg-zinc-950 mb-4">
                    {activeTab === "Chat" && (
                        <>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                                        <h3 className="text-lg font-bold text-white font-heading mb-2">Start a conversation</h3>
                                        <p className="text-sm text-zinc-400 font-medium">
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
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base transition-all duration-200 ${
                                                    msg.role === "user"
                                                        ? "bg-white text-zinc-950 font-medium rounded-br-none"
                                                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none"
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {loadingChat && (
                                    <div className="flex justify-start">
                                        <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center space-x-1.5 shadow-md">
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
                                    className="flex-1 minimal-input py-3 px-4 rounded-xl text-zinc-100 placeholder-zinc-500"
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
                                <h3 className="font-bold text-zinc-200 text-sm">Venture Strategy SWOT Report</h3>
                                <button
                                    className="btn-primary py-2 px-4 text-xs"
                                    onClick={generateSWOT}
                                    disabled={loadingSwot}
                                >
                                    {loadingSwot ? "Generating SWOT..." : "Generate SWOT"}
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl">
                                {loadingSwot ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                                        <div className="w-8 h-8 border-4 border-t-white border-zinc-800 rounded-full animate-spin mb-3"></div>
                                        <p className="animate-pulse text-xs">Assembling SWOT matrices...</p>
                                    </div>
                                ) : swotReport ? (
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-mono">{swotReport}</p>
                                ) : (
                                    <p className="text-zinc-500 text-xs text-center py-12">Click Generate SWOT to compile strategic venture analysis.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "Meetings" && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                            <div className="flex-1 flex flex-col gap-3 min-w-0">
                                <span className="font-bold text-zinc-200 text-sm">Raw Meeting Notes</span>
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
                                <span className="font-bold text-zinc-200 text-sm">Parsed Action Items</span>
                                <div className="flex-1 overflow-y-auto bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl">
                                    {loadingMeetings ? (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                                            <div className="w-8 h-8 border-4 border-t-white border-zinc-800 rounded-full animate-spin mb-3"></div>
                                            <p className="animate-pulse text-xs">Parsing transcripts...</p>
                                        </div>
                                    ) : meetingReport ? (
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-mono">{meetingReport}</p>
                                    ) : (
                                        <p className="text-zinc-500 text-xs text-center py-12">Action items, decisions, and deadlines will render here.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Doc Writer" && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                            <div className="w-full lg:w-1/3 flex flex-col gap-4 flex-shrink-0">
                                <span className="font-bold text-zinc-200 text-sm">Document Target</span>
                                <select 
                                    className="minimal-input cursor-pointer text-sm"
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    disabled={loadingWriter}
                                >
                                    <option value="PRD" className="bg-zinc-950 text-zinc-100">Product Requirement Document (PRD)</option>
                                    <option value="Pitch" className="bg-zinc-950 text-zinc-100">Pitch Deck Outline</option>
                                    <option value="Vision" className="bg-zinc-950 text-zinc-100">Venture Vision statement</option>
                                    <option value="Canvas" className="bg-zinc-950 text-zinc-100">Business Model Canvas (BMC)</option>
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
                                <span className="font-bold text-zinc-200 text-sm">Draft Preview</span>
                                <div className="flex-1 overflow-y-auto bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl">
                                    {loadingWriter ? (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                                            <div className="w-8 h-8 border-4 border-t-white border-zinc-800 rounded-full animate-spin mb-3"></div>
                                            <p className="animate-pulse text-xs">Writing document blueprint...</p>
                                        </div>
                                    ) : draftedContent ? (
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-mono">{draftedContent}</p>
                                    ) : (
                                        <p className="text-zinc-500 text-xs text-center py-12">Drafted document preview will load here.</p>
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
