"use client";
import { useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleLogin = async () => {
    if (!email || !password) { alert("Please enter email and password"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { alert(error.message); return; }
    router.push("/dashboard");
  };

  const handleSignup = async () => {
    if (!email || !password) { alert("Please enter email and password"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { alert(error.message); return; }
    alert("Account created! You can now log in.");
    setMode("login");
  };

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(139,92,246,0.25)",
    background: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    color: "#1a0a2e",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0520 0%, #1a0535 40%, #0d1545 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade { animation: fadeUp 0.6s ease both; }
        .inp:focus { border-color: rgba(168,85,247,0.6) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(217,70,239,0.5) !important; }
        .btn-primary:active { transform: translateY(0); }
        .toggle-btn:hover { color: #d946ef !important; }
      `}</style>

      {/* Animated background orbs */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle, rgba(217,70,239,0.15) 0%, transparent 70%)", animation:"pulse 6s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:"-10%", right:"-5%", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", animation:"pulse 8s ease-in-out infinite 2s" }} />
        <div style={{ position:"absolute", top:"40%", left:"60%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", animation:"pulse 5s ease-in-out infinite 1s" }} />
        {/* Grid lines */}
        <svg width="100%" height="100%" style={{ opacity:0.04 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Card */}
      <div className="fade" style={{
        width: "100%",
        maxWidth: "440px",
        margin: "24px",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: "28px",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        padding: "48px 40px",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Logo */}
        <div className="fade" style={{ textAlign:"center", marginBottom:"32px", animationDelay:"0.1s" }}>
          <div style={{ animation:"float 4s ease-in-out infinite", display:"inline-block" }}>
            <Image
              src="/qubrix.png"
              alt="Qubrix"
              width={180}
              height={60}
              style={{ objectFit:"contain", filter:"brightness(1.1)" }}
            />
          </div>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"13px", margin:"12px 0 0", letterSpacing:"0.04em" }}>
            Business Billing Suite
          </p>
        </div>

        {/* Title */}
        <div className="fade" style={{ marginBottom:"28px", animationDelay:"0.15s" }}>
          <h2 style={{
            fontSize:"22px", fontWeight:"800", color:"white",
            margin:"0 0 6px", letterSpacing:"-0.02em",
          }}>
            {mode === "login" ? "Welcome back 👋" : "Create account"}
          </h2>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 }}>
            {mode === "login" ? "Sign in to your Qubrix account" : "Start managing your business"}
          </p>
        </div>

        {/* Form */}
        <div className="fade" style={{ display:"flex", flexDirection:"column", gap:"14px", animationDelay:"0.2s" }}>
          <div>
            <label style={{ display:"block", fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.5)", marginBottom:"8px", letterSpacing:"0.06em" }}>
              EMAIL ADDRESS
            </label>
            <input
              className="inp"
              type="email"
              placeholder="you@example.com"
              style={inp}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.5)", marginBottom:"8px", letterSpacing:"0.06em" }}>
              PASSWORD
            </label>
            <input
              className="inp"
              type="password"
              placeholder="••••••••"
              style={inp}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())}
            />
          </div>

          <button
            className="btn-primary"
            onClick={mode === "login" ? handleLogin : handleSignup}
            disabled={loading}
            style={{
              marginTop:"8px",
              width:"100%",
              padding:"15px",
              borderRadius:"14px",
              background: loading ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #d946ef, #8b5cf6, #3b82f6)",
              color:"white",
              fontWeight:"800",
              fontSize:"15px",
              border:"none",
              cursor: loading ? "not-allowed" : "pointer",
              transition:"all 0.2s ease",
              boxShadow:"0 4px 20px rgba(217,70,239,0.35)",
              letterSpacing:"0.01em",
            }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>

        {/* Divider */}
        <div className="fade" style={{ display:"flex", alignItems:"center", gap:"12px", margin:"24px 0", animationDelay:"0.25s" }}>
          <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.08)" }} />
          <span style={{ color:"rgba(255,255,255,0.25)", fontSize:"12px" }}>OR</span>
          <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.08)" }} />
        </div>

        {/* Toggle */}
        <div className="fade" style={{ textAlign:"center", animationDelay:"0.3s" }}>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            className="toggle-btn"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{
              background:"none", border:"none", cursor:"pointer",
              color:"#a855f7", fontWeight:"700", fontSize:"14px",
              transition:"color 0.2s",
            }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>

        {/* Bottom glow */}
        <div style={{
          position:"absolute", bottom:"-1px", left:"20%", right:"20%",
          height:"2px", borderRadius:"999px",
          background:"linear-gradient(90deg, transparent, #d946ef, #8b5cf6, transparent)",
        }} />
      </div>
    </div>
  );
}