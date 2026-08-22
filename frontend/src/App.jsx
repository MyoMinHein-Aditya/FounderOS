import { useEffect, useState, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import api from "./api/axios";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Startup from "./pages/Startup";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import AI from "./pages/AI";
import Notes from "./pages/Notes";
import Documents from "./pages/Documents";
import CalendarView from "./pages/CalendarView";
import Team from "./pages/Team";
import Kanban from "./pages/Kanban";
import Financials from "./pages/Financials";
import CRM from "./pages/CRM";
import Whiteboard from "./pages/Whiteboard";
import Investor from "./pages/Investor";
import AuditLog from "./pages/AuditLog";

const BrainOverlay = import.meta.env.DEV ? lazy(() => import("../devtools/brain/BrainOverlay")) : () => null;

// Protecting routes with authentication check

import { useQuery } from '@tanstack/react-query';

function AuthCheck({ children }) {
  const { isLoading, isError, isSuccess } = useQuery({
    queryKey: ['authMe'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      try {
        await api.get("/auth/me");
        return true;
      } catch (error) {
        localStorage.removeItem("token");
        throw error;
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <div className="w-8 h-8 border-4 border-t-white border-border rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse text-sm font-medium">Verifying access credentials...</p>
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/" replace />;
  }

  return isSuccess ? children : null;
}

function App(){
  return(
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/dashboard" element={<AuthCheck><Dashboard/></AuthCheck>}/>
            <Route path="/startup" element={<AuthCheck><Startup/></AuthCheck>}/>
            <Route path="/goal" element={<AuthCheck><Goals/></AuthCheck>}/>
            <Route path="/task" element={<AuthCheck><Tasks/></AuthCheck>}/>
            <Route path="/settings" element={<AuthCheck><Settings/></AuthCheck>}/>
            <Route path="/ai" element={<AuthCheck><AI/></AuthCheck>}/>
            <Route path="/notes" element={<AuthCheck><Notes/></AuthCheck>}/>
            <Route path="/documents" element={<AuthCheck><Documents/></AuthCheck>}/>
            <Route path="/calendar" element={<AuthCheck><CalendarView/></AuthCheck>}/>
            <Route path="/team" element={<AuthCheck><Team/></AuthCheck>}/>
            <Route path="/kanban" element={<AuthCheck><Kanban/></AuthCheck>}/>
            <Route path="/financials" element={<AuthCheck><Financials/></AuthCheck>}/>
            <Route path="/crm" element={<AuthCheck><CRM/></AuthCheck>}/>
            <Route path="/whiteboard" element={<AuthCheck><Whiteboard/></AuthCheck>}/>
            <Route path="/investor" element={<AuthCheck><Investor/></AuthCheck>}/>
            <Route path="/audit" element={<AuthCheck><AuditLog/></AuthCheck>}/>
          </Routes>
          <Suspense fallback={null}>
            {import.meta.env.DEV && <BrainOverlay />}
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App;