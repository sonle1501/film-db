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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-surface-dark/80">
          <h2 className="text-xl font-bold text-white">Edit List Item</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-400">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-lg font-medium">Updated Successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                {listType === "MIXTURE" ? (
                  <select
                    {...register("itemState")}
                    className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ALL_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 cursor-not-allowed">
                    {watchItemState.replace(/_/g, " ")}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
                <textarea
                  {...register("notes")}
                  className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                  placeholder="What did you think about it?"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
