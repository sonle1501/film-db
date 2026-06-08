import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="rounded-none border border-white/10 bg-surface-dark p-4 sm:p-8 shadow-xl max-w-6xl mx-auto mt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 font-display uppercase tracking-widest text-white">// SYSTEM_CONTROL_PANEL</h2>
      <p className="text-xs font-mono uppercase text-text-muted-dark mb-8 leading-relaxed">
        AUTHORIZED ACCESS ONLY
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block">
          <div className="h-full p-6 rounded-none bg-surface-elevated-dark border border-white/10 hover:border-cyan-accent hover:shadow-[0_0_12px_rgba(85,234,212,0.15)] transition-all duration-200 cursor-pointer group">
            <h3 className="font-bold font-display uppercase tracking-wider text-sm mb-2 text-white group-hover:text-cyan-accent transition-colors">User Management</h3>
            <p className="text-xs text-text-muted-dark font-mono mt-1">View and manage user lists across the system.</p>
          </div>
        </Link>
        <Link href="/admin/jobs" className="block">
          <div className="h-full p-6 rounded-none bg-surface-elevated-dark border border-white/10 hover:border-cyan-accent hover:shadow-[0_0_12px_rgba(85,234,212,0.15)] transition-all duration-200 cursor-pointer group">
            <h3 className="font-bold font-display uppercase tracking-wider text-sm mb-2 text-white group-hover:text-cyan-accent transition-colors">Admin Requests</h3>
            <p className="text-xs text-text-muted-dark font-mono mt-1">Approve or reject pending administrator requests.</p>
          </div>
        </Link>
        <Link href="/admin/import" className="block">
          <div className="h-full p-6 rounded-none bg-surface-elevated-dark border border-white/10 hover:border-cyan-accent hover:shadow-[0_0_12px_rgba(85,234,212,0.15)] transition-all duration-200 cursor-pointer group">
            <h3 className="font-bold font-display uppercase tracking-wider text-sm mb-2 text-white group-hover:text-cyan-accent transition-colors">IMDB Data Import</h3>
            <p className="text-xs text-text-muted-dark font-mono mt-1">Trigger and track the IMDB movies/people import pipeline.</p>
          </div>
        </Link>
        <div className="h-full p-6 rounded-none bg-surface-elevated-dark border border-white/10 transition-colors">
          <h3 className="font-bold font-display uppercase tracking-wider text-sm mb-2 text-white/40">System Analytics</h3>
          <p className="text-xs text-white/20 font-mono mt-1">[ COMING SOON ]</p>
        </div>
      </div>
    </div>
  );
}
