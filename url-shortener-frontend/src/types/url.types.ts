export interface ShortenUrlRequest {
    fullUrl: string;
    customAlias?: string;
    expirationHours?: number;
}

export interface ShortenUrlResponse {
    id: string;
    fullUrl: string;
    shortUrl: string;
    customAlias?: string;
    createdAt: string;
    expirationDate: string;
    qrCode?: string;
}

export interface CreateShortUrlRequest {
    url: string;
    customAlias?: string;
    expirationHours?: number;
}

export interface ShortenUrlResponse {
    id: string;
    shortUrl: string;
    originalUrl: string;
    qrCodeUrl?: string;
    expiresAt?: string;
    createdAt: string;
}

export interface UrlStatsResponse {
    id: string;
    shortUrl: string;
    originalUrl: string;
    title?: string;
    description?: string;
    clickCount: number;
    isActive: boolean;
    createdAt: string;
    expiresAt?: string;
    qrCodeUrl?: string;
    updatedAt: string;
    userId?: string;
}

export interface UpdateUrlMetadataRequest {
    title?: string;
    description?: string;
}

export interface GlobalStatsResponse {
    totalUrls: number;
    totalClicks: number;
    activeUsers: number;
}


export interface CreateUrlRequest {
    originalUrl: string;
    customAlias?: string;
    expirationHours?: number;
}

export interface UrlEntity {
    id: string;
    fullUrl: string;
    customAlias?: string;
    createdAt: string;
    expirationDate: string;
    creatorIp: string;
    userId?: string;
    isActive: boolean;
    clickCount: number;
    title?: string;
    description?: string;
    isAuthenticatedUser?: boolean;
}

export interface UrlStatsResponse {
    id: string;
    shortUrl: string;
    fullUrl: string;
    title?: string;
    description?: string;
    clickCount: number;
    createdAt: string;
    expirationDate: string;
    isActive: boolean;
    lastClickAt?: string;
}
