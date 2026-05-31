"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Users, Wallet,
  Receipt, Landmark, CreditCard, Settings, LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard",          icon: LayoutDashboard },
  { name: "Invoices",  href: "/dashboard/invoices", icon: FileText },
  { name: "Clients",   href: "/dashboard/clients",  icon: Users },
  { name: "Payments",  href: "/dashboard/payments", icon: Wallet },
  { name: "Expenses",  href: "/dashboard/expenses", icon: Receipt },
  { name: "Accounts",  href: "/dashboard/accounts", icon: Landmark },
  { name: "EMI",       href: "/dashboard/emi",      icon: CreditCard },
  { name: "Settings",  href: "/dashboard/settings", icon: Settings },
];

async function handleLogout() {
  const { createClient } = await import("@/lib/client");
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/login";
}

function NavItem({ item, active }: { item: typeof menuItems[0]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "11px",
        padding: "10px 14px", borderRadius: "11px",
        background: active ? "linear-gradient(135deg, rgba(217,70,239,0.12), rgba(139,92,246,0.12))" : "transparent",
        border: active ? "1px solid rgba(168,85,247,0.2)" : "1px solid transparent",
        color: active ? "#a855f7" : "rgba(26,10,46,0.55)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative",
      }}>
        {active && (
          <div style={{
            position: "absolute", left: 0, top: "20%", bottom: "20%",
            width: "3px", borderRadius: "0 3px 3px 0",
            background: "linear-gradient(180deg, #d946ef, #8b5cf6)",
          }} />
        )}
        <Icon size={18} />
        <span style={{
          fontSize: "13.5px",
          fontWeight: active ? "700" : "500",
          color: active ? "#a855f7" : "rgba(26,10,46,0.7)",
        }}>
          {item.name}
        </span>
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div data-sidebar="true" style={{
  width: "260px", minHeight: "100vh",
  background: "rgba(250,245,255,0.9)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderRight: "1px solid rgba(139,92,246,0.15)",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh", zIndex: 10,
    }}>

     {/* Logo */}
<div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <svg width="38" height="38" viewBox="0 0 44 44" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
        <linearGradient id="sg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient>
      </defs>
      <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill="none" stroke="url(#sg1)" strokeWidth="2.5"/>
      <polygon points="22,10 34,17 34,31 22,38 10,31 10,17" fill="none" stroke="url(#sg2)" strokeWidth="1.5" opacity="0.6"/>
      <rect x="17" y="17" width="10" height="10" rx="2" fill="url(#sg1)"/>
    </svg>
    <div>
      <div style={{
        fontWeight: "800", fontSize: "17px", letterSpacing: "-0.02em",
        background: "linear-gradient(90deg, #d946ef, #8b5cf6, #3b82f6)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>Qubrix</div>
      <div style={{ fontSize: "9px", color: "rgba(26,10,46,0.4)", letterSpacing: "0.12em", fontWeight: "700" }}>
        BILLING SUITE
      </div>
    </div>
  </div>
</div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(26,10,46,0.35)", letterSpacing: "0.12em", padding: "0 12px", marginBottom: "6px" }}>
          MAIN MENU
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {menuItems.slice(0, 6).map(item => (
            <NavItem key={item.name} item={item} active={
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            } />
          ))}
        </div>

        <div style={{ marginTop: "20px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(26,10,46,0.35)", letterSpacing: "0.12em", padding: "0 12px", marginBottom: "6px" }}>
            FINANCE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {menuItems.slice(6).map(item => (
              <NavItem key={item.name} item={item} active={
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              } />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        <div style={{
          padding: "12px 14px", borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(217,70,239,0.08), rgba(139,92,246,0.08))",
          border: "1px solid rgba(168,85,247,0.15)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #d946ef, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(217,70,239,0.3)",
          }}>A</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "rgba(26,10,46,0.85)" }}>Admin</div>
            <div style={{ fontSize: "11px", color: "rgba(26,10,46,0.4)" }}>Administrator</div>
          </div>
          <button onClick={handleLogout} style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "8px", padding: "6px 10px",
            color: "#dc2626", cursor: "pointer",
            fontSize: "11px", fontWeight: "700",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}