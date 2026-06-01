'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api-client';
import { UserListDto } from '@/types/users';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Database, Users, AlertCircle } from 'lucide-react';

const adminSearchSchema = z.object({
  userId: z.string().refine((val) => val.trim() === '' || z.string().uuid().safeParse(val.trim()).success, {
    message: 'Must be a valid UUID format (e.g. 123e4567-e89b-12d3-a456-426614174000)',
  }),
});

type AdminSearchFormValues = z.infer<typeof adminSearchSchema>;

export default function AdminUsersPage() {
  const [submittedUserId, setSubmittedUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSearchFormValues>({
    resolver: zodResolver(adminSearchSchema),
    defaultValues: {
      userId: '',
    },
  });

  const { data: allLists, isLoading: isLoadingAll, error: errorAll } = useQuery<UserListDto[]>({
    queryKey: ['admin-all-lists'],
    queryFn: adminApi.getAllLists,
  });

  const { data: userLists, isLoading: isLoadingUser, error: errorUser } = useQuery<UserListDto[]>({
    queryKey: ['admin-user-lists', submittedUserId],
    queryFn: () => adminApi.getUserLists(submittedUserId!),
    enabled: !!submittedUserId,
  });

  const onSubmit = (data: AdminSearchFormValues) => {
    const trimmed = data.userId.trim();
    if (trimmed) {
      setSubmittedUserId(trimmed);
    } else {
      setSubmittedUserId(null);
    }
  };

  const renderListTable = (lists: UserListDto[], title: string) => (
    <div className="bg-surface-dark border border-white/10 rounded-none overflow-hidden shadow-xl mb-8">
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center space-x-2">
        <Database className="w-4 h-4 text-cyan-accent" />
        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-cyan-accent">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 font-mono text-xs uppercase">
            <tr>
              <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">List ID</th>
              <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Owner (User ID)</th>
              <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Visibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-transparent font-mono text-xs text-white/95">
            {lists.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted-dark uppercase tracking-widest">
                  [ NO LISTS FOUND ]
                </td>
              </tr>
            ) : (
              lists.map((list) => (
                <tr key={list.listId} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted-dark truncate max-w-[150px]" title={list.listId}>
                    {list.listId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-white uppercase">
                    {list.nameList}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted-dark uppercase">
                    {list.listType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted-dark truncate max-w-[150px]" title={list.userId}>
                    {list.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-none border ${
                      list.isPublic 
                        ? 'bg-cyan-accent/10 text-cyan-accent border-cyan-accent/20' 
                        : 'bg-white/5 text-text-muted-dark border-white/10'
                    }`}>
                      {list.isPublic ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-widest text-white">// USER_MANAGEMENT</h2>
          <p className="text-text-muted-dark mt-1 text-xs font-mono uppercase leading-relaxed">
            Query user lists, scan system schemas, and monitor user configurations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar query card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-dark border border-white/10 p-6 rounded-none shadow-xl">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
              <Search className="w-4 h-4 text-cyan-accent" />
              <span>// QUERY_USER_LISTS</span>
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-text-muted-dark tracking-wider mb-1.5">User UUID</label>
                <input
                  type="text"
                  {...register('userId')}
                  placeholder="ENTER USER UUID..."
                  className="w-full rounded-none border border-white/10 bg-black/45 px-3 py-2 text-white placeholder-white/20 focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent text-xs font-mono uppercase tracking-wider transition-colors outline-none"
                />
                {errors.userId && (
                  <p className="mt-2 text-[10px] text-red-accent font-mono uppercase tracking-widest flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.userId.message}</span>
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent hover:text-black hover:border-cyan-accent text-xs font-mono font-bold uppercase rounded-none transition-all cursor-pointer"
              >
                [ SEARCH_REGISTRY ]
              </button>
            </form>
          </div>
        </div>

        {/* Results view area */}
        <div className="lg:col-span-2">
          {submittedUserId ? (
            <>
              {isLoadingUser && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-cyan-accent uppercase tracking-widest">
                    <span>Searching registry records...</span>
                    <span className="inline-block h-3.5 w-1.5 bg-cyan-accent cursor-blink"></span>
                  </div>
                </div>
              )}
              {errorUser && (
                <div className="bg-red-accent/5 border border-red-accent/20 text-red-accent p-4 rounded-none font-mono text-xs uppercase mb-8">
                  Failed to load lists for user {submittedUserId}.
                </div>
              )}
              {!isLoadingUser && !errorUser && userLists && renderListTable(userLists, `Lists for User: ${submittedUserId}`)}
            </>
          ) : (
            <>
              {isLoadingAll && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-cyan-accent uppercase tracking-widest">
                    <span>Querying database registries...</span>
                    <span className="inline-block h-3.5 w-1.5 bg-cyan-accent cursor-blink"></span>
                  </div>
                </div>
              )}
              {errorAll && (
                <div className="bg-red-accent/5 border border-red-accent/20 text-red-accent p-4 rounded-none font-mono text-xs uppercase mb-8">
                  Failed to load all lists from system directory.
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
