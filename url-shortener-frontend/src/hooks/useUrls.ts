import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import urlService from '../services/urlService';
import type {
    CreateShortUrlRequest,
    ShortenUrlResponse,
    UpdateUrlMetadataRequest,
    UrlStatsResponse
} from '../types/url.types';

// ========== URL CREATION HOOKS ==========

export const useCreateShortUrl = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateShortUrlRequest) => urlService.createShortUrl(data),
        onSuccess: (data: ShortenUrlResponse) => {
            toast.success(`URL encurtada: ${data.shortUrl}`);
            queryClient.invalidateQueries({ queryKey: ['user-urls'] });
            queryClient.invalidateQueries({ queryKey: ['global-stats'] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Erro ao encurtar URL';
            toast.error(message);
        }
    });
};

// ========== URL MANAGEMENT HOOKS ==========

export const useUserUrls = () => {
    return useQuery({
        queryKey: ['user-urls'],
        queryFn: () => urlService.getUserUrls(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
    });
};

export const useUrlStats = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['url-stats', id],
        queryFn: () => urlService.getUrlStats(id),
        enabled: enabled && !!id,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

export const useUpdateUrlMetadata = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUrlMetadataRequest }) =>
            urlService.updateUrlMetadata(id, data),
        onSuccess: (updatedUrl: UrlStatsResponse) => {
            toast.success('Metadados atualizados com sucesso!');
            // Update the specific URL in cache
            queryClient.setQueryData(['url-stats', updatedUrl.id], updatedUrl);
            // Invalidate user URLs list to refresh
            queryClient.invalidateQueries({ queryKey: ['user-urls'] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Erro ao atualizar metadados';
            toast.error(message);
        }
    });
};

export const useDeactivateUrl = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => urlService.deactivateUrl(id),
        onSuccess: (_, id) => {
            toast.success('URL desativada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['user-urls'] });
            queryClient.invalidateQueries({ queryKey: ['url-stats', id] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Erro ao desativar URL';
            toast.error(message);
        }
    });
};

export const useDeleteUrl = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => urlService.deleteUrl(id),
        onSuccess: (_, id) => {
            toast.success('URL deletada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['user-urls'] });
            queryClient.removeQueries({ queryKey: ['url-stats', id] });
            queryClient.invalidateQueries({ queryKey: ['global-stats'] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Erro ao deletar URL';
            toast.error(message);
        }
    });
};

// ========== STATISTICS HOOKS ==========

export const useGlobalStats = () => {
    return useQuery({
        queryKey: ['global-stats'],
        queryFn: () => urlService.getGlobalStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

// ========== UTILITY HOOKS ==========

export const useUrlValidation = () => {
    const validateUrl = (url: string): boolean => {
        return urlService.isValidUrl(url);
    };

    const formatUrl = (url: string): string => {
        return urlService.formatUrl(url);
    };

    const getDomain = (url: string): string => {
        return urlService.getDomain(url);
    };

    return {
        validateUrl,
        formatUrl,
        getDomain
    };
};

export const useCopyToClipboard = () => {
    const copyToClipboard = async (text: string): Promise<boolean> => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copiado para o clipboard!');
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success('Copiado para o clipboard!');
                return true;
            } catch (fallbackError) {
                toast.error('Erro ao copiar para o clipboard');
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    };

    return { copyToClipboard };
};

// ========== BULK OPERATIONS HOOKS ==========

export const useBulkDeleteUrls = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ids: string[]) => {
            // Execute all deletions in parallel
            await Promise.all(ids.map(id => urlService.deleteUrl(id)));
        },
        onSuccess: () => {
            toast.success('URLs deletadas com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['user-urls'] });
            queryClient.invalidateQueries({ queryKey: ['global-stats'] });
        },
        onError: (error: any) => {
            toast.error('Erro ao deletar URLs');
        }
    });
};

export const useBulkDeactivateUrls = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ids: string[]) => {
            // Execute all deactivations in parallel
            await Promise.all(ids.map(id => urlService.deactivateUrl(id)));
        },
        onSuccess: () => {
            toast.success('URLs desativadas com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['user-urls'] });
        },
        onError: (error: any) => {
            toast.error('Erro ao desativar URLs');
        }
    });
};

// ========== CUSTOM HOOKS FOR SPECIFIC FEATURES ==========

export const useUrlPreview = (url: string) => {
    const { validateUrl, getDomain } = useUrlValidation();

    const isValid = validateUrl(url);
    const domain = isValid ? getDomain(url) : '';

    return {
        isValid,
        domain,
        preview: isValid ? urlService.formatUrl(url) : url
    };
};

export const useUrlExpiration = (expiresAt?: string) => {
    const timeUntilExpiration = urlService.getTimeUntilExpiration(expiresAt);
    const isExpired = timeUntilExpiration === 'Expirado';
    const isExpiringSoon = !isExpired && expiresAt &&
        new Date(expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000; // 24 hours

    return {
        timeUntilExpiration,
        isExpired,
        isExpiringSoon
    };
};

// ========== COMPOSITE HOOKS ==========

export const useUrlManagement = () => {
    const createUrl = useCreateShortUrl();
    const updateMetadata = useUpdateUrlMetadata();
    const deactivateUrl = useDeactivateUrl();
    const deleteUrl = useDeleteUrl();
    const { copyToClipboard } = useCopyToClipboard();

    return {
        createUrl,
        updateMetadata,
        deactivateUrl,
        deleteUrl,
        copyToClipboard,
        isLoading: createUrl.isPending ||
            updateMetadata.isPending ||
            deactivateUrl.isPending ||
            deleteUrl.isPending
    };
};