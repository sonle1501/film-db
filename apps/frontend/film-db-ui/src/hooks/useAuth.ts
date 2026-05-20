import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api-client';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginRequestDto, RegisterRequestDto } from '@/types/auth';

export const useAuth = () => {
  const { setAuth, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequestDto) => {
      const response = await authApi.login(data);
      // console.log('Login response:', response);
      // After successful login, we also fetch the user profile to get details
      const profile = await authApi.getProfile(data.username, response.token);
      return { token: response.token, user: profile };
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });

  const loginAdminMutation = useMutation({
    mutationFn: async (data: LoginRequestDto) => {
      const response = await authApi.login(data);
      const profile = await authApi.getProfile(data.username, response.token);
      if (profile.role !== 'ROLE_ADMIN' && profile.role !== 'ADMIN') {
        throw new Error('User is not an admin');
      }
      return { token: response.token, user: profile };
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequestDto) => {
      const response = await authApi.register(data);
      // Register response gives token, fetch profile too
      const profile = await authApi.getProfile(data.username, response.token);
      return { token: response.token, user: profile };
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });

  const registerAdminMutation = useMutation({
    mutationFn: async (data: RegisterRequestDto) => {
      const response = await authApi.registerAdmin(data);
      const profile = await authApi.getProfile(data.username, response.token);
      return { token: response.token, user: profile };
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      storeLogout();
    },
    onError: () => {
      // Even if API call fails, we still want to log out locally
      storeLogout();
    }
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    
    loginAdmin: loginAdminMutation.mutateAsync,
    isLoggingInAdmin: loginAdminMutation.isPending,
    loginAdminError: loginAdminMutation.error,
    
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    
    registerAdmin: registerAdminMutation.mutateAsync,
    isRegisteringAdmin: registerAdminMutation.isPending,
    registerAdminError: registerAdminMutation.error,
    
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};
