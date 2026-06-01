import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { NavigationGrid } from "@/components/home/NavigationGrid";

export default function Home() {
  return (
    <>
      <Navbar showSearch={false} />
      <main className="relative flex-1 flex flex-col bg-surface-dark overflow-hidden border-b border-white/10">
        {/* Background scanline matrix grid overlay covering both Hero and Navigation Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/95 to-surface-dark/50 z-10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,6px_100%] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/10 via-surface-dark to-surface-dark z-0" />
          
          {/* Subtle architectural vertical lines running top-to-bottom */}
          <div className="absolute left-[15%] top-0 bottom-0 w-[1px] bg-white/[0.02] z-0" />
          <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-white/[0.02] z-0" />
          <div className="absolute left-[85%] top-0 bottom-0 w-[1px] bg-white/[0.02] z-0" />
        </div>

        <HeroSection />
        <NavigationGrid />
      </main>
      <Footer />
    </>
  );
}
