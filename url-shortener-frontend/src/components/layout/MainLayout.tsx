import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

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
}

const MainLayout: React.FC<MainLayoutProps> = ({
                                                   children,
                                                   currentPath = '/',
                                                   onNavigate,
                                                   onLogout,
                                                   className = ''
                                               }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = React.useState(false);

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
                    onLogout={onLogout}
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