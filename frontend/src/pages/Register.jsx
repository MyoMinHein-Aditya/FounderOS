import {useState} from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";


function Register(){
    const[name,setName] = useState("");
    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("");
    const[role,setRole] = useState("founder");
    const [loading, setLoading] = useState(false);

    async function register(){
        try {
            setLoading(true);
            await api.post("/auth/register",{name,email,password,role});
            alert("Registration Successful. Please login.");
            window.location.href="/";
        } catch (err) {
            alert(err.response?.data?.detail || "Registration Failed");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
            <div className="minimal-card p-8 md:p-12 max-w-md w-full border border-border bg-background">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 font-heading">
                        <span className="text-foreground">
                            Create Workspace
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-3 font-medium">
                        Get started with FounderOS today
                    </p>
                </header>

                <div className="flex flex-col gap-4">
                    <select 
                        className="minimal-input bg-background"
                        value={role}
                        onChange={(e)=>setRole(e.target.value)}
                        disabled={loading}
                    >
                        <option value="founder">I am a Founder</option>
                        <option value="investor">I am an Investor</option>
                    </select>
                    <input 
                        className="minimal-input"
                        placeholder="Full Name" 
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        disabled={loading}
                    />
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
                        onClick={register}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Workspace"}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-900 text-center text-sm text-muted-foreground">
                    Already have a workspace?{" "}
                    <Link to="/" className="text-foreground hover:text-muted-foreground font-semibold underline underline-offset-4 transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Register;