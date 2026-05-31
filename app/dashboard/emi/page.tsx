"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Trash2, CreditCard } from "lucide-react";

type EMI = { id: string; loan_name: string; total_amount: number; emi_amount: number; months_total: number; months_paid: number; start_date: string; account_name: string; created_at: string };
type Account = { id: string; name: string; balance: number };

const inp: React.CSSProperties = { background:"rgba(255,255,255,0.8)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"12px", padding:"14px 16px", outline:"none", width:"100%", color:"#1a0a2e", fontSize:"14px", boxSizing:"border-box" };
const txt = (o: number) => `rgba(26,10,46,${o})`;

export default function EMIPage() {
  const [emis, setEmis] = useState<EMI[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loanName, setLoanName] = useState(""); const [totalAmount, setTotalAmount] = useState(""); const [emiAmount, setEmiAmount] = useState("");
  const [monthsTotal, setMonthsTotal] = useState(""); const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]); const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(false);

  async function getSupabase() {
    try { const m = await import("@/lib/client"); return m.createClient(); }
    catch { const m = await import("@/lib/supabase"); return m.supabase; }
  }

  async function fetchData() {
    const s = await getSupabase();
    const [{ data: ed }, { data: ad }] = await Promise.all([
      s.from("emis").select("*").order("created_at", { ascending: false }),
      s.from("accounts").select("*"),
    ]);
    if (ed) setEmis(ed); if (ad) setAccounts(ad);
  }

  useEffect(() => { fetchData(); }, []);

  async function addEMI() {
    if (!loanName || !emiAmount || !monthsTotal) { alert("Fill Loan Name, EMI Amount and Total Months"); return; }
    setLoading(true);
    const s = await getSupabase();
    const { error } = await s.from("emis").insert([{ loan_name: loanName, total_amount: Number(totalAmount), emi_amount: Number(emiAmount), months_total: Number(monthsTotal), months_paid: 0, start_date: startDate, account_name: selectedAccount }]);
    if (error) { alert(error.message); setLoading(false); return; }
    setLoanName(""); setTotalAmount(""); setEmiAmount(""); setMonthsTotal(""); setLoading(false);
    fetchData();
  }

  async function payEMI(emi: EMI) {
    if (emi.months_paid >= emi.months_total) { alert("All EMIs already paid!"); return; }
    const s = await getSupabase();
    const newPaid = emi.months_paid + 1;
    await s.from("emis").update({ months_paid: newPaid }).eq("id", emi.id);
    if (emi.account_name) {
      const acc = accounts.find(a => a.name === emi.account_name);
      if (acc) await s.from("accounts").update({ balance: Number(acc.balance) - emi.emi_amount }).eq("id", acc.id);
    }
    fetchData();
  }

  async function deleteEMI(id: string) {
    if (!confirm("Delete this EMI?")) return;
    const s = await getSupabase();
    await s.from("emis").delete().eq("id", id);
    fetchData();
  }

  const totalMonthlyEMI = emis.filter(e => e.months_paid < e.months_total).reduce((s, e) => s + Number(e.emi_amount||0), 0);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation: fadeUp 0.4s ease both; }
        input:focus, select:focus { border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1) !important; }
        .row-hover:hover { background: rgba(139,92,246,0.04) !important; }
      `}</style>

      {/* Header */}
      <div className="fade" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
        <div>
          <h1 style={{ fontSize:"28px", fontWeight:"800", margin:0, background:"linear-gradient(90deg,#d946ef,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>EMI Tracker</h1>
          <p style={{ color:txt(0.45), fontSize:"14px", margin:"4px 0 0" }}>Track your loan EMIs and repayments</p>
        </div>
        <div style={{ background:"linear-gradient(135deg,rgba(244,63,94,0.1),rgba(190,18,60,0.06))", border:"1px solid rgba(244,63,94,0.2)", borderRadius:"16px", padding:"14px 24px" }}>
          <p style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), margin:"0 0 4px" }}>Monthly Outflow</p>
          <p style={{ fontSize:"22px", fontWeight:"800", color:"#dc2626", margin:0, fontFamily:"'Space Mono',monospace" }}>₹{totalMonthlyEMI.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", padding:"24px", marginBottom:"24px", animationDelay:"0.05s" }}>
        <h2 style={{ fontSize:"15px", fontWeight:"700", color:txt(0.8), margin:"0 0 16px" }}>Add New EMI / Loan</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
          <input style={inp} placeholder="Loan / EMI Name *" value={loanName} onChange={e => setLoanName(e.target.value)} />
          <input type="number" style={inp} placeholder="Total Loan Amount (₹)" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
          <input type="number" style={inp} placeholder="EMI Amount per Month (₹) *" value={emiAmount} onChange={e => setEmiAmount(e.target.value)} />
          <input type="number" style={inp} placeholder="Total Months *" value={monthsTotal} onChange={e => setMonthsTotal(e.target.value)} />
          <input type="date" style={inp} value={startDate} onChange={e => setStartDate(e.target.value)} />
          <select style={inp} value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
            <option value="">Deduct from Account (optional)</option>
            {accounts.map(a => <option key={a.id} value={a.name}>{a.name} — ₹{Number(a.balance).toLocaleString("en-IN")}</option>)}
          </select>
        </div>
        <button onClick={addEMI} disabled={loading} style={{ marginTop:"16px", background:"linear-gradient(135deg,#d946ef,#8b5cf6)", color:"white", borderRadius:"12px", padding:"12px 22px", fontWeight:"700", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", boxShadow:"0 4px 15px rgba(217,70,239,0.3)", opacity: loading ? 0.7 : 1 }}>
          <PlusCircle size={18} /> {loading ? "Adding..." : "Add EMI"}
        </button>
      </div>

      {/* EMI Cards */}
      <div className="fade" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"18px", animationDelay:"0.1s" }}>
        {emis.map(emi => {
          const progress = emi.months_total > 0 ? (emi.months_paid / emi.months_total) * 100 : 0;
          const remaining = emi.months_total - emi.months_paid;
          const done = remaining === 0;
          return (
            <div key={emi.id} style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:`1px solid ${done ? "rgba(52,211,153,0.3)" : "rgba(139,92,246,0.15)"}`, borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.08)", padding:"24px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <div style={{ width:"44px", height:"44px", borderRadius:"12px", background: done ? "rgba(52,211,153,0.15)" : "linear-gradient(135deg,rgba(217,70,239,0.15),rgba(139,92,246,0.15))", border:`1px solid ${done ? "rgba(52,211,153,0.3)" : "rgba(139,92,246,0.25)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <CreditCard size={20} color={done ? "#059669" : "#8b5cf6"} />
                  </div>
                  <div>
                    <h3 style={{ fontSize:"15px", fontWeight:"700", color:txt(0.9), margin:"0 0 2px" }}>{emi.loan_name}</h3>
                    {emi.account_name && <p style={{ fontSize:"11px", color:txt(0.45), margin:0 }}>from {emi.account_name}</p>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                  {done ? (
                    <span style={{ background:"rgba(52,211,153,0.12)", color:"#059669", border:"1px solid rgba(52,211,153,0.3)", borderRadius:"999px", padding:"3px 12px", fontSize:"11px", fontWeight:"700" }}>✓ Complete</span>
                  ) : (
                    <button onClick={() => payEMI(emi)} style={{ background:"linear-gradient(135deg,#34d399,#059669)", color:"white", border:"none", borderRadius:"10px", padding:"8px 16px", fontSize:"12px", fontWeight:"700", cursor:"pointer", boxShadow:"0 2px 8px rgba(52,211,153,0.3)" }}>Pay EMI</button>
                  )}
                  <button onClick={() => deleteEMI(emi.id)} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", padding:"8px 10px", color:"#dc2626", cursor:"pointer", display:"flex", alignItems:"center" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                  <span style={{ fontSize:"12px", color:txt(0.5), fontWeight:"500" }}>{emi.months_paid} of {emi.months_total} months paid</span>
                  <span style={{ fontSize:"12px", fontWeight:"700", color: done ? "#059669" : "#8b5cf6" }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height:"6px", borderRadius:"999px", background:"rgba(139,92,246,0.1)", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:"999px", width:`${progress}%`, background: done ? "linear-gradient(90deg,#34d399,#059669)" : "linear-gradient(90deg,#d946ef,#8b5cf6)", transition:"width 0.5s ease" }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
                {[
                  { label:"EMI/Month", value:`₹${Number(emi.emi_amount).toLocaleString("en-IN")}` },
                  { label:"Remaining", value:`${remaining} months` },
                  { label:"Balance Due", value:`₹${(remaining * Number(emi.emi_amount)).toLocaleString("en-IN")}` },
                ].map(s => (
                  <div key={s.label} style={{ background:"rgba(139,92,246,0.05)", border:"1px solid rgba(139,92,246,0.1)", borderRadius:"10px", padding:"10px 12px" }}>
                    <p style={{ fontSize:"10px", fontWeight:"700", letterSpacing:"0.06em", textTransform:"uppercase", color:txt(0.35), margin:"0 0 4px" }}>{s.label}</p>
                    <p style={{ fontSize:"13px", fontWeight:"700", color:txt(0.85), margin:0, fontFamily:"'Space Mono',monospace" }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {emis.length === 0 && (
        <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", padding:"48px", textAlign:"center", color:txt(0.3), fontSize:"14px", animationDelay:"0.1s" }}>No EMIs tracked yet</div>
      )}
    </div>
  );
}