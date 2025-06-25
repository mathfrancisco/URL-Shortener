import {api} from "@/services/api.ts";
import type {
    AuthResponse, ChangePasswordRequest, EmailVerificationRequest, ErrorResponse,
    ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, SuccessResponse,
    UpdateProfileRequest,
    User,
    UserProfileResponse,
    UserStatsResponse
} from "@/types/user.types";

// Token management
const TOKEN_KEY = 'auth_token';

export const tokenManager = {
    getToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token: string): void => {
        localStorage.setItem(TOKEN_KEY, token);
        // Set default authorization header for all requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    removeToken: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common['Authorization'];
    },

    initializeToken: (): void => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }
};

// Initialize token on service load
tokenManager.initializeToken();

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            tokenManager.removeToken();
            // Optionally redirect to login page
            window.location.href = '/login';
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
            const response = await api.post<AuthResponse>('/api/auth/register', data);

            // Automatically set token if registration is successful
            if (response.data.token) {
                tokenManager.setToken(response.data.token);
            }

            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Login user
     */
    static async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/api/auth/login', data);

            // Set token after successful login
            if (response.data.token) {
                tokenManager.setToken(response.data.token);
            }

            return response.data;
        } catch (error: any) {
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
        return !!tokenManager.getToken();
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
        if (error.response?.data) {
            const errorData = error.response.data as ErrorResponse;
            return new Error(errorData.message || 'An error occurred');
        }

        if (error.request) {
            return new Error('Network error - please check your connection');
        }

        return new Error(error.message || 'An unexpected error occurred');
    }

    /**
     * Validate token expiration (basic check)
     * Note: This is a simple implementation. For production, you might want to decode JWT and check exp claim
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

            return payload.exp < currentTime;
        } catch {
            return true;
        }
    }

    /**
     * Get user info from token (if available)
     * Note: This assumes JWT token structure
     */
    static getUserFromToken(): Partial<User> | null {
        const token = tokenManager.getToken();
        if (!token) return null;

        try {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) return null;

            const payload = JSON.parse(atob(tokenParts[1]));
            return {
                id: payload.sub,
                username: payload.username,
                email: payload.email,
                roles: payload.roles || []
            };
        } catch {
            return null;
        }
    }

    /**
     * Check if current user has specific role
     */
    static hasRole(role: string): boolean {
        const user = this.getUserFromToken();
        return user?.roles?.includes(role) || false;
    }

    /**
     * Check if current user is admin
     */
    static isAdmin(): boolean {
        return this.hasRole('ADMIN');
    }
}

// Export default instance for convenience
export default UserService;