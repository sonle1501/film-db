'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api-client';
import { UserListDto } from '@/types/users';

export default function AdminUsersPage() {
  const [searchUserId, setSearchUserId] = useState('');
  const [submittedUserId, setSubmittedUserId] = useState<string | null>(null);

  const { data: allLists, isLoading: isLoadingAll, error: errorAll } = useQuery<UserListDto[]>({
    queryKey: ['admin-all-lists'],
    queryFn: adminApi.getAllLists,
  });

  const { data: userLists, isLoading: isLoadingUser, error: errorUser } = useQuery<UserListDto[]>({
    queryKey: ['admin-user-lists', submittedUserId],
    queryFn: () => adminApi.getUserLists(submittedUserId!),
    enabled: !!submittedUserId,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUserId.trim()) {
      setSubmittedUserId(searchUserId.trim());
    } else {
      setSubmittedUserId(null);
    }
  };

  const renderListTable = (lists: UserListDto[], title: string) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md mb-8">
      <div className="px-6 py-4 border-b border-white/10 bg-elevated/50">
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-transparent">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">List ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">Owner (User ID)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">Visibility</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-transparent">
          {lists.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-text-muted-dark">
                No lists found.
              </td>
            </tr>
          ) : (
            lists.map((list) => (
              <tr key={list.listId} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-dark font-mono truncate max-w-[150px]" title={list.listId}>
                  {list.listId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {list.nameList}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-dark">
                  {list.listType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-dark font-mono truncate max-w-[150px]" title={list.userId}>
                  {list.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${list.isPublic ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-text-muted-dark/10 text-text-muted-dark border border-white/10'}`}>
                    {list.isPublic ? 'Public' : 'Private'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold font-display mb-6">User Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
            <h3 className="text-lg font-medium text-white mb-4">Query User Lists</h3>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted-dark mb-1">User ID</label>
                <input
                  type="text"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  placeholder="Enter User UUID..."
                  className="w-full rounded-md border border-white/10 bg-elevated/50 px-3 py-2 text-white placeholder-text-muted-dark focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {submittedUserId ? (
            <>
              {isLoadingUser && (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {errorUser && (
                <div className="bg-red-400/10 text-red-400 p-4 rounded-md border border-red-400/20 mb-8">
                  Failed to load lists for user {submittedUserId}.
                </div>
              )}
              {!isLoadingUser && !errorUser && userLists && renderListTable(userLists, `Lists for User: ${submittedUserId}`)}
            </>
          ) : (
            <>
              {isLoadingAll && (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {errorAll && (
                <div className="bg-red-400/10 text-red-400 p-4 rounded-md border border-red-400/20 mb-8">
                  Failed to load all lists.
                </div>
              )}
              {!isLoadingAll && !errorAll && allLists && renderListTable(allLists, 'All Lists in System')}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
