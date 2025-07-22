// src/hooks/use-plans.ts
import { useState, useEffect, useCallback } from 'react';
import { plansService } from '@/services/plans.service';
import userService from '@/services/user.service';
import type { PlanInfo, PlanType, ChangePlanRequest } from '@/types/plans.types';
import type { UserProfileResponse } from '@/types/user.types';

interface UsePlansReturn {
    plans: PlanInfo[];
    currentPlan: PlanInfo | null;
    loading: boolean;
    error: string | null;
    changePlan: (newPlan: PlanType) => Promise<UserProfileResponse>;
    comparePlans: (plan1: PlanType, plan2: PlanType) => Promise<PlanInfo[]>;
    canUpgrade: boolean;
    canDowngrade: boolean;
    refreshPlans: () => Promise<void>;
    isUpgrade: (targetPlan: PlanType) => boolean;
    isDowngrade: (targetPlan: PlanType) => boolean;
}

export const usePlans = (userPlan?: PlanType): UsePlansReturn => {
    const [plans, setPlans] = useState<PlanInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [changingPlan, setChangingPlan] = useState(false);

    const currentPlan = plans.find(plan => plan.code === userPlan) || null;

    const canUpgrade = userPlan ? userPlan !== 'ENTERPRISE' : false;
    const canDowngrade = userPlan ? userPlan !== 'FREE' : false;

    const loadPlans = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const plansData = await plansService.getAvailablePlans();
            setPlans(plansData);
        } catch (err: any) {
            console.error('Erro ao carregar planos:', err);
            setError(err.message || 'Não foi possível carregar os planos');
        } finally {
            setLoading(false);
        }
    }, []);

    const changePlan = useCallback(async (newPlan: PlanType): Promise<UserProfileResponse> => {
        try {
            setChangingPlan(true);
            const request: ChangePlanRequest = { planType: newPlan };
            const updatedProfile = await userService.changePlan(request);

            // Recarrega os planos após a mudança
            await loadPlans();

            return updatedProfile;
        } catch (err: any) {
            console.error('Erro ao alterar plano:', err);
            throw new Error(err.response?.data?.message || 'Erro ao alterar plano');
        } finally {
            setChangingPlan(false);
        }
    }, [loadPlans]);

    const comparePlans = useCallback(async (plan1: PlanType, plan2: PlanType): Promise<PlanInfo[]> => {
        try {
            return await plansService.comparePlans(plan1, plan2);
        } catch (err: any) {
            console.error('Erro ao comparar planos:', err);
            throw new Error(err.response?.data?.message || 'Erro ao comparar planos');
        }
    }, []);

    const isUpgrade = useCallback((targetPlan: PlanType): boolean => {
        if (!userPlan) return false;
        return plansService.isUpgrade(userPlan, targetPlan);
    }, [userPlan]);

    const isDowngrade = useCallback((targetPlan: PlanType): boolean => {
        if (!userPlan) return false;
        return plansService.isDowngrade(userPlan, targetPlan);
    }, [userPlan]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    return {
        plans,
        currentPlan,
        loading: loading || changingPlan,
        error,
        changePlan,
        comparePlans,
        canUpgrade,
        canDowngrade,
        refreshPlans: loadPlans,
        isUpgrade,
        isDowngrade
    };
};