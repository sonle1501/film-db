'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLists, useCreateList, useUpdateList, useDeleteList } from '@/hooks/useLists';
import { UserListDto } from '@/types/users';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

interface ListFormData {
  nameList: string;
  type: string;
  isPublic: boolean;
}

const VALID_TYPES = [
  'PLAN_TO_WATCH',
  'WATCHING',
  'WATCHED',
  'LIKED',
  'LOVED',
  'HATED',
  'MIXTURE'
];

export function ListManager() {
  const { data: lists, isLoading, error } = useLists();
  const { mutate: createList, isPending: isCreating } = useCreateList();
  const { mutate: updateList, isPending: isUpdating } = useUpdateList();
  const { mutate: deleteList, isPending: isDeleting } = useDeleteList();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<UserListDto | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ListFormData>({
    defaultValues: {
      nameList: '',
      type: '',
      isPublic: true,
    }
  });

  const openCreateModal = () => {
    setEditingList(null);
    reset({
      nameList: '',
      type: '',
      isPublic: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (list: UserListDto) => {
    setEditingList(list);
    reset({
      nameList: list.nameList,
      type: list.listType || '',
      isPublic: list.isPublic,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      const loadingToast = toast.loading('Deleting list...');
      deleteList(listId, {
        onSuccess: () => {
          toast.success('List deleted successfully!', { id: loadingToast });
        },
        onError: (error) => {
          toast.error('Failed to delete list. Please try again.', { id: loadingToast });
          console.error('Delete list error:', error);
        }
      });
    }
  };

  const onSubmit = (data: ListFormData) => {
    const upperType = data.type.trim().toUpperCase();
    
    if (editingList) {
      const loadingToast = toast.loading('Updating list...');
      updateList(
        { 
          userId: editingList.userId,
          listId: editingList.listId,
          nameList: data.nameList,
          isPublic: data.isPublic,
          isCustom: editingList.isCustom,
          listType: upperType
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
            setEditingList(null);
            toast.success('List updated successfully!', { id: loadingToast });
          },
          onError: (error) => {
            toast.error('Failed to update list. Please try again.', { id: loadingToast });
            console.error('Update list error:', error);
          }
        }
      );
    } else {
      const loadingToast = toast.loading('Creating list...');
      createList(
        { ...data, type: upperType },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
            toast.success('List created successfully!', { id: loadingToast });
          },
          onError: (error) => {
            toast.error('Failed to create list. Please try again.', { id: loadingToast });
            console.error('Create list error:', error);
          }
        }
      );
    }
  };

  if (isLoading) return <div className="py-8 text-center text-text-muted">Loading lists...</div>;
  if (error) return <div className="py-8 text-center text-red-500">Error loading lists. Please try again.</div>;

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="px-4 py-2 border border-cyan-accent bg-cyan-accent font-bold uppercase tracking-widest text-surface-dark hover:bg-transparent hover:text-cyan-accent transition-all duration-300 rounded-none shadow-[0_0_8px_rgba(85,234,212,0.2)] hover:shadow-[0_0_16px_rgba(85,234,212,0.5)] cursor-pointer"
        >
          [ CREATE_CUSTOM_LIST ]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists?.map((list: UserListDto) => (
          <div key={list.listId} className="bg-black/20 border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-accent/40 transition-all duration-300 rounded-none hover:shadow-[0_0_12px_rgba(85,234,212,0.05)]">
            <div>
              <div className="flex justify-between items-start mb-4 pb-2 border-b border-white/5">
                <h3 className="text-base font-bold text-white line-clamp-1 flex-1 pr-2 uppercase tracking-wider font-mono" title={list.nameList}>
                  {list.nameList}
                </h3>
                <div className="flex space-x-3 shrink-0 text-[10px]">
                  <button 
                    onClick={() => openEditModal(list)}
                    className="text-cyan-accent hover:underline cursor-pointer font-bold"
                    title="Edit List"
                  >
                    EDIT
                  </button>
                  <button 
                    onClick={() => handleDelete(list.listId)}
                    disabled={isDeleting}
                    className="text-red-accent hover:underline cursor-pointer font-bold disabled:opacity-50"
                    title="Delete List"
                  >
                    DELETE
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-text-muted-dark space-y-1.5 font-mono">
                <p className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span>// TYPE:</span> 
                  <span className="text-white font-bold">{list.listType || 'CUSTOM'}</span>
                </p>
                <p className="flex justify-between border-b border-white/[0.02] pb-1">
                  <span>// VISIBILITY:</span> 
                  <span className="text-white font-bold">{list.isPublic ? 'PUBLIC' : 'PRIVATE'}</span>
                </p>
                <p className="flex justify-between pb-1">
                  <span>// CREATED:</span> 
                  <span className="text-white font-bold">{new Date(list.dateCreated).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            <Link 
              href={`/lists/${list.listId}`} 
              className="text-cyan-accent hover:underline mt-6 inline-block font-bold tracking-wider uppercase text-[11px]"
            >
              &gt; VIEW_LIST_RECORDS
            </Link>
          </div>
        ))}
        {lists?.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-muted bg-black/20 rounded-none border border-white/10 border-dashed">
            <p className="text-sm font-bold uppercase tracking-wider">// SYSTEM_LOG: NO_LISTS_FOUND</p>
            <p className="mt-2 text-text-muted-dark font-mono text-[11px]">INITIALIZE A CUSTOM LIST TO COMPILE CINEMATIC FILES.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingList ? "Edit List" : "Create New List"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-mono text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// LIST_NAME</label>
            <div className="relative flex items-center border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
              <span className="pl-3 pr-1 text-cyan-accent font-bold select-none">&gt;</span>
              <input
                type="text"
                {...register('nameList', { required: 'List name is required' })}
                className="w-full bg-transparent border-0 px-2 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm font-mono"
                placeholder="e.g., favorite_sci_fi"
              />
            </div>
            {errors.nameList && <p className="text-red-accent text-[10px] mt-1">// ERROR: {errors.nameList.message}</p>}
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark mb-1.5">// CLASSIFICATION_TYPE</label>
            <div className="relative border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full bg-transparent border-0 px-3 py-2 text-white focus:outline-none focus:ring-0 text-sm font-mono cursor-pointer"
              >
                <option value="" disabled className="bg-surface-dark">SELECT_TYPE...</option>
                {VALID_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-surface-dark text-white font-mono text-xs">{type}</option>
                ))}
              </select>
            </div>
            {errors.type && <p className="text-red-accent text-[10px] mt-1">// ERROR: {errors.type.message}</p>}
          </div>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="isPublic"
              {...register('isPublic')}
              className="mr-2 h-4 w-4 rounded-none border-white/15 text-cyan-accent focus:ring-cyan-accent bg-black/30 cursor-pointer"
            />
            <label htmlFor="isPublic" className="text-[10px] uppercase tracking-widest text-text-muted-dark cursor-pointer select-none">
              // PUBLISH_TO_FEDERATED_NET
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/10 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-white/10 text-white font-medium hover:bg-white/5 transition-all duration-200 rounded-none uppercase cursor-pointer"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 bg-cyan-accent text-surface-dark font-black hover:bg-[#2be0c5] shadow-[0_0_8px_rgba(85,234,212,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-none uppercase cursor-pointer"
            >
              {isCreating || isUpdating ? (editingList ? 'UPDATING...' : 'CREATING...') : (editingList ? '[ UPDATE_LIST ]' : '[ CREATE_LIST ]')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
