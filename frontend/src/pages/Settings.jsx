import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

// Customizing workspace preferences and account

function Settings(){
    const [user, setUser] = useState(null);

    async function loadUser(){
        const token = localStorage.getItem("token");
        try {
            const res = await api.get("/auth/me", {headers:{Authorization:`Bearer ${token}`}});
            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    function logout(){
        localStorage.removeItem("token");
        window.location.href="/";
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                        Settings ⚙️
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base">
                        Manage your account and workspace preferences.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="glass-card p-6 md:p-8 lg:col-span-2">
                        <h2 className="text-lg font-bold text-zinc-100 mb-6">Account Information</h2>
                        {user && (
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-zinc-800/20 rounded-xl border border-zinc-800/60">
                                    <p className="text-xs font-semibold text-zinc-400 mb-1">Name</p>
                                    <p className="text-lg font-semibold text-zinc-100">{user.name}</p>
                                </div>
                                <div className="p-4 bg-zinc-800/20 rounded-xl border border-zinc-800/60">
                                    <p className="text-xs font-semibold text-zinc-400 mb-1">Email</p>
                                    <p className="text-lg font-semibold text-zinc-100">{user.email}</p>
                                </div>
                                <div className="p-4 bg-zinc-800/20 rounded-xl border border-zinc-800/60">
                                    <p className="text-xs font-semibold text-zinc-400 mb-1">User ID</p>
                                    <p className="text-sm font-mono text-zinc-300">{user.id}</p>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="glass-card p-6 md:p-8 h-fit">
                        <h2 className="text-lg font-bold text-zinc-100 mb-6">Workspace</h2>
                        <div className="flex flex-col gap-3">
                            <div className="p-4 bg-zinc-800/20 rounded-xl border border-zinc-800/60 text-center">
                                <p className="text-sm text-zinc-400 mb-2">Current Workspace</p>
                                <p className="text-lg font-semibold text-violet-400">FounderOS</p>
                            </div>
                            <button 
                                className="w-full btn-secondary"
                            >
                                Theme Settings
                            </button>
                            <button 
                                className="w-full btn-secondary"
                            >
                                Notifications
                            </button>
                            <button 
                                className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold rounded-xl transition-all"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default Settings;
