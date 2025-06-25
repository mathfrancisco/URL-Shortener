import { Link, Menu, X, BarChart3, Home, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
    onNavigate?: (section: string) => void
}

export default function Header({ onNavigate }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const navigate = useNavigate()

    const handleNavigate = (section: string) => {
        onNavigate?.(section)
        setIsMobileMenuOpen(false)
    }

    const handleLogin = () => {
        navigate('/login')
        setIsMobileMenuOpen(false)
    }

    const handleRegister = () => {
        navigate('/register')
        setIsMobileMenuOpen(false)
    }

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link className="h-8 w-8 text-blue-600 mr-2" />
                        <span className="text-xl font-bold text-gray-900">
                            Short<span className="text-blue-600">Link</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => handleNavigate('home')}
                            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </button>
                        <button
                            onClick={() => handleNavigate('dashboard')}
                            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => handleNavigate('analytics')}
                            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </button>
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            className="text-gray-700 hover:text-blue-600 transition-colors"
                            onClick={handleLogin}
                        >
                            Login
                        </button>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={handleRegister}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6 text-gray-600" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-600" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <nav className="flex flex-col space-y-4">
                            <button
                                onClick={() => handleNavigate('home')}
                                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </button>
                            <button
                                onClick={() => handleNavigate('dashboard')}
                                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => handleNavigate('analytics')}
                                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                            </button>
                            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                                <button
                                    className="text-left text-gray-700 hover:text-blue-600 transition-colors"
                                    onClick={handleLogin}
                                >
                                    Login
                                </button>
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
                                    onClick={handleRegister}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}