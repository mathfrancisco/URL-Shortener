// User Types
import type {PlanType} from "@/types/plans.types.ts";

export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    emailVerified: boolean;
    active: boolean;
    createdAt: string;
    lastLoginAt?: string;
    creatorIp: string;
    roles: string[];
    planType: PlanType;
    planExpiresAt?: string;
    monthlyUrlLimit: number;
    currentMonthUrlCount: number;
    monthlyCountResetDate: string;
    failedLoginAttempts: number;
    lockoutUntil?: string;
}

// Request DTOs
export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    selectedPlan:string; // 'FREE', 'PREMIUM', 'ENTERPRISE'
}

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface EmailVerificationRequest {
    token: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    confirmPassword?: string;
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}

export interface ChangePasswordRequest {
    confirmPassword?: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

// Response DTOs
export interface AuthResponse {
    token: string;
    user: User;
    message: string;
}

export interface UserProfileResponse {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phoneNumber?: string;
    emailVerified: boolean;
    active: boolean;
    createdAt: string;
    lastLoginAt?: string;
    planType: string;
    planExpiresAt?: string;
    monthlyUrlLimit: number;
    currentMonthUrlCount: number;
}

export interface UserStatsResponse {
    totalUrls: number;
    totalClicks: number;
    monthlyUrls: number;
    monthlyClicks: number;
    topUrls: Array<{
        id: string;
        fullUrl: string;
        customAlias?: string;
        clickCount: number;
    }>;
    clicksByDay: Array<{
        date: string;
        clicks: number;
    }>;
    urlsCreatedByMonth: Array<{
        month: string;
        count: number;
    }>;
}

export interface SuccessResponse {
    message: string;
}

export interface ErrorResponse {
    message: string;
    error: string;
    status: number;
    path: string;
    timestamp?: string;
}