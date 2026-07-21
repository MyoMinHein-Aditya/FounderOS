import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

// Customizing workspace preferences and account

function Settings(){
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

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

    function changeTheme(newTheme) {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        if (newTheme === "light") {
            document.documentElement.classList.add("light");
        } else {
            document.documentElement.classList.remove("light");
        }
    }

    function logout(){
        localStorage.removeItem("token");
        window.location.href="/";
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Settings
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base font-medium">
                        Manage your account and workspace preferences.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="minimal-card p-6 md:p-8 lg:col-span-2">
                        <h2 className="text-lg font-bold text-white font-heading mb-6">Account Information</h2>
                        {user && (
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                                    <p className="text-xs font-semibold text-zinc-400 mb-1">Name</p>
                                    <p className="text-lg font-semibold text-zinc-100">{user.name}</p>
                                </div>
                                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                                    <p className="text-xs font-semibold text-zinc-400 mb-1">Email</p>
                                    <p className="text-lg font-semibold text-zinc-100">{user.email}</p>
                                </div>
                                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                                    <p className="text-xs font-semibold text-zinc-400 mb-1">User ID</p>
                                    <p className="text-sm font-mono text-zinc-300">{user.id}</p>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="minimal-card p-6 md:p-8 h-fit">
                        <h2 className="text-lg font-bold text-white font-heading mb-6">Workspace</h2>
                        <div className="flex flex-col gap-4">
                            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center">
                                <p className="text-xs font-semibold text-zinc-400 mb-1">Current Workspace</p>
                                <p className="text-lg font-bold text-gradient font-heading">FounderOS</p>
                            </div>

                            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 flex flex-col gap-3">
                                <p className="text-xs font-semibold text-zinc-400">Theme Settings</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            theme === "dark" 
                                                ? "bg-white text-zinc-950 border border-white shadow-sm" 
                                                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                                        }`}
                                        onClick={() => changeTheme("dark")}
                                    >
                                        Dark Mode
                                    </button>
                                    <button 
                                        className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            theme === "light" 
                                                ? "bg-zinc-950 text-white border border-zinc-950 shadow-sm" 
                                                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                                        }`}
                                        onClick={() => changeTheme("light")}
                                    >
                                        Light Mode
                                    </button>
                                </div>
                            </div>

                            <button 
                                className="w-full px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold rounded-xl transition-all cursor-pointer text-xs"
                            >
                                Notifications
                            </button>
                            <button 
                                className="w-full px-4 py-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/40 font-bold rounded-xl transition-all cursor-pointer text-xs"
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
