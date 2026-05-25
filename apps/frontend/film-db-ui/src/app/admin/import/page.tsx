'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal, 
  History, 
  Database, 
  ChevronRight, 
  Calendar,
  Clock,
  User,
  Activity
} from 'lucide-react';

interface ImportJobHistoryDto {
  jobId: string;
  jobType: string;
  targetDataset: string;
  status: string;
  progress: number;
  currentStage: string;
  startTime: string;
  endTime: string | null;
  errorMessage: string | null;
  triggeredBy: string | null;
  logs: string[];
}

const STAGES = [
  { id: 'PREPARATION', label: 'Preparation' },
  { id: 'DOWNLOADING', label: 'Downloading' },
  { id: 'IMPORTING', label: 'Importing' },
  { id: 'INDEXING', label: 'Indexing' },
  { id: 'SWAP', label: 'Atomic Swap' }
];

export default function AdminImportPage() {
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Fetch job history runs
  const { data: history, isLoading: isHistoryLoading } = useQuery<ImportJobHistoryDto[]>({
    queryKey: ['admin-import-history'],
    queryFn: adminApi.getImportHistory,
    refetchInterval: 10000, // Refresh history list every 10 seconds
  });

  // Query to track active job status with polling
  const { data: activeJob, error: statusError } = useQuery<ImportJobHistoryDto>({
    queryKey: ['admin-import-status', activeJobId],
    queryFn: () => adminApi.getImportStatus(activeJobId!),
    enabled: !!activeJobId,
    refetchInterval: (query) => {
      const job = query.state.data as ImportJobHistoryDto | undefined;
      if (!job) return 1000;
      return (job.status === 'PENDING' || job.status === 'IN_PROGRESS') ? 1000 : false;
    }
  });

  // Trigger import mutation
  const startImportMutation = useMutation({
    mutationFn: adminApi.runImportPipeline,
    onSuccess: (data: ImportJobHistoryDto) => {
      toast.success('IMDB Dataset Import Pipeline initiated!');
      setActiveJobId(data.jobId);
      queryClient.invalidateQueries({ queryKey: ['admin-import-history'] });
    },
    onError: (err) => {
      toast.error('Failed to trigger import pipeline.');
      console.error(err);
    }
  });

  // Auto-scroll logs terminal console to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [activeJob?.logs]);

  // Check if there is an active job running in the history on page load
  useEffect(() => {
    if (history && history.length > 0) {
      const runningJob = history.find(
        (job) => job.status === 'PENDING' || job.status === 'IN_PROGRESS'
      );
      if (runningJob && !activeJobId) {
        setActiveJobId(runningJob.jobId);
      }
    }
  }, [history, activeJobId]);

  const handleConfirmRun = () => {
    setIsConfirmOpen(false);
    startImportMutation.mutate();
  };

  const getLogLineColor = (line: string) => {
    const lower = line.toLowerCase();
    if (lower.includes('success') || lower.includes('complete') || lower.includes('successfully')) {
      return 'text-green-400 font-semibold';
    }
    if (lower.includes('fail') || lower.includes('error') || lower.includes('exception')) {
      return 'text-red-400 font-semibold';
    }
    if (lower.includes('download')) {
      return 'text-cyan-400';
    }
    if (lower.includes('starting') || lower.includes('wiping') || lower.includes('dropping')) {
      return 'text-yellow-400';
    }
    if (lower.includes('ingesting') || lower.includes('inserted')) {
      return 'text-purple-400';
    }
    return 'text-white/70';
  };

  const getStageStatus = (stageId: string) => {
    if (!activeJob) return 'pending';
    if (activeJob.status === 'FAILED') {
      if (activeJob.currentStage === stageId) return 'failed';
    }
    if (activeJob.status === 'SUCCESS') return 'completed';

    const currentStageIndex = STAGES.findIndex((s) => s.id === activeJob.currentStage);
    const stageIndex = STAGES.findIndex((s) => s.id === stageId);

    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'active';
    return 'pending';
  };

  const formatDuration = (startStr: string, endStr: string | null) => {
    const start = new Date(startStr).getTime();
    const end = endStr ? new Date(endStr).getTime() : Date.now();
    const diff = end - start;
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const activeStageLabel = STAGES.find(s => s.id === activeJob?.currentStage)?.label || activeJob?.currentStage || 'Idle';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold font-display text-white">IMDB Ingestion Control</h2>
          <p className="text-text-muted-dark mt-1 text-sm">
            Wipe staging schemas, fetch dataset chunks, index, and swap tables atomically.
          </p>
        </div>
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={startImportMutation.isPending || (activeJob && (activeJob.status === 'PENDING' || activeJob.status === 'IN_PROGRESS'))}
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
        >
          {startImportMutation.isPending || (activeJob && (activeJob.status === 'PENDING' || activeJob.status === 'IN_PROGRESS')) ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5 fill-current" />
          )}
          <span>Trigger Dataset Import</span>
        </button>
      </div>

      {/* Live System Feedback Panel */}
      {activeJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracker Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-primary-400" />
                  <h3 className="text-lg font-bold font-display text-white">Ingestion Status Board</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${
                  activeJob.status === 'SUCCESS'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : activeJob.status === 'FAILED'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                }`}>
                  {activeJob.status === 'IN_PROGRESS' || activeJob.status === 'PENDING' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                  ) : activeJob.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span>{activeJob.status}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted-dark font-medium">Stage: {activeStageLabel}</span>
                  <span className="text-white font-bold font-mono">{activeJob.progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-primary-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${activeJob.progress}%` }}
                  />
                </div>
              </div>

              {/* Live Timeline Steps */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  {STAGES.map((stage, idx) => {
                    const status = getStageStatus(stage.id);
                    return (
                      <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all z-10 ${
                            status === 'completed'
                              ? 'bg-green-500/20 border-green-400 text-green-400'
                              : status === 'active'
                              ? 'bg-primary-500/20 border-primary-400 text-primary-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] animate-pulse'
                              : status === 'failed'
                              ? 'bg-red-500/20 border-red-400 text-red-400'
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}>
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : status === 'failed' ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span className={`text-[10px] mt-2 font-semibold absolute -bottom-5 whitespace-nowrap ${
                            status === 'active' ? 'text-primary-400 font-bold' : 'text-text-muted-dark'
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                        {idx < STAGES.length - 1 && (
                          <div className={`h-[2px] flex-1 mx-2 ${
                            status === 'completed' ? 'bg-green-500/30' : 'bg-white/10'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Terminal Console */}
            <div className="rounded-2xl border border-white/10 bg-black/60 shadow-xl overflow-hidden backdrop-blur-md flex flex-col h-[320px]">
              <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white/80">system_log_console</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <div
                ref={consoleRef}
                className="p-4 flex-grow overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-white/10"
              >
                {activeJob.logs.length === 0 ? (
                  <div className="text-white/40 italic">Waiting for pipeline processes to initialize logs...</div>
                ) : (
                  activeJob.logs.map((logLine, index) => (
                    <div key={index} className="flex items-start space-x-2 leading-relaxed">
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0 mt-0.5" />
                      <span className={getLogLineColor(logLine)}>{logLine}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl space-y-6">
              <h3 className="text-lg font-bold font-display text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span>Job Metrics</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs text-text-muted-dark font-medium">Duration</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {formatDuration(activeJob.startTime, activeJob.endTime)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-xs text-text-muted-dark font-medium">Started At</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {new Date(activeJob.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>

                {activeJob.errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-1">
                    <div className="text-xs text-red-400 font-bold flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Pipeline Error</span>
                    </div>
                    <p className="text-xs text-red-300 font-mono break-all">{activeJob.errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Logs List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-display text-white flex items-center space-x-2">
          <History className="w-5 h-5 text-primary-400" />
          <span>Execution History</span>
        </h3>

        {isHistoryLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-text-muted-dark backdrop-blur-md">
            No pipeline executions have been triggered yet.
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted-dark uppercase tracking-wider">Job ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted-dark uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted-dark uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted-dark uppercase tracking-wider">Triggered By</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted-dark uppercase tracking-wider">Start Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent font-medium">
                  {history.map((job) => (
                    <tr 
                      key={job.jobId} 
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${activeJobId === job.jobId ? 'bg-primary-500/10' : ''}`}
                      onClick={() => setActiveJobId(job.jobId)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono truncate max-w-[180px]">
                        {job.jobId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          job.status === 'SUCCESS'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : job.status === 'FAILED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-dark">
                        {formatDuration(job.startTime, job.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-dark font-mono truncate max-w-[120px]">
                        {job.triggeredBy || 'SYSTEM'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-dark">
                        {new Date(job.startTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 transform scale-100 transition-all">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white">Run Ingestion Pipeline?</h3>
                <p className="text-sm text-text-muted-dark leading-relaxed">
                  You are about to trigger the IMDB dataset import pipeline. This will:
                </p>
                <ul className="text-xs text-text-muted-dark list-disc list-inside space-y-1 pl-1">
                  <li>Wipe current staging tables.</li>
                  <li>Download 7 large compressed TSV datasets.</li>
                  <li>Perform parallel COPY ingestion.</li>
                  <li>Rebuild database indexes.</li>
                  <li>Perform an atomic rename database swap.</li>
                </ul>
                <p className="text-xs text-yellow-500 font-medium pt-1">
                  Are you absolutely sure you want to proceed?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRun}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-sm font-semibold text-white transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                Trigger Ingestion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
