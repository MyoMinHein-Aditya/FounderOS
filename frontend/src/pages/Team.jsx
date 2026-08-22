import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

const teamSchema = z.object({
    name: z.string().min(1, "Team name is required")
});

const inviteSchema = z.object({
    email: z.string().email("Invalid email address")
});

function Team() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [teamName, setTeamName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");

    const { data: team } = useQuery({
        queryKey: ["team"],
        queryFn: async () => {
            const res = await api.get("/collaboration/teams/my_team");
            return res.data || null; // fallback to null if empty string
        }
    });

    const { data: members = [] } = useQuery({
        queryKey: ["teamMembers", team?.id],
        queryFn: async () => {
            if (!team?.id) return [];
            const res = await api.get(`/collaboration/teams/${team.id}/members`);
            return res.data;
        },
        enabled: !!team?.id
    });

    const createTeamMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post("/collaboration/teams/create", data);
            return res.data;
        },
        onSuccess: () => {
            showToast("Team created successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ["team"] });
        },
        onError: () => {
            showToast("Failed to create team", "error");
        }
    });

    const inviteMemberMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post(`/collaboration/teams/${team.id}/add_member`, { email: data.email, role: "Member" });
            return res.data;
        },
        onSuccess: () => {
            showToast("Teammate added successfully!", "success");
            setInviteEmail("");
            queryClient.invalidateQueries({ queryKey: ["teamMembers", team.id] });
        },
        onError: () => {
            showToast("Failed to add teammate. Ensure they are registered.", "error");
        }
    });

    async function handleCreateTeam() {
        try {
            const data = teamSchema.parse({ name: teamName });
            createTeamMutation.mutate(data);
        } catch (err) {
            if (err instanceof z.ZodError) {
                showToast(err.errors[0].message, "warning");
            }
        }
    }

    async function handleInviteMember() {
        try {
            const data = inviteSchema.parse({ email: inviteEmail });
            inviteMemberMutation.mutate(data);
        } catch (err) {
            if (err instanceof z.ZodError) {
                showToast(err.errors[0].message, "warning");
            }
        }
    }

    const isSaving = createTeamMutation.isPending || inviteMemberMutation.isPending;

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Team Workspace
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Coordinate with your co-founders and manage shared workspace credentials.
                    </p>
                </header>

                {!team ? (
                    <div className="minimal-card p-6 md:p-8 max-w-md mx-auto flex flex-col gap-5">
                        <h2 className="text-lg font-bold text-foreground font-heading">Create Team</h2>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
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
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Active Workspace</span>
                                <h2 className="text-2xl font-extrabold font-heading text-foreground mt-1">{team.name}</h2>
                                <span className="text-xs text-muted-foreground font-medium">Role: {team.role}</span>
                            </div>

                            {team.role === "Admin" && (
                                <div className="border-t border-zinc-900 pt-5 flex flex-col gap-4">
                                    <h3 className="text-sm font-bold text-foreground">Add Teammate</h3>
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
                            <h2 className="text-lg font-bold text-foreground font-heading mb-6">Teammates</h2>
                            <div className="flex flex-col gap-3">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-sm font-bold text-foreground truncate">{member.name}</span>
                                            <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                                        </div>
                                        <span className="text-[10px] text-foreground bg-muted border border-border px-2 py-0.5 rounded font-bold uppercase tracking-wider">
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
