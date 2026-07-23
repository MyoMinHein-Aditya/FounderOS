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
    const notificationsRef = useRef(null);
    
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
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
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
        { path: "/kanban", label: "Kanban Board" },
        { path: "/notes", label: "Notes" },
        { path: "/documents", label: "Documents" },
        { path: "/calendar", label: "Calendar" },
        { path: "/financials", label: "Financials" },
        { path: "/crm", label: "CRM Pipeline" },
        { path: "/whiteboard", label: "Whiteboard" },
        { path: "/team", label: "Team" },
        { path: "/ai", label: "AI Assistant" },
        { path: "/settings", label: "Settings" }
    ];

    const userInitials = user && user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "US";

    return (
        <>
            {/* Global Top Bar Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-canvas)] border-b border-[var(--border)] z-30 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button 
                        id="sidebar-trigger"
                        onClick={() => setIsOpen(true)}
                        className="p-2 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center text-lg border border-transparent"
                        aria-label="Open Sidebar"
                    >
                        ☰
                    </button>
                    <span className="text-xl font-extrabold text-gradient font-heading tracking-tight">
                        FounderOS
                    </span>
                </div>
                
                <div className="flex items-center gap-4 relative" ref={notificationsRef}>
                    {/* Theme Toggle Button using Sun / Moon icons */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center text-base border border-transparent"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                    
                    {/* Notification Bell Button */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-xl hover:bg-[var(--surface-strong)] text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center text-base border border-transparent"
                        title="Notifications"
                    >
                        🔔
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center border border-[var(--bg-canvas)]">
                            </span>
                        )}
                    </button>
                    
                    {/* Notification Dropdown Panel */}
                    {showNotifications && (
                        <div className="absolute top-12 right-0 w-80 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs flex flex-col gap-2 shadow-2xl z-50">
                            <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                                <span className="font-bold text-[var(--text-primary)]">Alerts</span>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={markAllRead}
                                        className="text-[10px] text-[var(--text-primary)] hover:underline cursor-pointer font-bold"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                                {notifications.length === 0 ? (
                                    <p className="text-[var(--text-muted)] text-center py-4">No new alerts</p>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="p-2.5 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)] text-[var(--text-secondary)]">
                                            {n.message}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Sidebar Drawer Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar Drawer */}
            <aside 
                ref={sidebarRef}
                className={`fixed top-0 left-0 z-50 w-64 h-screen bg-[var(--bg-canvas)] border-r border-[var(--border)] flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col">
                    <div className="flex items-center justify-between pb-6 border-b border-[var(--border)] mb-6 mt-1 flex-shrink-0">
                        <span className="text-2xl font-extrabold text-gradient font-heading tracking-tight">
                            FounderOS
                        </span>
                        <button 
                            className="text-zinc-500 hover:text-zinc-300 text-lg cursor-pointer ml-1"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <nav className="flex flex-col gap-1.5 mb-6">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link 
                                    key={item.path} 
                                    to={item.path} 
                                    onClick={() => setIsOpen(false)}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex flex-col gap-4 flex-shrink-0 bg-transparent">
                    {user && (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-zinc-200 to-zinc-400 flex items-center justify-center text-zinc-950 font-bold text-sm">
                                {userInitials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.name}</span>
                                <span className="text-xs text-[var(--text-muted)] truncate">Founder</span>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        className="nav-item w-full cursor-pointer" 
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