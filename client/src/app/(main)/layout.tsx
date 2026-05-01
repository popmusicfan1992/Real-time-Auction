import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-20 md:pt-32 pb-24 md:pb-16 flex flex-col gap-12">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
