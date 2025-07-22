// src/services/plans.service.ts
import {api} from "@/services/api.ts";
import type { PlanInfo, PlanType } from '@/types/plans.types';

class PlansService {
    /**
     * Lista todos os planos disponíveis
     * GET /api/plans/available
     */
    async getAvailablePlans(): Promise<PlanInfo[]> {
        const response = await api.get('/api/plans/available');
        return response.data;
    }

    /**
     * Obtém detalhes de um plano específico
     * GET /api/plans/{planCode}
     */
    async getPlanDetails(planCode: PlanType): Promise<PlanInfo> {
        const response = await api.get(`/api/plans/${planCode}`);
        return response.data;
    }

    /**
     * Compara dois planos
     * GET /api/plans/compare/{plan1}/{plan2}
     */
    async comparePlans(plan1: PlanType, plan2: PlanType): Promise<PlanInfo[]> {
        const response = await api.get(`/api/plans/compare/${plan1}/${plan2}`);
        return response.data;
    }

    /**
     * Valida se um código de plano é válido
     */
    isValidPlanCode(code: string): code is PlanType {
        return ['FREE', 'PREMIUM', 'ENTERPRISE'].includes(code.toUpperCase());
    }

    /**
     * Obtém a ordem hierárquica dos planos (para upgrade/downgrade)
     */
    getPlanHierarchy(plan: PlanType): number {
        const hierarchy = {
            'FREE': 1,
            'PREMIUM': 2,
            'ENTERPRISE': 3
        };
        return hierarchy[plan] || 0;
    }

    /**
     * Verifica se é um upgrade
     */
    isUpgrade(currentPlan: PlanType, targetPlan: PlanType): boolean {
        return this.getPlanHierarchy(targetPlan) > this.getPlanHierarchy(currentPlan);
    }

    /**
     * Verifica se é um downgrade
     */
    isDowngrade(currentPlan: PlanType, targetPlan: PlanType): boolean {
        return this.getPlanHierarchy(targetPlan) < this.getPlanHierarchy(currentPlan);
    }

    /**
     * Obtém os recursos destacados de cada plano
     */
    getPlanHighlights(planType: PlanType): string[] {
        const highlights = {
            'FREE': [
                '100 URLs por mês',
                'Estatísticas básicas',
                'Redirecionamento rápido',
                'Suporte por email'
            ],
            'PREMIUM': [
                'URLs ilimitadas',
                'URLs customizadas',
                'Analytics avançadas',
                'API completa',
                'Suporte prioritário'
            ],
            'ENTERPRISE': [
                'URLs ilimitadas',
                'URLs customizadas',
                'Analytics avançadas com exportação',
                'API completa com rate limit maior',
                'Suporte 24/7 dedicado',
                'SLA garantido'
            ]
        };
        return highlights[planType] || [];
    }

    /**
     * Obtém as limitações de cada plano
     */
    getPlanLimitations(planType: PlanType): string[] {
        const limitations = {
            'FREE': [
                'URLs customizadas',
                'Analytics avançadas',
                'Acesso à API',
                'Suporte prioritário'
            ],
            'PREMIUM': [
                'Suporte 24/7',
                'SLA garantido',
                'Configurações enterprise'
            ],
            'ENTERPRISE': []
        };
        return limitations[planType] || [];
    }
}

export const plansService = new PlansService();