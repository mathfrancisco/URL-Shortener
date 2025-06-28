// src/pages/private/Analytics.tsx

import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UrlAnalytics } from '@/components/analytics/UrlAnalytics';

export default function Analytics() {
    const { urlId } = useParams<{ urlId: string }>();
    const navigate = useNavigate();

    // If no urlId is provided, redirect to dashboard or show error
    if (!urlId) {
        return <Navigate to="/home" replace />;
    }

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header with back button */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGoBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Analytics
                        </h1>
                    </div>
                </div>

                {/* Analytics Component */}
                <UrlAnalytics />
            </div>
        </div>
    );
}