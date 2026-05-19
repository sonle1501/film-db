import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-xl max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 font-display">Welcome to Admin Control Panel</h2>
      <p className="text-text-muted-dark mb-8">
        This is a simple placeholder for the admin UI. Here you can manage users, approve admin requests, and monitor the system.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block">
          <div className="h-full p-6 rounded-xl bg-elevated/50 border border-white/5 hover:border-primary-500/50 transition-colors cursor-pointer group">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-400 transition-colors">User Management</h3>
            <p className="text-sm text-text-muted-dark">View and manage user lists across the system.</p>
          </div>
        </Link>
        <Link href="/admin/jobs" className="block">
          <div className="h-full p-6 rounded-xl bg-elevated/50 border border-white/5 hover:border-primary-500/50 transition-colors cursor-pointer group">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-400 transition-colors">Admin Requests</h3>
            <p className="text-sm text-text-muted-dark">Approve or reject pending administrator requests.</p>
          </div>
        </Link>
        <div className="h-full p-6 rounded-xl bg-elevated/50 border border-white/5 hover:border-primary-500/50 transition-colors cursor-pointer group">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-400 transition-colors">System Analytics</h3>
          <p className="text-sm text-text-muted-dark">View system metrics and usage statistics. (Coming soon)</p>
        </div>
      </div>
    </div>
  );
}
