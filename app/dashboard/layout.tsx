import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", padding: "32px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}