import React, { useState } from 'react';
import {
    User,
    Lock,
    Bell,
    Shield,
    CreditCard,
    Download,
    Trash2,
    Eye,
    EyeOff,
    Save,
    Edit3,
    Check,
    X,
    AlertTriangle,
    Mail,
    Phone,
    Calendar,
    Users,
    Globe,
    Settings as SettingsIcon,
    Smartphone,
    Monitor,
    Palette,
    Moon,
    Sun,
    Database,
    FileText,
    Activity,
    MapPin,
    Crown,
    ChevronRight,
    ExternalLink,
    RefreshCw,
    Key,
    Fingerprint,
} from 'lucide-react';


import { useNavigate, useLocation } from 'react-router-dom';
import {
    useAuth,
    useChangePassword,
    useResendEmailVerification,
    useUpdateProfile,
    useUserStats
} from "@/hooks/use-auth.ts";
import MainLayout from '@/components/layout/MainLayout';

interface SettingsTabProps {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    component: React.ComponentType<any>;
}

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const handleLogout = () => {
        logout();
    };

    const tabs: SettingsTabProps[] = [
        {
            id: 'profile',
            label: 'Perfil',
            icon: User,
            component: ProfileSettings
        },
        {
            id: 'security',
            label: 'Segurança',
            icon: Lock,
            component: SecuritySettings
        },
        {
            id: 'preferences',
            label: 'Preferências',
            icon: SettingsIcon,
            component: PreferencesSettings
        },
        {
            id: 'notifications',
            label: 'Notificações',
            icon: Bell,
            component: NotificationSettings
        },
        {
            id: 'plan',
            label: 'Plano & Faturamento',
            icon: CreditCard,
            component: PlanSettings
        },
        {
            id: 'privacy',
            label: 'Privacidade',
            icon: Shield,
            component: PrivacySettings
        },
        {
            id: 'account',
            label: 'Conta',
            icon: Database,
            component: AccountSettings
        }
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Carregando configurações...</h2>
                </div>
            </div>
        );
    }

    return (
        <MainLayout
            currentPath={location.pathname}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                            <p className="text-gray-600 mt-2">
                                Gerencie suas informações pessoais, segurança e preferências da conta
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="flex items-center justify-end mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                        <Crown className="w-3 h-3 mr-1" />
                                        {user.planType?.toLowerCase() || 'free'}
                                    </span>
                                </div>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs and Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                isActive
                                                    ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-500'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        >
                                            <tab.icon className={`mr-3 h-5 w-5 ${
                                                isActive ? 'text-purple-600' : 'text-gray-400'
                                            }`} />
                                            {tab.label}
                                            <ChevronRight className={`ml-auto h-4 w-4 ${
                                                isActive ? 'text-purple-600' : 'text-gray-400'
                                            }`} />
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {tabs.map((tab) => {
                                if (activeTab === tab.id) {
                                    const Component = tab.component;
                                    return (
                                        <div key={tab.id} className="p-6">
                                            <Component />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

// Profile Settings Component
const ProfileSettings: React.FC = () => {
    const { user } = useAuth();
    const updateProfile = useUpdateProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile.mutateAsync(formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phoneNumber: user?.phoneNumber || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Informações Pessoais</h2>
                <p className="text-gray-600 mt-1">Atualize suas informações básicas e dados de contato</p>
            </div>

            {/* Profile Picture Section */}
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Foto do Perfil</h3>
                <div className="flex items-center space-x-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="space-y-2">
                        <div className="flex space-x-3">
                            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Alterar foto
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500">
                                Remover
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">JPG, GIF ou PNG. Máximo 1MB.</p>
                    </div>
                </div>
            </div>

            {/* Personal Information Form */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nome *
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                disabled={!isEditing}
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Sobrenome *
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                disabled={!isEditing}
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <div className="mt-1 flex items-center space-x-3">
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                            />
                            <div className="flex items-center">
                                {user?.emailVerified ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Check className="w-3 h-3 mr-1" />
                                        Verificado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Não verificado
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Para alterar seu email, entre em contato com o suporte.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Telefone
                        </label>
                        <div className="mt-1 relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                disabled={!isEditing}
                                placeholder="(11) 99999-9999"
                                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nome de usuário
                        </label>
                        <input
                            type="text"
                            value={user?.username || ''}
                            disabled
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Seu nome de usuário não pode ser alterado.
                        </p>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <X className="w-4 h-4 mr-2 inline" />
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={updateProfile.isPending}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                            >
                                {updateProfile.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2 inline" />
                                )}
                                Salvar Alterações
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Account Information */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Conta</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Membro desde</p>
                                <p className="text-sm text-gray-500">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Activity className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Último acesso</p>
                                <p className="text-sm text-gray-500">
                                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Primeiro acesso'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">IP de criação</p>
                                <p className="text-sm text-gray-500 font-mono">
                                    {user?.creatorIp || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Security Settings Component
const SecuritySettings: React.FC = () => {
    const { user } = useAuth();
    const changePassword = useChangePassword();
    const resendVerification = useResendEmailVerification();
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await changePassword.mutateAsync(passwordForm);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
        }
    };

    const handleResendVerification = async () => {
        try {
            await resendVerification.mutateAsync();
        } catch (error) {
            console.error('Error resending verification:', error);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Segurança da Conta</h2>
                <p className="text-gray-600 mt-1">Gerencie sua senha e configurações de segurança</p>
            </div>

            {/* Email Verification Alert */}
            {!user?.emailVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Email não verificado
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700">
                                Seu email ainda não foi verificado. Isso pode limitar algumas funcionalidades da sua conta.
                            </p>
                            <div className="mt-3">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resendVerification.isPending}
                                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200 disabled:opacity-50 flex items-center"
                                >
                                    {resendVerification.isPending ? (
                                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                        <Mail className="w-4 h-4 mr-1" />
                                    )}
                                    {resendVerification.isPending ? 'Enviando...' : 'Reenviar verificação'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Section */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Alterar Senha
                </h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Senha Atual *
                        </label>
                        <div className="mt-1 relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 pr-10"
                                placeholder="Digite sua senha atual"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPasswords.current ? (
                                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nova Senha *
                        </label>
                        <div className="mt-1 relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 pr-10"
                                placeholder="Digite sua nova senha"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPasswords.new ? (
                                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Mínimo de 6 caracteres. Recomendamos usar uma combinação de letras, números e símbolos.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Confirmar Nova Senha *
                        </label>
                        <div className="mt-1 relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 pr-10"
                                placeholder="Confirme sua nova senha"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPasswords.confirm ? (
                                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={changePassword.isPending}
                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center"
                        >
                            {changePassword.isPending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                                <Lock className="w-4 h-4 mr-2" />
                            )}
                            Alterar Senha
                        </button>
                    </div>
                </form>
            </div>

            {/* Security Status */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Status de Segurança
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Verificação de Email</p>
                                <p className="text-sm text-gray-500">
                                    {user?.emailVerified ? 'Email verificado e protegido' : 'Verificação pendente'}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user?.emailVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {user?.emailVerified ? 'Verificado' : 'Pendente'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <Key className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Senha Forte</p>
                                <p className="text-sm text-gray-500">
                                    Sua senha atende aos requisitos de segurança
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Protegida
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <Activity className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Conta Ativa</p>
                                <p className="text-sm text-gray-500">
                                    {user?.active ? 'Sua conta está ativa e funcionando' : 'Conta desativada'}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user?.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {user?.active ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>

                    {user?.failedLoginAttempts > 0 && (
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-900">Tentativas de Login Falhadas</p>
                                    <p className="text-sm text-yellow-700">
                                        {user.failedLoginAttempts} tentativa(s) falhada(s) recente(s)
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                Atenção
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Two-Factor Authentication (Future Feature) */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Fingerprint className="w-5 h-5 mr-2" />
                    Autenticação de Dois Fatores
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                        <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Autenticação 2FA</p>
                            <p className="text-sm text-gray-500">
                                Adicione uma camada extra de segurança à sua conta
                            </p>
                        </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Em Breve
                    </button>
                </div>
            </div>
        </div>
    );
};

// Preferences Settings Component
const PreferencesSettings: React.FC = () => {
    const [preferences, setPreferences] = useState({
        theme: 'light',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'dd/MM/yyyy',
        defaultUrlExpiration: '30',
        autoGenerateQR: true,
        showAnalytics: true,
        compactView: false
    });

    const handlePreferenceChange = (key: string, value: any) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Preferências</h2>
                <p className="text-gray-600 mt-1">Customize a aparência e comportamento da aplicação</p>
            </div>

            {/* Theme Settings */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Aparência
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'light', label: 'Claro', icon: Sun },
                                { id: 'dark', label: 'Escuro', icon: Moon },
                                { id: 'auto', label: 'Automático', icon: Monitor }
                            ].map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => handlePreferenceChange('theme', theme.id)}
                                    className={`p-3 rounded-lg border-2 transition-colors ${
                                        preferences.theme === theme.id
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <theme.icon className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                                    <p className="text-sm font-medium text-gray-900">{theme.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={preferences.compactView}
                                onChange={(e) => handlePreferenceChange('compactView', e.target.checked)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Usar visualização compacta para listas
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Localization Settings */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Localização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Idioma
                        </label>
                        <select
                            value={preferences.language}
                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fuso Horário
                        </label>
                        <select
                            value={preferences.timezone}
                            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                            <option value="America/New_York">New York (GMT-4)</option>
                            <option value="Europe/London">London (GMT+0)</option>
                            <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Formato de Data
                        </label>
                        <select
                            value={preferences.dateFormat}
                            onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                            <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                            <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* URL Settings */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Configurações de URL
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiração padrão (dias)
                        </label>
                        <select
                            value={preferences.defaultUrlExpiration}
                            onChange={(e) => handlePreferenceChange('defaultUrlExpiration', e.target.value)}
                            className="block w-full md:w-48 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="7">7 dias</option>
                            <option value="30">30 dias</option>
                            <option value="90">90 dias</option>
                            <option value="365">1 ano</option>
                            <option value="0">Sem expiração</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={preferences.autoGenerateQR}
                                onChange={(e) => handlePreferenceChange('autoGenerateQR', e.target.checked)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Gerar QR Code automaticamente para novas URLs
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={preferences.showAnalytics}
                                onChange={(e) => handlePreferenceChange('showAnalytics', e.target.checked)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Mostrar estatísticas detalhadas por padrão
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Preferências
                </button>
            </div>
        </div>
    );
};

// Notification Settings Component
const NotificationSettings: React.FC = () => {
    const [notifications, setNotifications] = useState({
        emailUrls: true,
        emailStats: false,
        emailSecurity: true,
        emailMarketing: false,
        pushUrls: false,
        pushStats: false,
        pushSecurity: true,
        browserNotifications: false,
        weeklyReport: true,
        monthlyReport: false,
        instantAlerts: true
    });

    const handleNotificationChange = (key: string, value: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
    };

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                checked ? 'bg-purple-600' : 'bg-gray-200'
            }`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-5' : 'translate-x-0'
            }`} />
        </button>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
                <p className="text-gray-600 mt-1">Configure como você deseja receber atualizações e alertas</p>
            </div>

            {/* Email Notifications */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Notificações por Email
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">URLs criadas</p>
                            <p className="text-sm text-gray-500">Receba confirmação quando criar uma nova URL</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.emailUrls}
                            onChange={() => handleNotificationChange('emailUrls', !notifications.emailUrls)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Relatórios de estatísticas</p>
                            <p className="text-sm text-gray-500">Relatórios sobre performance das suas URLs</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.emailStats}
                            onChange={() => handleNotificationChange('emailStats', !notifications.emailStats)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Alertas de segurança</p>
                            <p className="text-sm text-gray-500">Avisos importantes sobre atividade da conta</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.emailSecurity}
                            onChange={() => handleNotificationChange('emailSecurity', !notifications.emailSecurity)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Atualizações de produto</p>
                            <p className="text-sm text-gray-500">Novidades e atualizações da plataforma</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.emailMarketing}
                            onChange={() => handleNotificationChange('emailMarketing', !notifications.emailMarketing)}
                        />
                    </div>
                </div>
            </div>

            {/* Push Notifications */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Notificações Push
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">URLs com alta atividade</p>
                            <p className="text-sm text-gray-500">Quando uma URL receber muitos cliques</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.pushUrls}
                            onChange={() => handleNotificationChange('pushUrls', !notifications.pushUrls)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Resumos de estatísticas</p>
                            <p className="text-sm text-gray-500">Resumos diários de performance</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.pushStats}
                            onChange={() => handleNotificationChange('pushStats', !notifications.pushStats)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Alertas de segurança</p>
                            <p className="text-sm text-gray-500">Notificações críticas sobre a conta</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.pushSecurity}
                            onChange={() => handleNotificationChange('pushSecurity', !notifications.pushSecurity)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Notificações do navegador</p>
                            <p className="text-sm text-gray-500">Permitir notificações no navegador</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.browserNotifications}
                            onChange={() => handleNotificationChange('browserNotifications', !notifications.browserNotifications)}
                        />
                    </div>
                </div>
            </div>

            {/* Report Frequency */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Frequência de Relatórios
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Relatório semanal</p>
                            <p className="text-sm text-gray-500">Resumo semanal das suas URLs e estatísticas</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.weeklyReport}
                            onChange={() => handleNotificationChange('weeklyReport', !notifications.weeklyReport)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Relatório mensal</p>
                            <p className="text-sm text-gray-500">Análise detalhada mensal de performance</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.monthlyReport}
                            onChange={() => handleNotificationChange('monthlyReport', !notifications.monthlyReport)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Alertas instantâneos</p>
                            <p className="text-sm text-gray-500">Notificações imediatas para eventos importantes</p>
                        </div>
                        <ToggleSwitch
                            checked={notifications.instantAlerts}
                            onChange={() => handleNotificationChange('instantAlerts', !notifications.instantAlerts)}
                        />
                    </div>
                </div>
            </div>

            {/* Notification Test */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Testar Notificações</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Teste suas configurações de notificação para garantir que estão funcionando corretamente.
                </p>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Testar Email
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
                        <Bell className="w-4 h-4 mr-2" />
                        Testar Push
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                </button>
            </div>
        </div>
    );
};

// Plan Settings Component
const PlanSettings: React.FC = () => {
    const { user } = useAuth();
    const { data: userStats } = useUserStats();

    const plans = [
        {
            id: 'FREE',
            name: 'Gratuito',
            price: 'R$ 0',
            period: '/mês',
            description: 'Perfeito para uso pessoal',
            features: [
                'Até 100 URLs por mês',
                'Estatísticas básicas',
                'URLs com expiração',
                'Suporte por email'
            ],
            limitations: [
                'Sem URLs customizadas',
                'Sem análises avançadas',
                'Sem API access'
            ],
            popular: false
        },
        {
            id: 'PREMIUM',
            name: 'Premium',
            price: 'R$ 29',
            period: '/mês',
            description: 'Ideal para profissionais',
            features: [
                'URLs ilimitadas',
                'URLs customizadas',
                'Estatísticas avançadas',
                'QR Codes personalizados',
                'Análises detalhadas',
                'API access',
                'Suporte prioritário'
            ],
            limitations: [],
            popular: true
        },
        {
            id: 'ENTERPRISE',
            name: 'Empresarial',
            price: 'R$ 99',
            period: '/mês',
            description: 'Para equipes e empresas',
            features: [
                'Tudo do Premium',
                'Múltiplos usuários',
                'Dashboard de equipe',
                'Branded domains',
                'Integrações avançadas',
                'Suporte 24/7',
                'SLA garantido'
            ],
            limitations: [],
            popular: false
        }
    ];

    const currentPlan = plans.find(plan => plan.id === user?.planType) || plans[0];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Plano & Faturamento</h2>
                <p className="text-gray-600 mt-1">Gerencie sua assinatura e informações de pagamento</p>
            </div>

            {/* Current Plan Status */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Crown className="w-5 h-5 mr-2 text-purple-600" />
                            Plano Atual: {currentPlan.name}
                        </h3>
                        <p className="text-gray-600">{currentPlan.description}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{currentPlan.price}</p>
                        <p className="text-sm text-gray-500">{currentPlan.period}</p>
                    </div>
                </div>

                {user?.planExpiresAt && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Renovação em: {new Date(user.planExpiresAt).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-sm font-medium text-gray-500">URLs este mês</p>
                        <p className="text-2xl font-bold text-gray-900">{user?.currentMonthUrlCount || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-sm font-medium text-gray-500">Limite mensal</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {user?.monthlyUrlLimit === -1 ? '∞' : user?.monthlyUrlLimit || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-sm font-medium text-gray-500">URLs restantes</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {user?.monthlyUrlLimit === -1
                                ? '∞'
                                : Math.max(0, (user?.monthlyUrlLimit || 0) - (user?.currentMonthUrlCount || 0))
                            }
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-sm font-medium text-gray-500">Total de cliques</p>
                        <p className="text-2xl font-bold text-green-600">{userStats?.totalClicks || 0}</p>
                    </div>
                </div>
            </div>

            {/* Available Plans */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Planos Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrent = plan.id === user?.planType;
                        return (
                            <div key={plan.id} className={`relative rounded-lg border-2 p-6 ${
                                plan.popular
                                    ? 'border-purple-500 bg-purple-50'
                                    : isCurrent
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 bg-white'
                            }`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-purple-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                                            Mais Popular
                                        </span>
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-green-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                                            Plano Atual
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-4">
                                    <h4 className="text-xl font-semibold text-gray-900">{plan.name}</h4>
                                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                                    <div className="mt-4">
                                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                        <span className="text-gray-500">{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm">
                                            <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                    {plan.limitations.map((limitation, index) => (
                                        <li key={index} className="flex items-center text-sm">
                                            <X className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                                            <span className="text-gray-500">{limitation}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-2 px-4 rounded-md font-medium ${
                                        isCurrent
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : plan.popular
                                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                                    disabled={isCurrent}
                                >
                                    {isCurrent ? 'Plano Atual' : `Escolher ${plan.name}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Billing History */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Histórico de Faturamento
                </h3>
                <div className="space-y-3">
                    {[
                        { date: '2024-01-01', description: 'Plano Premium', amount: 'R$ 29,00', status: 'Pago' },
                        { date: '2023-12-01', description: 'Plano Premium', amount: 'R$ 29,00', status: 'Pago' },
                        { date: '2023-11-01', description: 'Plano Premium', amount: 'R$ 29,00', status: 'Pago' }
                    ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(invoice.date).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-sm text-gray-500">{invoice.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-900">{invoice.amount}</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    {invoice.status}
                                </span>
                                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Ver todo o histórico
                    </button>
                </div>
            </div>

            {/* Payment Method */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Método de Pagamento
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">Nenhum método de pagamento cadastrado</p>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
                        Adicionar Cartão
                    </button>
                </div>
            </div>
        </div>
    );
};

// Privacy Settings Component
const PrivacySettings: React.FC = () => {
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'private',
        shareAnalytics: false,
        dataCollection: true,
        marketingEmails: false,
        analyticsSharing: false,
        publicStats: false
    });

    const handlePrivacyChange = (key: string, value: any) => {
        setPrivacySettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Privacidade & Dados</h2>
                <p className="text-gray-600 mt-1">Controle como seus dados são coletados e utilizados</p>
            </div>

            {/* Profile Privacy */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacidade do Perfil
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visibilidade do perfil
                        </label>
                        <select
                            value={privacySettings.profileVisibility}
                            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                            className="block w-full md:w-64 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="private">Privado</option>
                            <option value="public">Público</option>
                            <option value="friends">Apenas amigos</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                            Controla quem pode ver suas informações básicas de perfil
                        </p>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Estatísticas públicas</p>
                            <p className="text-sm text-gray-500">Permitir que outros vejam suas estatísticas de URLs</p>
                        </div>
                        <button
                            onClick={() => handlePrivacyChange('publicStats', !privacySettings.publicStats)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                privacySettings.publicStats ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                privacySettings.publicStats ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Collection */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Coleta de Dados
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Coleta de dados de uso</p>
                            <p className="text-sm text-gray-500">Ajuda a melhorar nossa plataforma</p>
                        </div>
                        <button
                            onClick={() => handlePrivacyChange('dataCollection', !privacySettings.dataCollection)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                privacySettings.dataCollection ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                privacySettings.dataCollection ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Compartilhar análises</p>
                            <p className="text-sm text-gray-500">Dados agregados para pesquisa e desenvolvimento</p>
                        </div>
                        <button
                            onClick={() => handlePrivacyChange('analyticsSharing', !privacySettings.analyticsSharing)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                privacySettings.analyticsSharing ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                privacySettings.analyticsSharing ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Emails de marketing</p>
                            <p className="text-sm text-gray-500">Receber ofertas e novidades por email</p>
                        </div>
                        <button
                            onClick={() => handlePrivacyChange('marketingEmails', !privacySettings.marketingEmails)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                privacySettings.marketingEmails ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                privacySettings.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Rights */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Seus Direitos de Dados
                </h3>
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Lei Geral de Proteção de Dados (LGPD)</h4>
                        <p className="text-sm text-blue-800">
                            Você tem direito ao acesso, correção, exclusão e portabilidade dos seus dados pessoais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                            <div className="flex items-center mb-2">
                                <Download className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">Baixar meus dados</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Obtenha uma cópia de todos os seus dados
                            </p>
                        </button>

                        <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                            <div className="flex items-center mb-2">
                                <Trash2 className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">Solicitar exclusão</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Remover permanentemente seus dados
                            </p>
                        </button>

                        <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                            <div className="flex items-center mb-2">
                                <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">Política de Privacidade</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Leia nossa política de privacidade
                            </p>
                        </button>

                        <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                            <div className="flex items-center mb-2">
                                <ExternalLink className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">Termos de Uso</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Consulte nossos termos de serviço
                            </p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                </button>
            </div>
        </div>
    );
};

// Account Settings Component
const AccountSettings: React.FC = () => {
    const { user, logout } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const handleExportData = () => {
        console.log('Exporting user data...');
        // Implementar exportação de dados
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText === 'EXCLUIR') {
            console.log('Deleting account...');
            setShowDeleteConfirm(false);
            // Implementar exclusão de conta
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações da Conta</h2>
                <p className="text-gray-600 mt-1">Gerencie sua conta e dados pessoais</p>
            </div>

            {/* Account Overview */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Visão Geral da Conta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Conta criada</p>
                                <p className="text-sm text-gray-500">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Activity className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Último acesso</p>
                                <p className="text-sm text-gray-500">
                                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Primeiro acesso'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Crown className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Plano atual</p>
                                <p className="text-sm text-gray-500 capitalize">
                                    {user?.planType?.toLowerCase() || 'Free'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Roles and Permissions */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Permissões e Funções
                </h3>
                <div className="space-y-3">
                    {user?.roles?.length > 0 ? user.roles.map((role, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {role.replace('ROLE_', '')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {role === 'ROLE_ADMIN' ? 'Acesso administrativo completo' : 'Acesso de usuário padrão'}
                                    </p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                Ativo
                            </span>
                        </div>
                    )) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Usuário</p>
                                    <p className="text-sm text-gray-500">Acesso de usuário padrão</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                Ativo
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Data Export */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Exportar Dados
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-4">
                        <FileText className="w-6 h-6 text-gray-400 mt-1" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                                Download dos seus dados
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Faça download de todas as suas URLs, estatísticas e dados da conta em formato JSON.
                                O arquivo incluirá todas as informações associadas à sua conta.
                            </p>
                            <button
                                onClick={handleExportData}
                                className="mt-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar Todos os Dados
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Management */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Gerenciamento de Sessões
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <Monitor className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Sessão atual</p>
                                <p className="text-sm text-gray-500">
                                    {navigator.userAgent.includes('Chrome') ? 'Chrome' :
                                        navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Navegador'} -
                                    {user?.creatorIp || 'IP não disponível'}
                                </p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Ativo agora
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Encerrar todas as sessões</p>
                            <p className="text-sm text-gray-500">
                                Você será desconectado de todos os dispositivos
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                            Desconectar
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-600 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Zona de Perigo
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                        <Trash2 className="w-6 h-6 text-red-400 mt-1" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800">
                                Excluir conta permanentemente
                            </h4>
                            <p className="text-sm text-red-600 mt-1">
                                Esta ação é irreversível. Isso excluirá permanentemente sua conta,
                                todas as suas URLs, estatísticas e removerá todos os seus dados dos nossos servidores.
                            </p>
                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-red-700 font-medium">
                                    O que será excluído:
                                </p>
                                <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                                    <li>Todas as suas URLs encurtadas</li>
                                    <li>Histórico de cliques e estatísticas</li>
                                    <li>Dados do perfil e preferências</li>
                                    <li>Histórico de faturamento</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700 flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir Minha Conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                            <h3 className="text-lg font-medium text-gray-900">
                                Confirmar exclusão da conta
                            </h3>
                        </div>
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Esta ação é irreversível. Digite <strong>EXCLUIR</strong> para confirmar
                                que você deseja excluir permanentemente sua conta e todos os dados associados.
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Digite EXCLUIR para confirmar"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'EXCLUIR'}
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Excluir Conta Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;