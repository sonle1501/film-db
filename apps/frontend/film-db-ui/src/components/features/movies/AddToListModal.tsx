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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-surface-dark/80">
          <h2 className="text-xl font-bold text-white">Add to List</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-grow">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-400">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-lg font-medium">Added Successfully!</p>
            </div>
          ) : !selectedList ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Select a list:</h3>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : lists.length > 0 ? (
                lists.map((list) => (
                  <button
                    key={list.listId}
                    onClick={() => handleSelectList(list)}
                    className="w-full text-left p-3 rounded-xl border border-white/5 bg-surface-dark hover:bg-white/5 hover:border-primary-500/30 transition-all flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-medium text-white group-hover:text-primary-400 transition-colors">
                        {list.nameList}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Type: {list.listType.replace(/_/g, " ")} • {list.isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-500 group-hover:text-primary-500" />
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  You don't have any lists yet.
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">
                  Adding to: <span className="text-white font-medium">{selectedList.nameList}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedList(null)}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  Change List
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                {selectedList.listType === "MIXTURE" ? (
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
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isSubmitting ? "Adding..." : "Add to List"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
