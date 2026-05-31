"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Wallet, Receipt, Landmark, TrendingUp, Zap } from "lucide-react";

type Invoice = {
  id: string;
  invoice_number: string;
  client_name: string;
  total_amount: number;
  due_amount: number;
  payment_status: string;
};

type Payment = {
  id: string;
  invoice_id: string;
  amount_paid: number;
  payment_date: string;
  invoices?: { client_name: string };
};

const cardStyles = [
  { grad: "linear-gradient(135deg, #d946ef, #a21caf)", glow: "rgba(217,70,239,0.2)", shimmer: "#f0abfc" },
  { grad: "linear-gradient(135deg, #f43f5e, #be123c)", glow: "rgba(244,63,94,0.2)",  shimmer: "#fda4af" },
  { grad: "linear-gradient(135deg, #8b5cf6, #5b21b6)", glow: "rgba(139,92,246,0.2)", shimmer: "#c4b5fd" },
  { grad: "linear-gradient(135deg, #ec4899, #9d174d)", glow: "rgba(236,72,153,0.2)", shimmer: "#f9a8d4" },
];

export default function DashboardPage() {
  const [totalRevenue, setTotalRevenue]   = useState(0);
  const [totalDue, setTotalDue]           = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance]   = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function fetchData() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let supabase: any;
      try {
        const mod = await import("@/lib/client");
        supabase = mod.createClient();
      } catch {
        const mod = await import("@/lib/supabase");
        supabase = mod.supabase;
      }

      const { data: invoices } = await supabase
        .from("invoices").select("*").order("created_at", { ascending: false });
      const { data: expenses } = await supabase.from("expenses").select("*");
      const { data: accounts } = await supabase.from("accounts").select("*");
      const { data: payments } = await supabase
        .from("payments").select("*, invoices(client_name)")
        .order("created_at", { ascending: false }).limit(5);

      setTotalRevenue(invoices?.reduce((s: number, i: Invoice) => s + Number(i.total_amount || 0), 0) || 0);
      setTotalDue(invoices?.reduce((s: number, i: Invoice) => s + Number(i.due_amount || 0), 0) || 0);
      setTotalExpenses(expenses?.reduce((s: number, e: { amount: number }) => s + Number(e.amount || 0), 0) || 0);
      setTotalBalance(accounts?.reduce((s: number, a: { balance: number }) => s + Number(a.balance || 0), 0) || 0);
      setRecentInvoices(invoices?.slice(0, 5) || []);
      setRecentPayments(payments || []);
    }
    fetchData();
  }, []);

  const cards = [
    { title: "Total Revenue",  value: totalRevenue,  icon: IndianRupee, trend: "+12.5%" },
    { title: "Pending Due",    value: totalDue,       icon: Wallet,      trend: "-3.2%"  },
    { title: "Total Expenses", value: totalExpenses,  icon: Receipt,     trend: "+8.1%"  },
    { title: "Balance",        value: totalBalance,   icon: Landmark,    trend: "+5.4%"  },
  ];

  const statusStyle = (status: string) => {
    if (status === "Paid")    return { background: "rgba(52,211,153,0.12)",  color: "#059669", border: "1px solid rgba(52,211,153,0.3)"  };
    if (status === "Partial") return { background: "rgba(251,191,36,0.12)",  color: "#d97706", border: "1px solid rgba(251,191,36,0.3)"  };
    return                           { background: "rgba(239,68,68,0.1)",    color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)" };
  };

  const txt = (opacity: number) => `rgba(26,10,46,${opacity})`;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .card-anim { animation: fadeUp 0.5s ease both; }
        .card-anim:nth-child(1) { animation-delay: 0.05s; }
        .card-anim:nth-child(2) { animation-delay: 0.12s; }
        .card-anim:nth-child(3) { animation-delay: 0.19s; }
        .card-anim:nth-child(4) { animation-delay: 0.26s; }
        .table-anim { animation: fadeUp 0.5s ease both; }
        .stat-card { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: default; }
        .stat-card:hover { transform: translateY(-5px) scale(1.02); }
        .row-hover { transition: background 0.15s ease; }
        .row-hover:hover { background: rgba(139,92,246,0.04) !important; }
      `}</style>

      {/* Header */}
      <div style={{ animation: "fadeUp 0.4s ease both", marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, #d946ef, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(217,70,239,0.35)",
          }}>
            <Zap size={20} color="white" fill="white" />
          </div>
          <h1 style={{
            fontSize: "28px", fontWeight: "800", margin: 0,
            background: "linear-gradient(90deg, #d946ef, #a855f7, #ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", letterSpacing: "-0.03em",
          }}>
            Command Center
          </h1>
        </div>
        <p style={{ color: txt(0.4), fontSize: "14px", margin: 0, paddingLeft: "52px" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px", marginBottom: "28px" }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          const s = cardStyles[i];
          return (
            <div key={card.title} className="card-anim stat-card" style={{
              borderRadius: "20px", background: s.grad, padding: "24px",
              position: "relative", overflow: "hidden",
              boxShadow: `0 8px 32px ${s.glow}, 0 0 0 1px rgba(255,255,255,0.15)`,
            }}>
              <div style={{
                position: "absolute", top: "-30px", right: "-30px",
                width: "120px", height: "120px", borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                animation: "pulseGlow 3s ease-in-out infinite",
                animationDelay: `${i * 0.4}s`,
              }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
                background: `linear-gradient(90deg, transparent, ${s.shimmer}, transparent)`,
                backgroundSize: "200% 100%",
                animation: "shimmer 2.5s linear infinite",
                animationDelay: `${i * 0.3}s`,
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
                    {card.title}
                  </p>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", color: "white", margin: "0 0 10px", letterSpacing: "-0.02em", fontFamily: "'Space Mono', monospace" }}>
                    ₹{card.value.toLocaleString("en-IN")}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <TrendingUp size={11} color="rgba(255,255,255,0.8)" />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
                      {card.trend} this month
                    </span>
                  </div>
                </div>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "13px",
                  background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}>
                  <Icon size={20} color="white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Recent Invoices */}
        <div className="table-anim" style={{
          borderRadius: "20px", background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(139,92,246,0.15)", overflow: "hidden",
          boxShadow: "0 8px 32px rgba(139,92,246,0.1)", animationDelay: "0.35s",
        }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #d946ef, #f472b6)", boxShadow: "0 0 8px rgba(217,70,239,0.6)" }} />
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: txt(0.9), margin: 0 }}>Recent Invoices</h2>
            </div>
            <span style={{ fontSize: "11px", color: txt(0.35), fontWeight: "600", letterSpacing: "0.08em" }}>LAST 5</span>
          </div>
          <div>
            {recentInvoices.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: txt(0.3), fontSize: "14px" }}>No invoices yet</div>
            ) : recentInvoices.map((inv, i) => {
              const colors: [string, string][] = [["#d946ef","#a21caf"],["#f43f5e","#be123c"],["#8b5cf6","#5b21b6"],["#ec4899","#9d174d"],["#d946ef","#8b5cf6"]];
              const [c1, c2] = colors[i % colors.length];
              return (
                <div key={inv.id} className="row-hover" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: i < recentInvoices.length - 1 ? "1px solid rgba(139,92,246,0.06)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: `linear-gradient(135deg, ${c1}, ${c2})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0,
                      boxShadow: `0 4px 12px ${c1}40`,
                    }}>
                      {inv.client_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: txt(0.9) }}>{inv.invoice_number}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: txt(0.45) }}>{inv.client_name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0 0 5px", fontSize: "14px", fontWeight: "700", color: txt(0.9), fontFamily: "'Space Mono', monospace" }}>
                      ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                    </p>
                    <span style={{ ...statusStyle(inv.payment_status), borderRadius: "999px", padding: "2px 10px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em" }}>
                      {inv.payment_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="table-anim" style={{
          borderRadius: "20px", background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(139,92,246,0.15)", overflow: "hidden",
          boxShadow: "0 8px 32px rgba(139,92,246,0.1)", animationDelay: "0.42s",
        }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg, #34d399, #059669)", boxShadow: "0 0 8px rgba(52,211,153,0.6)" }} />
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: txt(0.9), margin: 0 }}>Recent Payments</h2>
            </div>
            <span style={{ fontSize: "11px", color: txt(0.35), fontWeight: "600", letterSpacing: "0.08em" }}>LAST 5</span>
          </div>
          <div>
            {recentPayments.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: txt(0.3), fontSize: "14px" }}>No payments yet</div>
            ) : recentPayments.map((pay, i) => (
              <div key={pay.id} className="row-hover" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 24px",
                borderBottom: i < recentPayments.length - 1 ? "1px solid rgba(139,92,246,0.06)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: "700", color: "#059669", flexShrink: 0,
                  }}>
                    {(pay.invoices?.client_name ?? "U")?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: txt(0.9) }}>
                      {pay.invoices?.client_name ?? "Unknown Client"}
                    </p>
                    <p style={{ margin: 0, fontSize: "11px", color: txt(0.45) }}>{pay.payment_date}</p>
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: "15px", fontWeight: "700",
                  background: "linear-gradient(90deg, #059669, #34d399)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  +₹{Number(pay.amount_paid).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}