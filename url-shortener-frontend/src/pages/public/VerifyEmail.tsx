import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Header from '@/components/layout/HeaderLP';
import Footer from '@/components/layout/Footer';
import {useVerifyEmail} from "@/hooks/use-auth.ts";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    const verifyEmailMutation = useVerifyEmail();

    useEffect(() => {
        if (!token) {
            setVerificationStatus('invalid');
            return;
        }

        // Executar verificação
        verifyEmailMutation.mutate(
            { token },
            {
                onSuccess: () => {
                    setVerificationStatus('success');
                    // Redirecionar para home após 5 segundos
                    setTimeout(() => {
                        navigate('/home');
                    }, 5000);
                },
                onError: (error: any) => {
                    setVerificationStatus('error');
                    setErrorMessage(error.message || 'Erro na verificação do email');
                }
            }
        );
    }, [token]);

    const handleResendVerification = () => {
        // Redirecionar para página de reenvio ou mostrar modal
        navigate('/resend-verification');
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

            case 'invalid':
                return (
                    <div className="text-center">
                        <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Token inválido
                        </h2>
                        <p className="text-gray-600 mb-4">
                            O link de verificação é inválido ou não foi fornecido.
                        </p>
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
                <div className="max-w-md w-full">
                    <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
                        {renderContent()}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}