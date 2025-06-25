import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
    Link,
    Copy,
    ExternalLink,
    BarChart3,
    Shield,
    Zap,
    Globe,
    Users,
    TrendingUp,
    Clock,
    QrCode,
    ArrowRight,
    Check
} from 'lucide-react'
import Header from "@/components/layout/HeaderLP.tsx"
import Footer from "@/components/layout/Footer.tsx"

// Form validation schema
const urlSchema = z.object({
    url: z.string().url('Por favor, insira uma URL válida'),
    alias: z.string().optional(),
    expiresAt: z.string().optional(),
})

type UrlFormData = z.infer<typeof urlSchema>

interface ShortenedUrl {
    originalUrl: string
    shortUrl: string
    alias?: string
    clicks: number
    createdAt: string
    expiresAt?: string
}

export default function Home() {
    const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<UrlFormData>({
        resolver: zodResolver(urlSchema)
    })

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const onSubmit = async (data: UrlFormData) => {
        setIsLoading(true)

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))

            const mockShortUrl: ShortenedUrl = {
                originalUrl: data.url,
                shortUrl: `https://short.ly/${data.alias || Math.random().toString(36).substr(2, 8)}`,
                alias: data.alias,
                clicks: 0,
                createdAt: new Date().toISOString(),
                expiresAt: data.expiresAt
            }

            setShortenedUrl(mockShortUrl)
            toast.success('URL encurtada com sucesso!')
            reset()
        } catch (error) {
            toast.error('Erro ao encurtar URL. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('URL copiada para a área de transferência!')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Header />

            {/* Hero Section */}
            <main className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="pt-20 pb-16 text-center lg:pt-32">
                        <div className="mx-auto max-w-4xl">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                                Encurte suas{' '}
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    URLs
                                </span>{' '}
                                e acompanhe resultados
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                                Transforme links longos em URLs curtas e memoráveis. Acompanhe cliques,
                                analise performance e otimize suas campanhas de marketing digital.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <button
                                    onClick={scrollToForm}
                                    className="bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 rounded-xl transition-all hover:scale-105"
                                >
                                    Começar agora
                                </button>
                                <a
                                    href="#features"
                                    className="text-sm font-semibold leading-6 text-gray-900 flex items-center hover:text-blue-600 transition-colors"
                                >
                                    Saiba mais <ArrowRight className="w-4 h-4 ml-1" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* URL Shortener Form */}
                    <div className="max-w-4xl mx-auto mb-20">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                        Cole sua URL longa aqui
                                    </label>
                                    <input
                                        {...register('url')}
                                        type="url"
                                        placeholder="https://exemplo.com/sua-url-muito-longa"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    />
                                    {errors.url && (
                                        <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-2">
                                            Alias personalizado (opcional)
                                        </label>
                                        <input
                                            {...register('alias')}
                                            type="text"
                                            placeholder="meu-link"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                                            Data de expiração (opcional)
                                        </label>
                                        <input
                                            {...register('expiresAt')}
                                            type="datetime-local"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Link className="w-5 h-5 mr-2" />
                                            Encurtar URL
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Result */}
                            {shortenedUrl && (
                                <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center mb-4">
                                        <Check className="w-5 h-5 text-green-600 mr-2" />
                                        <span className="text-green-800 font-medium">URL encurtada com sucesso!</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                                            <span className="text-blue-600 font-medium truncate mr-4">
                                                {shortenedUrl.shortUrl}
                                            </span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => copyToClipboard(shortenedUrl.shortUrl)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Copiar"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => window.open(shortenedUrl.shortUrl, '_blank')}
                                                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Abrir"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="QR Code"
                                                >
                                                    <QrCode className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">URL original:</span> {shortenedUrl.originalUrl}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Link className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">10M+</div>
                            <div className="text-gray-600">Links encurtados</div>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">50K+</div>
                            <div className="text-gray-600">Usuários ativos</div>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">99.9%</div>
                            <div className="text-gray-600">Uptime garantido</div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div id="features" className="py-20">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                Recursos que fazem a diferença
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                Tudo que você precisa para gerenciar seus links de forma profissional
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Detalhados</h3>
                                <p className="text-gray-600">
                                    Acompanhe cliques, origem do tráfego, dispositivos e muito mais com dashboards intuitivos.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <Shield className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Segurança Avançada</h3>
                                <p className="text-gray-600">
                                    Proteção contra spam, malware e links maliciosos com verificação automática.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Velocidade Extrema</h3>
                                <p className="text-gray-600">
                                    Redirecionamentos em milissegundos com nossa rede global de CDN.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <Globe className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Domínio Personalizado</h3>
                                <p className="text-gray-600">
                                    Use seu próprio domínio para manter a consistência da sua marca.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <Clock className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Links Temporários</h3>
                                <p className="text-gray-600">
                                    Configure data de expiração para seus links e controle o acesso.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <QrCode className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Codes</h3>
                                <p className="text-gray-600">
                                    Gere QR codes automaticamente para facilitar o compartilhamento offline.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="py-20">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Pronto para começar?
                            </h2>
                            <p className="text-xl mb-8 opacity-90">
                                Junte-se a milhares de usuários que já escolheram nossa plataforma
                            </p>
                            <button
                                onClick={scrollToForm}
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Encurtar minha primeira URL
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}