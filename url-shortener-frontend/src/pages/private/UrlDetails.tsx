// src/pages/private/UrlDetails.tsx
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BarChart3,
    Link,
    ExternalLink,
    Users,
    MousePointer,
    Settings,
    Share2,
    QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrlAnalytics } from '@/components/analytics/UrlAnalytics';
import { useUrlStats } from '@/hooks/useUrls';
import { useCopyToClipboard } from '@/hooks/useUrls';
import { Suspense, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Loading component para detalhes da URL
const UrlDetailsLoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>

        <Skeleton className="h-96 w-full rounded-lg" />
    </div>
);

export default function UrlDetails() {
    const { urlId } = useParams<{ urlId: string }>();
    const navigate = useNavigate();
    const { copyToClipboard } = useCopyToClipboard();
    const [activeTab, setActiveTab] = useState('overview');

    // Verificar se urlId é um alias (não segue padrão UUID)
    const isAlias = urlId ? !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(urlId) : false;

    const {
        data: urlStats,
        isLoading: loadingStats,
        error: statsError
    } = useUrlStats(urlId || '', !!urlId);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoToAnalytics = () => {
        navigate('/analytics');
    };

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const handleCopyUrl = async () => {
        if (urlStats?.shortUrl) {
            await copyToClipboard(urlStats.shortUrl);
        }
    };

    const handleCopyFullUrl = async () => {
        if (urlStats?.originalUrl) {
            await copyToClipboard(urlStats.originalUrl);
        }
    };

    if (!urlId) {
        return (
            <MainLayout
                currentPath="/urls"
                onNavigate={handleNavigate}
                requireAuth={true}
            >
                <div className="max-w-7xl mx-auto">
                    <Alert>
                        <AlertDescription>
                            ID da URL não fornecido. Por favor, acesse através da lista de URLs.
                        </AlertDescription>
                    </Alert>
                </div>
            </MainLayout>
        );
    }

    if (loadingStats) {
        return (
            <MainLayout
                currentPath="/urls"
                onNavigate={handleNavigate}
                requireAuth={true}
                className="bg-gray-50 dark:bg-gray-900"
            >
                <div className="max-w-7xl mx-auto">
                    <UrlDetailsLoadingSkeleton />
                </div>
            </MainLayout>
        );
    }

    if (statsError || !urlStats) {
        return (
            <MainLayout
                currentPath="/urls"
                onNavigate={handleNavigate}
                requireAuth={true}
            >
                <div className="max-w-7xl mx-auto">
                    <Alert variant="destructive">
                        <AlertDescription>
                            Erro ao carregar detalhes da URL. Verifique se o ID/alias está correto.
                        </AlertDescription>
                    </Alert>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout
            currentPath="/urls"
            onNavigate={handleNavigate}
            requireAuth={true}
            className="bg-gray-50 dark:bg-gray-900"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
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
                            <Link className="h-6 w-6 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Detalhes da URL
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {isAlias ? `Carregado por alias: ${urlId}` : `ID: ${urlId}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGoToAnalytics}
                            className="flex items-center gap-2"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Dashboard Geral
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            Configurações
                        </Button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Main URL Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Link className="h-5 w-5" />
                                    Informações da URL
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Short URL */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">URL Encurtada</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <a
                                            href={urlStats.shortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                                        >
                                            {urlStats.shortUrl}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCopyUrl}
                                            className="p-1"
                                        >
                                            <Share2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Original URL */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">URL Original</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                                            {urlStats.originalUrl}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCopyFullUrl}
                                            className="p-1 flex-shrink-0"
                                        >
                                            <Share2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Metadata */}
                                {(urlStats.title || urlStats.description) && (
                                    <div className="space-y-2">
                                        {urlStats.title && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Título</label>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {urlStats.title}
                                                </p>
                                            </div>
                                        )}
                                        {urlStats.description && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Descrição</label>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {urlStats.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Status and Dates */}
                                <div className="flex items-center gap-4 pt-2">
                                    <Badge
                                        variant={urlStats.isActive ? "default" : "destructive"}
                                        className="flex items-center gap-1"
                                    >
                                        {urlStats.isActive ? "Ativa" : "Inativa"}
                                    </Badge>
                                    <div className="text-xs text-gray-500">
                                        Criada em: {new Date(urlStats.createdAt).toLocaleDateString('pt-BR')}
                                    </div>
                                    {urlStats.expiresAt && (
                                        <div className="text-xs text-gray-500">
                                            Expira em: {new Date(urlStats.expiresAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Stats Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MousePointer className="h-5 w-5" />
                                    Estatísticas Rápidas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {urlStats.clickCount}
                                    </div>
                                    <div className="text-sm text-gray-500">Total de Clicks</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* QR Code */}
                        {urlStats.qrCodeUrl && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="h-5 w-5" />
                                        QR Code
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-center">
                                        <img
                                            src={urlStats.qrCodeUrl}
                                            alt="QR Code"
                                            className="w-32 h-32 border rounded"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Analytics Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics Overview
                        </TabsTrigger>
                        <TabsTrigger value="detailed" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Analytics Detalhados
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="text-center py-8">
                            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Analytics Resumidos
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Visão básica do desempenho desta URL
                            </p>
                            <Button
                                onClick={() => setActiveTab('detailed')}
                                className="flex items-center gap-2"
                            >
                                <BarChart3 className="h-4 w-4" />
                                Ver Analytics Detalhados
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="detailed" className="space-y-6">
                        <Suspense fallback={<UrlDetailsLoadingSkeleton />}>
                            <UrlAnalytics urlId={urlId} isAlias={isAlias} />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}