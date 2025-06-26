// src/services/analyticsService.ts

import type {
    AnalyticsHealth,
    ClicksData, DashboardStats, DeviceStats,
    ExportData, GeographicStats,
    ReferrerStats,
    StatsSummary,
    TimelineData, TopUrlsData,
    UrlAnalyticsResponse
} from '@/types/analytics.types';
import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class AnalyticsService {
    private api = axios.create({
        baseURL: `${BASE_URL}/api/analytics`,
        timeout: 30000,
    });

    // Get complete analytics for a URL
    async getUrlAnalytics(urlId: string): Promise<UrlAnalyticsResponse> {
        const response = await this.api.get<UrlAnalyticsResponse>(`/url/${urlId}`);
        return response.data;
    }

    // Get paginated clicks for a URL with optional date filters
    async getUrlClicks(
        urlId: string,
        options?: {
            startDate?: string;
            endDate?: string;
            page?: number;
            size?: number;
        }
    ): Promise<ClicksData> {
        const params = new URLSearchParams();

        if (options?.startDate) params.append('startDate', options.startDate);
        if (options?.endDate) params.append('endDate', options.endDate);
        if (options?.page !== undefined) params.append('page', options.page.toString());
        if (options?.size !== undefined) params.append('size', options.size.toString());

        const response = await this.api.get<ClicksData>(`/url/${urlId}/clicks?${params}`);
        return response.data;
    }

    // Get stats summary for a URL
    async getUrlStatsSummary(urlId: string): Promise<StatsSummary> {
        const response = await this.api.get<StatsSummary>(`/url/${urlId}/stats/summary`);
        return response.data;
    }

    // Get geographic statistics
    async getGeographicStats(urlId: string): Promise<GeographicStats> {
        const response = await this.api.get<GeographicStats>(`/url/${urlId}/stats/geographic`);
        return response.data;
    }

    // Get referrer statistics
    async getReferrerStats(urlId: string): Promise<ReferrerStats> {
        const response = await this.api.get<ReferrerStats>(`/url/${urlId}/stats/referrers`);
        return response.data;
    }

    // Get device and browser statistics
    async getDeviceStats(urlId: string): Promise<DeviceStats> {
        const response = await this.api.get<DeviceStats>(`/url/${urlId}/stats/devices`);
        return response.data;
    }

    // Get click timeline with granularity
    async getClickTimeline(
        urlId: string,
        granularity: 'daily' | 'hourly' | 'weekly' = 'daily',
        days: number = 30
    ): Promise<TimelineData> {
        const response = await this.api.get<TimelineData>(
            `/url/${urlId}/stats/timeline?granularity=${granularity}&days=${days}`
        );
        return response.data;
    }

    // Get dashboard statistics for user
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await this.api.get<DashboardStats>('/dashboard');
        return response.data;
    }

    // Get top URLs for user
    async getTopUrls(
        limit: number = 10,
        sortBy: 'clicks' | 'recent' = 'clicks'
    ): Promise<TopUrlsData> {
        const response = await this.api.get<TopUrlsData>(
            `/top-urls?limit=${limit}&sortBy=${sortBy}`
        );
        return response.data;
    }

    // Export analytics data
    async exportAnalytics(
        urlId: string,
        format: 'json' | 'csv' = 'json'
    ): Promise<ExportData> {
        const response = await this.api.get<ExportData>(
            `/export/${urlId}?format=${format}`
        );
        return response.data;
    }

    // Download export data as file
    async downloadExport(
        urlId: string,
        format: 'json' | 'csv' = 'json',
        filename?: string
    ): Promise<void> {
        const exportData = await this.exportAnalytics(urlId, format);

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
    }

    // Get analytics service health
    async getHealth(): Promise<AnalyticsHealth> {
        const response = await this.api.get<AnalyticsHealth>('/health');
        return response.data;
    }
}

export const analyticsService = new AnalyticsService();