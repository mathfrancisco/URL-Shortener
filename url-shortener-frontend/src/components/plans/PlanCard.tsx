import React from 'react';
import { Check, Star, Zap, Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlanInfo, PlanType } from '@/types/plans.types';

interface PlanCardProps {
    plan: PlanInfo;
    currentPlan?: PlanType;
    onSelectPlan?: (planType: PlanType) => void;
    disabled?: boolean;
    loading?: boolean;
    compact?: boolean;
    showComparison?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
                                                      plan,
                                                      currentPlan,
                                                      onSelectPlan,
                                                      disabled = false,
                                                      loading = false,
                                                      compact = false,
                                                      showComparison = true
                                                  }) => {
    const isCurrent = currentPlan === plan.code;
    const isUpgrade = currentPlan && plan.monthlyPrice > (currentPlan === 'FREE' ? 0 : currentPlan === 'PREMIUM' ? 29 : 99);
    const isDowngrade = currentPlan && plan.monthlyPrice < (currentPlan === 'FREE' ? 0 : currentPlan === 'PREMIUM' ? 29 : 99);

    const getPlanIcon = (planType: PlanType) => {
        switch (planType) {
            case 'FREE':
                return <Star className="h-5 w-5" />;
            case 'PREMIUM':
                return <Zap className="h-5 w-5" />;
            case 'ENTERPRISE':
                return <Crown className="h-5 w-5" />;
        }
    };

    const getPlanColorClasses = (planType: PlanType) => {
        switch (planType) {
            case 'FREE':
                return 'bg-blue-100 text-blue-600';
            case 'PREMIUM':
                return 'bg-purple-100 text-purple-600';
            case 'ENTERPRISE':
                return 'bg-yellow-100 text-yellow-600';
        }
    };

    const getButtonText = () => {
        if (isCurrent) return 'Plano Atual';
        if (isUpgrade) return `Fazer Upgrade`;
        if (isDowngrade) return `Alterar para ${plan.name}`;
        return `Escolher ${plan.name}`;
    };

    const getButtonVariant = () => {
        if (isCurrent) return 'secondary';
        if (plan.popular) return 'default';
        return 'outline';
    };

    return (
        <Card className={`relative transition-all duration-200 hover:shadow-lg ${
            plan.popular ? 'border-purple-500 shadow-purple-100 dark:shadow-purple-900/20' : ''
        } ${isCurrent ? 'ring-2 ring-green-500 ring-opacity-50' : ''} ${
            compact ? 'p-2' : ''
        }`}>

            {/* Popular Badge */}
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-4 py-1">
                        Mais Popular
                    </Badge>
                </div>
            )}

            {/* Current Plan Badge */}
            {isCurrent && (
                <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                        Atual
                    </Badge>
                </div>
            )}

            <CardHeader className={compact ? 'pb-2' : 'pb-4'}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getPlanColorClasses(plan.code)}`}>
                            {getPlanIcon(plan.code)}
                        </div>
                        <div>
                            <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
                                {plan.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {plan.description}
                            </CardDescription>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline space-x-1 mt-4">
                    <span className={`font-bold ${
                        compact ? 'text-2xl' : 'text-3xl'
                    } text-gray-900 dark:text-white`}>
                        {plan.formattedPrice}
                    </span>
                </div>

                {/* URL Limit */}
                <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                        {plan.urlLimitDisplay}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className={compact ? 'py-2' : 'py-4'}>
                {/* Features */}
                <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                        Recursos inclusos:
                    </h4>
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && !compact && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-medium text-sm text-gray-500 mb-3">
                            Não inclusos:
                        </h4>
                        {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-400">
                                    {limitation}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Comparison Indicators */}
                {showComparison && currentPlan && !isCurrent && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        {isUpgrade && (
                            <div className="flex items-center space-x-2 text-green-600">
                                <span className="text-sm font-medium">
                                    ⬆️ Upgrade do plano {currentPlan}
                                </span>
                            </div>
                        )}
                        {isDowngrade && (
                            <div className="flex items-center space-x-2 text-orange-600">
                                <span className="text-sm font-medium">
                                    ⬇️ Downgrade do plano {currentPlan}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button
                    className="w-full"
                    variant={getButtonVariant()}
                    disabled={disabled || loading || isCurrent}
                    onClick={() => onSelectPlan?.(plan.code)}
                >
                    {loading ? 'Processando...' : getButtonText()}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PlanCard;