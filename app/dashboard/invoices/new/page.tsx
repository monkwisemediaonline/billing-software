"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createClient>;
let supabaseClient: SupabaseClient | null = null;
async function getSupabase(): Promise<SupabaseClient> {
  if (supabaseClient) return supabaseClient;
  try { const mod = await import("@/lib/client"); supabaseClient = mod.createClient(); }
  catch { const mod = await import("@/lib/supabase"); supabaseClient = mod.supabase; }
  return supabaseClient!;
}

type Client = { id: string; name: string };
type Item = { item_name: string; quantity: number; rate: number; total: number };

const inp: React.CSSProperties = {
  background: "rgba(255,255,255,0.8)", border: "1px solid rgba(139,92,246,0.2)",
  borderRadius: "12px", padding: "14px 16px", outline: "none",
  width: "100%", color: "#1a0a2e", fontSize: "14px", boxSizing: "border-box",
};
const txt = (o: number) => `rgba(26,10,46,${o})`;

export default function NewInvoicePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<Item[]>([{ item_name: "", quantity: 1, rate: 0, total: 0 }]);

  useEffect(() => {
    getSupabase().then(s => s.from("clients").select("*").then(({ data }) => data && setClients(data as Client[])));
  }, []);

  function updateItem(index: number, field: keyof Item, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    updated[index].total = updated[index].quantity * updated[index].rate;
    setItems(updated);
  }

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const grandTotal = subtotal - Number(discount || 0);

  async function createInvoice() {
    if (!invoiceNumber || !clientName) { alert("Please fill Invoice Number and Client"); return; }
    const supabase = await getSupabase();
    const { data: inv, error } = await supabase.from("invoices").insert([{
      invoice_number: invoiceNumber, client_name: clientName,
      total_amount: grandTotal, due_amount: grandTotal,
      payment_status: "Unpaid", due_date: dueDate, notes,
    }]).select().single();
    if (error || !inv) { alert("Failed: " + (error?.message ?? "unknown")); return; }
    await supabase.from("invoice_items").insert(items.map(item => ({ invoice_id: (inv as {id:string}).id, ...item })));
    alert("Invoice Created!");
    window.location.href = "/dashboard/invoices";
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation: fadeUp 0.4s ease both; }
        input:focus, select:focus, textarea:focus { border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1) !important; }
        .row-hover:hover { background: rgba(139,92,246,0.03) !important; }
      `}</style>

      {/* Header */}
      <div className="fade" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
        <div>
          <h1 style={{ fontSize:"28px", fontWeight:"800", margin:0, background:"linear-gradient(90deg,#d946ef,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>Create Invoice</h1>
          <p style={{ color:txt(0.45), fontSize:"14px", margin:"4px 0 0" }}>Generate a new invoice</p>
        </div>
        <button onClick={createInvoice} style={{ background:"linear-gradient(135deg,#d946ef,#8b5cf6)", color:"white", borderRadius:"12px", padding:"12px 24px", fontWeight:"700", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", boxShadow:"0 4px 15px rgba(217,70,239,0.35)" }}>
          <Save size={18} /> Save Invoice
        </button>
      </div>

      {/* Main Card */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", padding:"28px", animationDelay:"0.05s" }}>
        
        {/* Top fields */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"28px" }}>
          <input style={inp} placeholder="Invoice Number *" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
          <select style={inp} value={clientName} onChange={e => setClientName(e.target.value)}>
            <option value="">Select Client *</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <input type="date" style={inp} value={dueDate} onChange={e => setDueDate(e.target.value)} />
          <input type="number" style={inp} placeholder="Discount (₹)" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
        </div>

        {/* Items Table */}
        <div style={{ border:"1px solid rgba(139,92,246,0.12)", borderRadius:"16px", overflow:"hidden", marginBottom:"20px" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(139,92,246,0.05)" }}>
                {["Item", "Qty", "Rate (₹)", "Total", ""].map(h => (
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), borderBottom:"1px solid rgba(139,92,246,0.08)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="row-hover" style={{ borderBottom: i < items.length-1 ? "1px solid rgba(139,92,246,0.06)" : "none" }}>
                  <td style={{ padding:"10px 12px", width:"40%" }}>
                    <input style={{...inp, padding:"10px 12px"}} placeholder="Item name" value={item.item_name} onChange={e => updateItem(i, "item_name", e.target.value)} />
                  </td>
                  <td style={{ padding:"10px 12px", width:"12%" }}>
                    <input type="number" style={{...inp, padding:"10px 12px"}} value={item.quantity} onChange={e => updateItem(i, "quantity", Number(e.target.value))} />
                  </td>
                  <td style={{ padding:"10px 12px", width:"20%" }}>
                    <input type="number" style={{...inp, padding:"10px 12px"}} value={item.rate} onChange={e => updateItem(i, "rate", Number(e.target.value))} />
                  </td>
                  <td style={{ padding:"10px 16px", fontWeight:"700", color:txt(0.9), fontFamily:"'Space Mono',monospace", fontSize:"14px" }}>₹{item.total.toLocaleString("en-IN")}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <button onClick={() => setItems(items.filter((_,idx) => idx !== i))} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", padding:"6px 10px", color:"#dc2626", cursor:"pointer" }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={() => setItems([...items, { item_name:"", quantity:1, rate:0, total:0 }])} style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"12px", color:"#8b5cf6", fontWeight:"600", padding:"10px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", marginBottom:"28px" }}>
          <Plus size={18} /> Add Item
        </button>

        {/* Notes + Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
          <textarea placeholder="Notes (optional)" rows={6} style={{...inp, resize:"none", fontFamily:"inherit"}} value={notes} onChange={e => setNotes(e.target.value)} />
          <div style={{ background:"linear-gradient(135deg,rgba(217,70,239,0.06),rgba(139,92,246,0.08))", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"16px", padding:"24px" }}>
            {[["Subtotal", `₹${subtotal.toLocaleString("en-IN")}`], ["Discount", `₹${Number(discount||0).toLocaleString("en-IN")}`]].map(([label, val]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:"16px" }}>
                <span style={{ color:txt(0.5), fontSize:"14px" }}>{label}</span>
                <span style={{ fontWeight:"600", color:txt(0.8), fontFamily:"'Space Mono',monospace" }}>{val}</span>
              </div>
            ))}
            <div style={{ borderTop:"1px solid rgba(139,92,246,0.15)", paddingTop:"16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:"800", fontSize:"16px", color:txt(0.9) }}>Grand Total</span>
              <span style={{ fontWeight:"800", fontSize:"22px", fontFamily:"'Space Mono',monospace", background:"linear-gradient(90deg,#d946ef,#8b5cf6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}