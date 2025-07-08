import React from 'react';
import {
    Home,
    Link,
    BarChart3,
    Settings,
    HelpCircle,
    Zap,
    Shield,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.ts';

interface SidebarProps {
    currentPath?: string;
    onNavigate?: (path: string) => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             currentPath = '/',
                                             onNavigate,
                                             collapsed = false,
                                             onToggleCollapse,
                                             className = ''
                                         }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    const menuItems = [
        {
            id: 'home',
            label: 'Dashboard',
            icon: Home,
            path: '/home',
            badge: null
        },
        {
            id: 'urls',
            label: 'Minhas URLs',
            icon: Link,
            path: '/urls',
            badge: null
        },
        {
            id: 'analytics',
            label: 'Análises',
            icon: BarChart3,
            path: '/analytics',
            badge: null
        },
        {
            id: 'bulk',
            label: 'Criação em Lote',
            icon: Zap,
            path: '/bulk',
            badge: user?.planType === 'PREMIUM' ? null : 'Pro'
        }
    ];

    const bottomMenuItems = [
        {
            id: 'settings',
            label: 'Configurações',
            icon: Settings,
            path: '/settings',
            badge: null
        },
        {
            id: 'help',
            label: 'Ajuda',
            icon: HelpCircle,
            path: '/help',
            badge: null
        }
    ];

    const handleItemClick = (path: string) => {
        onNavigate?.(path);
    };

    const isActive = (path: string) => {
        return currentPath === path;
    };

    return (
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
            collapsed ? 'w-16' : 'w-64'
        } ${className}`}>

            {/* Toggle Button */}
            <div className="p-4 border-b border-gray-200">
                <button
                    onClick={onToggleCollapse}
                    className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* User Info */}
            {!collapsed && isAuthenticated && !isLoading && user && (
                <div className="flex flex-col items-center py-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xl font-bold">
                        {`${user.firstName} ${user.lastName}`}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-gray-800">{`${user.firstName} ${user.lastName}`}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="mt-1 text-xs text-purple-600 font-medium capitalize">
                        {user.planType || 'Free'}
                    </div>
                </div>
            )}

            {/* Main Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                                isActive(item.path)
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon className={`w-5 h-5 ${
                                isActive(item.path) ? 'text-purple-600' : 'text-gray-500'
                            }`} />

                            {!collapsed && (
                                <>
                                    <span className="font-medium">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Bottom Navigation */}
            <div className="p-4 border-t border-gray-200 space-y-1">
                {bottomMenuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive(item.path)
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon className={`w-5 h-5 ${
                            isActive(item.path) ? 'text-purple-600' : 'text-gray-500'
                        }`} />

                        {!collapsed && (
                            <span className="font-medium">{item.label}</span>
                        )}
                    </button>
                ))}

                {/* Upgrade Banner */}
                {!collapsed && user?.planType !== 'PREMIUM' && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-semibold">Upgrade Pro</span>
                        </div>
                        <p className="text-xs opacity-90 mb-3">
                            Desbloqueie recursos avançados e estatísticas detalhadas
                        </p>
                        <button className="w-full bg-white text-purple-600 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors">
                            Upgrade Agora
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;