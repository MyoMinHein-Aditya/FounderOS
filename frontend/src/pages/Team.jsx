import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

function Team() {
    const { showToast } = useToast();
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [teamName, setTeamName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function loadTeam() {
        try {
            const res = await api.get("/collaboration/teams/my_team");
            setTeam(res.data);
            if (res.data) {
                loadMembers(res.data.id);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function loadMembers(teamId) {
        try {
            const res = await api.get(`/collaboration/teams/${teamId}/members`);
            setMembers(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleCreateTeam() {
        if (!teamName.trim()) return showToast("Team name is required", "warning");
        setIsSaving(true);
        try {
            await api.post("/collaboration/teams/create", { name: teamName });
            showToast("Team created successfully!", "success");
            loadTeam();
        } catch (err) {
            showToast("Failed to create team", "error");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleInviteMember() {
        if (!inviteEmail.trim()) return showToast("Email address is required", "warning");
        setIsSaving(true);
        try {
            await api.post(`/collaboration/teams/${team.id}/add_member`, { email: inviteEmail, role: "Member" });
            showToast("Teammate added successfully!", "success");
            setInviteEmail("");
            loadMembers(team.id);
        } catch (err) {
            showToast("Failed to add teammate. Ensure they are registered.", "error");
        } finally {
            setIsSaving(false);
        }
    }

    useEffect(() => {
        loadTeam();
    }, []);

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Team Workspace
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base font-medium">
                        Coordinate with your co-founders and manage shared workspace credentials.
                    </p>
                </header>

                {!team ? (
                    <div className="minimal-card p-6 md:p-8 max-w-md mx-auto flex flex-col gap-5">
                        <h2 className="text-lg font-bold text-white font-heading">Create Team</h2>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                            Form a collaborative workspace to work on venture goals and tasks in real-time.
                        </p>
                        <div className="flex flex-col gap-4">
                            <input 
                                className="minimal-input"
                                placeholder="Team Name" 
                                value={teamName} 
                                onChange={(e) => setTeamName(e.target.value)}
                            />
                            <button 
                                className="btn-primary w-full font-bold"
                                onClick={handleCreateTeam}
                                disabled={isSaving}
                            >
                                {isSaving ? "Creating..." : "Create Team"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Team Info & Invite Teammate */}
                        <section className="minimal-card p-6 md:p-8 h-fit flex flex-col gap-5">
                            <div>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Workspace</span>
                                <h2 className="text-2xl font-extrabold font-heading text-gradient mt-1">{team.name}</h2>
                                <span className="text-xs text-zinc-400 font-medium">Role: {team.role}</span>
                            </div>

                            {team.role === "Admin" && (
                                <div className="border-t border-zinc-900 pt-5 flex flex-col gap-4">
                                    <h3 className="text-sm font-bold text-zinc-200">Add Teammate</h3>
                                    <input 
                                        className="minimal-input"
                                        placeholder="Teammate Email Address" 
                                        type="email"
                                        value={inviteEmail} 
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                    <button 
                                        className="btn-primary w-full font-bold text-xs py-2.5"
                                        onClick={handleInviteMember}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? "Adding..." : "Add Member"}
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Members List */}
                        <section className="lg:col-span-2 minimal-card p-6 md:p-8">
                            <h2 className="text-lg font-bold text-white font-heading mb-6">Teammates</h2>
                            <div className="flex flex-col gap-3">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-sm font-bold text-zinc-100 truncate">{member.name}</span>
                                            <span className="text-xs text-zinc-500 truncate">{member.email}</span>
                                        </div>
                                        <span className="text-[10px] text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                            {member.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Team;
