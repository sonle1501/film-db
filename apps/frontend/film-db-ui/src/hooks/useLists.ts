import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api-client';
import { UserListDto, ListItemDto } from '@/types/users';

export const useLists = () => {
  return useQuery<UserListDto[]>({
    queryKey: ['userLists'],
    queryFn: () => userApi.getLists(),
  });
};

export const useListDetails = (listId: string) => {
  return useQuery<UserListDto>({
    queryKey: ['userList', listId],
    queryFn: () => userApi.getListById(listId),
    enabled: !!listId,
  });
};

export const useListItems = (listId: string) => {
  return useQuery<ListItemDto[]>({
    queryKey: ['userListItems', listId],
    queryFn: async () => {
      const itemsData = await userApi.getListItems(listId);
      return Array.isArray(itemsData) ? itemsData : (itemsData ? [itemsData] : []);
    },
    enabled: !!listId,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { nameList: string; type: string; isPublic: boolean }) => 
      userApi.createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { userId: string; listId: string; nameList: string; isPublic: boolean; isCustom: boolean; listType: string }) => 
      userApi.updateList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listId: string) => userApi.deleteList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });
};

export const useUpdateListItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: { itemId: string; state?: string; notes?: string } }) => 
      userApi.updateListItem(listId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userListItems', variables.listId] });
    },
  });
};

export const useDeleteListItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) => 
      userApi.deleteListItem(listId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userListItems', variables.listId] });
    },
  });
};
