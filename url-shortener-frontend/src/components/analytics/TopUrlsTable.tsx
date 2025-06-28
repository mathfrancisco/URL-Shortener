// src/components/analytics/TopUrlsTable.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ExternalLink, Copy, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UrlData {
    id: string;
    shortUrl: string;
    originalUrl: string;
    title?: string;
    clicks: number;
    createdAt: string;
    isActive: boolean;
}

interface TopUrlsTableProps {
    urls: UrlData[];
    showActions?: boolean;
}

export function TopUrlsTable({ urls, showActions = true }: TopUrlsTableProps) {
    const navigate = useNavigate();

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('URL copiada para a área de transferência');
        } catch (error) {
            toast.error('Erro ao copiar URL');
        }
    };

    const handleViewAnalytics = (urlId: string) => {
        navigate(`/analytics/${urlId}`);
    };

    if (!urls || urls.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma URL encontrada</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead className="text-center">Cliques</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado</TableHead>
                        {showActions && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {urls.map((url) => (
                        <TableRow key={url.id}>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {url.title || url.shortUrl}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {url.shortUrl}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2 max-w-xs">
                  <span className="text-sm truncate" title={url.originalUrl}>
                    {url.originalUrl}
                  </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(url.originalUrl, '_blank')}
                                        className="h-6 w-6 p-0 flex-shrink-0"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="font-mono">
                                    {url.clicks.toLocaleString()}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={url.isActive ? "default" : "secondary"}
                                    className={url.isActive ? "bg-green-100 text-green-800" : ""}
                                >
                                    {url.isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(url.createdAt), {
                                    addSuffix: true,
                                    locale: ptBR
                                })}
                            </TableCell>
                            {showActions && (
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(url.shortUrl)}
                                            className="h-8 w-8 p-0"
                                            title="Copiar URL"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewAnalytics(url.id)}
                                            className="h-8 w-8 p-0"
                                            title="Ver Analytics"
                                        >
                                            <BarChart3 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}