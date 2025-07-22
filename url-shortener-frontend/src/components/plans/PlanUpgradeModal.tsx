import React, { useState } from 'react';
import {
    Shield,
    CheckCircle,
    AlertTriangle,
    Loader2,
    ArrowRight
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePlans } from '@/hooks/use-plans';
import { useAuth } from '@/hooks/use-auth';
import type { PlanType } from '@/types/plans.types';
import type { UserProfileResponse } from '@/types/user.types';

interface PlanUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetPlan: PlanType;
    onSuccess?: (updatedProfile: UserProfileResponse) => void;
}

const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               targetPlan,
                                                               onSuccess
                                                           }) => {
    const { user, updateUserData } = useAuth();
    const { plans, currentPlan, changePlan, loading, isUpgrade, isDowngrade } = usePlans(user?.planType);
    const [isChanging, setIsChanging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const targetPlanInfo = plans.find(plan => plan.code === targetPlan);

    if (!targetPlanInfo || !currentPlan) {
        return null;
    }

    const isUpgradeAction = isUpgrade(targetPlan);
    const isDowngradeAction = isDowngrade(targetPlan);
    const priceDifference = targetPlanInfo.monthlyPrice - currentPlan.monthlyPrice;

    const handleConfirmChange = async () => {
        try {
            setIsChanging(true);
            setError(null);

            const updatedProfile = await changePlan(targetPlan);

            // Atualizar dados do usuário no contexto
            await updateUserData();

            // Chamar callback de sucesso
            onSuccess?.(updatedProfile);

            // Fechar modal
            onClose();

        } catch (err: any) {
            console.error('Erro ao alterar plano:', err);
            setError(err.message || 'Erro ao alterar plano');
        } finally {
            setIsChanging(false);
        }
    };

    const getChangeType = () => {
        if (isUpgradeAction) return { text: 'Upgrade', color: 'text-green-600', icon: '⬆️' };
        if (isDowngradeAction) return { text: 'Downgrade', color: 'text-orange-600', icon: '⬇️' };
        return { text: 'Alteração', color: 'text-blue-600', icon: '🔄' };
    };

    const changeType = getChangeType();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <span className={changeType.color}>
                            {changeType.icon} {changeType.text} de Plano
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Você está alterando do plano{' '}
                        <span className="font-semibold">{currentPlan.name}</span>
                        {' '}para{' '}
                        <span className="font-semibold">{targetPlanInfo.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Price Comparison */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Plano atual:</span>
                            <span className="font-medium">{currentPlan.formattedPrice}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Novo plano:</span>
                            <span className="font-medium">{targetPlanInfo.formattedPrice}</span>
                        </div>

                        {priceDifference !== 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="text-sm font-medium">Diferença:</span>
                                <span className={`font-bold ${
                                    priceDifference > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {priceDifference > 0 ? '+' : ''}R$ {Math.abs(priceDifference).toFixed(0)}/mês
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Features Comparison */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm">O que muda:</h4>

                        <div className="space-y-2">
                            {/* URL Limit */}
                            <div className="flex items-center justify-between text-sm">
                                <span>URLs por mês:</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">{currentPlan.urlLimitDisplay}</span>
                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                    <span className="font-medium">{targetPlanInfo.urlLimitDisplay}</span>
                                </div>
                            </div>

                            {/* Custom URLs */}
                            {currentPlan.hasCustomUrls !== targetPlanInfo.hasCustomUrls && (
                                <div className="flex items-center justify-between text-sm">
                                    <span>URLs customizadas:</span>
                                    <div className="flex items-center space-x-2">
                                        {targetPlanInfo.hasCustomUrls ? (
                                            <Badge className="bg-green-100 text-green-800">Incluído</Badge>
                                        ) : (
                                            <Badge variant="outline">Removido</Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Advanced Analytics */}
                            {currentPlan.hasAdvancedAnalytics !== targetPlanInfo.hasAdvancedAnalytics && (
                                <div className="flex items-center justify-between text-sm">
                                    <span>Analytics avançadas:</span>
                                    <div className="flex items-center space-x-2">
                                        {targetPlanInfo.hasAdvancedAnalytics ? (
                                            <Badge className="bg-green-100 text-green-800">Incluído</Badge>
                                        ) : (
                                            <Badge variant="outline">Removido</Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* API Access */}
                            {currentPlan.hasApiAccess !== targetPlanInfo.hasApiAccess && (
                                <div className="flex items-center justify-between text-sm">
                                    <span>Acesso à API:</span>
                                    <div className="flex items-center space-x-2">
                                        {targetPlanInfo.hasApiAccess ? (
                                            <Badge className="bg-green-100 text-green-800">Incluído</Badge>
                                        ) : (
                                            <Badge variant="outline">Removido</Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Priority Support */}
                            {currentPlan.hasPrioritySupport !== targetPlanInfo.hasPrioritySupport && (
                                <div className="flex items-center justify-between text-sm">
                                    <span>Suporte prioritário:</span>
                                    <div className="flex items-center space-x-2">
                                        {targetPlanInfo.hasPrioritySupport ? (
                                            <Badge className="bg-green-100 text-green-800">Incluído</Badge>
                                        ) : (
                                            <Badge variant="outline">Removido</Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Important Notes */}
                    <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                            {isUpgradeAction ? (
                                <>A alteração será efetiva imediatamente. Você será cobrado na próxima fatura.</>
                            ) : (
                                <>A alteração será efetiva imediatamente. O valor será ajustado na próxima fatura.</>
                            )}
                        </AlertDescription>
                    </Alert>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isChanging}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmChange}
                        disabled={isChanging || loading}
                        className={isUpgradeAction ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
                    >
                        {isChanging ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Alterando...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar {changeType.text}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PlanUpgradeModal;