import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

function CalendarView() {
    const { showToast } = useToast();
    const [startups, setStartups] = useState([]);
    const [selectedStartupId, setSelectedStartupId] = useState("");
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [isSaving, setIsSaving] = useState(false);

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

    async function loadEvents(startupId) {
        if (!startupId) return;
        try {
            const res = await api.get(`/calendar/get_events/${startupId}`);
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStartups();
    }, []);

    useEffect(() => {
        loadEvents(selectedStartupId);
    }, [selectedStartupId]);

    async function handleAddEvent() {
        if (!selectedStartupId) return showToast("Select a startup first", "warning");
        if (!title.trim() || !date) return showToast("Title and Date are required", "warning");

        setIsSaving(true);
        try {
            await api.post("/calendar/create", { startup_id: Number(selectedStartupId), title, description, date });
            showToast("Event added to calendar", "success");
            setTitle("");
            setDescription("");
            setDate("");
            loadEvents(selectedStartupId);
        } catch (err) {
            showToast("Failed to add event", "error");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteEvent(eventId) {
        if (!window.confirm("Delete this event?")) return;
        try {
            await api.delete(`/calendar/${eventId}/delete`);
            showToast("Event deleted", "success");
            loadEvents(selectedStartupId);
        } catch (err) {
            showToast("Failed to delete event", "error");
        }
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Venture Calendar
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
                            Monitor launch target deadlines, investor calls, and task deadlines.
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Event Form */}
                    <section className="minimal-card p-6 md:p-8 h-fit">
                        <h2 className="text-lg font-bold text-white font-heading mb-6">Add Event</h2>
                        <div className="flex flex-col gap-4">
                            <input 
                                className="minimal-input"
                                placeholder="Event Title" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <input 
                                className="minimal-input"
                                placeholder="Description" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <input 
                                className="minimal-input cursor-pointer"
                                type="date"
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <button 
                                className="btn-primary w-full font-bold mt-2"
                                onClick={handleAddEvent}
                                disabled={isSaving}
                            >
                                {isSaving ? "Adding..." : "Add Event"}
                            </button>
                        </div>
                    </section>

                    {/* Timeline List */}
                    <section className="lg:col-span-2 minimal-card p-6 md:p-8">
                        <h2 className="text-lg font-bold text-white font-heading mb-6">Timeline Events</h2>
                        {events.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                                <p className="mb-2 font-medium">No events added yet</p>
                                <p className="text-xs">Schedule your first milestone deadline on the left</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {events.map(event => (
                                    <div key={event.id} className="flex items-start justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 transition-all duration-200">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="text-sm font-bold text-zinc-100 truncate">{event.title}</span>
                                            {event.description && (
                                                <p className="text-xs text-zinc-400 font-medium truncate">{event.description}</p>
                                            )}
                                            <span className="text-[10px] text-zinc-500 font-semibold mt-1">Date: {event.date}</span>
                                        </div>
                                        <button 
                                            className="px-2.5 py-1 text-[10px] font-bold text-red-400 bg-red-950/20 border border-red-900/40 rounded hover:bg-red-900/40 transition-all cursor-pointer whitespace-nowrap ml-2"
                                            onClick={() => handleDeleteEvent(event.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default CalendarView;
