"use client";
import { useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

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
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: "1px solid rgba(139,92,246,0.25)", background: "rgba(255,255,255,0.08)",
    fontSize: "14px", color: "white", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  const stats = [
    { value: "10K+", label: "Invoices Generated" },
    { value: "500+", label: "Businesses Trust Us" },
    { value: "99.9%", label: "Uptime Guaranteed" },
  ];

  const features = [
    { icon: "📄", title: "Smart Invoicing", desc: "Create and send professional invoices in seconds" },
    { icon: "💰", title: "Payment Tracking", desc: "Track payments and outstanding dues in real time" },
    { icon: "📊", title: "Business Insights", desc: "Powerful dashboard with financial analytics" },
    { icon: "🏦", title: "Account Management", desc: "Manage multiple accounts and EMIs effortlessly" },
  ];

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'DM Sans', sans-serif",
      background: "#0f0520",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.08)} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .fade { animation: fadeUp 0.5s ease both; }
        .inp:focus { border-color: rgba(168,85,247,0.7) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important; background: rgba(255,255,255,0.12) !important; }
        .inp::placeholder { color: rgba(255,255,255,0.25); }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(217,70,239,0.5) !important; }
        .feature-card:hover { background: rgba(255,255,255,0.08) !important; transform: translateX(4px); }
      `}</style>

      {/* LEFT PANEL */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0f0520 0%, #1a0535 50%, #0d1545 100%)",
      }}>
        {/* Background orbs */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-100px", left:"-100px", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle, rgba(217,70,239,0.18) 0%, transparent 65%)", animation:"pulse 7s ease-in-out infinite" }} />
          <div style={{ position:"absolute", bottom:"-80px", right:"-80px", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)", animation:"pulse 9s ease-in-out infinite 2s" }} />
          <div style={{ position:"absolute", top:"50%", left:"40%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)", animation:"pulse 6s ease-in-out infinite 1s" }} />
          {/* Grid */}
          <svg width="100%" height="100%" style={{ opacity:0.05, position:"absolute", inset:0 }}>
            <defs><pattern id="g" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
          </svg>
        </div>

        {/* Logo top */}
        <div className="fade" style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            {/* Qubrix icon mark */}
            <div style={{ animation:"float 4s ease-in-out infinite" }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <defs>
                  <linearGradient id="qg1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00d4ff"/>
                    <stop offset="100%" stopColor="#7c3aed"/>
                  </linearGradient>
                  <linearGradient id="qg2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7c3aed"/>
                    <stop offset="100%" stopColor="#4f46e5"/>
                  </linearGradient>
                </defs>
                <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill="none" stroke="url(#qg1)" strokeWidth="2.5"/>
                <polygon points="22,10 34,17 34,31 22,38 10,31 10,17" fill="none" stroke="url(#qg2)" strokeWidth="1.5" opacity="0.6"/>
                <rect x="17" y="17" width="10" height="10" rx="2" fill="url(#qg1)"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: "26px", fontWeight: "800", letterSpacing: "-0.03em",
                background: "linear-gradient(90deg, #ffffff, #c084fc, #60a5fa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Qubrix</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: "600", marginTop: "-2px" }}>BILLING SUITE</div>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div className="fade" style={{ animationDelay:"0.1s", marginBottom:"40px" }}>
            <h1 style={{
              fontSize: "42px", fontWeight: "800", color: "white",
              margin: "0 0 16px", lineHeight: "1.15", letterSpacing: "-0.03em",
            }}>
              Run your business<br />
              <span style={{
                background: "linear-gradient(90deg, #d946ef, #a855f7, #60a5fa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>smarter & faster</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", lineHeight: "1.7", margin: 0, maxWidth: "380px" }}>
              Everything you need to manage invoices, track payments, handle expenses and grow your business — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="fade" style={{ display:"flex", flexDirection:"column", gap:"10px", animationDelay:"0.2s" }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{
                display:"flex", alignItems:"center", gap:"14px",
                padding:"14px 16px", borderRadius:"14px",
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.06)",
                transition:"all 0.2s ease", cursor:"default",
              }}>
                <div style={{
                  width:"40px", height:"40px", borderRadius:"11px", flexShrink:0,
                  background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.25)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px",
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize:"13px", fontWeight:"700", color:"rgba(255,255,255,0.9)", marginBottom:"2px" }}>{f.title}</div>
                  <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bottom */}
        <div className="fade" style={{ display:"flex", gap:"32px", position:"relative", zIndex:1, animationDelay:"0.3s" }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{
                fontSize:"22px", fontWeight:"800", fontFamily:"'Space Mono',monospace",
                background:"linear-gradient(90deg,#d946ef,#a855f7)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>{s.value}</div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px", fontWeight:"500" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div style={{
        width: "480px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 40px",
        background: "rgba(255,255,255,0.03)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
      }}>
        <div style={{ width:"100%", maxWidth:"380px" }}>

          {/* Form header */}
          <div className="fade" style={{ marginBottom:"32px", animationDelay:"0.15s" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:"8px",
              background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)",
              borderRadius:"999px", padding:"6px 14px", marginBottom:"20px",
            }}>
              <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#a855f7" }} />
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.6)", fontWeight:"600", letterSpacing:"0.05em" }}>
                {mode === "login" ? "SECURE LOGIN" : "CREATE ACCOUNT"}
              </span>
            </div>
            <h2 style={{ fontSize:"26px", fontWeight:"800", color:"white", margin:"0 0 8px", letterSpacing:"-0.02em" }}>
              {mode === "login" ? "Sign in to Qubrix" : "Join Qubrix"}
            </h2>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"14px", margin:0 }}>
              {mode === "login" ? "Enter your credentials to access your dashboard" : "Create your account and start managing your business"}
            </p>
          </div>

          {/* Inputs */}
          <div className="fade" style={{ display:"flex", flexDirection:"column", gap:"16px", animationDelay:"0.2s" }}>
            <div>
              <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", marginBottom:"8px", letterSpacing:"0.08em" }}>EMAIL ADDRESS</label>
              <input className="inp" type="email" placeholder="you@example.com" style={inp}
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", marginBottom:"8px", letterSpacing:"0.08em" }}>PASSWORD</label>
              <input className="inp" type="password" placeholder="••••••••" style={inp}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} />
            </div>

            <button className="btn-main" onClick={mode === "login" ? handleLogin : handleSignup}
              disabled={loading} style={{
                marginTop:"8px", width:"100%", padding:"15px", borderRadius:"14px",
                background: loading ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg, #d946ef 0%, #8b5cf6 50%, #3b82f6 100%)",
                color:"white", fontWeight:"800", fontSize:"15px", border:"none",
                cursor: loading ? "not-allowed" : "pointer",
                transition:"all 0.25s ease",
                boxShadow:"0 4px 20px rgba(217,70,239,0.3)",
                letterSpacing:"0.01em",
              }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </div>

          {/* Divider */}
          <div className="fade" style={{ display:"flex", alignItems:"center", gap:"12px", margin:"24px 0", animationDelay:"0.25s" }}>
            <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.07)" }} />
            <span style={{ color:"rgba(255,255,255,0.2)", fontSize:"12px" }}>OR</span>
            <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.07)" }} />
          </div>

          {/* Toggle */}
          <div className="fade" style={{ textAlign:"center", animationDelay:"0.3s" }}>
            <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"14px" }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{
              background:"none", border:"none", cursor:"pointer",
              color:"#a855f7", fontWeight:"700", fontSize:"14px",
            }}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </div>

          {/* Bottom note */}
          <div className="fade" style={{ marginTop:"32px", padding:"16px", borderRadius:"12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", animationDelay:"0.35s" }}>
            <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)", margin:0, textAlign:"center", lineHeight:"1.6" }}>
              By signing in, you agree to Qubrix's Terms of Service and Privacy Policy. Your data is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}