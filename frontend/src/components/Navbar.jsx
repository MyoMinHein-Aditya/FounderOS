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
        try {
            const res = await api.get("/auth/me");
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
                if (triggerButton && triggerButton.contains(event.target)) return;
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/startup", label: "Startups" },
        { path: "/goal", label: "Goals" },
        { path: "/task", label: "Tasks" },
        { path: "/ai", label: "AI Assistant" },
        { path: "/settings", label: "Settings" }
    ];

    const userInitials = user && user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "US";

    return (
        <>
            <button 
                id="sidebar-trigger"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer flex items-center justify-center"
                aria-label="Toggle Sidebar"
            >
                <span className="text-xl">☰</span>
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-30 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <aside 
                ref={sidebarRef}
                className={`fixed top-0 left-0 z-40 w-64 h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    <div className="flex items-center justify-between pb-6 border-b border-zinc-900 mb-6">
                        <span className="text-2xl font-extrabold text-gradient font-heading tracking-tight">
                            FounderOS
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
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-white text-zinc-950 border-l-4 border-white pl-3' 
                                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto pt-6 border-t border-zinc-900 flex flex-col gap-4">
                    {user && (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-zinc-200 to-zinc-400 flex items-center justify-center text-zinc-950 font-bold text-sm">
                                {userInitials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-zinc-200 truncate">{user.name}</span>
                                <span className="text-xs text-zinc-500 truncate">Founder</span>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-all duration-200 cursor-pointer" 
                        onClick={logout}
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Navbar;