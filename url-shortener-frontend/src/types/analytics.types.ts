// src/types/analytics.types.ts

export interface DailyClickStats {
    date: string;
    clicks: number;
}

export interface RecentClick {
    clickedAt: string;
    country?: string;
    referer?: string;
}

export interface UrlAnalyticsResponse {
    urlId: string;
    shortUrl: string;
    fullUrl: string;
    totalClicks: number;
    createdAt: string;
    lastClickAt?: string;
    dailyStats: DailyClickStats[];
    countryStats: Record<string, number>;
    refererStats: Record<string, number>;
    recentClicks: RecentClick[];
}

export interface ClicksData {
    clicks: ClickEntity[];
    totalCount: number;
    page: number;
    size: number;
    totalPages: number;
}

export interface ClickEntity {
    id: string;
    urlId: string;
    clickedAt: string;
    ipAddress: string;
    userAgent?: string;
    referer?: string;
    country?: string;
    city?: string;
}

export interface TimelineDataPoint {
    date: string;
    clicks: number;
    uniqueVisitors?: number;
}

export interface TimelineData {
    data: TimelineDataPoint[];
    totalClicks: number;
    totalUniqueVisitors?: number;
    granularity: 'daily' | 'hourly' | 'weekly';
    days: number;
}

export interface StatsSummary {
    totalClicks: number;
    uniqueVisitors: number;
    avgClicksPerDay: number;
    peakDay?: string;
    clicksToday: number;
    clicksThisWeek: number;
    clicksThisMonth: number;
}

export interface GeographicStats {
    countries: Record<string, number>;
    cities: Record<string, number>;
    topCountry?: string;
    topCity?: string;
    geoDataAvailable: boolean;
}

export interface ReferrerStats {
    referrers: Record<string, number>;
    topReferrer?: string;
    directTraffic: number;
}

export interface DeviceStats {
    devices: Record<string, number>;
    browsers: Record<string, number>;
    topDevice?: string;
    topBrowser?: string;
}

export interface DashboardStats {
    totalUrls: number;
    totalClicks: number;
    activeUrls: number;
    recentUrls: number;
    avgClicksPerUrl: number;
}

export interface TopUrlsData {
    urls: TopUrl[];
    sortBy: 'clicks' | 'recent';
    limit: number;
}

export interface TopUrl {
    id: string;
    shortUrl: string;
    fullUrl: string;
    title?: string;
    clickCount: number;
    createdAt: string;
}

export interface ExportData {
    urlId: string;
    format: 'json' | 'csv';
    exportedAt: string;
    totalClicks: number;
    data: any;
    contentType: 'application/json' | 'text/csv';
}

export interface SystemStats {
    totalUrls: number;
    totalClicks: number;
    activeUrls: number;
    clicksToday: number;
    avgClicksPerUrl: number;
    geoLocationEnabled: boolean;
}

export interface AnalyticsHealth {
    status: 'healthy' | 'degraded';
    timestamp: string;
    service: string;
    stats?: SystemStats;
    error?: string;
}