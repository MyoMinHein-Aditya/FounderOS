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
        <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
            <div className="minimal-card p-8 md:p-12 max-w-md w-full border border-border bg-background">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        <span className="text-foreground">
                            FounderOS
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-3 font-medium">
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

                <div className="mt-8 pt-6 border-t border-zinc-900 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-foreground hover:text-muted-foreground font-semibold underline underline-offset-4 transition-colors">
                        Create Workspace
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login;