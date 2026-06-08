import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-white text-slate-900 font-sans selection:bg-accent/20">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
