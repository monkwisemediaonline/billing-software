import { createClient } from "@/lib/server";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  const { data: invoices } = await supabase.from("invoices").select("*").eq("client_name", client?.name).order("created_at", { ascending: false });

  if (!client) return <div style={{ padding:"32px" }}>Client not found</div>;

  const totalBilled = invoices?.reduce((s, i) => s + Number(i.total_amount||0), 0) || 0;
  const totalDue = invoices?.reduce((s, i) => s + Number(i.due_amount||0), 0) || 0;
  const totalPaid = totalBilled - totalDue;
  const invoiceCount = invoices?.length || 0;

  const txt = (o: number) => `rgba(26,10,46,${o})`;
  const statusStyle = (s: string) => s === "Paid" ? { bg:"rgba(52,211,153,0.12)", color:"#059669", border:"rgba(52,211,153,0.3)" } : s === "Partial" ? { bg:"rgba(251,191,36,0.12)", color:"#d97706", border:"rgba(251,191,36,0.3)" } : { bg:"rgba(239,68,68,0.1)", color:"#dc2626", border:"rgba(239,68,68,0.25)" };

  const statCards = [
    { label:"Total Invoices", value:String(invoiceCount), color:txt(0.9), mono:false },
    { label:"Total Billed", value:`₹${totalBilled.toLocaleString("en-IN")}`, color:txt(0.9), mono:true },
    { label:"Total Paid", value:`₹${totalPaid.toLocaleString("en-IN")}`, color:"#059669", mono:true },
    { label:"Total Due", value:`₹${totalDue.toLocaleString("en-IN")}`, color:"#dc2626", mono:true },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation: fadeUp 0.4s ease both; }
        .row-hover:hover { background: rgba(139,92,246,0.04) !important; }
        .view-btn:hover { background: rgba(139,92,246,0.15) !important; }
      `}</style>

      <Link href="/dashboard/clients" className="fade" style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"10px", padding:"8px 16px", fontSize:"13px", color:"#8b5cf6", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"8px", textDecoration:"none", marginBottom:"24px" }}>
        <ArrowLeft size={16} /> Back to Clients
      </Link>

      {/* Client Info */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", padding:"28px", marginBottom:"20px", animationDelay:"0.05s" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:"20px" }}>
          <div style={{ width:"60px", height:"60px", borderRadius:"16px", background:"linear-gradient(135deg,#d946ef,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", fontWeight:"800", color:"white", flexShrink:0, boxShadow:"0 4px 20px rgba(217,70,239,0.4)" }}>
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize:"26px", fontWeight:"800", margin:"0 0 8px", color:txt(0.9) }}>{client.name}</h1>
            <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
              {client.phone && <span style={{ fontSize:"13px", color:txt(0.5) }}>📞 {client.phone}</span>}
              {client.email && <span style={{ fontSize:"13px", color:txt(0.5) }}>✉️ {client.email}</span>}
              {client.address && <span style={{ fontSize:"13px", color:txt(0.5) }}>📍 {client.address}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="fade" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"20px", animationDelay:"0.1s" }}>
        {statCards.map(card => (
          <div key={card.label} style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"16px", boxShadow:"0 4px 16px rgba(139,92,246,0.08)", padding:"20px 24px" }}>
            <p style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), margin:"0 0 10px" }}>{card.label}</p>
            <p style={{ fontSize:"22px", fontWeight:"800", color:card.color, margin:0, fontFamily: card.mono ? "'Space Mono',monospace" : "inherit" }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="fade" style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(139,92,246,0.1)", overflow:"hidden", animationDelay:"0.15s" }}>
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid rgba(139,92,246,0.08)" }}>
          <h2 style={{ fontSize:"15px", fontWeight:"700", color:txt(0.9), margin:0 }}>All Invoices</h2>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(139,92,246,0.05)" }}>
              {["Invoice","Date","Amount","Due","Status","Action"].map(h => (
                <th key={h} style={{ padding:"12px 20px", textAlign:"left", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:txt(0.4), borderBottom:"1px solid rgba(139,92,246,0.08)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices?.map((inv, i) => {
              const st = statusStyle(inv.payment_status);
              return (
                <tr key={inv.id} className="row-hover" style={{ borderBottom: i < (invoices.length-1) ? "1px solid rgba(139,92,246,0.06)" : "none" }}>
                  <td style={{ padding:"14px 20px", fontWeight:"700", color:txt(0.9), fontFamily:"'Space Mono',monospace", fontSize:"13px" }}>{inv.invoice_number}</td>
                  <td style={{ padding:"14px 20px", color:txt(0.5), fontSize:"13px" }}>{inv.invoice_date || "—"}</td>
                  <td style={{ padding:"14px 20px", fontWeight:"700", color:txt(0.9), fontFamily:"'Space Mono',monospace" }}>₹{Number(inv.total_amount).toLocaleString("en-IN")}</td>
                  <td style={{ padding:"14px 20px", fontWeight:"600", color:"#dc2626", fontFamily:"'Space Mono',monospace" }}>₹{Number(inv.due_amount).toLocaleString("en-IN")}</td>
                  <td style={{ padding:"14px 20px" }}>
                    <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, borderRadius:"999px", padding:"3px 12px", fontSize:"11px", fontWeight:"700" }}>{inv.payment_status}</span>
                  </td>
                  <td style={{ padding:"14px 20px" }}>
                    <Link href={`/dashboard/invoices/${inv.id}`} className="view-btn" style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", color:"#8b5cf6", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"6px", textDecoration:"none", transition:"background 0.15s" }}>
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!invoices || invoices.length === 0) && <div style={{ padding:"48px", textAlign:"center", color:txt(0.3), fontSize:"14px" }}>No invoices for this client yet</div>}
      </div>
    </div>
  );
}