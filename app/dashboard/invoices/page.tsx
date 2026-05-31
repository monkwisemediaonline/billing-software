"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Plus, Search, Trash2 } from "lucide-react";
import { createClient } from "@/lib/client";

type Invoice = {
  id: string;
  invoice_number: string;
  client_name: string;
  total_amount: number;
  due_amount: number;
  payment_status: string;
  invoice_date: string;
};

export default function InvoicesPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setInvoices(data);
  }

  useEffect(() => { fetchInvoices(); }, []);

  async function deleteInvoice(id: string, invoiceNumber: string) {
    if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return;
    await supabase.from("invoice_items").delete().eq("invoice_id", id);
    await supabase.from("payments").delete().eq("invoice_id", id);
    await supabase.from("invoices").delete().eq("id", id);
    fetchInvoices();
  }

  const filtered = invoices.filter((inv) =>
    inv.client_name.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle = (s: string) => {
    if (s === "Paid")    return { background: "rgba(52,211,153,0.12)",  color: "#059669", border: "1px solid rgba(52,211,153,0.3)"  };
    if (s === "Partial") return { background: "rgba(251,191,36,0.12)",  color: "#d97706", border: "1px solid rgba(251,191,36,0.3)"  };
    return                      { background: "rgba(239,68,68,0.1)",    color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)" };
  };

  const txt = (o: number) => `rgba(26,10,46,${o})`;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .page-anim { animation: fadeUp 0.4s ease both; }
        .row-hover { transition: background 0.15s ease; }
        .row-hover:hover { background: rgba(139,92,246,0.04) !important; }
        .view-btn:hover { background: rgba(139,92,246,0.15) !important; }
        .del-btn:hover { background: rgba(239,68,68,0.15) !important; }
      `}</style>

      {/* Header */}
      <div className="page-anim" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
        <div>
          <h1 style={{ fontSize:"28px", fontWeight:"800", margin:0, background:"linear-gradient(90deg,#d946ef,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>Invoices</h1>
          <p style={{ color:txt(0.45), fontSize:"14px", margin:"4px 0 0" }}>Manage all your invoices</p>
        </div>
        <Link href="/dashboard/invoices/new" style={{ background:"linear-gradient(135deg,#d946ef,#8b5cf6)", color:"white", borderRadius:"12px", padding:"11px 22px", fontWeight:"700", display:"flex", alignItems:"center", gap:"8px", textDecoration:"none", boxShadow:"0 4px 15px rgba(217,70,239,0.35)", fontSize:"14px" }}>
          <Plus size={18} /> Create Invoice
        </Link>
      </div>

      {/* Search */}
      <div className="page-anim" style={{ display:"flex", alignItems:"center", gap:"12px", background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"16px", padding:"14px 18px", marginBottom:"20px", boxShadow:"0 4px 16px rgba(139,92,246,0.08)", animationDelay:"0.05s" }}>
        <Search size={18} style={{ color:txt(0.35), flexShrink:0 }} />
        <input
          type="text"
          placeholder="Search by client name or invoice number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background:"transparent", border:"none", outline:"none", color:txt(0.9), fontSize:"14px", width:"100%" }}
        />
      </div>

      {/* Table */}
      <div className="page-anim" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", overflow:"hidden", animationDelay:"0.1s" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(139,92,246,0.05)" }}>
              {["Invoice","Client","Date","Amount","Due","Status","Actions"].map(h => (
                <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), borderBottom:"1px solid rgba(139,92,246,0.08)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <tr key={inv.id} className="row-hover" style={{ borderBottom: i < filtered.length-1 ? "1px solid rgba(139,92,246,0.06)" : "none" }}>
                <td style={{ padding:"16px 20px", fontWeight:"700", color:txt(0.9), fontFamily:"'Space Mono',monospace", fontSize:"13px" }}>
                  {inv.invoice_number}
                </td>
                <td style={{ padding:"16px 20px", color:txt(0.75), fontSize:"14px" }}>
                  {inv.client_name}
                </td>
                <td style={{ padding:"16px 20px", color:txt(0.5), fontSize:"13px" }}>
                  {inv.invoice_date || "—"}
                </td>
                <td style={{ padding:"16px 20px", fontWeight:"700", color:txt(0.9), fontFamily:"'Space Mono',monospace", fontSize:"14px" }}>
                  ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                </td>
                <td style={{ padding:"16px 20px", fontWeight:"600", color:"#dc2626", fontFamily:"'Space Mono',monospace", fontSize:"14px" }}>
                  ₹{Number(inv.due_amount).toLocaleString("en-IN")}
                </td>
                <td style={{ padding:"16px 20px" }}>
                  <span style={{ ...statusStyle(inv.payment_status), borderRadius:"999px", padding:"3px 12px", fontSize:"11px", fontWeight:"700", letterSpacing:"0.04em" }}>
                    {inv.payment_status}
                  </span>
                </td>
                <td style={{ padding:"16px 20px" }}>
                  <div style={{ display:"flex", gap:"8px" }}>
                    <Link href={`/dashboard/invoices/${inv.id}`} className="view-btn" style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", color:"#8b5cf6", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"6px", textDecoration:"none", transition:"background 0.15s" }}>
                      <Eye size={14} /> View
                    </Link>
                    <button onClick={() => deleteInvoice(inv.id, inv.invoice_number)} className="del-btn" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", color:"#dc2626", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"6px", cursor:"pointer", transition:"background 0.15s" }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding:"48px", textAlign:"center", color:txt(0.3), fontSize:"14px" }}>
            No invoices found
          </div>
        )}
      </div>
    </div>
  );
}