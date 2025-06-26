import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import UserService from "@/services/user.service.ts";
import {useAuth} from "@/hooks/use-auth.ts";


interface MainLayoutProps {
    children: React.ReactNode;
    currentPath?: string;
    onNavigate?: (path: string) => void;
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    onLogout?: () => void;
    className?: string;
    // Auth guard options
    requireAuth?: boolean;
    requiredRoles?: string[];
    redirectTo?: string;
    fallbackComponent?: React.ComponentType;
}

// Loading component for auth check
const AuthLoadingSpinner: React.FC = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600">Verificando autenticação...</p>
        </div>
    </div>
);

// Unauthorized access component
const UnauthorizedAccess: React.FC<{ requiredRoles?: string[] }> = ({ requiredRoles }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
                {requiredRoles && requiredRoles.length > 0
                    ? `Você não possui as permissões necessárias para acessar esta página. Roles necessárias: ${requiredRoles.join(', ')}`
                    : 'Você não tem permissão para acessar esta página.'
                }
            </p>
            <button
                onClick={() => window.history.back()}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
                Voltar
            </button>
        </div>
    </div>
);

const MainLayout: React.FC<MainLayoutProps> = ({
                                                   children,
                                                   currentPath = '/',
                                                   onNavigate,
                                                   onLogout,
                                                   className = '',
                                                   requireAuth = true,
                                                   requiredRoles = [],
                                                   redirectTo = '/login',
                                                   fallbackComponent: FallbackComponent
                                               }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = React.useState(false);
    const [authChecked, setAuthChecked] = React.useState(false);

    const { isLoading, isAuthenticated } = useAuth();

    // Check if mobile
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setSidebarCollapsed(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auth guard effect
    React.useEffect(() => {
        if (!requireAuth) {
            setAuthChecked(true);
            return;
        }

        // Check if token is expired
        if (UserService.isTokenExpired()) {
            UserService.logout();
            window.location.href = redirectTo;
            return;
        }

        // If authentication is required and we're not loading
        if (!isLoading) {
            if (!isAuthenticated) {
                // Redirect to login if not authenticated
                window.location.href = redirectTo;
                return;
            }

            // Check role-based access
            if (requiredRoles.length > 0) {
                const hasRequiredRole = requiredRoles.some(role =>
                    UserService.hasRole(role)
                );

                if (!hasRequiredRole) {
                    setAuthChecked(true);
                    return; // Will show unauthorized component
                }
            }

            setAuthChecked(true);
        }
    }, [isAuthenticated, isLoading, requireAuth, requiredRoles, redirectTo]);

    // Enhanced logout handler
    const handleLogout = React.useCallback(() => {
        UserService.logout();
        if (onLogout) {
            onLogout();
        } else {
            window.location.href = '/login';
        }
    }, [onLogout]);

    const handleSidebarToggle = () => {
        if (isMobile) {
            setShowMobileSidebar(!showMobileSidebar);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    const handleNavigate = (path: string) => {
        onNavigate?.(path);
        if (isMobile) {
            setShowMobileSidebar(false);
        }
    };

    // Show loading while checking authentication
    if (requireAuth && (isLoading || !authChecked)) {
        return FallbackComponent ? <FallbackComponent /> : <AuthLoadingSpinner />;
    }

    // Show unauthorized if user doesn't have required roles
    if (requireAuth && authChecked && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role =>
            UserService.hasRole(role)
        );

        if (!hasRequiredRole) {
            return <UnauthorizedAccess requiredRoles={requiredRoles} />;
        }
    }

    // If auth is not required or user is properly authenticated, show the layout
    return (
        <div className={`min-h-screen bg-gray-50 flex ${className}`}>
            {/* Mobile Sidebar Overlay */}
            {isMobile && showMobileSidebar && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`${
                isMobile
                    ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
                        showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
                    }`
                    : 'relative'
            }`}>
                <Sidebar
                    currentPath={currentPath}
                    onNavigate={handleNavigate}
                    collapsed={!isMobile && sidebarCollapsed}
                    onToggleCollapse={handleSidebarToggle}
                    className="h-screen"
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <Header
                    onLogout={handleLogout}
                    className="sticky top-0 z-30"
                />

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-30 lg:hidden"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default MainLayout;