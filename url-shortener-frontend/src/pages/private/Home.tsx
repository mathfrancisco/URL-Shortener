import React, { useState, useEffect } from 'react';
import { Link, TrendingUp,  MousePointerClick, Copy, CheckCircle, Activity } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import CreateUrlFormComponent from '@/components/forms/CreateUrlForm';
import StatsCard from '@/components/display/StatsCard';
import { useDashboardStats, useTopUrls } from '@/hooks/useAnalytics';
import { useGlobalStats } from '@/hooks/useUrls';

const HomePage: React.FC = () => {
    const [createdUrl, setCreatedUrl] = useState<any>(null);
    const [currentPath, setCurrentPath] = useState('/');
    const [copySuccess, setCopySuccess] = useState(false);

    // Use real analytics hooks
    const { data: dashboardStats, isPending: dashboardLoading, error: dashboardError } = useDashboardStats();
    const { data: topUrls, isPending: topUrlsLoading } = useTopUrls(5, 'clicks');
    const { data: globalStats, isLoading: globalStatsLoading } = useGlobalStats();

    const handleUrlCreated = (result: any) => {
        console.log('URL criada:', result);
        setCreatedUrl(result);
    };

    const handleCopyUrl = async () => {
        if (!createdUrl) return;

        const shortUrl = createdUrl.shortUrl ||
            createdUrl.shortened_url ||
            createdUrl.short_url ||
            createdUrl.url ||
            '';

        console.log('Tentando copiar URL:', shortUrl);

        if (!shortUrl) {
            console.error('URL encurtada não encontrada no objeto:', createdUrl);
            return;
        }

        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            console.log('URL copiada com sucesso:', shortUrl);
        } catch (error) {
            console.error('Failed to copy URL:', error);
            const textArea = document.createElement('textarea');
            textArea.value = shortUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
                console.log('URL copiada com fallback:', shortUrl);
            } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
            } finally {
                document.body.removeChild(textArea);
            }
        }
    };

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
        console.log('Navigating to:', path);
    };

    const handleLogout = () => {
        console.log('Logging out...');
    };

    useEffect(() => {
        console.log('createdUrl state changed:', createdUrl);
    }, [createdUrl]);

    const getShortUrl = () => {
        if (!createdUrl) return '';
        return createdUrl.shortUrl ||
            createdUrl.shortened_url ||
            createdUrl.short_url ||
            createdUrl.url ||
            'URL não disponível';
    };

    const getOriginalUrl = () => {
        if (!createdUrl) return '';
        return createdUrl.originalUrl ||
            createdUrl.original_url ||
            createdUrl.longUrl ||
            createdUrl.long_url ||
            createdUrl.target_url ||
            'URL original não disponível';
    };

    // Real statistics data with fallbacks
    const statsData = [
        {
            title: "URLs Criadas",
            value: dashboardStats?.totalUrls || globalStats?.totalUrls || 0,
            icon: Link,
            loading: dashboardLoading || globalStatsLoading,
            description: "Total de URLs encurtadas"
        },
        {
            title: "Total de Cliques",
            value: dashboardStats?.totalClicks || globalStats?.totalClicks || 0,
            icon: MousePointerClick,
            loading: dashboardLoading || globalStatsLoading,
            description: "Cliques em todas as URLs"
        },
        {
            title: "URLs Ativas",
            value: dashboardStats?.activeUrls || globalStats?.activeUsers || 0,
            icon: Activity,
            loading: dashboardLoading || globalStatsLoading,
            description: "URLs com cliques recentes"
        },
        {
            title: "Média de Cliques",
            value: dashboardStats?.avgClicksPerUrl ? dashboardStats.avgClicksPerUrl.toFixed(1) : "0.0",
            icon: TrendingUp,
            loading: dashboardLoading,
            description: "Cliques por URL",
            isFloat: true
        }
    ];

    const formatNumber = (num: number | string) => {
        const numValue = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(numValue)) return '0';

        if (numValue >= 1000000) {
            return (numValue / 1000000).toFixed(1) + 'M';
        }
        if (numValue >= 1000) {
            return (numValue / 1000).toFixed(1) + 'K';
        }
        return numValue.toString();
    };

    return (
        <MainLayout
            currentPath={currentPath}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
        >
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-gray-200">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                                <Link className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Bem-vindo ao ShortLink
                            </span>
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Transforme URLs longas em links curtos e profissionais.
                            Acompanhe estatísticas detalhadas e tenha controle total sobre seus links.
                        </p>
                    </div>
                </div>

                {/* URL Creation Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Encurtar Nova URL
                            </h2>
                            <p className="text-gray-600">
                                Cole sua URL longa abaixo e crie um link curto em segundos
                            </p>
                        </div>
                        <CreateUrlFormComponent
                            onSuccess={handleUrlCreated}
                            className="shadow-none border border-gray-200"
                        />
                    </div>
                </div>

                {/* Result Display */}
                {createdUrl && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-2 bg-green-500 rounded-full">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                URL Encurtada com Sucesso!
                            </h3>
                            <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500 mb-1">URL Encurtada:</p>
                                        <span className="text-lg font-medium text-purple-600 break-all">
                                            {getShortUrl()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopyUrl}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                            copySuccess
                                                ? 'bg-green-600 text-white'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                    >
                                        {copySuccess ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copiar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="text-left bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>URL Original:</strong>
                                </p>
                                <p className="text-sm text-gray-800 break-all">
                                    {getOriginalUrl()}
                                </p>
                                {createdUrl.id && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        ID: {createdUrl.id}
                                    </p>
                                )}
                                {createdUrl.expiresAt && (
                                    <p className="text-xs text-gray-500">
                                        Expira em: {new Date(createdUrl.expiresAt).toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Real Analytics Statistics Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Suas Estatísticas
                        </h2>
                        <p className="text-gray-600">
                            Acompanhe o desempenho dos seus links em tempo real
                        </p>
                        {dashboardError && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-700">
                                    ⚠️ Não foi possível carregar algumas estatísticas. Tentando novamente...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid using StatsCard component */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsData.map((stat, index) => (
                            <StatsCard
                                key={index}
                                title={stat.title}
                                value={stat.isFloat ? stat.value : formatNumber(stat.value)}
                                icon={stat.icon}
                                loading={stat.loading}
                                className="bg-gray-50 hover:bg-gray-100 transition-colors border-0"
                            />
                        ))}
                    </div>

                    {/* Top URLs Preview */}
                    {topUrls && topUrls.urls && topUrls.urls.length > 0 && (
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Top URLs por Cliques
                                </h3>
                                <button
                                    onClick={() => handleNavigate('/analytics')}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Ver todos →
                                </button>
                            </div>
                            <div className="space-y-3">
                                {topUrls.urls.slice(0, 3).map((url, index) => (
                                    <div
                                        key={url.id || index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {url.shortUrl || url.fullUrl|| 'URL'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {url.shortUrl || url.fullUrl || url.title || 'URL original'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-purple-600">
                                                {formatNumber(url.title || url.clickCount || 0)}
                                            </p>
                                            <p className="text-xs text-gray-500">cliques</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {topUrlsLoading && (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                            <div className="w-12 h-4 bg-gray-200 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Debug Info - Remove em produção */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info - Analytics:</h4>
                        <div className="text-xs text-yellow-700 space-y-1">
                            <p><strong>Dashboard Stats:</strong> {JSON.stringify(dashboardStats, null, 2)}</p>
                            <p><strong>Global Stats:</strong> {JSON.stringify(globalStats, null, 2)}</p>
                            <p><strong>Top URLs Count:</strong> {topUrls?.urls?.length || 0}</p>
                            <p><strong>Loading States:</strong> Dashboard: {dashboardLoading.toString()}, Global: {globalStatsLoading.toString()}, TopUrls: {topUrlsLoading.toString()}</p>
                        </div>
                        {createdUrl && (
                            <div className="mt-4 pt-4 border-t border-yellow-300">
                                <h5 className="text-sm font-medium text-yellow-800 mb-2">Created URL Debug:</h5>
                                <pre className="text-xs text-yellow-700 overflow-auto">
                                    {JSON.stringify(createdUrl, null, 2)}
                                </pre>
                                <div className="mt-2 text-xs text-yellow-700">
                                    <p><strong>Short URL extraída:</strong> {getShortUrl()}</p>
                                    <p><strong>Original URL extraída:</strong> {getOriginalUrl()}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">URLs Recentes</h3>
                        <p className="text-purple-100 mb-4">
                            Veja e gerencie suas URLs criadas recentemente
                        </p>
                        <button
                            onClick={() => handleNavigate('/urls')}
                            className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Ver Minhas URLs
                        </button>
                    </div>

                    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">Análises Detalhadas</h3>
                        <p className="text-green-100 mb-4">
                            Acompanhe o desempenho dos seus links
                        </p>
                        <button
                            onClick={() => handleNavigate('/analytics')}
                            className="px-6 py-2 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Ver Análises
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default HomePage;