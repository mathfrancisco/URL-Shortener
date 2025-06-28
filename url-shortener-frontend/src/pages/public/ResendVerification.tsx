import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import Header from '@/components/layout/HeaderLP';
import Footer from '@/components/layout/Footer';
import {useResendEmailVerification} from "@/hooks/use-auth.ts";

export default function ResendVerification() {
    const navigate = useNavigate();
    const [emailSent, setEmailSent] = useState(false);

    const resendMutation = useResendEmailVerification();

    const handleResendVerification = () => {
        resendMutation.mutate(undefined, {
            onSuccess: () => {
                setEmailSent(true);
            }
        });
    };

    if (emailSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Header />

                <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-md w-full">
                        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
                            <div className="text-center">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Email reenviado!
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Um novo email de verificação foi enviado. Verifique sua caixa de entrada e spam.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                                >
                                    Ir para Login
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Header />

            <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-md w-full">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </button>
                    </div>

                    <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
                        <div className="text-center">
                            <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Reenviar verificação de email
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Não recebeu o email de verificação? Clique no botão abaixo para reenviar.
                            </p>

                            <button
                                onClick={handleResendVerification}
                                disabled={resendMutation.isPending}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200 mb-4"
                            >
                                {resendMutation.isPending ? 'Reenviando...' : 'Reenviar Email'}
                            </button>

                            <div className="text-sm text-gray-500">
                                <p>Dicas:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Verifique sua caixa de spam</li>
                                    <li>Aguarde alguns minutos para o email chegar</li>
                                    <li>Certifique-se de que o email está correto</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}