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