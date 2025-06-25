import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Lazy loading para otimização
const PublicPages = {
    Home: lazy(() => import('./pages/public/Home')),
     Login: lazy(() => import('./pages/public/Login')),
     Register: lazy(() => import('./pages/public/Register'))
}

 const PrivatePages = {
    // Dashboard: lazy(() => import('./pages/private/Dashboard')),
     Home: lazy(() => import('./pages/private/Home'))
    // Analytics: lazy(() => import('./pages/private/Analytics')),
 }

// Loading component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
)

export default function App() {
    return (
        <Router>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<PublicPages.Home />} />
                    {<Route path="/login" element={<PublicPages.Login />} />}
                    {<Route path="/register" element={<PublicPages.Register />} />}

                    {/* Private Routes */}
                    {/*<Route path="/dashboard" element={<PrivatePages.Dashboard />} />*/}
                    <Route path="/home" element={<PrivatePages.Home />} />
                    {/*<Route path="/analytics" element={<PrivatePages.Analytics />} />*/}

                    {/* 404 Route */}
                    <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                                <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
                                <a
                                    href="/"
                                    className="bg-blue-600 px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Voltar ao início
                                </a>
                            </div>
                        </div>
                    } />
                </Routes>
            </Suspense>
        </Router>
    )
}