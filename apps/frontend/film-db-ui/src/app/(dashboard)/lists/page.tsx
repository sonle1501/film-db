import { ListManager } from '@/components/features/lists/ListManager';

export default function ListsPage() {
  return (
    <div className="text-white max-w-7xl mx-auto py-8 font-mono">
      <h1 className="text-3xl font-display font-bold mb-2 uppercase tracking-widest">// MY_WATCHLISTS</h1>
      <p className="text-xs text-text-muted-dark mb-8">// SESSION_LISTS: ACTIVE</p>
      <ListManager />
    </div>
  );
}
