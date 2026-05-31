import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", minHeight:"100vh", position:"relative", zIndex:1 }}>
      <style>{`
        @media print {
          [data-sidebar="true"] { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <Sidebar />
      <main style={{ flex:1, overflowY:"auto", padding:"32px", minHeight:"100vh" }}>
        {children}
      </main>
    </div>
  );
}