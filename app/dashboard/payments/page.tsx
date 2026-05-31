"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

type Payment = { id: string; invoice_id: string; amount_paid: number; payment_date: string; payment_method: string; note: string; invoices?: { invoice_number: string; client_name: string } };
type Invoice = { id: string; invoice_number: string; client_name: string; due_amount: number; payment_status: string };

const inp: React.CSSProperties = { background:"rgba(255,255,255,0.8)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"12px", padding:"14px 16px", outline:"none", width:"100%", color:"#1a0a2e", fontSize:"14px", boxSizing:"border-box" };
const txt = (o: number) => `rgba(26,10,46,${o})`;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("Cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function getSupabase() {
    try { const m = await import("@/lib/client"); return m.createClient(); }
    catch { const m = await import("@/lib/supabase"); return m.supabase; }
  }

  async function fetchData() {
    const s = await getSupabase();
    const [{ data: pd }, { data: id }] = await Promise.all([
      s.from("payments").select("*, invoices(invoice_number, client_name)").order("created_at", { ascending: false }),
      s.from("invoices").select("*").neq("payment_status", "Paid").order("created_at", { ascending: false }),
    ]);
    if (pd) setPayments(pd); if (id) setInvoices(id);
  }

  useEffect(() => { fetchData(); }, []);

  async function addPayment() {
    if (!selectedInvoice || !amount) { alert("Select invoice and enter amount"); return; }
    const invoice = invoices.find(i => i.id === selectedInvoice);
    if (!invoice) return;
    const paid = Number(amount);
    if (paid <= 0) { alert("Amount must be greater than 0"); return; }
    setLoading(true);
    const s = await getSupabase();

    await s.from("payments").insert([{ invoice_id: selectedInvoice, amount_paid: paid, payment_date: date, payment_method: method, note }]);

    const newDue = Math.max(0, Number(invoice.due_amount) - paid);
    const newStatus = newDue === 0 ? "Paid" : "Partial";
    await s.from("invoices").update({ due_amount: newDue, payment_status: newStatus }).eq("id", selectedInvoice);

    setSelectedInvoice(""); setAmount(""); setNote(""); setLoading(false);
    fetchData();
  }

  async function deletePayment(id: string) {
    if (!confirm("Delete this payment?")) return;
    const s = await getSupabase();
    await s.from("payments").delete().eq("id", id);
    fetchData();
  }

  const totalCollected = payments.reduce((s, p) => s + Number(p.amount_paid||0), 0);

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
          <h1 style={{ fontSize:"28px", fontWeight:"800", margin:0, background:"linear-gradient(90deg,#d946ef,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>Payments</h1>
          <p style={{ color:txt(0.45), fontSize:"14px", margin:"4px 0 0" }}>Record and track invoice payments</p>
        </div>
        <div style={{ background:"linear-gradient(135deg,rgba(52,211,153,0.1),rgba(5,150,105,0.08))", border:"1px solid rgba(52,211,153,0.25)", borderRadius:"16px", padding:"14px 24px" }}>
          <p style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), margin:"0 0 4px" }}>Total Collected</p>
          <p style={{ fontSize:"22px", fontWeight:"800", color:"#059669", margin:0, fontFamily:"'Space Mono',monospace" }}>₹{totalCollected.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Add Payment Form */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", padding:"24px", marginBottom:"24px", animationDelay:"0.05s" }}>
        <h2 style={{ fontSize:"15px", fontWeight:"700", color:txt(0.8), margin:"0 0 16px" }}>Record New Payment</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
          <select style={inp} value={selectedInvoice} onChange={e => setSelectedInvoice(e.target.value)}>
            <option value="">Select Invoice *</option>
            {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoice_number} — {inv.client_name} (Due: ₹{Number(inv.due_amount).toLocaleString("en-IN")})</option>)}
          </select>
          <input type="number" style={inp} placeholder="Amount Paid (₹) *" value={amount} onChange={e => setAmount(e.target.value)} />
          <input type="date" style={inp} value={date} onChange={e => setDate(e.target.value)} />
          <select style={inp} value={method} onChange={e => setMethod(e.target.value)}>
            {["Cash","UPI","Bank Transfer","Cheque","Card"].map(m => <option key={m}>{m}</option>)}
          </select>
          <input style={{...inp, gridColumn:"1 / -1"}} placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button onClick={addPayment} disabled={loading} style={{ marginTop:"16px", background:"linear-gradient(135deg,#34d399,#059669)", color:"white", borderRadius:"12px", padding:"12px 22px", fontWeight:"700", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", boxShadow:"0 4px 15px rgba(52,211,153,0.3)", opacity: loading ? 0.7 : 1 }}>
          <PlusCircle size={18} /> {loading ? "Recording..." : "Record Payment"}
        </button>
      </div>

      {/* Table */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", overflow:"hidden", animationDelay:"0.1s" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(139,92,246,0.05)" }}>
              {["Invoice","Client","Amount","Date","Method","Note","Action"].map(h => (
                <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), borderBottom:"1px solid rgba(139,92,246,0.08)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={p.id} className="row-hover" style={{ borderBottom: i < payments.length-1 ? "1px solid rgba(139,92,246,0.06)" : "none" }}>
                <td style={{ padding:"16px 20px", fontWeight:"700", color:txt(0.9), fontFamily:"'Space Mono',monospace", fontSize:"13px" }}>{p.invoices?.invoice_number || "—"}</td>
                <td style={{ padding:"16px 20px", color:txt(0.75), fontSize:"14px" }}>{p.invoices?.client_name || "—"}</td>
                <td style={{ padding:"16px 20px", fontWeight:"700", fontFamily:"'Space Mono',monospace", fontSize:"14px" }}>
                  <span style={{ background:"linear-gradient(90deg,#059669,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>+₹{Number(p.amount_paid).toLocaleString("en-IN")}</span>
                </td>
                <td style={{ padding:"16px 20px", color:txt(0.5), fontSize:"13px" }}>{p.payment_date}</td>
                <td style={{ padding:"16px 20px" }}>
                  <span style={{ background:"rgba(96,165,250,0.1)", color:"#2563eb", border:"1px solid rgba(96,165,250,0.25)", borderRadius:"999px", padding:"3px 12px", fontSize:"11px", fontWeight:"700" }}>{p.payment_method}</span>
                </td>
                <td style={{ padding:"16px 20px", color:txt(0.5), fontSize:"13px" }}>{p.note || "—"}</td>
                <td style={{ padding:"16px 20px" }}>
                  <button onClick={() => deletePayment(p.id)} className="del-btn" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", color:"#dc2626", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"6px", cursor:"pointer", transition:"background 0.15s" }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <div style={{ padding:"48px", textAlign:"center", color:txt(0.3), fontSize:"14px" }}>No payments recorded yet</div>}
      </div>
    </div>
  );
}