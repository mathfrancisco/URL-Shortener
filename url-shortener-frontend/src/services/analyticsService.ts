// src/services/analyticsService.ts - Simplificado para funcionar com seu backend

import type {
    AnalyticsHealth,
    ClicksData,
    DashboardStats,
    DeviceStats,
    ExportData,
    GeographicStats,
    ReferrerStats,
    StatsSummary,
    TimelineData,
    TopUrlsData,
    UrlAnalyticsResponse
} from '@/types/analytics.types';
import { api } from '@/services/api';

const ANALYTICS_BASE = '/api/analytics';

class AnalyticsService {
    // Get complete analytics for a URL
    async getUrlAnalytics(urlId: string, isAlias: boolean = false): Promise<UrlAnalyticsResponse> {
        try {
            const response = await api.get<UrlAnalyticsResponse>(`${ANALYTICS_BASE}/url/${urlId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching URL analytics:', error);
            throw this.handleError(error, 'Failed to fetch URL analytics');
        }
    }

    // Get paginated clicks for a URL with optional date filters
    async getUrlClicks(
        urlId: string,
        options?: {
            startDate?: string;
            endDate?: string;
            page?: number;
            size?: number;
        },
        isAlias: boolean = false
    ): Promise<ClicksData> {
        try {
            const params = new URLSearchParams();

            if (options?.startDate) params.append('startDate', options.startDate);
            if (options?.endDate) params.append('endDate', options.endDate);
            if (options?.page !== undefined) params.append('page', options.page.toString());
            if (options?.size !== undefined) params.append('size', options.size.toString());

            const url = `${ANALYTICS_BASE}/url/${urlId}/clicks`;
            const queryString = params.toString();
            const fullUrl = queryString ? `${url}?${queryString}` : url;

            const response = await api.get<ClicksData>(fullUrl);
            return response.data;
        } catch (error) {
            console.error('Error fetching URL clicks:', error);
            throw this.handleError(error, 'Failed to fetch URL clicks');
        }
    }

    // Get stats summary for a URL
    async getUrlStatsSummary(urlId: string, isAlias: boolean = false): Promise<StatsSummary> {
        try {
            const response = await api.get<StatsSummary>(`${ANALYTICS_BASE}/url/${urlId}/stats/summary`);
            return response.data;
        } catch (error) {
            console.error('Error fetching URL stats summary:', error);
            throw this.handleError(error, 'Failed to fetch URL stats summary');
        }
    }

    // Get geographic statistics
    async getGeographicStats(urlId: string, isAlias: boolean = false): Promise<GeographicStats> {
        try {
            const response = await api.get<GeographicStats>(`${ANALYTICS_BASE}/url/${urlId}/stats/geographic`);
            return response.data;
        } catch (error) {
            console.error('Error fetching geographic stats:', error);
            throw this.handleError(error, 'Failed to fetch geographic stats');
        }
    }

    // Get referrer statistics
    async getReferrerStats(urlId: string, isAlias: boolean = false): Promise<ReferrerStats> {
        try {
            const response = await api.get<ReferrerStats>(`${ANALYTICS_BASE}/url/${urlId}/stats/referrers`);
            return response.data;
        } catch (error) {
            console.error('Error fetching referrer stats:', error);
            throw this.handleError(error, 'Failed to fetch referrer stats');
        }
    }

    // Get device and browser statistics
    async getDeviceStats(urlId: string, isAlias: boolean = false): Promise<DeviceStats> {
        try {
            const response = await api.get<DeviceStats>(`${ANALYTICS_BASE}/url/${urlId}/stats/devices`);
            return response.data;
        } catch (error) {
            console.error('Error fetching device stats:', error);
            throw this.handleError(error, 'Failed to fetch device stats');
        }
    }

    // Get click timeline with granularity
    async getClickTimeline(
        urlId: string,
        granularity: 'daily' | 'hourly' | 'weekly' = 'daily',
        days: number = 30,
        isAlias: boolean = false
    ): Promise<TimelineData> {
        try {
            const response = await api.get<TimelineData>(
                `${ANALYTICS_BASE}/url/${urlId}/stats/timeline?granularity=${granularity}&days=${days}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching click timeline:', error);
            throw this.handleError(error, 'Failed to fetch click timeline');
        }
    }

    // Get dashboard statistics for user
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const response = await api.get<DashboardStats>(`${ANALYTICS_BASE}/dashboard`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw this.handleError(error, 'Failed to fetch dashboard stats');
        }
    }

