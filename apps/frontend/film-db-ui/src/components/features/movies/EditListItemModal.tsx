"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Check, Save } from "lucide-react";
import { useUpdateListItem } from "@/hooks/useLists";
import { useForm } from "react-hook-form";

interface EditListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  item: any;
  listType: string;
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

export function EditListItemModal({ isOpen, onClose, listId, item, listType }: EditListItemModalProps) {
  const [error, setError] = useState<string | null>(null);
  
  const { mutateAsync: updateListItem, isPending, isSuccess } = useUpdateListItem();

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      itemState: "",
      notes: ""
    }
  });

  const watchItemState = watch("itemState");

  useEffect(() => {
    if (isOpen && item) {
      reset({
        notes: item.notes || "",
        itemState: item.state || ""
      });
      setError(null);
    }
  }, [isOpen, item, reset]);

  const onSubmit = async (data: any) => {
    if (!item) return;

    setError(null);
    try {
      await updateListItem({
        listId,
        data: {
          itemId: item.itemId,
          state: data.itemState,
          notes: data.notes.trim() !== "" ? data.notes : undefined,
        }
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to update item.");
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-mono text-xs">
      <div className="bg-surface-dark border border-white/10 rounded-none w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/60 select-none">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-accent animate-pulse"></span>
            // EDIT_LIST_ITEM
          </h2>
          <button 
            onClick={onClose} 
            className="text-[10px] text-text-muted-dark hover:text-red-accent transition-all font-mono font-bold px-1.5 py-0.5 border border-transparent hover:border-red-accent/30 hover:bg-red-accent/15 rounded-none cursor-pointer"
          >
            ESC [X]
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-accent/10 border border-red-accent/20 rounded-none text-red-accent text-xs">
              // SYSTEM_ERROR: {error}
            </div>
          )}

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-400">
              <div className="w-12 h-12 bg-green-400/20 border border-green-500/30 rounded-none flex items-center justify-center mb-4">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm uppercase tracking-wider font-bold">Updated Successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// CLASSIFICATION_STATE</label>
                {listType === "MIXTURE" ? (
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
                  disabled={isPending}
                  className="w-full bg-cyan-accent text-surface-dark font-black hover:bg-[#2be0c5] shadow-[0_0_8px_rgba(85,234,212,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-none uppercase cursor-pointer py-3 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isPending ? "SAVING_CHANGES..." : "[ EXECUTE_SAVE_CHANGES ]"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
