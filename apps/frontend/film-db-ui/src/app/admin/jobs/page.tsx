'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api-client';
import { PendingRequestDto } from '@/types/admin';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function AdminJobsPage() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, error } = useQuery<PendingRequestDto[]>({
    queryKey: ['admin-pending-tasks'],
    queryFn: adminApi.getPendingTasks,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => adminApi.approveAdmin(userId),
    onSuccess: (_, userId) => {
      toast.success('Admin request approved successfully!');
      queryClient.setQueryData<PendingRequestDto[]>(['admin-pending-tasks'], (old) => {
        if (!old) return old;
        return old.map((job) =>
          job.targetEntityId === userId ? { ...job, state: 'APPROVED' } : job
        );
      });
    },
    onError: (err) => {
      toast.error('Failed to approve admin request.');
      console.error(err);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => adminApi.rejectAdmin(userId),
    onSuccess: (_, userId) => {
      toast.success('Admin request rejected successfully!');
      queryClient.setQueryData<PendingRequestDto[]>(['admin-pending-tasks'], (old) => {
        if (!old) return old;
        return old.map((job) =>
          job.targetEntityId === userId ? { ...job, state: 'REJECTED' } : job
        );
      });
    },
    onError: (err) => {
      toast.error('Failed to reject admin request.');
      console.error(err);
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-widest text-white">// PENDING_ADMIN_JOBS</h2>
          <p className="text-text-muted-dark mt-1 text-xs font-mono uppercase leading-relaxed">
            Supervise, approve, or reject incoming administrative clearance requests.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-accent uppercase tracking-widest">
            <span>Querying active system job queues...</span>
            <span className="inline-block h-3.5 w-1.5 bg-cyan-accent cursor-blink"></span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-accent/5 border border-red-accent/20 text-red-accent p-4 rounded-none font-mono text-xs uppercase">
          Failed to load pending tasks.
        </div>
      )}

      {!isLoading && !error && jobs && (
        <div className="bg-surface-dark border border-white/10 rounded-none overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5 font-mono text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Job ID</th>
                  <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Action Type</th>
                  <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Target Entity</th>
                  <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-text-muted-dark tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent font-mono text-xs text-white/95">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted-dark uppercase tracking-widest">
                      [ NO PENDING TASKS FOUND ]
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.taskId} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-text-muted-dark truncate max-w-[150px]" title={job.taskId}>
                        {job.taskId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-white uppercase tracking-wider">
                        {job.actionType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-muted-dark truncate max-w-[150px]" title={job.targetEntityId}>
                        {job.targetEntityId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-none border ${
                          job.state === 'PENDING'
                            ? 'bg-yellow-accent/10 text-yellow-400 border-yellow-400/20'
                            : job.state === 'APPROVED'
                            ? 'bg-cyan-accent/10 text-cyan-accent border-cyan-accent/20'
                            : job.state === 'REJECTED'
                            ? 'bg-red-accent/10 text-red-accent border-red-accent/20'
                            : 'bg-white/5 text-text-muted-dark border-white/10'
                        }`}>
                          {job.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        {job.actionType === 'ADMIN_APPROVAL' && job.state === 'PENDING' ? (
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => approveMutation.mutate(job.targetEntityId)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="px-3 py-1 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent hover:text-black hover:border-cyan-accent text-[10px] font-mono font-bold uppercase rounded-none transition-colors cursor-pointer disabled:opacity-50"
                            >
                              [ APPROVE ]
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(job.targetEntityId)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="px-3 py-1 bg-red-accent/10 border border-red-accent/30 text-red-accent hover:bg-red-accent hover:text-black hover:border-red-accent text-[10px] font-mono font-bold uppercase rounded-none transition-colors cursor-pointer disabled:opacity-50"
                            >
                              [ REJECT ]
                            </button>
                          </div>
                        ) : (
                          <span className="text-text-muted-dark uppercase tracking-widest text-[10px]">[ OFFLINE ]</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
