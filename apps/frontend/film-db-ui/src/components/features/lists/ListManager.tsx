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
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Create Custom List
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists?.map((list: UserListDto) => (
          <div key={list.listId} className="bg-background-light p-6 rounded-xl border border-border flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white line-clamp-1 flex-1 pr-2" title={list.nameList}>
                  {list.nameList}
                </h3>
                <div className="flex space-x-2 shrink-0">
                  <button 
                    onClick={() => openEditModal(list)}
                    className="text-text-muted hover:text-white transition-colors"
                    title="Edit List"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(list.listId)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete List"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-text-muted space-y-1">
                <p className="flex justify-between">
                  <span>Type:</span> 
                  <span className="text-white">{list.listType || 'Custom'}</span>
                </p>
                <p className="flex justify-between">
                  <span>Visibility:</span> 
                  <span className="text-white">{list.isPublic ? 'Public' : 'Private'}</span>
                </p>
                <p className="flex justify-between">
                  <span>Created:</span> 
                  <span className="text-white">{new Date(list.dateCreated).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            <Link 
              href={`/lists/${list.listId}`} 
              className="text-primary hover:text-primary/80 mt-6 inline-block font-medium self-start"
            >
              View List &rarr;
            </Link>
          </div>
        ))}
        {lists?.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-muted bg-background-light rounded-xl border border-border border-dashed">
            <p className="text-lg">You don&apos;t have any lists yet.</p>
            <p className="mt-2 text-sm">Create one to start saving your favorite movies and people!</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingList ? "Edit List" : "Create New List"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-muted-dark">List Name</label>
            <input
              type="text"
              {...register('nameList', { required: 'List name is required' })}
              className="w-full bg-background-light border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="e.g., My Favorite Action Movies"
            />
            {errors.nameList && <p className="text-red-500 text-xs mt-1">{errors.nameList.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-muted-dark">Type</label>
            <select
              {...register('type', { required: 'Type is required' })}
              className="w-full bg-background-light border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>Select a type...</option>
              {VALID_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
          </div>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="isPublic"
              {...register('isPublic')}
              className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-background-light"
            />
            <label htmlFor="isPublic" className="text-sm text-text-muted-dark cursor-pointer">
              Make this list public
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating || isUpdating ? (editingList ? 'Updating...' : 'Creating...') : (editingList ? 'Update List' : 'Create List')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
