import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { plansService } from '@/services/plans.service';
import type { PlanInfo, PlanType } from '@/types/plans.types';
import { PlanCard } from '@/components/plans/PlanCard';

interface PlanSelectorProps {
    selectedPlan?: PlanType;
    onPlanSelect: (plan: PlanType) => void;
    currentPlan?: PlanType;
    disabled?: boolean;
    compact?: boolean;
    title?: string;
    description?: string;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
                                                       selectedPlan,
                                                       onPlanSelect,
                                                       currentPlan,
                                                       disabled = false,
                                                       compact = false,
                                                       title = "Escolha seu plano",
                                                       description = "Selecione o plano que melhor atende às suas necessidades"
                                                   }) => {
    const [plans, setPlans] = useState<PlanInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            const plansData = await plansService.getAvailablePlans();

            // Ordena os planos por preço (FREE, PREMIUM, ENTERPRISE)
            const sortedPlans = plansData.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
            setPlans(sortedPlans);
        } catch (err: any) {
            console.error('Erro ao carregar planos:', err);
            setError(err.response?.data?.message || 'Não foi possível carregar os planos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlanSelect = (planType: PlanType) => {
        if (!disabled) {
            onPlanSelect(planType);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                    <p className="text-sm text-gray-600 mt-2">Carregando planos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <button
                            onClick={loadPlans}
                            className="underline ml-2 hover:no-underline"
                        >
                            Tentar novamente
                        </button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Nenhum plano disponível no momento.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            {!compact && (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {description}
                    </p>
                </div>
            )}

            {/* Plans Grid */}
            <div className={`grid gap-6 ${
                compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'
            }`}>
                {plans.map((plan) => (
                    <div
                        key={plan.code}
                        className={`transition-all duration-200 ${
                            selectedPlan === plan.code ? 'scale-105' : ''
                        }`}
                    >
                        <PlanCard
                            plan={plan}
                            currentPlan={currentPlan}
                            onSelectPlan={handlePlanSelect}
                            disabled={disabled}
                            compact={compact}
                            showComparison={!!currentPlan}
                        />
                    </div>
                ))}
            </div>

            {/* Selection Indicator */}
            {selectedPlan && !compact && (
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                        ✨ Você selecionou o plano{' '}
                        <span className="font-semibold">
                            {plans.find(p => p.code === selectedPlan)?.name}
                        </span>
                    </p>
                </div>
            )}

            {/* Help Text */}
            {!compact && (
                <div className="text-center text-sm text-gray-500">
                    <p>
                        Você pode alterar seu plano a qualquer momento nas configurações.
                    </p>
                    <p className="mt-1">
                        Não há taxas de cancelamento ou períodos de fidelidade.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PlanSelector;