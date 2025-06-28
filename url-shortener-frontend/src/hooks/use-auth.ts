import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import UserService from '../services/user.service';
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
        mutationFn: (data: RegisterRequest) => UserService.register(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Conta criada com sucesso! Verifique seu email.');
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Erro ao criar conta';
            toast.error(errorMessage);
        }
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => UserService.login(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Login realizado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Erro ao fazer login';
            toast.error(errorMessage);
        }
    });
};

export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: (data: EmailVerificationRequest) => UserService.verifyEmail(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Email verificado com sucesso!');
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Erro ao verificar email';
            toast.error(errorMessage);
            throw error; // Re-throw para permitir tratamento no componente
        }
    });
};

export const useResendEmailVerification = () => {
    return useMutation({
        mutationFn: () => UserService.resendEmailVerification(),
        onSuccess: (data) => {
            toast.success(data.message || 'Email de verificação reenviado!');
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Erro ao reenviar email';
            toast.error(errorMessage);
        }
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => UserService.forgotPassword(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Email de recuperação enviado!');
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Erro ao enviar email de recuperação';
            toast.error(errorMessage);
        }
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => UserService.resetPassword(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Senha alterada com sucesso!');
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Erro ao alterar senha';
            toast.error(errorMessage);
        }
    });
};

// ========== USER PROFILE HOOKS ==========

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: () => UserService.getUserProfile(),
        enabled: UserService.isAuthenticated(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            // Não retentar se for erro 401 (não autorizado)
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        }
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => UserService.updateProfile(data),
        onSuccess: (data) => {
            toast.success('Perfil atualizado com sucesso!');
            queryClient.setQueryData(['user-profile'], data);
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Erro ao atualizar perfil';
            toast.error(errorMessage);
        }
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => UserService.changePassword(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Senha alterada com sucesso!');
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Erro ao alterar senha';
            toast.error(errorMessage);
        }
    });
};

export const useUserStats = () => {
    return useQuery({
        queryKey: ['user-stats'],
        queryFn: () => UserService.getUserStats(),
        enabled: UserService.isAuthenticated(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        }
    });
};

// ========== ADMIN HOOKS ==========

export const useAllUsers = () => {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: () => UserService.getAllUsers(),
        enabled: UserService.isAuthenticated() && UserService.isAdmin(),
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        }
    });
};

export const useActiveUsers = () => {
    return useQuery({
        queryKey: ['admin-active-users'],
        queryFn: () => UserService.getActiveUsers(),
        enabled: UserService.isAuthenticated() && UserService.isAdmin(),
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        }
    });
};

export const useUnverifiedUsers = () => {
    return useQuery({
        queryKey: ['admin-unverified-users'],
        queryFn: () => UserService.getUnverifiedUsers(),
        enabled: UserService.isAuthenticated() && UserService.isAdmin(),
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        }
    });
};

export const useUsersByPlan = (planType: string) => {
    return useQuery({
        queryKey: ['admin-users-by-plan', planType],
        queryFn: () => UserService.getUsersByPlan(planType),
        enabled: UserService.isAuthenticated() && UserService.isAdmin() && !!planType,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        }
    });
};

// ========== AUTH CONTEXT HOOK ==========

export const useAuth = () => {
    const { data: user, isLoading, error, refetch } = useUserProfile();

    const logout = () => {
        UserService.logout();
        // Forçar refresh da página para limpar todo o estado
        window.location.href = '/';
    };

    return {
        user,
        isLoading,
        error,
        isAuthenticated: UserService.isAuthenticated(),
        isAdmin: UserService.isAdmin(),
        login: useLogin(),
        register: useRegister(),
        logout,
        refetch
    };
};