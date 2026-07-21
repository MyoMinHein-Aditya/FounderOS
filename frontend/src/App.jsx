import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Startup from "./pages/Startup";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import AI from "./pages/AI";

// Protecting routes with authentication check

function AuthCheck({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
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