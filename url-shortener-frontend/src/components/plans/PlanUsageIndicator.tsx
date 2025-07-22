import React from 'react';
import { AlertTriangle, TrendingUp, Clock, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlanUsage, PlanType } from '@/types/plans.types';

interface PlanUsageIndicatorProps {
    usage: PlanUsage;
    planType: PlanType;
    onUpgrade?: () => void;
    compact?: boolean;
}

export function PlanUsageIndicator: React.FC<PlanUsageIndicatorProps> = ({
                                                                   usage,
                                                                   planType,
                                                                   onUpgrade,
                                                                   compact = false
                                                               }) => {
    const isUnlimited = usage.monthlyUrlLimit === -1;
    const isNearLimit = usage.usagePercentage >= 80;
    const isAtLimit = usage.usagePercentage >= 100;

    const getStatusColor = () => {
        if (isAtLimit) return 'text-red-600';
        if (isNearLimit) return 'text-orange-600';
        return 'text-green-600';
    };

    const getStatusIcon = () => {
        if (isAtLimit) return <AlertTriangle className="h-4 w-4" />;
        if (isNearLimit) return <TrendingUp className="h-4 w-4" />;
        return <Zap className="h-4 w-4" />;
    };

    const getStatusMessage = () => {
        if (isUnlimited) return 'URLs ilimitadas';
        if (isAtLimit) return 'Limite atingido';
        if (isNearLimit) return 'Próximo do limite';
        return 'Uso normal';
    };

    const formatResetDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long'
        });
    };

    if (compact) {
        return (
            <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="text-sm font-medium">
            {isUnlimited ? '∞' : `${usage.remainingUrls}`}
          </span>
                </div>
                {!isUnlimited && (
                    <Progress
                        value={usage.usagePercentage}
                        className="w-16 h-2"
                    />
                )}
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                        Uso do Plano {planType}
                    </CardTitle>
                    <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
                        {getStatusIcon()}
                        <span className="text-sm font-medium">
              {getStatusMessage()}
            </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Usage Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            {usage.currentMonthUrlCount}
                        </div>
                        <div className="text-xs text-gray-500">Usadas</div>
                    </div>

                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            {isUnlimited ? '∞' : usage.remainingUrls}
                        </div>
                        <div className="text-xs text-gray-500">Restantes</div>
                    </div>

                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            {isUnlimited ? '∞' : usage.monthlyUrlLimit}
                        </div>
                        <div className="text-xs text-gray-500">Limite</div>
                    </div>
                </div>

                {/* Progress Bar */}
                {!isUnlimited && (
                    <div className="space-y-2">
                        <Progress
                            value={usage.usagePercentage}
                            className="h-3"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{usage.usagePercentage.toFixed(1)}% usado</span>
                            <span>{(100 - usage.usagePercentage).toFixed(1)}% disponível</span>
                        </div>
                    </div>
                )}

                {/* Reset Date */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Renova em {formatResetDate(usage.resetDate)}</span>
                </div>

                {/* Upgrade CTA */}
                {(isAtLimit || isNearLimit) && planType !== 'ENTERPRISE' && onUpgrade && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                {isAtLimit
                                    ? 'Você atingiu o limite do seu plano atual'
                                    : 'Você está próximo do limite do seu plano'
                                }
                            </p>
                            <Button
                                size="sm"
                                onClick={onUpgrade}
                                className="w-full"
                            >
                                Fazer Upgrade
                            </Button>
                        </div>
                    </div>
                )}

                {/* Plan Benefits Preview */}
                {planType === 'FREE' && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="text-center space-y-2">
                            <p className="text-xs text-gray-500">
                                Com o plano Premium você teria:
                            </p>
                            <div className="flex justify-center space-x-4 text-xs">
                                <Badge variant="outline">URLs ilimitadas</Badge>
                                <Badge variant="outline">URLs customizadas</Badge>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};