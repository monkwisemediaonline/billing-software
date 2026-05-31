"use client";

import { useEffect, useState } from "react";
import { Save, Building2 } from "lucide-react";

type Settings = { id: string; business_name: string; address: string; phone: string; email: string };

const inp: React.CSSProperties = { background:"rgba(255,255,255,0.8)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"12px", padding:"14px 16px", outline:"none", width:"100%", color:"#1a0a2e", fontSize:"14px", boxSizing:"border-box" };
const txt = (o: number) => `rgba(26,10,46,${o})`;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [businessName, setBusinessName] = useState(""); const [address, setAddress] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); const [saved, setSaved] = useState(false);

  async function getSupabase() {
    try { const m = await import("@/lib/client"); return m.createClient(); }
    catch { const m = await import("@/lib/supabase"); return m.supabase; }
  }

  useEffect(() => {
    getSupabase().then(s => s.from("settings").select("*").single().then(({ data }) => {
      if (data) { setSettings(data); setBusinessName(data.business_name||""); setAddress(data.address||""); setPhone(data.phone||""); setEmail(data.email||""); }
    }));
  }, []);

  async function saveSettings() {
    if (!businessName) { alert("Business name is required"); return; }
    setLoading(true);
    const s = await getSupabase();
    const { error } = await s.from("settings").update({ business_name: businessName, address, phone, email }).eq("id", settings?.id);
    setLoading(false);
    if (error) { alert("Failed: " + error.message); return; }
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation: fadeUp 0.4s ease both; }
        input:focus, textarea:focus { border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1) !important; }
      `}</style>

      <div className="fade" style={{ marginBottom:"32px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:"800", margin:0, background:"linear-gradient(90deg,#d946ef,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>Settings</h1>
        <p style={{ color:txt(0.45), fontSize:"14px", margin:"4px 0 0" }}>Your business details appear on all invoices</p>
      </div>

      <div className="fade" style={{ maxWidth:"600px", background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", padding:"32px", animationDelay:"0.05s" }}>
        <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"linear-gradient(135deg,#d946ef,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px", boxShadow:"0 4px 15px rgba(217,70,239,0.35)" }}>
          <Building2 size={24} color="white" />
        </div>
        <h2 style={{ fontSize:"17px", fontWeight:"700", color:txt(0.9), margin:"0 0 24px" }}>Business Information</h2>

        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {[
            { label:"Business Name *", value:businessName, setter:setBusinessName, type:"text", placeholder:"e.g. Sharma Traders" },
            { label:"Phone", value:phone, setter:setPhone, type:"text", placeholder:"e.g. +91 98765 43210" },
            { label:"Email", value:email, setter:setEmail, type:"email", placeholder:"e.g. business@email.com" },
          ].map(field => (
            <div key={field.label}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:"700", color:txt(0.55), marginBottom:"8px", letterSpacing:"0.04em" }}>{field.label}</label>
              <input type={field.type} style={inp} placeholder={field.placeholder} value={field.value} onChange={e => field.setter(e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{ display:"block", fontSize:"12px", fontWeight:"700", color:txt(0.55), marginBottom:"8px", letterSpacing:"0.04em" }}>Address</label>
            <textarea rows={3} style={{...inp, resize:"none", fontFamily:"inherit"}} placeholder="e.g. 123 Main Street, Ludhiana, Punjab" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop:"24px", display:"flex", alignItems:"center", gap:"16px" }}>
          <button onClick={saveSettings} disabled={loading} style={{ background:"linear-gradient(135deg,#d946ef,#8b5cf6)", color:"white", borderRadius:"12px", padding:"12px 24px", fontWeight:"700", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", boxShadow:"0 4px 15px rgba(217,70,239,0.3)", opacity: loading ? 0.7 : 1 }}>
            <Save size={18} /> {loading ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span style={{ color:"#059669", fontWeight:"600", fontSize:"14px", display:"flex", alignItems:"center", gap:"6px" }}>✓ Saved successfully!</span>}
        </div>
      </div>
    </div>
  );
}