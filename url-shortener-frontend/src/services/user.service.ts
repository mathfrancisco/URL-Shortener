import {api} from "@/services/api.ts";
import type {
    AuthResponse, ChangePasswordRequest, EmailVerificationRequest, ErrorResponse,
    ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, SuccessResponse,
    UpdateProfileRequest,
    User,
    UserProfileResponse,
    UserStatsResponse
} from "@/types/user.types";
import type {ChangePlanRequest} from "@/types/plans.types.ts";

// Token management
const TOKEN_KEY = 'auth_token';

export const tokenManager = {
    getToken: (): string | null => {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token from localStorage:', error);
            return null;
        }
    },

    setToken: (token: string): void => {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            // Set default authorization header for all requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error('Error setting token in localStorage:', error);
        }
    },

    removeToken: (): void => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            delete api.defaults.headers.common['Authorization'];
        } catch (error) {
            console.error('Error removing token from localStorage:', error);
        }
    },

    initializeToken: (): void => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error initializing token:', error);
        }
    }
};

// Initialize token on service load
tokenManager.initializeToken();

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
        });

        if (error.response?.status === 401) {
            // Avoid infinite loop by checking if we're already on login page
            if (!window.location.pathname.includes('/login')) {
                tokenManager.removeToken();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export class UserService {
    // ========== AUTH METHODS ==========

    /**
     * Register a new user
     */
    static async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            // Validate passwords match
            if (data.password !== data.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // REMOVA ESTA LINHA:
            // const { confirmPassword, ...requestData } = data;

            console.log('Sending registration request:', { ...data, password: '[HIDDEN]' });

            // Envie os dados completos:
            const response = await api.post<AuthResponse>('/api/auth/register', data);

            // Automatically set token if registration is successful
            if (response.data.token) {
                tokenManager.setToken(response.data.token);
            }

            return response.data;
        } catch (error: any) {
            console.error('Registration error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Login user
     */
    static async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            console.log('Sending login request for:', data.usernameOrEmail);

            const response = await api.post<AuthResponse>('/api/auth/login', {
                usernameOrEmail: data.usernameOrEmail.trim(),
                password: data.password
            });

            console.log('Login response received:', {
                success: !!response.data.token,
                user: response.data.user?.username
            });

            // Set token after successful login
            if (response.data.token) {
                tokenManager.setToken(response.data.token);
            }

            return response.data;
        } catch (error: any) {
            console.error('Login error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Logout user
     */
    static logout(): void {
        tokenManager.removeToken();
    }

    /**
     * Verify email with token
     */
    static async verifyEmail(data: EmailVerificationRequest): Promise<SuccessResponse> {
        try {
            const response = await api.post<SuccessResponse>('/api/auth/verify-email', data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Resend email verification
     */
    static async resendEmailVerification(): Promise<SuccessResponse> {
        try {
            const response = await api.post<SuccessResponse>('/api/auth/resend-verification');
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Request password reset
     */
    static async forgotPassword(data: ForgotPasswordRequest): Promise<SuccessResponse> {
        try {
            const response = await api.post<SuccessResponse>('/api/auth/forgot-password', data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Reset password with token
     */
    static async resetPassword(data: ResetPasswordRequest): Promise<SuccessResponse> {
        try {
            // Validate passwords match
            if (data.newPassword !== data.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const response = await api.post<SuccessResponse>('/api/auth/reset-password', data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // ========== USER PROFILE METHODS ==========

    /**
     * Get current user profile
     */
    static async getUserProfile(): Promise<UserProfileResponse> {
        try {
            const response = await api.get<UserProfileResponse>('/api/user/profile');
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
        try {
            const response = await api.put<UserProfileResponse>('/api/user/profile', data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Change user password
     */
    static async changePassword(data: ChangePasswordRequest): Promise<SuccessResponse> {
        try {
            // Validate passwords match
            if (data.newPassword !== data.confirmPassword) {
                throw new Error('New passwords do not match');
            }

            const response = await api.post<SuccessResponse>('/api/user/change-password', data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStats(): Promise<UserStatsResponse> {
        try {
            const response = await api.get<UserStatsResponse>('/api/user/stats');
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    async changePlan(data: ChangePlanRequest): Promise<UserProfileResponse> {
        try {
            const response = await api.post<UserProfileResponse>(`api/user/change-plan`, data);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao alterar plano:', error);
            const message = error.response?.data?.message || 'Erro ao alterar plano';
            throw new Error(message);
        }
    }

    // ========== ADMIN METHODS ==========

    /**
     * Get all users (Admin only)
     */
    static async getAllUsers(): Promise<User[]> {
        try {
            const response = await api.get<User[]>('/api/admin/users');
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get active users (Admin only)
     */
    static async getActiveUsers(): Promise<User[]> {
        try {
            const response = await api.get<User[]>('/api/admin/users/active');
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get unverified users (Admin only)
     */
    static async getUnverifiedUsers(): Promise<User[]> {
        try {
            const response = await api.get<User[]>('/api/admin/users/unverified');
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get users by plan type (Admin only)
     */
    static async getUsersByPlan(planType: string): Promise<User[]> {
        try {
            const response = await api.get<User[]>(`/api/admin/users/plan/${planType}`);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // ========== UTILITY METHODS ==========

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        const token = tokenManager.getToken();
        return !!token && !this.isTokenExpired();
    }

    /**
     * Get current auth token
     */
    static getAuthToken(): string | null {
        return tokenManager.getToken();
    }

    /**
     * Handle API errors consistently
     */
    private static handleError(error: any): Error {
        // Network error
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            return new Error('Network error - please check your connection and try again');
        }

        // Server error with response
        if (error.response?.data) {
            const errorData = error.response.data as ErrorResponse;

            // Handle different error formats
            if (typeof errorData === 'string') {
                return new Error(errorData);
            }

            if (errorData.message) {
                return new Error(errorData.message);
            }

            if (errorData.error) {
                return new Error(errorData.error);
            }
        }

        // HTTP error without specific message
        if (error.response?.status) {
            switch (error.response.status) {
                case 400:
                    return new Error('Invalid request - please check your input');
                case 401:
                    return new Error('Authentication failed - please check your credentials');
                case 403:
                    return new Error('Access denied - insufficient permissions');
                case 404:
                    return new Error('Resource not found');
                case 409:
                    return new Error('Conflict - resource already exists');
                case 422:
                    return new Error('Validation error - please check your input');
                case 429:
                    return new Error('Too many requests - please try again later');
                case 500:
                    return new Error('Server error - please try again later');
                case 503:
                    return new Error('Service unavailable - please try again later');
                default:
                    return new Error(`HTTP error ${error.response.status} - please try again`);
            }
        }

        // Request error
        if (error.request) {
            return new Error('Network error - unable to reach server');
        }

        // Generic error
        return new Error(error.message || 'An unexpected error occurred');
    }

    /**
     * Validate token expiration (basic check)
     */
    static isTokenExpired(): boolean {
        const token = tokenManager.getToken();
        if (!token) return true;

        try {
            // Simple check - you might want to implement proper JWT decoding
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) return true;

            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            return payload.exp && payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    /**
     * Get user info from token (if available)
     */
    static getUserFromToken(): Partial<User> | null {
        const token = tokenManager.getToken();
        if (!token) return null;

        try {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) return null;

            const payload = JSON.parse(atob(tokenParts[1]));
            return {
                id: payload.sub || payload.id,
                username: payload.username,
                email: payload.email,
                roles: payload.roles || payload.authorities || []
            };
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    /**
     * Check if current user has specific role
     */
    static hasRole(role: string): boolean {
        const user = this.getUserFromToken();
        if (!user?.roles) return false;

        // Check for role with or without ROLE_ prefix
        return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
    }

    /**
     * Check if current user is admin
     */
    static isAdmin(): boolean {
        return this.hasRole('ADMIN');
    }

    /**
     * Health check method to test API connectivity
     */
    static async healthCheck(): Promise<boolean> {
        try {
            const response = await api.get('/api/health', {
                timeout: 5000
            });
            return response.status === 200;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

// Export default instance for convenience
export default UserService;