import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import userService from '../services/user.service';
import type {
    RegisterRequest,
    LoginRequest,
    EmailVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
} from '../types/user.types';

// ========== AUTH HOOKS ==========

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterRequest) => userService.register(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Conta criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar conta');
        }
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => userService.login(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Login realizado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao fazer login');
        }
    });
};

export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: (data: EmailVerificationRequest) => userService.verifyEmail(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Email verificado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao verificar email');
        }
    });
};

export const useResendEmailVerification = () => {
    return useMutation({
        mutationFn: () => userService.resendEmailVerification(),
        onSuccess: (data) => {
            toast.success(data.message || 'Email de verificação reenviado!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao reenviar email');
        }
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => userService.forgotPassword(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Email de recuperação enviado!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao enviar email de recuperação');
        }
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => userService.resetPassword(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Senha alterada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao alterar senha');
        }
    });
};

// ========== USER PROFILE HOOKS ==========

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: () => userService.getUserProfile(),
        enabled: userService.isAuthenticated(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
        onSuccess: (data) => {
            toast.success('Perfil atualizado com sucesso!');
            queryClient.setQueryData(['user-profile'], data);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
        }
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => userService.changePassword(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Senha alterada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao alterar senha');
        }
    });
};

export const useUserStats = () => {
    return useQuery({
        queryKey: ['user-stats'],
        queryFn: () => userService.getUserStats(),
        enabled: userService.isAuthenticated(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// ========== ADMIN HOOKS ==========

export const useAllUsers = () => {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: () => userService.getAllUsers(),
        enabled: userService.isAuthenticated(),
    });
};

export const useActiveUsers = () => {
    return useQuery({
        queryKey: ['admin-active-users'],
        queryFn: () => userService.getActiveUsers(),
        enabled: userService.isAuthenticated(),
    });
};

export const useUnverifiedUsers = () => {
    return useQuery({
        queryKey: ['admin-unverified-users'],
        queryFn: () => userService.getUnverifiedUsers(),
        enabled: userService.isAuthenticated(),
    });
};

export const useUsersByPlan = (planType: string) => {
    return useQuery({
        queryKey: ['admin-users-by-plan', planType],
        queryFn: () => userService.getUsersByPlan(planType),
        enabled: userService.isAuthenticated() && !!planType,
    });
};

// ========== AUTH CONTEXT HOOK ==========

export const useAuth = () => {
    const { data: user, isLoading, error } = useUserProfile();

    return {
        user,
        isLoading,
        error,
        isAuthenticated: userService.isAuthenticated(),
        login: useLogin(),
        register: useRegister(),
        logout: () => userService.logout(),
    };
};