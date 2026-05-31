"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

type Expense = { id: string; title: string; amount: number; category: string; payment_method: string; account_name: string; created_at: string };
type Account = { id: string; name: string; balance: number };
const CATEGORIES = ["Office Supplies","Travel","Food & Drinks","Utilities","Salary","Rent","Marketing","Other"];

const inp: React.CSSProperties = { background:"rgba(255,255,255,0.8)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"12px", padding:"14px 16px", outline:"none", width:"100%", color:"#1a0a2e", fontSize:"14px", boxSizing:"border-box" };
const txt = (o: number) => `rgba(26,10,46,${o})`;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [title, setTitle] = useState(""); const [amount, setAmount] = useState(""); const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash"); const [selectedAccount, setSelectedAccount] = useState(""); const [loading, setLoading] = useState(false);

  async function getSupabase() {
    try { const m = await import("@/lib/client"); return m.createClient(); }
    catch { const m = await import("@/lib/supabase"); return m.supabase; }
  }

  async function fetchData() {
    const s = await getSupabase();
    const [{ data: ed }, { data: ad }] = await Promise.all([
      s.from("expenses").select("*").order("created_at", { ascending: false }),
      s.from("accounts").select("*"),
    ]);
    if (ed) setExpenses(ed); if (ad) setAccounts(ad);
  }

  useEffect(() => { fetchData(); }, []);

  async function addExpense() {
    if (!title || !amount || !selectedAccount) { alert("Please fill Title, Amount and Account"); return; }
    const account = accounts.find(a => a.name === selectedAccount);
    if (!account) return;
    setLoading(true);
    const s = await getSupabase();
    const { error } = await s.from("expenses").insert([{ title, amount: Number(amount), category, payment_method: paymentMethod, account_name: selectedAccount }]);
    if (error) { alert(error.message); setLoading(false); return; }
    await s.from("accounts").update({ balance: Number(account.balance) - Number(amount) }).eq("id", account.id);
    setTitle(""); setAmount(""); setCategory(""); setLoading(false);
    fetchData();
  }

  async function deleteExpense(id: string) {
    if (!confirm("Delete this expense?")) return;
    const s = await getSupabase();
    await s.from("expenses").delete().eq("id", id);
    fetchData();
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount||0), 0);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation: fadeUp 0.4s ease both; }
        input:focus, select:focus { border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1) !important; }
        .row-hover:hover { background: rgba(139,92,246,0.04) !important; }
        .del-btn:hover { background: rgba(239,68,68,0.15) !important; }
      `}</style>

      {/* Header */}
      <div className="fade" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
        <div>
          <h1 style={{ fontSize:"28px", fontWeight:"800", margin:0, background:"linear-gradient(90deg,#d946ef,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>Expenses</h1>
          <p style={{ color:txt(0.45), fontSize:"14px", margin:"4px 0 0" }}>Track your business expenses</p>
        </div>
        {/* Total chip */}
        <div style={{ background:"linear-gradient(135deg,rgba(239,68,68,0.1),rgba(244,63,94,0.08))", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"16px", padding:"14px 24px" }}>
          <p style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), margin:"0 0 4px" }}>Total Expenses</p>
          <p style={{ fontSize:"22px", fontWeight:"800", color:"#dc2626", margin:0, fontFamily:"'Space Mono',monospace" }}>₹{totalExpenses.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", padding:"24px", marginBottom:"24px", animationDelay:"0.05s" }}>
        <h2 style={{ fontSize:"15px", fontWeight:"700", color:txt(0.8), margin:"0 0 16px" }}>Add New Expense</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
          <input style={inp} placeholder="Expense Title *" value={title} onChange={e => setTitle(e.target.value)} />
          <input type="number" style={inp} placeholder="Amount (₹) *" value={amount} onChange={e => setAmount(e.target.value)} />
          <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={inp} value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
            <option value="">Select Account *</option>
            {accounts.map(a => <option key={a.id} value={a.name}>{a.name} — ₹{Number(a.balance).toLocaleString("en-IN")}</option>)}
          </select>
          <select style={inp} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            {["Cash","UPI","Bank Transfer","Cheque"].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <button onClick={addExpense} disabled={loading} style={{ marginTop:"16px", background:"linear-gradient(135deg,#d946ef,#8b5cf6)", color:"white", borderRadius:"12px", padding:"12px 22px", fontWeight:"700", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", boxShadow:"0 4px 15px rgba(217,70,239,0.3)", opacity: loading ? 0.7 : 1 }}>
          <PlusCircle size={18} /> {loading ? "Adding..." : "Add Expense"}
        </button>
      </div>

      {/* Table */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", overflow:"hidden", animationDelay:"0.1s" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(139,92,246,0.05)" }}>
              {["Title","Category","Amount","Account","Method","Action"].map(h => (
                <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), borderBottom:"1px solid rgba(139,92,246,0.08)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, i) => (
              <tr key={e.id} className="row-hover" style={{ borderBottom: i < expenses.length-1 ? "1px solid rgba(139,92,246,0.06)" : "none" }}>
                <td style={{ padding:"16px 20px", fontWeight:"700", color:txt(0.9), fontSize:"14px" }}>{e.title}</td>
                <td style={{ padding:"16px 20px" }}>
                  {e.category ? <span style={{ background:"rgba(139,92,246,0.1)", color:"#8b5cf6", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"999px", padding:"3px 12px", fontSize:"11px", fontWeight:"700" }}>{e.category}</span> : <span style={{ color:txt(0.3) }}>—</span>}
                </td>
                <td style={{ padding:"16px 20px", fontWeight:"700", color:"#dc2626", fontFamily:"'Space Mono',monospace", fontSize:"14px" }}>₹{Number(e.amount).toLocaleString("en-IN")}</td>
                <td style={{ padding:"16px 20px", color:txt(0.6), fontSize:"13px" }}>{e.account_name}</td>
                <td style={{ padding:"16px 20px" }}>
                  <span style={{ background:"rgba(96,165,250,0.1)", color:"#2563eb", border:"1px solid rgba(96,165,250,0.25)", borderRadius:"999px", padding:"3px 12px", fontSize:"11px", fontWeight:"700" }}>{e.payment_method}</span>
                </td>
                <td style={{ padding:"16px 20px" }}>
                  <button onClick={() => deleteExpense(e.id)} className="del-btn" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", color:"#dc2626", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"6px", cursor:"pointer", transition:"background 0.15s" }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <div style={{ padding:"48px", textAlign:"center", color:txt(0.3), fontSize:"14px" }}>No expenses yet</div>}
      </div>
    </div>
  );
}