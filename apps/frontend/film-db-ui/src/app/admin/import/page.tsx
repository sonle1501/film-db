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
          <h2 className="text-3xl font-bold font-display uppercase tracking-widest text-white">// IMDB_INGESTION_CONTROL</h2>
          <p className="text-text-muted-dark mt-1 text-xs font-mono uppercase leading-relaxed">
            Wipe staging schemas, fetch dataset chunks, index, and swap tables atomically.
          </p>
        </div>
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={startImportMutation.isPending || (activeJob && (activeJob.status === 'PENDING' || activeJob.status === 'IN_PROGRESS'))}
          className="flex items-center space-x-2 px-5 py-3 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent hover:text-black hover:border-cyan-accent disabled:opacity-50 text-xs font-mono font-bold uppercase rounded-none transition-colors cursor-pointer"
        >
          {startImportMutation.isPending || (activeJob && (activeJob.status === 'PENDING' || activeJob.status === 'IN_PROGRESS')) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>[ TRIGGER INGESTION ]</span>
        </button>
      </div>

      {/* Live System Feedback Panel */}
      {activeJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracker Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-none border border-white/10 bg-surface-dark p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-cyan-accent" />
                  <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">// INGESTION_STATUS_BOARD</h3>
                </div>
                <span className={`px-3 py-1 rounded-none text-xs font-mono font-bold border flex items-center space-x-1.5 ${
                  activeJob.status === 'SUCCESS'
                    ? 'bg-cyan-accent/10 text-cyan-accent border-cyan-accent/20'
                    : activeJob.status === 'FAILED'
                    ? 'bg-red-accent/10 text-red-accent border-red-accent/20'
                    : 'bg-yellow-accent/10 text-yellow-400 border-yellow-accent/20 animate-pulse'
                }`}>
                  {activeJob.status === 'IN_PROGRESS' || activeJob.status === 'PENDING' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                  ) : activeJob.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-accent" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-accent" />
                  )}
                  <span>{activeJob.status}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono uppercase font-bold text-text-muted-dark">
                  <span>Stage: {activeStageLabel}</span>
                  <span>{activeJob.progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-none overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-cyan-accent rounded-none transition-all duration-500 shadow-[0_0_8px_rgba(85,234,212,0.5)]"
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
                          <div className={`w-8 h-8 rounded-none flex items-center justify-center font-mono font-bold text-xs border transition-all z-10 ${
                            status === 'completed'
                              ? 'bg-cyan-accent/15 border-cyan-accent text-cyan-accent shadow-[0_0_8px_rgba(85,234,212,0.2)]'
                              : status === 'active'
                              ? 'bg-yellow-accent/15 border-yellow-accent text-yellow-accent shadow-[0_0_12px_rgba(243,230,0,0.3)] animate-pulse'
                              : status === 'failed'
                              ? 'bg-red-accent/15 border-red-accent text-red-accent shadow-[0_0_8px_rgba(255,0,85,0.2)]'
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}>
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : status === 'failed' ? (
                              <AlertCircle className="w-3.5 h-3.5" />
                            ) : (
                              `0${idx + 1}`
                            )}
                          </div>
                          <span className={`text-[9px] font-mono uppercase tracking-widest mt-2 absolute -bottom-5 whitespace-nowrap ${
                            status === 'active' ? 'text-yellow-accent font-bold' : 'text-text-muted-dark'
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                        {idx < STAGES.length - 1 && (
                          <div className={`h-[1px] flex-1 mx-2 ${
                            status === 'completed' ? 'bg-cyan-accent/35' : 'bg-white/10'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Terminal Console */}
            <div className="rounded-none border border-white/10 bg-black/85 shadow-xl overflow-hidden flex flex-col h-[320px]">
              <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-accent" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-accent">system_log_console</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-none bg-red-accent/60" />
                  <div className="w-2 h-2 rounded-none bg-yellow-accent/60" />
                  <div className="w-2 h-2 rounded-none bg-cyan-accent/60" />
                </div>
              </div>
              <div
                ref={consoleRef}
                className="p-4 flex-grow overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-white/10"
              >
                {activeJob.logs.length === 0 ? (
                  <div className="text-white/40 italic font-mono uppercase text-[10px]">[ WAITING FOR PIPELINE PROCESSES TO INITIALIZE LOGS... ]</div>
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
            <div className="rounded-none border border-white/10 bg-surface-dark p-6 shadow-xl space-y-6">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-accent" />
                <span>// JOB_METRICS</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-none p-4 border border-white/10 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-cyan-accent" />
                    <div>
                      <div className="text-[10px] font-mono uppercase text-text-muted-dark font-bold">Duration</div>
                      <div className="text-xs font-bold font-mono text-white mt-0.5">
                        {formatDuration(activeJob.startTime, activeJob.endTime)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-none p-4 border border-white/10 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-yellow-accent" />
                    <div>
                      <div className="text-[10px] font-mono uppercase text-text-muted-dark font-bold">Started At</div>
                      <div className="text-xs font-bold font-mono text-white mt-0.5">
                        {new Date(activeJob.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>

                {activeJob.errorMessage && (
                  <div className="bg-red-accent/5 border border-red-accent/20 rounded-none p-4 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-red-accent font-bold flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Pipeline Error</span>
                    </div>
                    <p className="text-xs text-red-accent/80 font-mono break-all">{activeJob.errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Logs List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display text-white flex items-center space-x-2">
          <History className="w-4 h-4 text-cyan-accent" />
          <span>// EXECUTION_HISTORY</span>
        </h3>

        {isHistoryLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 text-cyan-accent animate-spin" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="rounded-none border border-white/10 bg-surface-dark p-12 text-center text-text-muted-dark font-mono text-xs uppercase">
            No pipeline executions have been triggered yet.
          </div>
        ) : (
          <div className="bg-surface-dark border border-white/10 rounded-none overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5 font-mono text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Job ID</th>
                    <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Triggered By</th>
                    <th className="px-6 py-4 text-left text-text-muted-dark tracking-wider">Start Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent font-mono text-xs text-white/95">
                  {history.map((job) => (
                    <tr 
                      key={job.jobId} 
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${activeJobId === job.jobId ? 'bg-cyan-accent/5' : ''}`}
                      onClick={() => setActiveJobId(job.jobId)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-white truncate max-w-[180px]">
                        {job.jobId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-none border ${
                          job.status === 'SUCCESS'
                            ? 'bg-cyan-accent/10 text-cyan-accent border-cyan-accent/20'
                            : job.status === 'FAILED'
                            ? 'bg-red-accent/10 text-red-accent border-red-accent/20'
                            : 'bg-yellow-accent/10 text-yellow-400 border-yellow-400/20'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-muted-dark">
                        {formatDuration(job.startTime, job.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-muted-dark truncate max-w-[120px]">
                        {job.triggeredBy || 'SYSTEM'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-muted-dark">
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
          <div className="bg-surface-dark border border-white/10 rounded-none p-6 max-w-md w-full shadow-2xl space-y-6 transform scale-100 transition-all">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-accent/5 p-3 rounded-none border border-yellow-accent/20 shrink-0">
                <AlertCircle className="w-5 h-5 text-yellow-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">// RUN_INGESTION_PIPELINE</h3>
                <p className="text-xs font-mono uppercase text-text-muted-dark leading-relaxed">
                  You are about to trigger the IMDB dataset import pipeline. This will:
                </p>
                <ul className="text-xs font-mono uppercase text-text-muted-dark list-disc list-inside space-y-1 pl-1">
                  <li>Wipe current staging tables.</li>
                  <li>Download 7 large compressed TSV datasets.</li>
                  <li>Perform parallel COPY ingestion.</li>
                  <li>Rebuild database indexes.</li>
                  <li>Perform an atomic rename database swap.</li>
                </ul>
                <p className="text-xs text-yellow-accent font-mono uppercase font-bold pt-1">
                  Are you absolutely sure you want to proceed?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold uppercase text-white transition-colors cursor-pointer rounded-none"
              >
                [ CANCEL ]
              </button>
              <button
                onClick={handleConfirmRun}
                className="px-5 py-2 bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent hover:bg-cyan-accent hover:text-black hover:border-cyan-accent rounded-none text-xs font-mono font-bold uppercase transition-all cursor-pointer"
              >
                [ TRIGGER INGESTION ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
