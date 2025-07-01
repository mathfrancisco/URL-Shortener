import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'

// Lazy loading para otimização
const PublicPages = {
    Home: lazy(() => import('./pages/public/Home')),
    Login: lazy(() => import('./pages/public/Login')),
    Register: lazy(() => import('./pages/public/Register')),
    VerifyEmail: lazy(() => import('./pages/public/VerifyEmail')),
    ResendVerification: lazy(() => import('./pages/public/ResendVerification')),
    EmailSent: lazy(() => import('./pages/public/EmailSent')),
}

const PrivatePages = {
    Home: lazy(() => import('./pages/private/Home')),
    Analytics: lazy(() => import('./pages/private/Analytics')), // Dashboard geral apenas
    UrlDetails: lazy(() => import('./pages/private/UrlDetails')),
    Urls: lazy(() => import('./pages/private/Urls'))
}

// Loading component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
)

// Componente para redirecionamento de rotas antigas
const AnalyticsRedirect = () => {
    const { urlId, alias } = useParams()
    const identifier = urlId || alias

    if (identifier) {
        return <Navigate to={`/urls/${identifier}`} replace />
    }

    // Se não tem parâmetro, vai para analytics geral
    return <Navigate to="/analytics" replace />
}

export default function App() {
    return (
        <Router>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* ========== PUBLIC ROUTES ========== */}
                    <Route path="/" element={<PublicPages.Home />} />
                    <Route path="/login" element={<PublicPages.Login />} />
                    <Route path="/register" element={<PublicPages.Register />} />
                    <Route path="/verify-email" element={<PublicPages.VerifyEmail />} />
                    <Route path="/resend-verification" element={<PublicPages.ResendVerification />} />
                    <Route path="/email-sent" element={<PublicPages.EmailSent />} />

                    {/* ========== PRIVATE ROUTES ========== */}

                    {/* Home/Dashboard */}
                    <Route path="/home" element={<PrivatePages.Home />} />

                    {/* Analytics Dashboard Geral - SEM parâmetros */}
                    <Route path="/analytics" element={<PrivatePages.Analytics />} />

                    {/* URLs Management */}
                    <Route path="/urls" element={<PrivatePages.Urls />} /> {/* Lista de URLs - pode usar Home ou criar página dedicada */}

                    {/* Detalhes Específicos da URL - NOVA ESTRUTURA */}
                    <Route path="/urls/:urlId" element={<PrivatePages.UrlDetails />} />

                    {/* ========== COMPATIBILITY ROUTES (Redirecionamento) ========== */}
                    {/* Redireciona rotas antigas para nova estrutura */}
                    <Route
                        path="/analytics/:urlId"
                        element={<AnalyticsRedirect />}
                    />
                    <Route
                        path="/analytics/:alias"
                        element={<AnalyticsRedirect />}
                    />

                    {/* ========== 404 ROUTE ========== */}
                    <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                                <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
                                <div className="space-y-4">
                                    <div>
                                        <a
                                            href="/home"
                                            className="bg-blue-600 px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
                                        >
                                            Ir para Home
                                        </a>
                                        <a
                                            href="/analytics"
                                            className="bg-gray-600 px-6 py-3 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            Ver Analytics
                                        </a>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4">
                                        Se você estava tentando acessar analytics de uma URL específica,<br />
                                        acesse através da lista de URLs em /home
                                    </p>
                                </div>
                            </div>
                        </div>
                    } />
                </Routes>
            </Suspense>
        </Router>
    )
}