import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api-client';
import { UserProfileDto } from '@/types/users';

export const useProfile = (username: string | undefined) => {
  return useQuery<UserProfileDto>({
    queryKey: ['userProfile', username],
    queryFn: () => userApi.getProfile(username!),
    enabled: !!username,
  });
};

export const useUpdateUsername = () => {
  return useMutation({
    mutationFn: userApi.updateUsername,
  });
};

export const useUpdateProfile = (username: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      }
    }
  });
};

export const useRequestAdmin = (username: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.requestAdmin,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      }
    }
  });
};
