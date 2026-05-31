import { createClient } from "@/lib/server";
import InvoiceActions from "@/components/InvoiceActions";

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single();
  const { data: items } = await supabase.from("invoice_items").select("*").eq("invoice_id", id);
  const { data: settings } = await supabase.from("settings").select("*").single();

  if (!invoice) return <div style={{ padding:"32px", color:"#1a0a2e" }}>Invoice Not Found</div>;

  const biz = {
    name: settings?.business_name || "My Business",
    address: settings?.address || "",
    phone: settings?.phone || "",
    email: settings?.email || "",
  };

  const statusColor = invoice.payment_status === "Paid" ? "#059669" : invoice.payment_status === "Partial" ? "#d97706" : "#dc2626";
  const statusBg = invoice.payment_status === "Paid" ? "rgba(52,211,153,0.12)" : invoice.payment_status === "Partial" ? "rgba(251,191,36,0.12)" : "rgba(239,68,68,0.1)";

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@700&display=swap');`}</style>

      {/* Actions bar */}
      <div style={{ marginBottom:"24px" }}>
        <InvoiceActions invoiceId={invoice.id} totalAmount={invoice.total_amount} dueAmount={invoice.due_amount} paymentStatus={invoice.payment_status} />
      </div>

      {/* Invoice Card */}
      <div id="invoice-content" style={{ background:"rgba(255,255,255,0.9)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"24px", boxShadow:"0 8px 40px rgba(139,92,246,0.12)", padding:"40px", maxWidth:"860px", margin:"0 auto" }}>
        
        {/* Top */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"40px" }}>
          <div>
            <h1 style={{ fontSize:"36px", fontWeight:"800", margin:"0 0 4px", background:"linear-gradient(90deg,#d946ef,#8b5cf6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em" }}>INVOICE</h1>
            <p style={{ color:"rgba(26,10,46,0.45)", fontSize:"14px", fontFamily:"'Space Mono',monospace", margin:0 }}>{invoice.invoice_number}</p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontWeight:"800", fontSize:"18px", color:"#1a0a2e", margin:"0 0 4px" }}>{biz.name}</p>
            {biz.address && <p style={{ color:"rgba(26,10,46,0.5)", fontSize:"13px", margin:"2px 0" }}>{biz.address}</p>}
            {biz.phone && <p style={{ color:"rgba(26,10,46,0.5)", fontSize:"13px", margin:"2px 0" }}>{biz.phone}</p>}
            {biz.email && <p style={{ color:"rgba(26,10,46,0.5)", fontSize:"13px", margin:"2px 0" }}>{biz.email}</p>}
          </div>
        </div>

        {/* Bill To + Dates */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"32px", background:"rgba(139,92,246,0.04)", borderRadius:"16px", padding:"20px 24px" }}>
          <div>
            <p style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.1em", color:"rgba(26,10,46,0.4)", textTransform:"uppercase", margin:"0 0 8px" }}>Bill To</p>
            <p style={{ fontWeight:"700", fontSize:"16px", color:"#1a0a2e", margin:0 }}>{invoice.client_name}</p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:"13px", color:"rgba(26,10,46,0.6)", margin:"0 0 6px" }}><span style={{ fontWeight:"600" }}>Invoice Date:</span> {invoice.invoice_date || "—"}</p>
            <p style={{ fontSize:"13px", color:"rgba(26,10,46,0.6)", margin:0 }}><span style={{ fontWeight:"600" }}>Due Date:</span> {invoice.due_date || "—"}</p>
          </div>
        </div>

        {/* Items */}
        <div style={{ border:"1px solid rgba(139,92,246,0.12)", borderRadius:"16px", overflow:"hidden", marginBottom:"32px" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(139,92,246,0.05)" }}>
                {["Item","Qty","Rate","Total"].map(h => (
                  <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(26,10,46,0.4)", borderBottom:"1px solid rgba(139,92,246,0.08)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items?.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < (items.length-1) ? "1px solid rgba(139,92,246,0.06)" : "none" }}>
                  <td style={{ padding:"14px 20px", color:"rgba(26,10,46,0.85)", fontSize:"14px" }}>{item.item_name}</td>
                  <td style={{ padding:"14px 20px", color:"rgba(26,10,46,0.6)", fontSize:"14px" }}>{item.quantity}</td>
                  <td style={{ padding:"14px 20px", color:"rgba(26,10,46,0.6)", fontFamily:"'Space Mono',monospace", fontSize:"13px" }}>₹{item.rate}</td>
                  <td style={{ padding:"14px 20px", fontWeight:"700", color:"rgba(26,10,46,0.9)", fontFamily:"'Space Mono',monospace", fontSize:"14px" }}>₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom: invoice.notes ? "32px" : 0 }}>
          <div style={{ width:"300px", background:"linear-gradient(135deg,rgba(217,70,239,0.06),rgba(139,92,246,0.08))", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"16px", padding:"20px 24px" }}>
            {[["Total", `₹${Number(invoice.total_amount).toLocaleString("en-IN")}`, false], ["Due", `₹${Number(invoice.due_amount).toLocaleString("en-IN")}`, true]].map(([label, val, red]) => (
              <div key={String(label)} style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px" }}>
                <span style={{ color:"rgba(26,10,46,0.55)", fontSize:"14px" }}>{label}</span>
                <span style={{ fontWeight:"700", color: red ? "#dc2626" : "rgba(26,10,46,0.9)", fontFamily:"'Space Mono',monospace" }}>{val}</span>
              </div>
            ))}
            <div style={{ borderTop:"1px solid rgba(139,92,246,0.15)", paddingTop:"14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:"700", fontSize:"15px", color:"rgba(26,10,46,0.8)" }}>Status</span>
              <span style={{ background:statusBg, color:statusColor, border:`1px solid ${statusColor}40`, borderRadius:"999px", padding:"3px 14px", fontSize:"12px", fontWeight:"700" }}>{invoice.payment_status}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ background:"rgba(139,92,246,0.04)", border:"1px solid rgba(139,92,246,0.1)", borderRadius:"14px", padding:"20px 24px" }}>
            <p style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.1em", color:"rgba(26,10,46,0.4)", textTransform:"uppercase", margin:"0 0 8px" }}>Notes</p>
            <p style={{ color:"rgba(26,10,46,0.7)", fontSize:"14px", margin:0, lineHeight:"1.6" }}>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}