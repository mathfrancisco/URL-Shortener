
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import Header from '@/components/layout/HeaderLP';
import Footer from '@/components/layout/Footer';
import {useResendEmailVerification} from "@/hooks/use-auth.ts";

export default function EmailSent() {
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message || 'Email de verificação enviado!';

    const resendMutation = useResendEmailVerification();

    const handleResendEmail = () => {
        resendMutation.mutate();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Header />

            <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-md w-full">
                    <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                                <Mail className="h-8 w-8 text-blue-600" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifique seu email
                            </h2>

                            <p className="text-gray-600 mb-6">
                                {message}
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-blue-900 mb-2">
                                    Próximos passos:
                                </h3>
                                <ol className="text-sm text-blue-800 space-y-1">
                                    <li>1. Verifique sua caixa de entrada</li>
                                    <li>2. Procure também na pasta de spam</li>
                                    <li>3. Clique no link de verificação</li>
                                    <li>4. Faça login em sua conta</li>
                                </ol>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                                >
                                    Ir para Login
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </button>

                                <button
                                    onClick={handleResendEmail}
                                    disabled={resendMutation.isPending}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50"
                                >
                                    {resendMutation.isPending ? (
                                        <>
                                            <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                                            Reenviando...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Reenviar Email
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                                >
                                    Voltar ao Início
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}