import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Home, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrlAnalytics } from '@/components/analytics/UrlAnalytics';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';

// Loading component para analytics específicos
const AnalyticsLoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
        </div>

        <Skeleton className="h-96 w-full rounded-lg" />
    </div>
);

// Loading component para dashboard
const DashboardLoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
        </div>

        <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <div className="border rounded-lg">
                <div className="p-6 border-b">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="p-6">
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
                </div>
            </div>
        </div>
    </div>
);

export default function Analytics() {
    const { urlId } = useParams<{ urlId: string }>();
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/home');
    };

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    // Se há urlId, mostra analytics específicos da URL
    // Se não há urlId, mostra o dashboard geral
    const showUrlAnalytics = urlId && urlId.trim() !== '';
    const defaultTab = showUrlAnalytics ? 'url-analytics' : 'dashboard';

    return (
        <MainLayout
            currentPath="/analytics"
            onNavigate={handleNavigate}
            requireAuth={true}
            className="bg-gray-50 dark:bg-gray-900"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header com navegação melhorada */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleGoBack}
                            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Button>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Analytics
                            </h1>
                        </div>
                    </div>

                    {/* Botão para ir ao dashboard geral quando estiver vendo URL específica */}
                    {showUrlAnalytics && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGoHome}
                            className="flex items-center gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Dashboard Geral
                        </Button>
                    )}
                </div>

                {/* Tabs para alternar entre Dashboard e Analytics específicos */}
                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger
                            value="dashboard"
                            className="flex items-center gap-2"
                        >
                            <TrendingUp className="h-4 w-4" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger
                            value="url-analytics"
                            className="flex items-center gap-2"
                            disabled={!showUrlAnalytics}
                        >
                            <BarChart3 className="h-4 w-4" />
                            URL Específica
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard Geral */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <Suspense fallback={<DashboardLoadingSkeleton />}>
                            <AnalyticsDashboard />
                        </Suspense>
                    </TabsContent>

                    {/* Analytics específicos da URL */}
                    <TabsContent value="url-analytics" className="space-y-6">
                        {showUrlAnalytics ? (
                            <Suspense fallback={<AnalyticsLoadingSkeleton />}>
                                <UrlAnalytics urlId={urlId} />
                            </Suspense>
                        ) : (
                            <div className="text-center py-12">
                                <div className="space-y-4">
                                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto" />
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                            Nenhuma URL selecionada
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                            Para ver analytics específicos de uma URL,
                                            acesse através da lista de URLs ou forneça um ID válido.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleGoHome}
                                        className="flex items-center gap-2"
                                    >
                                        <Home className="h-4 w-4" />
                                        Ir ao Dashboard
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}