// src/pages/private/UrlsList.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Link,
    Plus,
    Search,
    Filter,
    RefreshCw,
    BarChart3,
    Settings,
    Trash2,
    Power,
    Edit3,
    ExternalLink,
    Copy,
    Eye,
    Calendar,
    Activity,
    MousePointer,
    TrendingUp,
    ArrowUpDown,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import CreateUrlFormComponent from '@/components/forms/CreateUrlForm';
import StatsCard from '@/components/display/StatsCard';
import {
    useUserUrls,
    useDeleteUrl,
    useDeactivateUrl,
    useCopyToClipboard,
} from '@/hooks/useUrls';
import { useDashboardStats } from '@/hooks/useAnalytics';
import type { UrlStatsResponse } from '@/types/url.types';

type SortField = 'createdAt' | 'clickCount' | 'shortUrl' | 'isActive';
type SortOrder = 'asc' | 'desc';

export default function UrlsList() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

    // Hooks
    const { data: userUrls, isPending: urlsLoading, error: urlsError, refetch } = useUserUrls();
    const { data: dashboardStats, isPending: statsLoading } = useDashboardStats();
    const { copyToClipboard } = useCopyToClipboard();
    const deleteUrl = useDeleteUrl();
    const deactivateUrl = useDeactivateUrl();

    // Navegação
    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const handleViewDetails = (urlId: string) => {
        navigate(`/urls/${urlId}`);
    };

    const handleViewAnalytics = (urlId: string) => {
        navigate(`/urls/${urlId}?tab=detailed`);
    };

    const handleEditUrl = (urlId: string) => {
        navigate(`/urls/${urlId}?tab=edit`);
    };

    // Ações
    const handleCopyUrl = async (shortUrl: string) => {
        await copyToClipboard(shortUrl);
    };

    const handleDeleteUrl = async (urlId: string) => {
        if (window.confirm('Tem certeza que deseja deletar esta URL? Esta ação não pode ser desfeita.')) {
            await deleteUrl.mutateAsync(urlId);
            refetch();
        }
    };

    const handleDeactivateUrl = async (urlId: string) => {
        await deactivateUrl.mutateAsync(urlId);
        refetch();
    };

    const handleRefresh = () => {
        refetch();
    };

    const handleUrlCreated = () => {
        setShowCreateDialog(false);
        refetch();
    };

    // Sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // Filtering and sorting
    const filteredAndSortedUrls = useMemo(() => {
        if (!userUrls) return [];

        let filtered = userUrls.filter((url: UrlStatsResponse) => {
            // Search filter
            const matchesSearch = !searchTerm ||
                url.shortUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                url.originalUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                url.title?.toLowerCase().includes(searchTerm.toLowerCase());

            // Status filter
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && url.isActive) ||
                (filterStatus === 'inactive' && !url.isActive);

            return matchesSearch && matchesStatus;
        });

        // Sort
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortField) {
                case 'createdAt':
                    aValue = new Date(a.createdAt || 0);
                    bValue = new Date(b.createdAt || 0);
                    break;
                case 'clickCount':
                    aValue = a.clickCount || 0;
                    bValue = b.clickCount || 0;
                    break;
                case 'shortUrl':
                    aValue = a.shortUrl || '';
                    bValue = b.shortUrl || '';
                    break;
                case 'isActive':
                    aValue = a.isActive ? 1 : 0;
                    bValue = b.isActive ? 1 : 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [userUrls, searchTerm, filterStatus, sortField, sortOrder]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatTimeAgo = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Há poucos minutos';
        if (diffInHours < 24) return `Há ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Há ${diffInDays}d`;
        return formatDate(dateString);
    };

    // Loading skeleton
    const TableSkeleton = () => (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    );

    if (urlsError) {
        return (
            <MainLayout currentPath="/urls" onNavigate={handleNavigate} requireAuth={true}>
                <div className="max-w-7xl mx-auto">
                    <Alert variant="destructive">
                        <AlertDescription>
                            Erro ao carregar URLs. Tente novamente.
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
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Link className="h-8 w-8 text-blue-600" />
                            Minhas URLs
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Gerencie e monitore suas URLs encurtadas
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={urlsLoading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${urlsLoading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/analytics')}
                            className="flex items-center gap-2"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </Button>
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nova URL
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Criar Nova URL</DialogTitle>
                                    <DialogDescription>
                                        Encurte uma nova URL e personalize como desejar
                                    </DialogDescription>
                                </DialogHeader>
                                <CreateUrlFormComponent onSuccess={handleUrlCreated} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total de URLs"
                        value={dashboardStats?.totalUrls ?? userUrls?.length ?? 0}
                        icon={Link}
                        loading={statsLoading}
                    />
                    <StatsCard
                        title="URLs Ativas"
                        value={dashboardStats?.activeUrls ?? userUrls?.filter(u => u.isActive).length ?? 0}
                        icon={Activity}
                        loading={statsLoading}
                    />
                    <StatsCard
                        title="Total de Clicks"
                        value={dashboardStats?.totalClicks ?? 0}
                        icon={MousePointer}
                        loading={statsLoading}
                    />
                    <StatsCard
                        title="Média de Clicks"
                        value={dashboardStats?.avgClicksPerUrl?.toFixed(1) ?? '0.0'}
                        icon={TrendingUp}
                        loading={statsLoading}
                    />
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por URL, título ou destino..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            Status: {filterStatus === 'all' ? 'Todos' : filterStatus === 'active' ? 'Ativos' : 'Inativos'}
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                                            Todos
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                                            Apenas Ativos
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                                            Apenas Inativos
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* URLs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>URLs ({filteredAndSortedUrls.length})</span>
                            {selectedUrls.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {selectedUrls.length} selecionadas
                                    </span>
                                    <Button variant="outline" size="sm">
                                        Ações em Lote
                                    </Button>
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {urlsLoading ? (
                            <TableSkeleton />
                        ) : filteredAndSortedUrls.length === 0 ? (
                            <div className="text-center py-12">
                                <Link className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {searchTerm || filterStatus !== 'all' ? 'Nenhuma URL encontrada' : 'Nenhuma URL criada ainda'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    {searchTerm || filterStatus !== 'all'
                                        ? 'Tente ajustar os filtros de busca'
                                        : 'Comece criando sua primeira URL encurtada'
                                    }
                                </p>
                                {(!searchTerm && filterStatus === 'all') && (
                                    <Button onClick={() => setShowCreateDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Criar Primeira URL
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input type="checkbox" className="rounded" />
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('shortUrl')}
                                                className="flex items-center gap-1 h-auto p-0 font-semibold"
                                            >
                                                URL
                                                <ArrowUpDown className="h-3 w-3" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Destino</TableHead>
                                        <TableHead className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('clickCount')}
                                                className="flex items-center gap-1 h-auto p-0 font-semibold"
                                            >
                                                <MousePointer className="h-3 w-3" />
                                                Clicks
                                                <ArrowUpDown className="h-3 w-3" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('isActive')}
                                                className="flex items-center gap-1 h-auto p-0 font-semibold"
                                            >
                                                Status
                                                <ArrowUpDown className="h-3 w-3" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('createdAt')}
                                                className="flex items-center gap-1 h-auto p-0 font-semibold"
                                            >
                                                <Calendar className="h-3 w-3" />
                                                Criado
                                                <ArrowUpDown className="h-3 w-3" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedUrls.map((url) => (
                                        <TableRow
                                            key={url.id}
                                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            onClick={() => handleViewDetails(url.id)}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={selectedUrls.includes(url.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUrls([...selectedUrls, url.id]);
                                                        } else {
                                                            setSelectedUrls(selectedUrls.filter(id => id !== url.id));
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-blue-600">
                                                            {url.shortUrl?.replace(/^https?:\/\//, '') || url.id}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopyUrl(url.shortUrl || '');
                                                            }}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    {url.title && (
                                                        <p className="text-sm text-gray-500">{url.title}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-96 truncate text-sm text-gray-600">
                                                    {url.originalUrl}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="font-mono">
                                                    {url.clickCount?.toLocaleString() || '0'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={url.isActive ? "default" : "secondary"}
                                                    className={url.isActive
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                                    }
                                                >
                                                    {url.isActive ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {formatTimeAgo(url.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleViewDetails(url.id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Ver Detalhes
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleViewAnalytics(url.id)}>
                                                            <BarChart3 className="h-4 w-4 mr-2" />
                                                            Analytics
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => window.open(url.shortUrl, '_blank')}>
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            Abrir URL
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleEditUrl(url.id)}>
                                                            <Edit3 className="h-4 w-4 mr-2" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeactivateUrl(url.id)}
                                                            disabled={!url.isActive}
                                                        >
                                                            <Power className="h-4 w-4 mr-2" />
                                                            Desativar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteUrl(url.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Deletar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}