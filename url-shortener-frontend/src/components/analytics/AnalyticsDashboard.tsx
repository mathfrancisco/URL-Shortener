// src/components/analytics/AnalyticsDashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardStats, useTopUrls } from '@/hooks/useAnalytics';
import { Activity, Link, MousePointer, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TopUrlsTable } from './TopUrlsTable';
import StatsCard from "@/components/display/StatsCard.tsx";

export function AnalyticsDashboard() {
    const { data: dashboardStats, isPending: isLoadingDashboard, error: dashboardError } = useDashboardStats();
    const { data: topUrls, isPending: isLoadingTopUrls, error: topUrlsError } = useTopUrls(10, 'clicks');

    if (dashboardError || topUrlsError) {
        return (
            <Alert>
                <AlertDescription>
                    Failed to load dashboard data. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your URL shortening activity and performance
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total URLs"
                    value={dashboardStats?.totalUrls ?? 0}
                    icon={Link}
                    loading={isLoadingDashboard}
                />
                <StatsCard
                    title="Total Clicks"
                    value={dashboardStats?.totalClicks ?? 0}
                    icon={MousePointer}
                    loading={isLoadingDashboard}
                />
                <StatsCard
                    title="Active URLs"
                    value={dashboardStats?.activeUrls ?? 0}
                    icon={Activity}
                    loading={isLoadingDashboard}
                />
                <StatsCard
                    title="Avg Clicks/URL"
                    value={dashboardStats?.avgClicksPerUrl ? dashboardStats.avgClicksPerUrl.toFixed(1) : "0.0"}
                    icon={TrendingUp}
                    loading={isLoadingDashboard}
                />
            </div>

            {/* Top URLs Section */}
            <Tabs defaultValue="clicks" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="clicks">Top by Clicks</TabsTrigger>
                    <TabsTrigger value="recent">Most Recent</TabsTrigger>
                </TabsList>

                <TabsContent value="clicks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing URLs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTopUrls ? (
                                <TopUrlsSkeleton />
                            ) : (
                                <TopUrlsTable urls={topUrls?.urls || []} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Created URLs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RecentUrls />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TopUrlsSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-4 w-[60px]" />
                </div>
            ))}
        </div>
    );
}

function RecentUrls() {
    const { data: recentUrls, isPending } = useTopUrls(10, 'recent');

    if (isPending) {
        return <TopUrlsSkeleton />;
    }

    return <TopUrlsTable urls={recentUrls?.urls || []} />;
}