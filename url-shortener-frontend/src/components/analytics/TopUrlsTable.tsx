// src/components/analytics/TopUrlsTable.tsx
import { useNavigate } from 'react-router-dom';
import {
    ExternalLink,
    BarChart3,
    Calendar,
    MousePointer,
    Copy,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useCopyToClipboard } from '@/hooks/useUrls';
import type { TopUrl } from '@/types/analytics.types';

interface TopUrlsTableProps {
    urls: TopUrl[];
    loading?: boolean;
}

export function TopUrlsTable({ urls, loading }: TopUrlsTableProps) {
    const navigate = useNavigate();
    const { copyToClipboard } = useCopyToClipboard();

    const handleViewDetails = (urlId: string) => {
        navigate(`/urls/${urlId}`);
    };

    const handleViewAnalytics = (urlId: string) => {
        navigate(`/urls/${urlId}?tab=detailed`);
    };

    const handleCopyUrl = async (e: React.MouseEvent, shortUrl: string) => {
        e.stopPropagation();
        await copyToClipboard(shortUrl);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getDomain = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return url;
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="h-10 w-10 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-3 bg-gray-200 rounded w-12"></div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!urls || urls.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="space-y-3">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Nenhuma URL encontrada
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Comece criando sua primeira URL encurtada.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead className="text-center">
                            <MousePointer className="h-4 w-4 mx-auto" />
                        </TableHead>
                        <TableHead className="text-center">
                            <Calendar className="h-4 w-4 mx-auto" />
                        </TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {urls.map((url) => (
                        <TableRow
                            key={url.id}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            onClick={() => handleViewDetails(url.id)}
                        >
                            <TableCell className="max-w-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={url.shortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm flex items-center gap-1"
                                        >
                                            {url.shortUrl.replace(/^https?:\/\//, '')}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleCopyUrl(e, url.shortUrl)}
                                            className="h-6 w-6 p-0"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate max-w-96">
                                        {getDomain(url.fullUrl)}
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="max-w-48">
                                <div className="truncate">
                                    {url.title ? (
                                        <span className="text-sm font-medium">{url.title}</span>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">
                                            Sem título
                                        </span>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {url.clickCount.toLocaleString()}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className="text-xs text-gray-500">
                                    {formatDate(url.createdAt)}
                                </span>
                            </TableCell>

                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetails(url.id);
                                        }}
                                        className="h-8 w-8 p-0"
                                        title="Ver detalhes"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewAnalytics(url.id);
                                        }}
                                        className="h-8 w-8 p-0"
                                        title="Ver analytics"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}