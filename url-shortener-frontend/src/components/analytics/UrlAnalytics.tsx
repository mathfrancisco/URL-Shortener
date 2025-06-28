// src/components/analytics/UrlAnalytics.tsx

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUrlAnalyticsOverview } from '@/hooks/useAnalytics';
import {
    BarChart3,
    Globe,
    MousePointer,
    Smartphone,
    ExternalLink,
    Calendar,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TimelineChart } from './TimelineChart';
import { GeographicStats } from './GeographicStats';
import { DeviceStats } from './DeviceStats';
import { ReferrerStats } from './ReferrerStats';
import { ExportButton } from './ExportButton';
import StatsCard from "@/components/display/StatsCard.tsx";

export function UrlAnalytics() {
    const { urlId } = useParams<{ urlId: string }>();
    const [timelineGranularity, setTimelineGranularity] = useState<'daily' | 'hourly' | 'weekly'>('daily');

    if (!urlId) {
        return (
            <Alert>
                <AlertDescription>URL ID is required to view analytics.</AlertDescription>
            </Alert>
        );
    }

    const {
        analytics,
        summary,
        geographic,
        referrers,
        devices,
        timeline,
        isLoading,
        isError,
        error
    } = useUrlAnalyticsOverview(urlId);

    if (isError) {
        return (
            <Alert>
                <AlertDescription>
                    Failed to load analytics data: {error?.message || 'Unknown error'}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">URL Analytics</h1>
                    {analytics.data && (
                        <div className="flex items-center gap-2 mt-2">
                            <a
                                href={analytics.data.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                                {analytics.data.shortUrl}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <Badge variant="secondary">{analytics.data.totalClicks} clicks</Badge>
                        </div>
                    )}
                </div>
                <ExportButton urlId={urlId} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Clicks"
                    value={summary.data?.totalClicks ?? 0}
                    icon={MousePointer}
                />
                <StatsCard
                    title="Unique Visitors"
                    value={summary.data?.uniqueVisitors ?? 0}
                    icon={Users}
                />
                <StatsCard
                    title="Clicks Today"
                    value={summary.data?.clicksToday ?? 0}
                    icon={Calendar}
                />
                <StatsCard
                    title="Avg Clicks/Day"
                    value={summary.data?.avgClicksPerDay ? summary.data.avgClicksPerDay.toFixed(1) : '0.0'}
                    icon={TrendingUp}
                />
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="geographic">Geographic</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                    <TabsTrigger value="referrers">Referrers</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Timeline Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Click Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TimelineChart
                                    data={timeline.data}
                                    loading={isLoading}
                                    granularity={timelineGranularity}
                                    onGranularityChange={setTimelineGranularity}
                                />
                            </CardContent>
                        </Card>

                        {/* Top Countries */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Top Countries
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GeographicStats
                                    data={geographic.data}
                                    loading={isLoading}
                                    compact
                                />
                            </CardContent>
                        </Card>

                        {/* Top Devices */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="h-5 w-5" />
                                    Device Types
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DeviceStats
                                    data={devices.data}
                                    loading={isLoading}
                                    compact
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="geographic">
                    <Card>
                        <CardHeader>
                            <CardTitle>Geographic Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GeographicStats data={geographic.data} loading={isLoading} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="devices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Device & Browser Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DeviceStats data={devices.data} loading={isLoading} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="referrers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Traffic Sources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ReferrerStats
                                data={referrers.data}
                                loading={isLoading}
                                compact
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline">
                    <Card>
                        <CardHeader>
                            <CardTitle>Click Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TimelineChart
                                data={timeline.data}
                                loading={isLoading}
                                granularity={timelineGranularity}
                                onGranularityChange={setTimelineGranularity}
                                detailed
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}