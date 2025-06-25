import React, { useState } from 'react';
import { Link, TrendingUp, Users, MousePointerClick, Copy, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import CreateUrlFormComponent from '@/components/forms/CreateUrlForm';
import { useGlobalStats } from '@/hooks/useUrls';

const HomePage: React.FC = () => {
    const [createdUrl, setCreatedUrl] = useState<any>(null);
    const [currentPath, setCurrentPath] = useState('/');
    const { data: globalStats, isLoading: statsLoading } = useGlobalStats();

    const handleUrlCreated = (result: any) => {
        setCreatedUrl(result);
    };

    const handleCopyUrl = async () => {
        if (createdUrl?.shortUrl) {
            try {
                await navigator.clipboard.writeText(createdUrl.shortUrl);
            } catch (error) {
                console.error('Failed to copy URL');
            }
        }
    };

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
        // Aqui você implementaria a navegação real
        console.log('Navigating to:', path);
    };

    const handleLogout = () => {
        // Implementar logout
        console.log('Logging out...');
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
            value: globalStats?.totalClicks || 0,
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
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-lg font-medium text-purple-600 truncate">
                                        {createdUrl.shortUrl}
                                    </span>
                                    <button
                                        onClick={handleCopyUrl}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copiar
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Sua URL original:
                                <span className="font-medium"> {createdUrl.originalUrl}</span>
                            </p>
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