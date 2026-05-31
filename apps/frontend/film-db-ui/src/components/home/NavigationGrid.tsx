"use client";

import Link from "next/link";

export function NavigationGrid() {
  const cards = [
    {
      title: "MOVIES",
      desc: "Browse, filter, and index over 10 million films. Access runtime details, release dates, and raw IMDB rating data.",
      href: "/movies",
      asciiIcon: "[▮▮]",
    },
    {
      title: "SEARCH",
      desc: "Execute multi-criteria smart search routines. Leverage fuzzy matches to resolve search vectors across titles and actors.",
      href: "/search",
      asciiIcon: "[?]",
    },
    {
      title: "GENRES",
      desc: "Explore cinema segments from high-octane Action to Cyberpunk Sci-Fi. Map film counts across diverse metadata nodes.",
      href: "/movies/genres",
      asciiIcon: "[#]",
    },
    {
      title: "PEOPLE",
      desc: "Inspect artist biographical profiles, direction histories, actor credits, and complete cast associations.",
      href: "/people",
      asciiIcon: "[@]",
    },
    {
      title: "PROJECT",
      desc: "Examine our frontend Next.js routing protocols, state systems via Zustand, and backend Spring Boot endpoints.",
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
    <section className="relative z-20 pb-16 pt-0 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid Container: Spaced layout with transparent background to prevent green color bleed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-transparent">
          {cards.map((card, i) => {
            return (
              <Link
                key={i}
                href={card.href}
                className="group flex flex-col bg-surface-elevated-dark/50 hover:bg-surface-elevated-dark/70 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-150 backdrop-blur-sm shadow-[0_0_25px_rgba(85,234,212,0.02)] rounded-none"
              >
                {/* Header Compartment: Title | Icon - cyan-tinted background (like HeroSection terminal) */}
                <div className="flex border-b border-primary-500/20 bg-primary-900/10">
                  {/* Title Cell */}
                  <div className="flex-grow py-5 px-5 font-display text-sm font-bold tracking-widest text-white uppercase group-hover:text-primary-500 transition-colors border-r border-primary-500/20">
                    {card.title}
                  </div>
                  {/* Icon Cell: Red Gradient with pulse (Cyberpunk Red) */}
                  <div className="w-16 shrink-0 flex items-center justify-center font-mono text-xs font-bold select-none">
                    <span className="bg-gradient-to-r from-red-accent to-[#ff5577] bg-clip-text text-transparent animate-pulse drop-shadow-[0_0_3px_rgba(255,0,85,0.5)]">
                      {card.asciiIcon}
                    </span>
                  </div>
                </div>

                {/* Content Compartment: Taller vertical space */}
                <div className="py-6 px-5 text-xs text-text-dark font-sans leading-relaxed flex-grow min-h-[130px]">
                  {card.desc}
                </div>

                {/* Label Compartment with prompt symbol ">" */}
                <div className="border-t border-primary-500/20 px-5 py-3 font-display text-[9px] select-none bg-black/45 flex items-center justify-between">
                  <span className="italic font-bold tracking-[0.25em] bg-gradient-to-r from-primary-500 to-yellow-accent bg-clip-text text-transparent uppercase flex items-center gap-1.5">
                    &gt; GRID BLOCK {i + 1}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
