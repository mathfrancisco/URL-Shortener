import React, { useState, useEffect } from 'react';
import { Link, TrendingUp, Users, MousePointerClick, Copy, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import CreateUrlFormComponent from '@/components/forms/CreateUrlForm';
import { useGlobalStats } from '@/hooks/useUrls';

const HomePage: React.FC = () => {
    const [createdUrl, setCreatedUrl] = useState<any>(null);
    const [currentPath, setCurrentPath] = useState('/');
    const [copySuccess, setCopySuccess] = useState(false);
    const { data: globalStats, isLoading: statsLoading } = useGlobalStats();

    const handleUrlCreated = (result: any) => {
        console.log('URL criada:', result); // Debug log
        setCreatedUrl(result);
    };

    const handleCopyUrl = async () => {
        if (!createdUrl) return;

        // Determinar qual propriedade contém a URL encurtada
        const shortUrl = createdUrl.shortUrl ||
            createdUrl.shortened_url ||
            createdUrl.short_url ||
            createdUrl.url ||
            '';

        console.log('Tentando copiar URL:', shortUrl); // Debug log

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
            // Fallback para navegadores mais antigos
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

    // Debug: Log quando createdUrl muda
    useEffect(() => {
        console.log('createdUrl state changed:', createdUrl);
    }, [createdUrl]);

    // Função para extrair a URL encurtada
    const getShortUrl = () => {
        if (!createdUrl) return '';
        return createdUrl.shortUrl ||
            createdUrl.shortened_url ||
            createdUrl.short_url ||
            createdUrl.url ||
            'URL não disponível';
    };

    // Função para extrair a URL original
    const getOriginalUrl = () => {
        if (!createdUrl) return '';
        return createdUrl.originalUrl ||
            createdUrl.original_url ||
            createdUrl.longUrl ||
            createdUrl.long_url ||
            createdUrl.target_url ||
            'URL original não disponível';
    };

    const stats = [
        {
            icon: <Link className="w-8 h-8" />,
            title: "URLs Criadas",
            value: globalStats?.totalUrls || 0,
            suffix: "+"
        },
        {
            icon: <MousePointerClick className="w-8 h-8" />,
            title: "Total de Cliques",
            value: globalStats?.totalClicks || 0,
            suffix: "+"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Usuários Ativos",
            value: globalStats?.activeUsers || 0,
            suffix: "+"
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Cliques Hoje",
            value: globalStats?.totalUrls || globalStats?.totalClicks || 0,
            suffix: ""
        }
    ];

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
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

                {/* Debug Info - Remove em produção */}
                {process.env.NODE_ENV === 'development' && createdUrl && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h4>
                        <pre className="text-xs text-yellow-700 overflow-auto">
                            {JSON.stringify(createdUrl, null, 2)}
                        </pre>
                        <div className="mt-2 text-xs text-yellow-700">
                            <p><strong>Short URL extraída:</strong> {getShortUrl()}</p>
                            <p><strong>Original URL extraída:</strong> {getOriginalUrl()}</p>
                        </div>
                    </div>
                )}

                {/* Statistics Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Estatísticas em Tempo Real
                        </h2>
                        <p className="text-gray-600">
                            Veja como nossa plataforma está ajudando milhares de usuários
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg text-purple-600">
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {statsLoading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-16 mx-auto rounded"></div>
                                    ) : (
                                        formatNumber(stat.value) + stat.suffix
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">{stat.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

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