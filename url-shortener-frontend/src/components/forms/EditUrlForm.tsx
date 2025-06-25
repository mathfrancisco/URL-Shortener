import React from 'react';
import { Edit, Loader2, AlertCircle, X } from 'lucide-react';
import { useUpdateUrlMetadata } from "@/hooks/useUrls.ts";

interface EditUrlFormProps {
    url: {
        id: string;
        shortUrl: string;
        originalUrl: string;
        title?: string;
        description?: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    className?: string;
}

const EditUrlForm: React.FC<EditUrlFormProps> = ({
                                                     url,
                                                     isOpen,
                                                     onClose,
                                                     onSuccess,
                                                     className = ''
                                                 }) => {
    const [title, setTitle] = React.useState(url.title || '');
    const [description, setDescription] = React.useState(url.description || '');
    const [errors, setErrors] = React.useState<{title?: string; description?: string}>({});

    const updateMetadata = useUpdateUrlMetadata();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validação simples
        const newErrors: {title?: string; description?: string} = {};

        if (title.length > 100) {
            newErrors.title = 'Título deve ter no máximo 100 caracteres';
        }

        if (description.length > 500) {
            newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await updateMetadata.mutateAsync({
                id: url.id,
                data: {
                    title: title.trim(),
                    description: description.trim()
                }
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    const handleClose = () => {
        if (!updateMetadata.isPending) {
            setTitle(url.title || '');
            setDescription(url.description || '');
            setErrors({});
            onClose();
        }
    };

    // Reset form when url changes
    React.useEffect(() => {
        setTitle(url.title || '');
        setDescription(url.description || '');
        setErrors({});
    }, [url.title, url.description]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Edit className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Editar URL</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={updateMetadata.isPending}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* URL Info */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="space-y-2">
                        <div>
                            <span className="text-sm text-gray-500">URL Encurtada:</span>
                            <p className="font-medium text-purple-600 break-all">{url.shortUrl}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">URL Original:</span>
                            <p className="text-sm text-gray-700 break-all">{url.originalUrl}</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Título (opcional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Adicione um título para sua URL..."
                            maxLength={100}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors ${
                                errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={updateMetadata.isPending}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.title}
                            </p>
                        )}
                        <div className="text-xs text-gray-500 text-right">
                            {title.length}/100
                        </div>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Descrição (opcional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adicione uma descrição para sua URL..."
                            rows={3}
                            maxLength={500}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors resize-none ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={updateMetadata.isPending}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.description}
                            </p>
                        )}
                        <div className="text-xs text-gray-500 text-right">
                            {description.length}/500
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={updateMetadata.isPending}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={updateMetadata.isPending}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {updateMetadata.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Edit className="w-4 h-4" />
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUrlForm;