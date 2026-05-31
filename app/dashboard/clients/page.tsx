"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Trash2, UserPlus } from "lucide-react";

type Client = { id: string; name: string; phone: string; email: string; address: string };

const inp: React.CSSProperties = { background:"rgba(255,255,255,0.8)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"12px", padding:"14px 16px", outline:"none", width:"100%", color:"#1a0a2e", fontSize:"14px", boxSizing:"border-box" };
const txt = (o: number) => `rgba(26,10,46,${o})`;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState(""); const [address, setAddress] = useState("");

  async function getSupabase() {
    try { const m = await import("@/lib/client"); return m.createClient(); }
    catch { const m = await import("@/lib/supabase"); return m.supabase; }
  }

  async function fetchClients() {
    const s = await getSupabase();
    const { data } = await s.from("clients").select("*").order("created_at", { ascending: false });
    if (data) setClients(data);
  }

  useEffect(() => { fetchClients(); }, []);

  async function addClient() {
    if (!name) { alert("Client name is required"); return; }
    const s = await getSupabase();
    const { error } = await s.from("clients").insert([{ name, phone, email, address }]);
    if (error) { alert(error.message); return; }
    setName(""); setPhone(""); setEmail(""); setAddress("");
    fetchClients();
  }

  async function deleteClient(id: string) {
    if (!confirm("Delete this client?")) return;
    const s = await getSupabase();
    await s.from("clients").delete().eq("id", id);
    fetchClients();
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation: fadeUp 0.4s ease both; }
        input:focus, select:focus { border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1) !important; }
        .row-hover:hover { background: rgba(139,92,246,0.04) !important; }
        .view-btn:hover { background: rgba(139,92,246,0.15) !important; }
        .del-btn:hover { background: rgba(239,68,68,0.15) !important; }
      `}</style>

      {/* Header */}
      <div className="fade" style={{ marginBottom:"32px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:"800", margin:0, background:"linear-gradient(90deg,#d946ef,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>Clients</h1>
        <p style={{ color:txt(0.45), fontSize:"14px", margin:"4px 0 0" }}>Manage your clients</p>
      </div>

      {/* Add Form */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", padding:"24px", marginBottom:"24px", animationDelay:"0.05s" }}>
        <h2 style={{ fontSize:"15px", fontWeight:"700", color:txt(0.8), margin:"0 0 16px" }}>Add New Client</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
          <input style={inp} placeholder="Client Name *" value={name} onChange={e => setName(e.target.value)} />
          <input style={inp} placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
          <input style={inp} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={inp} placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <button onClick={addClient} style={{ marginTop:"16px", background:"linear-gradient(135deg,#d946ef,#8b5cf6)", color:"white", borderRadius:"12px", padding:"12px 22px", fontWeight:"700", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", boxShadow:"0 4px 15px rgba(217,70,239,0.3)" }}>
          <UserPlus size={18} /> Add Client
        </button>
      </div>

      {/* Table */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", overflow:"hidden", animationDelay:"0.1s" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(139,92,246,0.05)" }}>
              {["Name","Phone","Email","Address","Actions"].map(h => (
                <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), borderBottom:"1px solid rgba(139,92,246,0.08)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr key={c.id} className="row-hover" style={{ borderBottom: i < clients.length-1 ? "1px solid rgba(139,92,246,0.06)" : "none" }}>
                <td style={{ padding:"16px 20px", fontWeight:"700", color:txt(0.9), fontSize:"14px" }}>{c.name}</td>
                <td style={{ padding:"16px 20px", color:txt(0.6), fontSize:"13px" }}>{c.phone || "—"}</td>
                <td style={{ padding:"16px 20px", color:txt(0.6), fontSize:"13px" }}>{c.email || "—"}</td>
                <td style={{ padding:"16px 20px", color:txt(0.6), fontSize:"13px" }}>{c.address || "—"}</td>
                <td style={{ padding:"16px 20px" }}>
                  <div style={{ display:"flex", gap:"8px" }}>
                    <Link href={`/dashboard/clients/${c.id}`} className="view-btn" style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", color:"#8b5cf6", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"6px", textDecoration:"none", transition:"background 0.15s" }}>
                      <Eye size={14} /> View
                    </Link>
                    <button onClick={() => deleteClient(c.id)} className="del-btn" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", color:"#dc2626", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"6px", cursor:"pointer", transition:"background 0.15s" }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <div style={{ padding:"48px", textAlign:"center", color:txt(0.3), fontSize:"14px" }}>No clients yet</div>}
      </div>
    </div>
  );
}