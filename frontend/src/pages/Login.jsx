import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import api from "../api/axios";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const res = await api.post("/auth/login", credentials);
            return res.data;
        },
        onSuccess: async (data) => {
            localStorage.setItem("token", data.access_token);
            const userRes = await api.get("/auth/me");
            if (userRes.data.role === "investor") {
                window.location.href = "/investor";
            } else {
                window.location.href = "/dashboard";
            }
        },
        onError: (err) => {
            alert(err.response?.data?.detail || "Login Failed");
        }
    });

    function login() {
        try {
            const credentials = { email, password };
            loginSchema.parse(credentials);
            loginMutation.mutate(credentials);
        } catch (err) {
            if (err instanceof z.ZodError) {
                alert(err.errors[0].message);
            }
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
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loginMutation.isPending}
                    />
                    <input
                        className="minimal-input"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loginMutation.isPending}
                    />
                    <button
                        className="btn-primary w-full mt-2 font-bold text-base"
                        onClick={login}
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
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
    );
}

export default Login;