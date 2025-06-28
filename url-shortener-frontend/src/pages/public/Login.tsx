import Header from "@/components/layout/HeaderLP.tsx"
import Footer from "@/components/layout/Footer.tsx"
import {LoginForm} from "@/components/forms/LoginForms.tsx";


export default function Login() {
    const handleLoginSuccess = () => {
        // Redirect to home on successful login
        window.location.href = '/home'
    }

    const handleForgotPassword = () => {
        // Navigate to forgot password page
        window.location.href = '/forgot-password'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Header />

            <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <p className="mt-2 text-sm text-gray-600">
                            Não tem uma conta?{' '}
                            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Crie uma conta gratuita
                            </a>
                        </p>
                    </div>

                    <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
                        <LoginForm
                            onSuccess={handleLoginSuccess}
                            onForgotPassword={handleForgotPassword}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}