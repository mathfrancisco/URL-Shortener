import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Clock, Settings, Loader2, AlertCircle } from 'lucide-react';
import {useCreateShortUrl, useUrlPreview} from "@/hooks/useUrls.ts";

const createUrlSchema = z.object({
    url: z.string().url('Por favor, insira uma URL válida'),
    customAlias: z.string()
        .optional()
        .refine((alias) => !alias || /^[a-zA-Z0-9_-]+$/.test(alias), {
            message: 'Alias deve conter apenas letras, números, _ e -'
        }),
    expirationHours: z.number()
        .min(1, 'Mínimo 1 hora')
        .max(8760, 'Máximo 1 ano')
        .optional()
});

type CreateUrlForm = z.infer<typeof createUrlSchema>;

interface CreateUrlFormProps {
    onSuccess?: (result: any) => void;
    className?: string;
}

const CreateUrlFormComponent: React.FC<CreateUrlFormProps> = ({
                                                                  onSuccess,
                                                                  className = ''
                                                              }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const createUrl = useCreateShortUrl();

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
        reset
    } = useForm<CreateUrlForm>({
        resolver: zodResolver(createUrlSchema),
        defaultValues: {
            expirationHours: 24 // Default 24 hours
        }
    });

    const watchedUrl = watch('url');
    const { isValid: isUrlValid, domain } = useUrlPreview(watchedUrl || '');

    const onSubmit = async (data: CreateUrlForm) => {
        try {
            console.log('Enviando dados:', data);
            const result = await createUrl.mutateAsync(data);
            console.log('Resultado recebido:', result);

            const enrichedResult = {
                ...result,
                originalUrl: data.url, // Capturar do formulário
                inputData: data // Para debug
            };

            if (onSuccess) {
                onSuccess(enrichedResult);
            } else {
                reset();
                setShowAdvanced(false);
            }
        } catch (error) {
            console.error('Erro ao criar URL:', error);
        }
    };

    const expirationOptions = [
        { value: 1, label: '1 hora' },
        { value: 24, label: '1 dia' },
        { value: 168, label: '1 semana' },
        { value: 720, label: '1 mês' },
        { value: 8760, label: '1 ano' },
    ];

    return (
        <div className={`bg-white rounded-xl shadow-lg border p-6 ${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* URL Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        URL Original
                    </label>
                    <div className="relative">
                        <input
                            {...register('url')}
                            type="url"
                            placeholder="https://exemplo.com/minha-url-longa"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors ${
                                errors.url ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {watchedUrl && isUrlValid && (
                            <div className="absolute right-3 top-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {domain}
                            </div>
                        )}
                    </div>
                    {errors.url && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.url.message}
                        </p>
                    )}
                </div>

                {/* Advanced Options Toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Opções Avançadas
                    <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                {/* Advanced Options */}
                {showAdvanced && (
                    <div className="space-y-4 border-t pt-4">
                        {/* Custom Alias */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Alias Personalizado (opcional)
                            </label>
                            <div className="flex items-center">
                                <span className="bg-gray-100 px-3 py-3 rounded-l-lg border border-r-0 text-sm text-gray-600">
                                    short.ly/
                                </span>
                                <input
                                    {...register('customAlias')}
                                    type="text"
                                    placeholder="meu-alias"
                                    className={`flex-1 px-3 py-3 border rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors ${
                                        errors.customAlias ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.customAlias && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.customAlias.message}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Deixe vazio para gerar automaticamente
                            </p>
                        </div>

                        {/* Expiration */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Tempo de Expiração
                            </label>
                            <Controller
                                name="expirationHours"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                                    >
                                        <option value="">Sem expiração</option>
                                        {expirationOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.expirationHours && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.expirationHours.message}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={createUrl.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {createUrl.isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Encurtando...
                        </>
                    ) : (
                        <>
                            <Link className="w-5 h-5" />
                            Encurtar URL
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateUrlFormComponent;