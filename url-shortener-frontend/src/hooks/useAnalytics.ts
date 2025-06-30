// src/hooks/useAnalytics.ts

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import type {
    AnalyticsHealth,
    ClicksData, DashboardStats, DeviceStats,
    GeographicStats,
    ReferrerStats,
    StatsSummary, TimelineData, TopUrlsData,
    UrlAnalyticsResponse
} from "@/types/analytics.types.ts";

// Get complete URL analytics
export const useUrlAnalytics = (
    urlId: string,
    options?: UseQueryOptions<UrlAnalyticsResponse>
) => {
    return useQuery({
        queryKey: ['analytics', urlId],
        queryFn: () => analyticsService.getUrlAnalytics(urlId),
        enabled: !!urlId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

// Get URL clicks with pagination and filters
export const useUrlClicks = (
    urlId: string,
    filters?: {
        startDate?: string;
        endDate?: string;
        page?: number;
        size?: number;
    },
    options?: UseQueryOptions<ClicksData>
) => {
    return useQuery({
        queryKey: ['analytics', urlId, 'clicks', filters],
        queryFn: () => analyticsService.getUrlClicks(urlId, filters),
        enabled: !!urlId,
        staleTime: 2 * 60 * 1000, // 2 minutos
        ...options,
    });
};

// Get URL stats summary
export const useUrlStatsSummary = (
    urlId: string,
    options?: UseQueryOptions<StatsSummary>
) => {
    return useQuery({
        queryKey: ['analytics', urlId, 'summary'],
        queryFn: () => analyticsService.getUrlStatsSummary(urlId),
        enabled: !!urlId,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

// Get geographic statistics
export const useGeographicStats = (
    urlId: string,
    options?: UseQueryOptions<GeographicStats>
) => {
    return useQuery({
        queryKey: ['analytics', urlId, 'geographic'],
        queryFn: () => analyticsService.getGeographicStats(urlId),
        enabled: !!urlId,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

// Get referrer statistics
export const useReferrerStats = (
    urlId: string,
    options?: UseQueryOptions<ReferrerStats>
) => {
    return useQuery({
        queryKey: ['analytics', urlId, 'referrers'],
        queryFn: () => analyticsService.getReferrerStats(urlId),
        enabled: !!urlId,
        staleTime: 10 * 60 * 1000,
        ...options,
    });
};

// Get device statistics
export const useDeviceStats = (
    urlId: string,
    options?: UseQueryOptions<DeviceStats>
) => {
    return useQuery({
        queryKey: ['analytics', urlId, 'devices'],
        queryFn: () => analyticsService.getDeviceStats(urlId),
        enabled: !!urlId,
        staleTime: 10 * 60 * 1000,
        ...options,
    });
};

// Get click timeline
export const useClickTimeline = (
    urlId: string,
    granularity: 'daily' | 'hourly' | 'weekly' = 'daily',
    days: number = 30,
    options?: UseQueryOptions<TimelineData>
) => {
    return useQuery({
        queryKey: ['analytics', urlId, 'timeline', granularity, days],
        queryFn: () => analyticsService.getClickTimeline(urlId, granularity, days),
        enabled: !!urlId,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

// Get dashboard statistics
export const useDashboardStats = (options?: UseQueryOptions<DashboardStats>) => {
    return useQuery({
        queryKey: ['analytics', 'dashboard'],
        queryFn: () => analyticsService.getDashboardStats(),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

// Get top URLs
export const useTopUrls = (
    limit: number = 10,
    sortBy: 'clicks' | 'recent' = 'clicks',
    options?: UseQueryOptions<TopUrlsData>
) => {
    return useQuery({
        queryKey: ['analytics', 'top-urls', limit, sortBy],
        queryFn: () => analyticsService.getTopUrls(limit, sortBy),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

// Get analytics health
export const useAnalyticsHealth = (options?: UseQueryOptions<AnalyticsHealth>) => {
    return useQuery({
        queryKey: ['analytics', 'health'],
        queryFn: () => analyticsService.getHealth(),
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

// Combined hook for URL analytics overview - FIXED VERSION
export const useUrlAnalyticsOverview = (urlId: string) => {
    const analytics = useUrlAnalytics(urlId);
    const summary = useUrlStatsSummary(urlId);
    const geographic = useGeographicStats(urlId);
    const referrers = useReferrerStats(urlId);
    const devices = useDeviceStats(urlId);
    const timeline = useClickTimeline(urlId, 'daily', 30);

    return {
        analytics,
        summary,
        geographic,
        referrers,
        devices,
        timeline,
        isLoading: analytics.isPending || summary.isPending || geographic.isPending ||
            referrers.isPending || devices.isPending || timeline.isPending,
        isError: analytics.isError || summary.isError || geographic.isError ||
            referrers.isError || devices.isError || timeline.isError,
        error: analytics.error || summary.error || geographic.error ||
            referrers.error || devices.error || timeline.error,
    };
};