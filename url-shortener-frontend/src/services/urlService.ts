import {api} from "@/services/api.ts";
import type {CreateShortUrlRequest, GlobalStatsResponse, ShortenUrlResponse, UpdateUrlMetadataRequest, UrlStatsResponse } from "@/types/url.types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);



class UrlService {
    // Create short URL
    async createShortUrl(data: CreateShortUrlRequest): Promise<ShortenUrlResponse> {
        const response = await api.post('/url/shorten', data);
        return response.data;
    }

    // Get user URLs
    async getUserUrls(): Promise<UrlStatsResponse[]> {
        const response = await api.get('/url/urls');
        return response.data;
    }

    // Get URL statistics
    async getUrlStats(id: string): Promise<UrlStatsResponse> {
        const response = await api.get(`/url/${id}/stats`);
        return response.data;
    }

    // Update URL metadata
    async updateUrlMetadata(id: string, data: UpdateUrlMetadataRequest): Promise<UrlStatsResponse> {
        const response = await api.put(`/url/${id}/metadata`, data);
        return response.data;
    }

    // Deactivate URL
    async deactivateUrl(id: string): Promise<void> {
        await api.put(`/url/${id}/deactivate`);
    }

    // Delete URL
    async deleteUrl(id: string): Promise<void> {
        await api.delete(`/url/${id}`);
    }

    // Get global statistics (mock endpoint)
    async getGlobalStats(): Promise<GlobalStatsResponse> {
        // This would be a real endpoint in production
        return {
            totalUrls: 1234567,
            totalClicks: 9876543,
            activeUsers: 45678
        };
    }

    // Process redirect (this happens on the server, but we might need it for preview)
    getRedirectUrl(id: string): string {
        return `${API_BASE_URL}/${id}`;
    }

    // Generate QR Code URL
    generateQrCodeUrl(shortUrl: string): string {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`;
    }

    // Validate URL format
    isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Format URL for display
    formatUrl(url: string): string {
        if (url.length > 50) {
            return url.substring(0, 47) + '...';
        }
        return url;
    }

    // Calculate time until expiration
    getTimeUntilExpiration(expiresAt?: string): string | null {
        if (!expiresAt) return null;

        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return 'Expirado';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    // Format date for display
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Get domain from URL
    getDomain(url: string): string {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    }
}

const urlService = new UrlService();
export default urlService;