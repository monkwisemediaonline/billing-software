"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Trash2, Landmark } from "lucide-react";
import { createClient } from "@/lib/client";

type Account = { id: string; name: string; type: string; balance: number };

const inp: React.CSSProperties = { background:"rgba(255,255,255,0.8)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"12px", padding:"14px 16px", outline:"none", width:"100%", color:"#1a0a2e", fontSize:"14px", boxSizing:"border-box" };
const txt = (o: number) => `rgba(26,10,46,${o})`;

const cardColors = [
  { grad:"linear-gradient(135deg,#d946ef,#a21caf)", glow:"rgba(217,70,239,0.25)" },
  { grad:"linear-gradient(135deg,#8b5cf6,#5b21b6)", glow:"rgba(139,92,246,0.25)" },
  { grad:"linear-gradient(135deg,#ec4899,#9d174d)", glow:"rgba(236,72,153,0.25)" },
  { grad:"linear-gradient(135deg,#f43f5e,#be123c)", glow:"rgba(244,63,94,0.25)" },
  { grad:"linear-gradient(135deg,#06b6d4,#0891b2)", glow:"rgba(6,182,212,0.25)" },
  { grad:"linear-gradient(135deg,#34d399,#059669)", glow:"rgba(52,211,153,0.25)" },
];

export default function AccountsPage() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState(""); const [type, setType] = useState(""); const [balance, setBalance] = useState("");

  async function fetchAccounts() {
    const { data } = await supabase.from("accounts").select("*").order("created_at", { ascending: false });
    if (data) setAccounts(data);
  }

  useEffect(() => { fetchAccounts(); }, []);

  async function addAccount() {
    if (!name) { alert("Account name required"); return; }
    const { error } = await supabase.from("accounts").insert([{ name, type, balance: Number(balance) }]);
    if (error) { alert(error.message); return; }
    setName(""); setType(""); setBalance("");
    fetchAccounts();
  }

  async function deleteAccount(id: string) {
    if (!confirm("Delete this account?")) return;
    await supabase.from("accounts").delete().eq("id", id);
    fetchAccounts();
  }

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance||0), 0);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        .fade { animation: fadeUp 0.4s ease both; }
        input:focus { border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1) !important; }
        .acc-card { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: default; }
        .acc-card:hover { transform: translateY(-4px) scale(1.02); }
      `}</style>

      {/* Header */}
      <div className="fade" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
        <div>
          <h1 style={{ fontSize:"28px", fontWeight:"800", margin:0, background:"linear-gradient(90deg,#d946ef,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>Accounts</h1>
          <p style={{ color:txt(0.45), fontSize:"14px", margin:"4px 0 0" }}>Manage your bank and cash accounts</p>
        </div>
        <div style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.1),rgba(168,85,247,0.08))", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"16px", padding:"14px 24px" }}>
          <p style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), margin:"0 0 4px" }}>Total Balance</p>
          <p style={{ fontSize:"22px", fontWeight:"800", margin:0, fontFamily:"'Space Mono',monospace", background:"linear-gradient(90deg,#d946ef,#8b5cf6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>₹{totalBalance.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", padding:"24px", marginBottom:"28px", animationDelay:"0.05s" }}>
        <h2 style={{ fontSize:"15px", fontWeight:"700", color:txt(0.8), margin:"0 0 16px" }}>Add New Account</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"14px" }}>
          <input style={inp} placeholder="Account Name *" value={name} onChange={e => setName(e.target.value)} />
          <input style={inp} placeholder="Type (e.g. Bank, Cash, UPI)" value={type} onChange={e => setType(e.target.value)} />
          <input type="number" style={inp} placeholder="Opening Balance (₹)" value={balance} onChange={e => setBalance(e.target.value)} />
        </div>
        <button onClick={addAccount} style={{ marginTop:"16px", background:"linear-gradient(135deg,#d946ef,#8b5cf6)", color:"white", borderRadius:"12px", padding:"12px 22px", fontWeight:"700", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", boxShadow:"0 4px 15px rgba(217,70,239,0.3)" }}>
          <PlusCircle size={18} /> Add Account
        </button>
      </div>

      {/* Account Cards */}
      <div className="fade" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"18px", animationDelay:"0.1s" }}>
        {accounts.map((account, i) => {
          const c = cardColors[i % cardColors.length];
          return (
            <div key={account.id} className="acc-card" style={{ borderRadius:"20px", background:c.grad, padding:"24px", position:"relative", overflow:"hidden", boxShadow:`0 8px 32px ${c.glow}, 0 0 0 1px rgba(255,255,255,0.1)` }}>
              <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"100px", height:"100px", borderRadius:"50%", background:"rgba(255,255,255,0.12)", animation:"pulseGlow 3s ease-in-out infinite", animationDelay:`${i*0.3}s` }} />
              <div style={{ position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px" }}>
                  <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.25)" }}>
                    <Landmark size={20} color="white" />
                  </div>
                  <button onClick={() => deleteAccount(account.id)} style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"8px", padding:"6px 10px", color:"white", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px", fontSize:"12px", fontWeight:"600" }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
                <h2 style={{ fontSize:"18px", fontWeight:"800", color:"white", margin:"0 0 4px", letterSpacing:"-0.01em" }}>{account.name}</h2>
                {account.type && <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.7)", margin:"0 0 16px", fontWeight:"500" }}>{account.type}</p>}
                <p style={{ fontSize:"28px", fontWeight:"800", color:"white", margin:0, fontFamily:"'Space Mono',monospace", letterSpacing:"-0.02em" }}>₹{Number(account.balance).toLocaleString("en-IN")}</p>
              </div>
            </div>
          );
        })}
      </div>
      {accounts.length === 0 && (
        <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", padding:"48px", textAlign:"center", color:txt(0.3), fontSize:"14px", animationDelay:"0.1s" }}>No accounts yet</div>
      )}
    </div>
  );
}