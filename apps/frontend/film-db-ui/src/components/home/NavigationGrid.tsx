"use client";

import Link from "next/link";

export function NavigationGrid() {
  const cards = [
    {
      title: "MOVIES",
      desc: "Explore and filter over 10 million films",
      href: "/movies",
      asciiIcon: "[▮▮]",
    },
    {
      title: "SEARCH",
      desc: "Smart search and Vietnamese localized search",
      href: "/search",
      asciiIcon: "[?]",
    },
    {
      title: "GENRES",
      desc: "Explore genres like Action, Animation, Sci-Fi",
      href: "/movies/genres",
      asciiIcon: "[#]",
    },
    {
      title: "PEOPLE",
      desc: "Inspect cast, crew profiles",
      href: "/people",
      asciiIcon: "[@]",
    },
    {
      title: "PROJECT",
      desc: "About my project",
      href: "/movies",
      asciiIcon: "[*]",
    },
    {
      title: "WATCHLISTS",
      desc: "Curate your custom watchlist. Save films, log viewing history, rank entries, and share lists securely.",
      href: "/lists",
      asciiIcon: "[+]",
    },
  ];

  return (
    <section className="relative z-20 pb-16 pt-8 bg-transparent mt-8">
      {/* HUD Corner Brackets matching HeroSection */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/15 pointer-events-none"></div>
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/15 pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/15 pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/15 pointer-events-none"></div>

      {/* HUD Tiny Monitor Tag matching HeroSection */}
      {/* <div className="absolute left-1/2 top-4 -translate-x-1/2 font-display text-[8px] text-text-muted-dark/50 select-none tracking-[0.25em] pointer-events-none uppercase">
        [ SYS_NAVIGATION // DECR_LEVEL_1 ]
      </div> */}

      {/* HUD Left/Right Scale Bars matching HeroSection */}
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center">
        {/* HUD/Terminal Outer Wrapper */}
        <div className="relative w-full max-w-4xl border border-primary-500/15 bg-surface-elevated-dark/15 backdrop-blur-md p-6 md:p-8 rounded-none">
          {/* HUD Inner Corner Decorators */}
          <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-primary-500/45 pointer-events-none" />
          <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-primary-500/45 pointer-events-none" />
          <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-primary-500/45 pointer-events-none" />
          <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-primary-500/45 pointer-events-none" />

          {/* HUD Module Identifier Header */}
          <div className="absolute -top-3 left-6 px-3 bg-surface-dark border border-primary-500/15 font-display text-[12px] text-primary-500 tracking-[0.25em] uppercase select-none">
            [ GRID ]
          </div>
          
          {/* HUD Module Status Footer */}
          <div className="absolute -bottom-3 right-6 px-3 bg-surface-dark border border-primary-500/15 font-display text-[8px] text-yellow-accent tracking-[0.2em] uppercase select-none">
            DECR_UNIT: READY
          </div>

          {/* Main Grid Container: Spaced layout with transparent background to prevent green color bleed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-transparent">
            {cards.map((card, i) => {
              return (
                <Link
                  key={i}
                  href={card.href}
                  className="group flex flex-col bg-surface-elevated-dark/50 hover:bg-surface-elevated-dark/80 border border-primary-500/20 hover:border-primary-500/60 transition-all duration-300 backdrop-blur-sm shadow-[0_0_25px_rgba(85,234,212,0.01)] hover:shadow-[0_0_20px_rgba(85,234,212,0.12)] hover:-translate-y-1 hover:scale-[1.01] rounded-none"
                >
                  {/* Header Compartment: Title | Icon - cyan-tinted background (like HeroSection terminal) */}
                  <div className="flex border-b border-primary-500/20 bg-primary-900/10">
                    {/* Title Cell */}
                    <div className="flex-grow py-5 px-6 font-display text-sm font-bold tracking-widest text-white uppercase group-hover:text-primary-500 group-hover:translate-x-1.5 transition-all duration-300 border-r border-primary-500/20">
                      {card.title}
                    </div>
                    {/* Icon Cell: Red Gradient with pulse (Cyberpunk Red) */}
                    <div className="w-16 shrink-0 flex items-center justify-center font-mono text-xs font-bold select-none border-primary-500/20">
                      <span className="bg-gradient-to-r from-red-accent to-[#ff5577] bg-clip-text text-transparent animate-pulse drop-shadow-[0_0_3px_rgba(255,0,85,0.5)] group-hover:scale-110 transition-transform duration-300">
                        {card.asciiIcon}
                      </span>
                    </div>
                  </div>

                  {/* Content Compartment: Taller vertical space with interactive terminal prompt */}
                  <div className="py-8 px-6 text-sm text-text-dark font-mono leading-relaxed flex-grow min-h-[140px] flex items-start">
                    <span className="text-primary-500 font-mono mr-2.5 select-none group-hover:translate-x-0.5 transition-transform duration-200">&gt;</span>
                    <span>
                      {card.desc}
                      <span className="inline-block w-1.5 h-3.5 bg-primary-500/80 ml-1.5 align-middle opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-200"></span>
                    </span>
                  </div>

                  {/* Label Compartment with prompt symbol ">" */}
                  <div className="border-t border-primary-500/20 px-6 py-3.5 font-display text-[9px] select-none bg-black/45 flex items-center justify-between">
                    <span className="italic font-bold tracking-[0.25em] bg-gradient-to-r from-primary-500 to-yellow-accent bg-clip-text text-transparent uppercase flex items-center gap-1.5 group-hover:tracking-[0.32em] transition-all duration-300">
                      &gt; GRID BLOCK {i + 1}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
