import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, } from 'lucide-react';
import Header from '@/components/layout/HeaderLP';
import Footer from '@/components/layout/Footer';
import { useVerifyEmail } from "@/hooks/use-auth.ts";
import { toast } from 'sonner';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const { token: paramToken } = useParams(); // Para capturar token da URL como parâmetro
    const navigate = useNavigate();

    // Pega o token de diferentes fontes possíveis
    const queryToken = searchParams.get('token');
    const token = queryToken || paramToken || searchParams.get('t'); // 't' como fallback

    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'invalid' | 'manual'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualToken, setManualToken] = useState('');

    const verifyEmailMutation = useVerifyEmail();

    // Função para verificar o email
    const performVerification = (tokenToVerify: string) => {
        if (!tokenToVerify || tokenToVerify.length < 10) {
            setVerificationStatus('invalid');
            return;
        }

        setVerificationStatus('loading');

        verifyEmailMutation.mutate(
            { token: tokenToVerify },
            {
                onSuccess: () => {
                    setVerificationStatus('success');
                    toast.success('Email verificado com sucesso!');
                    // Redirecionar para login após 3 segundos
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                },
                onError: (error: any) => {
                    setVerificationStatus('error');
                    setErrorMessage(error.message || 'Erro na verificação do email');
                    toast.error('Erro na verificação do email');
                }
            }
        );
    };

    useEffect(() => {
        // Log para debug
        console.log('VerifyEmail - Debug Info:', {
            queryToken,
            paramToken,
            finalToken: token,
            searchParams: Object.fromEntries(searchParams.entries()),
            currentUrl: window.location.href
        });

        if (!token) {
            // Se não tem token, mostrar opção de inserção manual
            setVerificationStatus('manual');
            return;
        }

        // Executar verificação automaticamente se tem token
        performVerification(token);
    }, [token]);

    const handleManualVerification = () => {
        if (!manualToken.trim()) {
            toast.error('Por favor, insira o token de verificação');
            return;
        }
        performVerification(manualToken.trim());
    };

    const handleResendVerification = () => {
        navigate('/resend-verification');
    };

    const copyTokenFromUrl = () => {
        // Tenta extrair token da URL atual
        const currentUrl = window.location.href;
        const tokenMatch = currentUrl.match(/token=([^&\s]+)/);

        if (tokenMatch) {
            const extractedToken = tokenMatch[1];
            setManualToken(extractedToken);
            toast.success('Token copiado da URL!');
            return;
        }

        // Se não encontrou na query string, tenta no path
        const pathMatch = currentUrl.match(/verify-email\/([^\/\s]+)/);
        if (pathMatch) {
            const extractedToken = pathMatch[1];
            setManualToken(extractedToken);
            toast.success('Token extraído da URL!');
            return;
        }

        toast.error('Não foi possível extrair o token da URL');
    };

    const handleCopyCorrectUrl = () => {
        if (token) {
            const correctUrl = `${window.location.origin}/verify-email?token=${token}`;
            navigator.clipboard.writeText(correctUrl);
            toast.success('URL correta copiada para a área de transferência!');
        }
    };

    const renderContent = () => {
        switch (verificationStatus) {
            case 'loading':
                return (
                    <div className="text-center">
                        <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Verificando seu email...
                        </h2>
                        <p className="text-gray-600">
                            Por favor, aguarde enquanto verificamos seu email.
                        </p>
                        {token && (
                            <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                                Token: {token.substring(0, 20)}...
                            </p>
                        )}
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Email verificado com sucesso!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Sua conta foi ativada. Você será redirecionado para a página de login em breve.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Ir para Login
                            </button>
                            <button
                                onClick={() => navigate('/home')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Ir para Home
                            </button>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Erro na verificação
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {errorMessage}
                        </p>

                        {/* Mostrar opção de tentar manualmente se houve erro */}
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800 mb-2">
                                💡 Se você recebeu um link diferente no email, tente inserir o token manualmente:
                            </p>
                            <button
                                onClick={() => setShowManualInput(true)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Inserir token manualmente
                            </button>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleResendVerification}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Reenviar Verificação
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Criar Nova Conta
                            </button>
                        </div>
                    </div>
                );

            case 'manual':
            case 'invalid':
                return (
                    <div className="text-center">
                        <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {verificationStatus === 'invalid' ? 'Token inválido' : 'Verificação de Email'}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {verificationStatus === 'invalid'
                                ? 'O link de verificação é inválido ou não foi fornecido.'
                                : 'Insira o token de verificação que você recebeu por email.'
                            }
                        </p>

                        {/* Debug info - removível em produção */}
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                            <p className="text-sm text-blue-800 font-medium mb-2">🔍 Debug Info:</p>
                            <div className="text-xs text-blue-700 space-y-1">
                                <p>URL atual: <code className="bg-blue-100 px-1 rounded">{window.location.href}</code></p>
                                <p>Query token: <code className="bg-blue-100 px-1 rounded">{queryToken || 'não encontrado'}</code></p>
                                <p>Param token: <code className="bg-blue-100 px-1 rounded">{paramToken || 'não encontrado'}</code></p>
                            </div>
                            <button
                                onClick={copyTokenFromUrl}
                                className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                            >
                                Extrair Token da URL
                            </button>
                        </div>

                        {/* Campo para inserção manual do token */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Token de Verificação
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualToken}
                                    onChange={(e) => setManualToken(e.target.value)}
                                    placeholder="Cole aqui o token do email"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleManualVerification}
                                    disabled={verifyEmailMutation.isPending || !manualToken.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                                >
                                    {verifyEmailMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Verificar'
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                O token é uma sequência longa de caracteres que você recebeu no email
                            </p>
                        </div>

                        {/* Instruções para corrigir o problema */}
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                            <h3 className="font-medium text-amber-800 mb-2">📧 Como encontrar o token:</h3>
                            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                                <li>Verifique seu email de verificação</li>
                                <li>Procure por um link que contenha "verify-email"</li>
                                <li>Copie a parte depois de "token=" do link</li>
                                <li>Cole no campo acima</li>
                            </ol>
                            <p className="text-xs text-amber-600 mt-2">
                                Exemplo: se o link for "http://localhost:3000/verify-email?token=abc123",
                                copie apenas "abc123"
                            </p>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleResendVerification}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Solicitar Novo Link
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Criar Conta
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Header />

            <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-lg w-full">
                    <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
                        {renderContent()}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}