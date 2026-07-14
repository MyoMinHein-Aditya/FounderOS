import {useState} from "react";
import { Link } from "react-router-dom";
import api from "../api/axios"

// Authenticating user with email and password

function Login(){
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function login(){
        try {
            setLoading(true);
            const res = await api.post("/auth/login",{email,password});
            localStorage.setItem("token",res.data.access_token);
            window.location.href="/dashboard";
        } catch (err) {
            alert(err.response?.data?.detail || "Login Failed");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500 rounded-full mix-blend-screen blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen blur-3xl"></div>
            </div>
            
            <div className="glass-card p-8 md:p-12 max-w-md w-full relative z-10">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                        <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                            FounderOS
                        </span>
                        <span className="ml-2 text-3xl">🚀</span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-4">
                        Sign in to your startup command center
                    </p>
                </header>

                <div className="flex flex-col gap-4">
                    <input 
                        className="glass-input"
                        placeholder="Email Address" 
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <input 
                        className="glass-input"
                        placeholder="Password" 
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button 
                        className="btn-primary w-full mt-2 font-semibold text-lg" 
                        onClick={login}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800/60 text-center text-sm text-zinc-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                        Create Workspace
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login;