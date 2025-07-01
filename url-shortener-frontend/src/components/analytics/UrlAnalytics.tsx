// components/analytics/UrlAnalytics.tsx - Versão atualizada
import { useState, useMemo } from 'react';
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
    RefreshCw,
    AlertCircle,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TimelineChart } from './TimelineChart';
import { GeographicStats } from './GeographicStats';
import { DeviceStats } from './DeviceStats';
import { ReferrerStats } from './ReferrerStats';
import { ExportButton } from './ExportButton';
import StatsCard from "@/components/display/StatsCard";
import { Skeleton } from '@/components/ui/skeleton';

interface UrlAnalyticsProps {
    urlId: string;
    isAlias?: boolean; // Indica se o urlId é na verdade um alias
}

// Loading skeleton component
function AnalyticsLoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </div>
                            <Skeleton className="h-8 w-16 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

// Error component
interface AnalyticsErrorProps {
    error: Error;
    onRetry: () => void;
    isAlias?: boolean;
    identifier: string;
}

function AnalyticsError({ error, onRetry, isAlias, identifier }: AnalyticsErrorProps) {
    return (
        <div className="space-y-6">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <span>Erro ao carregar analytics: {error.message}</span>
                        {isAlias && (
                            <span className="text-sm">
                                Tentando carregar dados para o alias "{identifier}".
                                Verifique se o alias existe ou tente usar o ID da URL.
                            </span>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="ml-4"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tentar Novamente
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    );
}

export function UrlAnalytics({ urlId, isAlias = false }: UrlAnalyticsProps) {
    const [timelineGranularity, setTimelineGranularity] = useState<'daily' | 'hourly' | 'weekly'>('daily');

    // Hook personalizado que deve lidar com ID ou alias
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
    } = useUrlAnalyticsOverview(urlId, isAlias);

    // Memoização dos dados computados
    const computedStats = useMemo(() => {
        if (!summary.data) return null;

        return {
            totalClicks: summary.data.totalClicks || 0,
            uniqueVisitors: summary.data.uniqueVisitors || 0,
            clicksToday: summary.data.clicksToday || 0,
            avgClicksPerDay: summary.data.avgClicksPerDay ?
                Number(summary.data.avgClicksPerDay).toFixed(1) : '0.0',
        };
    }, [summary.data]);

    const handleRefresh = () => {
        // Force refetch all queries
        analytics.refetch();
        summary.refetch();
        geographic.refetch();
        referrers.refetch();
        devices.refetch();
        timeline.refetch();
    };

    // Loading state melhorado
    if (isLoading && !analytics.data) {
        return <AnalyticsLoadingSkeleton />;
    }

    // Error state melhorado com retry
    if (isError) {
        return (
            <AnalyticsError
                error={error as Error}
                onRetry={handleRefresh}
                isAlias={isAlias}
                identifier={urlId}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header melhorado com indicação de tipo */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">URL Analytics</h1>
                        {isAlias && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Carregado por Alias
                            </Badge>
                        )}
                    </div>
                    {analytics.data && (
                        <div className="flex items-center gap-3 flex-wrap">
                            <a
                                href={analytics.data.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                            >
                                <span className="font-medium">{analytics.data.shortUrl}</span>
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <Badge variant="secondary" className="font-medium">
                                {analytics.data.totalClicks} clicks
                            </Badge>
                            <div className="text-sm text-gray-500">
                                {isAlias ? `Alias: ${urlId}` : `ID: ${urlId}`}
                            </div>
                            {analytics.data. fullUrl && isAlias && (
                                <div className="text-xs text-gray-400">
                                    ID Real: {analytics.data. fullUrl}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                    <ExportButton
                        urlId={analytics.data?. fullUrl || urlId}
                        isAlias={isAlias}
                    />
                </div>
            </div>

            {/* Aviso se carregando por alias */}
            {isAlias && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Você está visualizando analytics através do alias "{urlId}".
                        Os dados mostrados são os mesmos que seriam exibidos usando o ID da URL.
                    </AlertDescription>
                </Alert>
            )}

            {/* Quick Stats com loading individual */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total de Clicks"
                    value={computedStats?.totalClicks ?? 0}
                    icon={MousePointer}
                    loading={summary.isPending}
                    trend={summary.data?.clicksToday ? "up" : undefined}
                    trendValue={summary.data?.clicksToday}
                />
                <StatsCard
                    title="Visitantes Únicos"
                    value={computedStats?.uniqueVisitors ?? 0}
                    icon={Users}
                    loading={summary.isPending}
                />
                <StatsCard
                    title="Clicks Hoje"
                    value={computedStats?.clicksToday ?? 0}
                    icon={Calendar}
                    loading={summary.isPending}
                    highlight={true}
                />
                <StatsCard
                    title="Média Diária"
                    value={computedStats?.avgClicksPerDay ?? '0.0'}
                    icon={TrendingUp}
                    loading={summary.isPending}
                />
            </div>

            {/* Main Content com tabs melhoradas */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="geographic" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Geografia
                    </TabsTrigger>
                    <TabsTrigger value="devices" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Dispositivos
                    </TabsTrigger>
                    <TabsTrigger value="referrers">Origem</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Timeline Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Timeline de Clicks
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {timeline.isFetching && (
                                            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TimelineChart
                                    data={timeline.data}
                                    loading={timeline.isPending}
                                    granularity={timelineGranularity}
                                    onGranularityChange={setTimelineGranularity}
                                />
                            </CardContent>
                        </Card>

                        {/* Geographic Stats - Compact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Top Países
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GeographicStats
                                    data={geographic.data}
                                    loading={geographic.isPending}
                                    compact={true}
                                />
                            </CardContent>
                        </Card>

                        {/* Device Stats - Compact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="h-5 w-5" />
                                    Dispositivos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DeviceStats
                                    data={devices.data}
                                    loading={devices.isPending}
                                    compact={true}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="geographic">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição Geográfica</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GeographicStats
                                data={geographic.data}
                                loading={geographic.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="devices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estatísticas de Dispositivos e Navegadores</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DeviceStats
                                data={devices.data}
                                loading={devices.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="referrers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fontes de Tráfego</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ReferrerStats
                                data={referrers.data}
                                loading={referrers.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline">
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline Detalhada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TimelineChart
                                data={timeline.data}
                                loading={timeline.isPending}
                                granularity={timelineGranularity}
                                onGranularityChange={setTimelineGranularity}
                                detailed={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}