    // Get top URLs for user
    async getTopUrls(
        limit: number = 10,
        sortBy: 'clicks' | 'recent' = 'clicks'
    ): Promise<TopUrlsData> {
        try {
            const response = await api.get<TopUrlsData>(
                `${ANALYTICS_BASE}/top-urls?limit=${limit}&sortBy=${sortBy}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching top URLs:', error);
            throw this.handleError(error, 'Failed to fetch top URLs');
        }
    }

    // Export analytics data
    async exportAnalytics(
        urlId: string,
        format: 'json' | 'csv' = 'json',
        isAlias: boolean = false
    ): Promise<ExportData> {
        try {
            const response = await api.get<ExportData>(
                `${ANALYTICS_BASE}/export/${urlId}?format=${format}`
            );
            return response.data;
        } catch (error) {
            console.error('Error exporting analytics:', error);
            throw this.handleError(error, 'Failed to export analytics');
        }
    }

    // Download export data as file
    async downloadExport(
        urlId: string,
        format: 'json' | 'csv' = 'json',
        filename?: string,
        isAlias: boolean = false
    ): Promise<void> {
        try {
            const exportData = await this.exportAnalytics(urlId, format, isAlias);

            const blob = new Blob([
                format === 'csv' ? exportData.data : JSON.stringify(exportData.data, null, 2)
            ], {
                type: exportData.contentType
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `analytics-${urlId}-${Date.now()}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading export:', error);
            throw this.handleError(error, 'Failed to download export');
        }
    }

    // Get analytics service health
    async getHealth(): Promise<AnalyticsHealth> {
        try {
            const response = await api.get<AnalyticsHealth>(`${ANALYTICS_BASE}/health`);
            return response.data;
        } catch (error) {
            console.error('Error fetching analytics health:', error);
            throw this.handleError(error, 'Failed to fetch analytics health');
        }
    }

    // Enhanced error handling
    private handleError(error: any, defaultMessage: string): Error {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    return new Error('Unauthorized access. Please verify your session.');
                case 403:
                    return new Error('Access denied. You are not authorized to view this URL analytics.');
                case 404:
                    return new Error('URL not found. Please check the URL ID or alias.');
                case 500:
                    return new Error('Server error. Please try again later.');
                default:
                    return new Error(data?.message || `${defaultMessage} (Status: ${status})`);
            }
        } else if (error.request) {
            return new Error('Network error. Please check your connection.');
        } else {
            return new Error(error.message || defaultMessage);
        }
    }

    // Utility method to check if user can access URL analytics
    async canAccessUrlAnalytics(urlId: string, isAlias: boolean = false): Promise<boolean> {
        try {
            await this.getUrlStatsSummary(urlId, isAlias);
            return true;
        } catch (error: any) {
            if (error.message?.includes('Access denied') || error.message?.includes('Unauthorized')) {
                return false;
            }
            throw error;
        }
    }

    // Helper method to validate if string is UUID vs alias
    static isValidUUID(str: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    }

    // Helper method to auto-detect if identifier is alias or ID
    static detectIdentifierType(identifier: string): { isAlias: boolean; cleanId: string } {
        const cleanId = identifier.trim();
        const isAlias = !this.isValidUUID(cleanId);
        return {
            isAlias,
            cleanId
        };
    }

    // Method to get analytics with auto-detection of alias vs ID
    async getUrlAnalyticsAutoDetect(identifier: string): Promise<UrlAnalyticsResponse> {
        const { cleanId } = AnalyticsService.detectIdentifierType(identifier);
        // Como seu backend aceita tanto alias quanto ID na mesma rota,
        // não precisamos distinguir
        return this.getUrlAnalytics(cleanId, false);
    }

    // Method to get stats summary with auto-detection
    async getUrlStatsSummaryAutoDetect(identifier: string): Promise<StatsSummary> {
        const { cleanId } = AnalyticsService.detectIdentifierType(identifier);
        return this.getUrlStatsSummary(cleanId, false);
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

export function isAnalyticsError(error: any): error is { message: string; status?: number } {
    return error && typeof error.message === 'string';
}

