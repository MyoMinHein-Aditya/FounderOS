import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import api from "./api/axios";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Startup from "./pages/Startup";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import AI from "./pages/AI";


function AuthCheck({ children }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthorized(false);
      return;
    }
    
    api.get("/auth/me")
      .then(() => setAuthorized(true))
      .catch(() => {
        localStorage.removeItem("token");
        setAuthorized(false);
      });
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500">
        <div className="w-8 h-8 border-4 border-t-white border-zinc-800 rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse text-sm font-medium">Verifying access credentials...</p>
      </div>
    );
  }

  if (authorized === false) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App(){
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);
  return(
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
      </Routes>
    </BrowserRouter>
  )
}

export default App;