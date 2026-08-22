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

        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";
        const ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
            // For now, just add simple real-time push to alerts list
            try {
                const data = JSON.parse(event.data);
                if(data.message) {
                    setNotifications(prev => [{id: Date.now(), message: data.message}, ...prev]);
                }
            } catch (err) {
                // Not json or just echo
            }
        };

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

        function handleOpenNotifications() {
            setShowNotifications(true);
        }

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("open-notifications", handleOpenNotifications);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("open-notifications", handleOpenNotifications);
            ws.close();
        };
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
        { path: "/audit", label: "Audit Log" },
        { path: "/settings", label: "Settings" }
    ];

    const userInitials = user && user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "US";

    return (
        <>
            {/* Global Top Bar Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-30 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button 
                        id="sidebar-trigger"
                        onClick={() => setIsOpen(true)}
                        className="p-2 min-w-[44px] min-h-[44px] rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center justify-center text-lg border border-transparent aria-expanded={isOpen}"
                        aria-label="Open Sidebar"
                        aria-expanded={isOpen}
                    >
                        ☰
                    </button>
                    <span className="text-xl font-extrabold text-foreground font-heading tracking-tight">
                        FounderOS
                    </span>
                </div>
                
                <div className="flex items-center gap-2 relative" ref={notificationsRef}>
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 min-w-[44px] min-h-[44px] rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center justify-center border border-transparent"
                        title="Toggle Theme"
                        aria-label="Toggle Theme"
                    >
                        {theme === "dark" ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    
                    {/* Notification Bell Button */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 min-w-[44px] min-h-[44px] rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center justify-center border border-transparent"
                        title="Notifications"
                        aria-label="Notifications"
                        aria-expanded={showNotifications}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full flex items-center justify-center border border-background">
                            </span>
                        )}
                    </button>
                    
                    {/* Notification Dropdown Panel */}
                    {showNotifications && (
                        <div className="absolute top-14 right-0 w-80 p-4 rounded-xl bg-popover border border-border text-popover-foreground text-sm flex flex-col gap-2 shadow-lg z-50">
                            <div className="flex justify-between items-center pb-3 border-b border-border">
                                <span className="font-semibold">Alerts</span>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={markAllRead}
                                        className="text-xs text-muted-foreground hover:text-foreground cursor-pointer font-medium transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                                {notifications.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-6 text-sm">No new alerts</p>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="p-3 rounded-lg bg-muted border border-border text-foreground text-sm">
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
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar Drawer */}
            <aside 
                ref={sidebarRef}
                className={`fixed top-0 left-0 z-50 w-64 h-screen bg-background border-r border-border flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col">
                    <div className="flex items-center justify-between pb-6 border-b border-border mb-6 mt-1 flex-shrink-0">
                        <span className="text-2xl font-extrabold text-foreground font-heading tracking-tight">
                            FounderOS
                        </span>
                        <button 
                            className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer -mr-2 transition-colors"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close Sidebar"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <nav className="flex flex-col gap-1 mb-6">
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

                <div className="pt-6 border-t border-border flex flex-col gap-4 flex-shrink-0">
                    {user && (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                                {userInitials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                                <span className="text-xs text-muted-foreground truncate">Founder</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="px-2 mt-2">
                        <label className="text-xs text-muted-foreground mb-1 block">Workspace</label>
                        <select 
                            className="w-full bg-muted border border-border rounded text-sm p-2 text-foreground"
                            value={user?.current_workspace_id || 1}
                            onChange={async (e) => {
                                const newId = e.target.value;
                                try {
                                    await api.post(`/auth/workspace/${newId}`);
                                    window.location.reload();
                                } catch(err) {
                                    console.error(err);
                                }
                            }}
                        >
                            <option value={1}>Personal Workspace</option>
                            <option value={2}>Acme Corp</option>
                            <option value={3}>Global Ventures</option>
                        </select>
                    </div>
                    
                    <button 
                        className="nav-item justify-start w-full cursor-pointer mt-2" 
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