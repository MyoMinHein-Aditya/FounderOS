import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

function Navbar(){
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef(null);
    
    function logout(){
        localStorage.removeItem("token");
        window.location.href="/";
    }

    async function loadUser() {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadUser();

        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                const triggerButton = document.getElementById("sidebar-trigger");
                if (triggerButton && triggerButton.contains(event.target)) {
                    return;
                }
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/startup", label: "Startups", icon: "🚀" },
        { path: "/goal", label: "Goals", icon: "🎯" },
        { path: "/task", label: "Tasks", icon: "📋" },
        { path: "/ai", label: "AI Assistant", icon: "✨" },
        { path: "/settings", label: "Settings", icon: "⚙️" }
    ];

    const userInitials = user && user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "US";

    return (
        <>
            <button 
                id="sidebar-trigger"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-zinc-900/90 backdrop-blur border border-zinc-800/80 text-zinc-200 hover:text-zinc-100 hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center shadow-lg"
                aria-label="Toggle Sidebar"
            >
                <span className="text-xl">☰</span>
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <aside 
                ref={sidebarRef}
                className={`fixed top-0 left-0 z-40 w-64 h-screen bg-zinc-950 border-r border-zinc-900/80 flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    <div className="flex items-center justify-between pb-6 border-b border-zinc-900 mb-6">
                        <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            FounderOS 🚀
                        </span>
                        <button 
                            className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <nav className="flex flex-col gap-1.5">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link 
                                    key={item.path} 
                                    to={item.path} 
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-violet-600/10 text-violet-400 border-l-2 border-violet-500 rounded-l-none pl-3' 
                                            : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                                    }`}
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto pt-6 border-t border-zinc-900 flex flex-col gap-4">
                    {user && (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-violet-500/10">
                                {userInitials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-zinc-200 truncate">{user.name}</span>
                                <span className="text-xs text-zinc-500 truncate">Founder</span>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        className="flex items-center gap-3 px-4 py-3 w-100 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer" 
                        onClick={logout}
                    >
                        <span className="text-base">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Navbar;