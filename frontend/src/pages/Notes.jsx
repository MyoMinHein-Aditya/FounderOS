import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import EmptyState from "../components/EmptyState";
import { useToast } from "../context/ToastContext";

const noteSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    tags: z.string().optional()
});

function Notes() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [activeNote, setActiveNote] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");

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

    const { data: notes = [] } = useQuery({
        queryKey: ["notes", selectedStartupId],
        queryFn: async () => {
            const res = await api.get(`/notes/get_notes/${selectedStartupId}`);
            return res.data;
        },
        enabled: !!selectedStartupId
    });

    // When selectedStartupId changes, clear active note
    useEffect(() => {
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

    const saveNoteMutation = useMutation({
        mutationFn: async (noteData) => {
            if (activeNote && activeNote.id !== "new") {
                const res = await api.put(`/notes/${activeNote.id}/update`, noteData);
                return res.data;
            } else {
                const res = await api.post("/notes/create", { ...noteData, startup_id: Number(selectedStartupId) });
                return res.data;
            }
        },
        onSuccess: (data) => {
            showToast(activeNote?.id === "new" ? "Note created successfully" : "Note updated successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["notes", selectedStartupId] });
            setActiveNote(data);
        },
        onError: () => {
            showToast("Failed to save note", "error");
        }
    });

    const togglePinMutation = useMutation({
        mutationFn: async (noteId) => {
            return await api.patch(`/notes/${noteId}/toggle_pin`);
        },
        onSuccess: () => {
            showToast("Pin status updated", "success");
            queryClient.invalidateQueries({ queryKey: ["notes", selectedStartupId] });
        },
        onError: () => {
            showToast("Failed to pin note", "error");
        }
    });

    const deleteNoteMutation = useMutation({
        mutationFn: async (noteId) => {
            return await api.delete(`/notes/${noteId}/delete`);
        },
        onSuccess: () => {
            showToast("Note deleted", "success");
            queryClient.invalidateQueries({ queryKey: ["notes", selectedStartupId] });
            setActiveNote(null);
            clearForm();
        },
        onError: () => {
            showToast("Failed to delete note", "error");
        }
    });

    const summarizeNoteMutation = useMutation({
        mutationFn: async (noteId) => {
            const res = await api.post(`/notes/${noteId}/summarize`);
            return res.data;
        },
        onSuccess: (data) => {
            setContent(prev => prev + "\n\nSummary:\n" + data.summary);
            showToast("Summary appended successfully", "success");
        },
        onError: () => {
            showToast("Failed to generate summary", "error");
        }
    });

    function saveNote() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");

        try {
            const noteData = { title, content, tags };
            noteSchema.parse(noteData);
            saveNoteMutation.mutate(noteData);
        } catch (err) {
            if (err instanceof z.ZodError) {
                showToast(err.errors[0].message, "warning");
            }
        }
    }

    function togglePin(noteId) {
        togglePinMutation.mutate(noteId);
    }

    function deleteNote(noteId) {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        deleteNoteMutation.mutate(noteId);
    }

    function summarizeNote() {
        if (!activeNote || activeNote.id === "new") return;
        summarizeNoteMutation.mutate(activeNote.id);
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Notes
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base font-medium">
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
                                <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>
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
                        <h2 className="text-lg font-bold text-foreground font-heading">Saved Notes</h2>
                        {notes.length === 0 ? (
                            <p className="text-muted-foreground text-xs text-center py-6">No notes created yet.</p>
                        ) : (
                            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                                {notes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => selectNote(note)}
                                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                                            activeNote && activeNote.id === note.id
                                                ? "bg-muted border-border"
                                                : "bg-muted border-border hover:border-border"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="font-bold text-sm text-foreground truncate">{note.title}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                                                    note.is_pinned
                                                        ? "bg-white text-zinc-950"
                                                        : "bg-secondary text-muted-foreground hover:text-foreground"
                                                }`}
                                                disabled={togglePinMutation.isPending && togglePinMutation.variables === note.id}
                                            >
                                                {note.is_pinned ? "Pinned" : "Pin"}
                                            </button>
                                        </div>
                                        {note.tags && (
                                            <span className="text-[10px] text-muted-foreground font-semibold truncate">{note.tags}</span>
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
                                <h2 className="text-lg font-bold text-foreground font-heading">
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
                                            disabled={saveNoteMutation.isPending}
                                        >
                                            {saveNoteMutation.isPending ? "Saving..." : "Save Note"}
                                        </button>
                                        {activeNote.id !== "new" && (
                                            <>
                                                <button
                                                    className="btn-secondary flex-1 py-3 text-sm flex items-center justify-center gap-1.5"
                                                    onClick={summarizeNote}
                                                    disabled={summarizeNoteMutation.isPending}
                                                >
                                                    {summarizeNoteMutation.isPending ? "Summarizing..." : "AI Summarize"}
                                                </button>
                                                <button
                                                    className="px-5 py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/40 font-bold rounded-xl transition-all cursor-pointer text-sm"
                                                    onClick={() => deleteNote(activeNote.id)}
                                                    disabled={deleteNoteMutation.isPending}
                                                >
                                                    {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
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
