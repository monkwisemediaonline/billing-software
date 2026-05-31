"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, CreditCard, ArrowLeft, Download } from "lucide-react";

type Props = {
  invoiceId: string;
  totalAmount: number;
  dueAmount: number;
  paymentStatus: string;
};

export default function InvoiceActions({ invoiceId, totalAmount, dueAmount, paymentStatus }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    const style = document.createElement("style");
    style.id = "print-hide-sidebar";
    style.innerHTML = `
      @media print {
        [data-sidebar] { display: none !important; }
        nav, aside { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
        body { background: white !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      const el = document.getElementById("print-hide-sidebar");
      if (el) el.remove();
    }, 1000);
  }

  async function handleDownloadPDF() {
    const el = document.getElementById("invoice-content");
    if (!el) { alert("Invoice content not found"); return; }
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        let y = 0;
        while (y < imgHeight) {
          pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
          y += pageHeight;
          if (y < imgHeight) pdf.addPage();
        }
      }
      pdf.save(`invoice-${invoiceId}.pdf`);
    } catch {
      alert("PDF generation failed. Try the Print option instead.");
    }
  }

  async function handlePayment() {
    const paid = Number(amountPaid);
    if (!paid || paid <= 0) { alert("Enter a valid amount"); return; }
    if (paid > dueAmount) { alert("Amount exceeds due amount ₹" + dueAmount); return; }
    setLoading(true);
    const newDue = dueAmount - paid;
    const newStatus = newDue === 0 ? "Paid" : "Partial";
    const { createClient } = await import("@/lib/client");
    const supabase = createClient();
    const { error } = await supabase.from("invoices").update({ due_amount: newDue, payment_status: newStatus }).eq("id", invoiceId);
    if (error) { alert("Failed: " + error.message); setLoading(false); return; }
    await supabase.from("payments").insert([{
      invoice_id: invoiceId, amount_paid: paid,
      payment_date: new Date().toISOString().split("T")[0],
    }]);
    setLoading(false);
    setShowModal(false);
    alert(newStatus === "Paid" ? "Invoice marked as Paid!" : `Payment of ₹${paid} recorded. Due: ₹${newDue}`);
    router.refresh();
  }

  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "7px",
    borderRadius: "10px", padding: "9px 16px", fontSize: "13px",
    fontWeight: "600", cursor: "pointer", border: "1px solid rgba(139,92,246,0.2)",
    background: "rgba(255,255,255,0.8)", color: "rgba(26,10,46,0.7)",
    transition: "all 0.15s ease", fontFamily: "inherit",
  };

  return (
    <>
      <div className="no-print" style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
        <button onClick={() => router.back()} style={btn}>
          <ArrowLeft size={15} /> Back
        </button>
        <button onClick={handlePrint} style={btn}>
          <Printer size={15} /> Print
        </button>
        <button onClick={handleDownloadPDF} style={{
          ...btn,
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.25)",
          color: "#8b5cf6",
        }}>
          <Download size={15} /> Download PDF
        </button>
        {paymentStatus !== "Paid" && (
          <button onClick={() => setShowModal(true)} style={{
            ...btn,
            background: "linear-gradient(135deg,#d946ef,#8b5cf6)",
            border: "none", color: "white",
            boxShadow: "0 4px 15px rgba(217,70,239,0.3)",
          }}>
            <CreditCard size={15} /> Record Payment
          </button>
        )}
        {paymentStatus === "Paid" && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: "10px", padding: "9px 16px", fontSize: "13px",
            fontWeight: "700", color: "#059669",
          }}>✓ Fully Paid</span>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        }}>
          <div style={{
            width: "100%", maxWidth: "420px", margin: "24px",
            background: "white", borderRadius: "24px", padding: "36px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#1a0a2e", margin: "0 0 6px" }}>Record Payment</h2>
            <p style={{ color: "rgba(26,10,46,0.5)", fontSize: "14px", margin: "0 0 24px" }}>
              Due amount: <span style={{ fontWeight: "700", color: "#dc2626" }}>₹{Number(dueAmount).toLocaleString("en-IN")}</span>
            </p>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(26,10,46,0.5)", marginBottom: "8px", letterSpacing: "0.06em" }}>
              AMOUNT RECEIVED (₹)
            </label>
            <input
              type="number"
              placeholder={`Max ₹${dueAmount}`}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: "12px",
                border: "1px solid rgba(139,92,246,0.25)", fontSize: "15px",
                outline: "none", boxSizing: "border-box", marginBottom: "24px",
                fontFamily: "inherit", color: "#1a0a2e",
              }}
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "13px", borderRadius: "12px",
                border: "1px solid rgba(139,92,246,0.2)", background: "white",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                color: "rgba(26,10,46,0.7)", fontFamily: "inherit",
              }}>Cancel</button>
              <button onClick={handlePayment} disabled={loading} style={{
                flex: 1, padding: "13px", borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg,#d946ef,#8b5cf6)",
                fontSize: "14px", fontWeight: "700", cursor: "pointer",
                color: "white", fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 15px rgba(217,70,239,0.3)",
              }}>
                {loading ? "Saving..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}