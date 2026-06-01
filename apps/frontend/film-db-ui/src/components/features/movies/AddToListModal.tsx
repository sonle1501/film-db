"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Plus, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { userApi } from "@/lib/api-client";

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: string;
}

const ALL_STATES = [
  "PLAN_TO_WATCH",
  "WATCHING",
  "WATCHED",
  "LIKED",
  "LOVED",
  "HATED",
  "NEUTRAL"
];

export function AddToListModal({ isOpen, onClose, movieId }: AddToListModalProps) {
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      itemState: "",
      notes: ""
    }
  });

  const watchItemState = watch("itemState");

  useEffect(() => {
    if (isOpen) {
      fetchLists();
      setSelectedList(null);
      reset({ itemState: "", notes: "" });
      setSuccess(false);
      setError(null);
    }
  }, [isOpen, reset]);

  const fetchLists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getLists();
      setLists(data || []);
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to load your lists.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectList = (list: any) => {
    setSelectedList(list);
    if (list.listType !== "MIXTURE") {
      setValue("itemState", list.listType);
    } else {
      setValue("itemState", "PLAN_TO_WATCH");
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedList) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await userApi.addListItem(selectedList.listId, {
        movieId,
        state: data.itemState,
        notes: data.notes.trim() !== "" ? data.notes : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to add movie to list.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-mono text-xs">
      <div className="bg-surface-dark border border-white/10 rounded-none w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/60 select-none">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-accent animate-pulse"></span>
            // ADD_TO_LIST
          </h2>
          <button 
            onClick={onClose} 
            className="text-[10px] text-text-muted-dark hover:text-red-accent transition-all font-mono font-bold px-1.5 py-0.5 border border-transparent hover:border-red-accent/30 hover:bg-red-accent/15 rounded-none cursor-pointer"
          >
            ESC [X]
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-grow">
          {error && (
            <div className="mb-4 p-3 bg-red-accent/10 border border-red-accent/20 rounded-none text-red-accent text-xs">
              // SYSTEM_ERROR: {error}
            </div>
          )}
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-400">
              <div className="w-12 h-12 bg-green-400/20 border border-green-500/30 rounded-none flex items-center justify-center mb-4">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm uppercase tracking-wider font-bold">Added Successfully!</p>
            </div>
          ) : !selectedList ? (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold text-text-muted-dark uppercase tracking-wider mb-2">// SELECT_TARGET_WATCHLIST</h3>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-accent" />
                </div>
              ) : lists.length > 0 ? (
                lists.map((list) => (
                  <button
                    key={list.listId}
                    onClick={() => handleSelectList(list)}
                    className="w-full text-left p-3 rounded-none border border-white/5 bg-black/20 hover:bg-white/5 hover:border-cyan-accent/20 transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-cyan-accent transition-colors uppercase tracking-wide">
                        {list.nameList}
                      </div>
                      <div className="text-[10px] text-text-muted-dark mt-1 font-mono uppercase">
                        Type: {list.listType.replace(/_/g, " ")} • {list.isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-text-muted-dark group-hover:text-cyan-accent" />
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-text-muted-dark text-xs">
                  // REGISTER_DATA: NO WATCHLISTS DETECTED.
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-text-muted-dark uppercase tracking-wider">
                  Target: <span className="text-cyan-accent font-bold uppercase">{selectedList.nameList}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedList(null)}
                  className="text-xs text-yellow-accent hover:underline cursor-pointer"
                >
                  [ CHANGE_LIST ]
                </button>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// CLASSIFICATION_STATE</label>
                {selectedList.listType === "MIXTURE" ? (
                  <div className="relative border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
                    <select
                      {...register("itemState")}
                      className="w-full bg-transparent border-0 px-3 py-2 text-white focus:outline-none focus:ring-0 text-sm font-mono cursor-pointer"
                    >
                      {ALL_STATES.map((state) => (
                        <option key={state} value={state} className="bg-surface-dark text-white font-mono text-xs">
                          {state.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-2.5 text-cyan-accent font-bold uppercase">
                    {watchItemState.replace(/_/g, " ")}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// NOTES_METADATA (OPTIONAL)</label>
                <div className="relative border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
                  <textarea
                    {...register("notes")}
                    className="w-full bg-transparent border-0 px-3 py-2 text-white focus:outline-none focus:ring-0 text-sm font-mono resize-none"
                    rows={3}
                    placeholder="Enter notes..."
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-accent text-surface-dark font-black hover:bg-[#2be0c5] shadow-[0_0_8px_rgba(85,234,212,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-none uppercase cursor-pointer py-3 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isSubmitting ? "ADDING_ITEM..." : "[ EXECUTE_ADD_ITEM ]"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
