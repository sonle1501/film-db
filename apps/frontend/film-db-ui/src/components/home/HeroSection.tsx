import Link from "next/link";
import { LiveSearchInput } from "@/components/ui/LiveSearchInput";

export function HeroSection() {
  return (
    <div className="relative w-full flex items-center justify-center pb-16 pt-16 border-b border-white/5">
      {/* HUD Corner Brackets */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/15 pointer-events-none"></div>
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/15 pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/15 pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/15 pointer-events-none"></div>

      {/* HUD Tiny Monitor Tag */}
      {/* <div className="absolute left-1/2 top-4 -translate-x-1/2 font-display text-[8px] text-text-muted-dark/50 select-none tracking-[0.25em] pointer-events-none uppercase">
        [ SYS_MONITOR // DECR_LEVEL_0 ]
      </div> */}

      {/* HUD Left/Right Scale Bars */}
      <div className="absolute left-6 top-1/4 bottom-1/4 w-[1px] bg-white/5 flex flex-col justify-between items-center py-4 text-[8px] font-mono text-white/20 select-none pointer-events-none hidden lg:flex">
        <span>[00]</span>
        <span>[25]</span>
        <span>[50]</span>
        <span>[75]</span>
        <span>[99]</span>
      </div>
      <div className="absolute right-6 top-1/4 bottom-1/4 w-[1px] bg-white/5 flex flex-col justify-between items-center py-4 text-[8px] font-mono text-white/20 select-none pointer-events-none hidden lg:flex">
        <span>MAX</span>
        <span>•</span>
        <span>MID</span>
        <span>•</span>
        <span>MIN</span>
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
        
        {/* Technical Terminal Widget - Simulated Window */}
        <div className="mb-8 w-full max-w-4xl border border-primary-500/20 bg-surface-elevated-dark/50 shadow-[0_0_25px_rgba(85,234,212,0.02)] select-none rounded-none">
          {/* Terminal Window Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-primary-500/20 bg-primary-900/10 font-display text-[9px] text-[#55ead4] tracking-widest">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-accent animate-pulse shadow-[0_0_8px_#ff0055]"></span>
              TERMINAL
            </span>

          </div>

          <div className="p-6 font-display text-xs text-text-muted-dark leading-relaxed text-left uppercase tracking-widest sm:grid sm:grid-cols-[1.1fr_auto_1.2fr] sm:gap-x-8">
            {/* Left Column: ASCII Art Logo */}
            <div className="hidden md:flex flex-col justify-center text-primary-500 font-bold select-none text-[8px] leading-[1.15]">
              <pre>
{`  ██████╗██╗██╗     ███╗   ███╗     ██████╗ ██████╗ 
  ██╔════╝██║██║     ████╗ ████║     ██╔══██╗██╔══██╗
  █████╗  ██║██║     ██╔████╔██║     ██║  ██║██████╔╝
  ██╔══╝  ██║██║     ██║╚██╔╝██║     ██║  ██║██╔══██╗
  ██║     ██║███████╗██║ ╚═╝ ██║     ██████╔╝██████╔╝
  ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝     ╚═════╝ ╚═════╝ `}
              </pre>
            </div>
            
            {/* Middle Vertical Divider Line */}
            <div className="hidden md:block w-[1px] bg-white/10 self-stretch"></div>

            {/* Right Column: Terminal logs */}
            <div className="flex flex-col justify-center h-full font-mono text-xs text-white">
              <div className="pb-2 border-b border-white/10 font-bold">
                <span className="text-[#f3e600]">sonle@film-db</span><span className="text-white">:</span><span className="text-[#f3e600]">~$</span> <span className="text-white">systemctl status film-db</span>
              </div>
              <div className="space-y-1.5 pt-3 font-mono text-[11px] text-text-dark">
                <div className="flex"><span className="text-red-accent w-24 shrink-0">[AUTHOR]</span> <span className="text-white font-mono uppercase">Son Le's Open Source Project</span></div>
                <div className="flex"><span className="text-red-accent w-24 shrink-0">[DATASET]</span> <span className="text-white font-mono uppercase">IMDb Non-Commercial Dataset</span></div>
                <div className="flex"><span className="text-red-accent w-24 shrink-0">[CAPACITY]</span> <span className="text-white font-mono uppercase">10,000,000+ Movies & Extra Info</span></div>
                <div className="flex"><span className="text-red-accent w-24 shrink-0">[THEME]</span> <span className="text-white font-mono uppercase">Cyberpunk Aesthetic</span></div>
                <div className="flex items-center"><span className="text-red-accent w-24 shrink-0">[STATUS]</span> <span className="text-[#55ead4] flex items-center gap-1.5 font-bold">ONLINE<span className="inline-block h-3.5 w-1.5 bg-[#55ead4] cursor-blink"></span></span></div>
              </div>
            </div>
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-widest text-white max-w-4xl leading-[1.1] uppercase mb-2 mt-8">
          EXPLORE <span className="text-primary-500">FILM-DB</span>
        </h1>

        {/* Title decorative details */}
        {/* <div className="flex items-center gap-4 w-full max-w-md justify-center mb-6">
          <div className="h-[1px] bg-gradient-to-r from-transparent to-white/15 flex-grow"></div>
          <span className="font-display text-[9px] text-[#f3e600] tracking-[0.3em]">[ HUD_V.2.0 // DECRYPTED ]</span>
          <div className="h-[1px] bg-gradient-to-l from-transparent to-white/15 flex-grow"></div>
        </div> */}
        
        <div className="mt-8 w-full max-w-4xl z-30">
          <LiveSearchInput
            variant="hero"
            placeholder="ENTER CRITERIA (MOVIE, PERSON, YEAR)..."
          />
        </div>


      </div>
    </div>
  );
}
