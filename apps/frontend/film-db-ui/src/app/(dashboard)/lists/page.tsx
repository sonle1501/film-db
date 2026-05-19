import { ListManager } from '@/components/features/lists/ListManager';

export default function ListsPage() {
  return (
    <div className="text-white max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-display font-bold mb-6">My Lists</h1>
      <p className="text-text-muted-dark mb-8">Manage your custom lists here.</p>
      <ListManager />
    </div>
  );
}
