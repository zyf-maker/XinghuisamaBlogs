import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}