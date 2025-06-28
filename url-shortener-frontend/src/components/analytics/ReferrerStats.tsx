// src/components/analytics/ReferrerStats.tsx

import { Loader2, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define the type for individual referrer items
type ReferrerItem = {
    referrer: string;
    count: number;
};

// Define the type for the complete referrer stats data structure
type ReferrerStatsData = {
    referrers: ReferrerItem[];
    totalReferrers: number;
    totalClicks: number;
} | ReferrerItem[]; // Support both nested and flat array structures

interface ReferrerStatsProps {
    data?: ReferrerStatsData;
    loading?: boolean;
    compact?: boolean;
}

export function ReferrerStats({ data, loading, compact = false }: ReferrerStatsProps) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
        );
    }

    // Handle different data structures
    let referrerItems: ReferrerItem[] = [];

    if (Array.isArray(data)) {
        // If data is already an array of ReferrerItem
        referrerItems = data;
    } else if (data && 'referrers' in data) {
        // If data is an object with referrers property
        referrerItems = data.referrers;
    }

    if (referrerItems.length === 0) {
        return (
            <div className="text-muted-foreground text-center py-8">
                Nenhuma fonte de tráfego registrada.
            </div>
        );
    }

    // Limit items in compact mode
    const displayItems = compact ? referrerItems.slice(0, 5) : referrerItems;

    return (
        <div className="space-y-2">
            {displayItems.map((item, index) => (
                <div key={`${item.referrer}-${index}`} className="flex items-center justify-between border-b py-2 last:border-b-0">
                    <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-xs" title={item.referrer || 'Direto'}>
                            {item.referrer || 'Direto'}
                        </span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                </div>
            ))}

            {compact && referrerItems.length > 5 && (
                <div className="text-sm text-muted-foreground text-center pt-2">
                    +{referrerItems.length - 5} mais fontes
                </div>
            )}
        </div>
    );
}