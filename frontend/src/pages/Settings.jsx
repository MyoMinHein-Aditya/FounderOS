import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

function Settings(){
    const [user, setUser] = useState(null);
    const { theme, setTheme } = useTheme();

    async function loadUser(){
        try {
            const res = await api.get("/auth/me");
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
    }

    function logout(){
        localStorage.removeItem("token");
        window.location.href="/";
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        Settings
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Manage your account and workspace preferences.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="minimal-card p-6 md:p-8 lg:col-span-2">
                        <h2 className="text-lg font-bold text-foreground font-heading mb-6">Account Information</h2>
                        {user && (
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-muted rounded-xl border border-border">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Name</p>
                                    <p className="text-lg font-semibold text-foreground">{user.name}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-xl border border-border">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Email</p>
                                    <p className="text-lg font-semibold text-foreground">{user.email}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-xl border border-border">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">User ID</p>
                                    <p className="text-sm font-mono text-muted-foreground">{user.id}</p>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="minimal-card p-6 md:p-8 h-fit">
                        <h2 className="text-lg font-bold text-foreground font-heading mb-6">Workspace</h2>
                        <div className="flex flex-col gap-4">
                            <div className="p-4 bg-muted rounded-xl border border-border text-center">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Current Workspace</p>
                                <p className="text-lg font-bold text-foreground font-heading">FounderOS</p>
                            </div>

                            <div className="p-4 bg-muted rounded-xl border border-border flex flex-col gap-3">
                                <p className="text-xs font-semibold text-muted-foreground">Theme Settings</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            theme === "dark" 
                                                ? "bg-white text-zinc-950 border border-white shadow-sm" 
                                                : "bg-muted text-muted-foreground border border-border hover:text-foreground"
                                        }`}
                                        onClick={() => changeTheme("dark")}
                                    >
                                        Dark Mode
                                    </button>
                                    <button 
                                        className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            theme === "light" 
                                                ? "bg-background text-foreground border border-zinc-950 shadow-sm" 
                                                : "bg-muted text-muted-foreground border border-border hover:text-foreground"
                                        }`}
                                        onClick={() => changeTheme("light")}
                                    >
                                        Light Mode
                                    </button>
                                </div>
                            </div>

                            <button 
                                className="w-full px-4 py-2.5 bg-muted hover:bg-secondary text-muted-foreground border border-border font-semibold rounded-xl transition-all cursor-pointer text-xs"
                                onClick={() => window.dispatchEvent(new Event("open-notifications"))}
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
