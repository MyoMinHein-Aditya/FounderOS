import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import EmptyState from "../components/EmptyState";
import { useToast } from "../context/ToastContext";

function Notes() {
    const { showToast } = useToast();
    const [startups, setStartups] = useState([]);
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);

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

    async function loadNotes(startupId) {
        if (!startupId) return;
        try {
            const res = await api.get(`/notes/get_notes/${startupId}`);
            setNotes(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStartups();
    }, []);

    useEffect(() => {
        loadNotes(selectedStartupId);
        setActiveNote(null);
        clearForm();
    }, [selectedStartupId]);

    function clearForm() {
        setTitle("");
        setContent("");
        setTags("");
    }

    function selectNote(note) {
        setActiveNote(note);
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags);
    }

    function createNewNote() {
        setActiveNote({ id: "new" });
        clearForm();
    }

    async function saveNote() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        if (!title.trim() || !content.trim()) return showToast("Title and Content are required", "warning");

        setIsSaving(true);
        try {
            if (activeNote && activeNote.id !== "new") {
                const res = await api.put(`/notes/${activeNote.id}/update`, { title, content, tags });
                showToast("Note updated successfully", "success");
                loadNotes(selectedStartupId);
                setActiveNote(res.data);
            } else {
                const res = await api.post("/notes/create", { startup_id: Number(selectedStartupId), title, content, tags });
                showToast("Note created successfully", "success");
                loadNotes(selectedStartupId);
                setActiveNote(res.data);
            }
        } catch (err) {
            showToast("Failed to save note", "error");
        } finally {
            setIsSaving(false);
        }
    }

    async function togglePin(noteId) {
        try {
            await api.patch(`/notes/${noteId}/toggle_pin`);
            showToast("Pin status updated", "success");
            loadNotes(selectedStartupId);
        } catch (err) {
            showToast("Failed to pin note", "error");
        }
    }

    async function deleteNote(noteId) {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        try {
            await api.delete(`/notes/${noteId}/delete`);
            showToast("Note deleted", "success");
            loadNotes(selectedStartupId);
            setActiveNote(null);
            clearForm();
        } catch (err) {
            showToast("Failed to delete note", "error");
        }
    }

    async function summarizeNote() {
        if (!activeNote || activeNote.id === "new") return;
        setIsSummarizing(true);
        try {
            const res = await api.post(`/notes/${activeNote.id}/summarize`);
            setContent(prev => prev + "\n\nSummary:\n" + res.data.summary);
            showToast("Summary appended successfully", "success");
        } catch (err) {
            showToast("Failed to generate summary", "error");
        } finally {
            setIsSummarizing(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Notes
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
                            Organize ideas, capture decisions, and leverage AI summaries.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select 
                            className="minimal-input py-2 px-3 cursor-pointer text-sm"
                            value={selectedStartupId} 
                            onChange={(e) => setSelectedStartupId(e.target.value)}
                        >
                            {startups.map(s => (
                                <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-100">{s.name}</option>
                            ))}
                        </select>
                        <button 
                            className="btn-primary py-2.5 px-4 text-xs"
                            onClick={createNewNote}
                        >
                            New Note
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Notes List Panel */}
                    <section className="minimal-card p-6 md:p-8 h-fit flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-white font-heading">Saved Notes</h2>
                        {notes.length === 0 ? (
                            <p className="text-zinc-500 text-xs text-center py-6">No notes created yet.</p>
                        ) : (
                            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                                {notes.map(note => (
                                    <div 
                                        key={note.id} 
                                        onClick={() => selectNote(note)}
                                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                                            activeNote && activeNote.id === note.id 
                                                ? "bg-zinc-900 border-zinc-700" 
                                                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="font-bold text-sm text-zinc-200 truncate">{note.title}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                                                    note.is_pinned 
                                                        ? "bg-white text-zinc-950" 
                                                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                                                }`}
                                            >
                                                {note.is_pinned ? "Pinned" : "Pin"}
                                            </button>
                                        </div>
                                        {note.tags && (
                                            <span className="text-[10px] text-zinc-500 font-semibold truncate">{note.tags}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Editor Panel */}
                    <section className="lg:col-span-2">
                        {activeNote ? (
                            <div className="minimal-card p-6 md:p-8 flex flex-col gap-5">
                                <h2 className="text-lg font-bold text-white font-heading">
                                    {activeNote.id === "new" ? "Create Note" : "Edit Note"}
                                </h2>
                                <div className="flex flex-col gap-4">
                                    <input 
                                        className="minimal-input"
                                        placeholder="Note Title" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    <input 
                                        className="minimal-input"
                                        placeholder="Tags (comma-separated, e.g. Ideas, Marketing)" 
                                        value={tags} 
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                    <textarea 
                                        className="minimal-input min-h-[250px] resize-y"
                                        placeholder="Write note contents..." 
                                        value={content} 
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                    
                                    <div className="flex flex-wrap gap-2.5 pt-2 border-t border-zinc-900 mt-2">
                                        <button 
                                            className="btn-primary flex-1 py-3 font-bold text-sm"
                                            onClick={saveNote}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? "Saving..." : "Save Note"}
                                        </button>
                                        {activeNote.id !== "new" && (
                                            <>
                                                <button 
                                                    className="btn-secondary flex-1 py-3 text-sm flex items-center justify-center gap-1.5"
                                                    onClick={summarizeNote}
                                                    disabled={isSummarizing}
                                                >
                                                    {isSummarizing ? "Summarizing..." : "AI Summarize"}
                                                </button>
                                                <button 
                                                    className="px-5 py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/40 font-bold rounded-xl transition-all cursor-pointer text-sm"
                                                    onClick={() => deleteNote(activeNote.id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <EmptyState 
                                title="No active note selected"
                                description="Select an existing note from the list, or create a brand new one for your startup."
                                actionText="Create Note"
                                onAction={createNewNote}
                            />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Notes;
