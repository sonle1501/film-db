'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api-client';
import { PendingRequestDto } from '@/types/admin';
import { toast } from 'react-hot-toast';

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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display">Pending Admin Jobs</h2>
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-400/10 text-red-400 p-4 rounded-md border border-red-400/20">
          Failed to load pending tasks.
        </div>
      )}

      {!isLoading && !error && jobs && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-elevated/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">Job ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">Action Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">Target Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted-dark uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-transparent">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted-dark">
                    No pending tasks found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.taskId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-dark font-mono truncate max-w-[150px]" title={job.taskId}>
                      {job.taskId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {job.actionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-dark font-mono truncate max-w-[150px]" title={job.targetEntityId}>
                      {job.targetEntityId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        job.state === 'PENDING'
                          ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                          : job.state === 'APPROVED'
                          ? 'bg-green-400/10 text-green-400 border-green-400/20'
                          : job.state === 'REJECTED'
                          ? 'bg-red-400/10 text-red-400 border-red-400/20'
                          : 'bg-gray-400/10 text-gray-400 border-gray-400/20'
                      }`}>
                        {job.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {job.actionType === 'ADMIN_APPROVAL' && job.state === 'PENDING' ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => approveMutation.mutate(job.targetEntityId)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="text-green-400 hover:text-green-300 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <span className="text-white/20">|</span>
                          <button
                            onClick={() => rejectMutation.mutate(job.targetEntityId)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-text-muted-dark text-xs">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
