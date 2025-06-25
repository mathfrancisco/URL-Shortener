import React from 'react';
import { Link, User, Settings, LogOut, Bell, Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.ts';

interface HeaderProps {
    onLogout?: () => void;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({
                                           onLogout,
                                           className = ''
                                       }) => {
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);

    const userMenuRef = React.useRef<HTMLDivElement>(null);
    const notificationRef = React.useRef<HTMLDivElement>(null);

    const { user, isLoading, isAuthenticated, logout } = useAuth();

    // Fecha menus ao clicar fora
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={`bg-white border-b border-gray-200 ${className}`}>
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                            <Link className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                ShortLink
                            </h1>
                            <p className="text-xs text-gray-500">URL Shortener</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar URLs..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-900">Notificações</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        <div className="p-4 hover:bg-gray-50 border-b">
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-900">Sua URL está expirando em breve</p>
                                                    <p className="text-xs text-gray-500 mt-1">short.ly/abc123 expira em 2 dias</p>
                                                    <p className="text-xs text-gray-400 mt-1">2 horas atrás</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            Nenhuma notificação nova
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        {isAuthenticated && !isLoading && user && (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                        {user.avatar? (
                                            <img
                                                src={user.avatar}
                                                alt={`${user.firstName} ${user.lastName}`}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white text-sm font-medium">
                                         {(user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '') || 'U'}
                                         </span>
                                        )}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </button>

                                {/* User Dropdown */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                                        <div className="p-2">
                                            <button
                                                onClick={() => setShowUserMenu(false)}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <User className="w-4 h-4" />
                                                Perfil
                                            </button>
                                            <button
                                                onClick={() => setShowUserMenu(false)}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Configurações
                                            </button>
                                            <hr className="my-1" />
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    logout();
                                                    onLogout?.();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sair
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;