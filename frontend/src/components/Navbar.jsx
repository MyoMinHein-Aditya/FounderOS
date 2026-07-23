import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function Navbar(){
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
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

    async function loadNotifications() {
        try {
            const res = await api.get("/notifications/get_unread");
            setNotifications(res.data);
        } catch (err) {
            // Silence if endpoint not yet loaded
        }
    }

    async function markAllRead() {
        try {
            await api.post("/notifications/read_all");
            setNotifications([]);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadUser();
        loadNotifications();

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
        { path: "/notes", label: "Notes" },
        { path: "/documents", label: "Documents" },
        { path: "/calendar", label: "Calendar" },
        { path: "/team", label: "Team" },
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
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={toggleTheme}
                                className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                                title="Toggle Theme"
                            >
                                {theme === "dark" ? "Light" : "Dark"}
                            </button>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative px-2 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                                title="Notifications"
                            >
                                Alerts
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white text-zinc-950 text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>
                            <button 
                                className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer ml-1"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {showNotifications && (
                        <div className="mb-6 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs flex flex-col gap-2">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                                <span className="font-bold text-zinc-200">Alerts</span>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={markAllRead}
                                        className="text-[10px] text-white hover:underline cursor-pointer font-bold"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
                                {notifications.length === 0 ? (
                                    <p className="text-zinc-500 text-center py-2">No new alerts</p>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="p-2 rounded bg-zinc-950 border border-zinc-900 text-zinc-300">
                                            {n.message}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    
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