import {useState} from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";


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
        <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 py-12">
            <div className="minimal-card p-8 md:p-12 max-w-md w-full border border-zinc-800 bg-zinc-950">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        <span className="text-gradient">
                            FounderOS
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-3 font-medium">
                        Sign in to your startup command center
                    </p>
                </header>

                <div className="flex flex-col gap-4">
                    <input 
                        className="minimal-input"
                        placeholder="Email Address" 
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <input 
                        className="minimal-input"
                        placeholder="Password" 
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button 
                        className="btn-primary w-full mt-2 font-bold text-base" 
                        onClick={login}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-900 text-center text-sm text-zinc-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-white hover:text-zinc-300 font-semibold underline underline-offset-4 transition-colors">
                        Create Workspace
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login;