import React, { useState } from 'react';
import {
    Copy,
    ExternalLink,
    Calendar,
    MousePointerClick,
    AlertTriangle,
    CheckCircle,
    QrCode, BarChart3,
    Edit, Power, Trash2
} from 'lucide-react';
import { useCopyToClipboard, useDeleteUrl, useDeactivateUrl, useUrlExpiration } from '@/hooks/useUrls';
import type {UrlStatsResponse} from "@/types/url.types.ts";

interface UrlCardProps {
    url: UrlStatsResponse;
    onEdit?: (url: UrlStatsResponse) => void;
    onViewAnalytics?: (url: UrlStatsResponse) => void;
    showActions?: boolean;
    className?: string;
}

const UrlCard: React.FC<UrlCardProps> = ({
                                             url,
                                             onEdit,
                                             onViewAnalytics,
                                             showActions = true,
                                             className = ''
                                         }) => {
    const [showQr, setShowQr] = useState(false);
    const { copyToClipboard } = useCopyToClipboard();
    const deleteUrl = useDeleteUrl();
    const deactivateUrl = useDeactivateUrl();
    const { timeUntilExpiration, isExpired, isExpiringSoon } = useUrlExpiration(url.expiresAt);

    const handleCopy = () => {
        copyToClipboard(url.shortUrl);
    };

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja deletar esta URL? Esta ação não pode ser desfeita.')) {
            deleteUrl.mutate(url.id);
        }
    };

    const handleDeactivate = () => {
        if (window.confirm('Tem certeza que deseja desativar esta URL?')) {
            deactivateUrl.mutate(url.id);
        }
    };

    const handleViewOriginal = () => {
        window.open(url.originalUrl, '_blank');
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
            return new URL(url).hostname;
        } catch {
            return url;
        }
    };

    const getStatusColor = () => {
        if (isExpired || !url.isActive) return 'text-red-500 bg-red-50';
        if (isExpiringSoon) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const getStatusText = () => {
        if (!url.isActive) return 'Desativada';
        if (isExpired) return 'Expirada';
        if (isExpiringSoon) return 'Expirando';
        return 'Ativa';
    };

    const getStatusIcon = () => {
        if (isExpired || !url.isActive) return <AlertTriangle className="w-3 h-3" />;
        return <CheckCircle className="w-3 h-3" />;
    };

    // Generate QR Code placeholder
    const generateQRCode = (text: string) => {
        // Simple QR code placeholder - you can replace this with a real QR code library
        return (
            <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <QrCode className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <span className="text-xs text-gray-500">QR Code</span>
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <div className="p-4">
                {/* Header with Status */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        {url.title && (
                            <h3 className="font-semibold text-gray-900 truncate mb-1">
                                {url.title}
                            </h3>
                        )}

                        {/* Short URL */}
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                onClick={handleCopy}
                                className="text-purple-600 hover:text-purple-700 font-medium truncate flex-1 text-left"
                                title="Clique para copiar"
                            >
                                {url.shortUrl}
                            </button>
                            <button
                                onClick={handleCopy}
                                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                                title="Copiar URL"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Original URL */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="truncate flex-1" title={url.originalUrl}>
                                {getDomain(url.originalUrl)}
                            </span>
                            <button
                                onClick={handleViewOriginal}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Abrir URL original"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ml-2 ${getStatusColor()}`}>
                        {getStatusIcon()}
                        {getStatusText()}
                    </div>
                </div>

                {/* Description */}
                {url.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {url.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                            <MousePointerClick className="w-4 h-4" />
                            <span className="font-medium text-gray-900">{url.clickCount}</span>
                            <span>cliques</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(url.createdAt)}</span>
                        </div>
                        {url.expiresAt && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span className={isExpiringSoon || isExpired ? 'text-red-600 font-medium' : ''}>
                                    expira {formatDate(url.expiresAt)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expiration Warning */}
                {(isExpiringSoon || isExpired) && (
                    <div className={`p-2 rounded-lg text-sm flex items-center gap-2 mb-3 ${
                        isExpired ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                            {isExpired ? 'Esta URL expirou' : `Expira em ${timeUntilExpiration}`}
                        </span>
                    </div>
                )}

                {/* Actions */}
                {showActions && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                        <button
                            onClick={() => setShowQr(!showQr)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            title="Mostrar QR Code"
                        >
                            <QrCode className="w-4 h-4" />
                            QR
                        </button>

                        {onViewAnalytics && (
                            <button
                                onClick={() => onViewAnalytics(url)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Ver análises"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Análises
                            </button>
                        )}

                        {onEdit && (
                            <button
                                onClick={() => onEdit(url)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                        )}

                        <div className="flex-1" />

                        <button
                            onClick={handleDeactivate}
                            disabled={!url.isActive || deactivateUrl.isPending}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={url.isActive ? "Desativar" : "URL já desativada"}
                        >
                            <Power className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={deleteUrl.isPending}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Deletar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* QR Code */}
                {showQr && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">QR Code</h4>
                        {generateQRCode(url.shortUrl)}
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Escaneie para acessar: {url.shortUrl}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UrlCard;