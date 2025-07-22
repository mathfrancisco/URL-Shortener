// src/types/plans.types.ts

export type PlanType = 'FREE' | 'PREMIUM' | 'ENTERPRISE';

/**
 * Resposta do backend para informações de plano
 * Mapeia PlanInfoResponse do Java
 */
export interface PlanInfoResponse {
    code: PlanType;
    name: string;
    description: string;
    monthlyPrice: number;
    formattedPrice: string;
    monthlyUrlLimit: number;
    urlLimitDisplay: string;
    hasCustomUrls: boolean;
    hasAdvancedAnalytics: boolean;
    hasApiAccess: boolean;
    hasPrioritySupport: boolean;
    features: string[];
    limitations: string[];
    popular: boolean;
}

/**
 * Interface de plano usada no frontend
 * Extende PlanInfoResponse para compatibilidade
 */
export interface PlanInfo extends PlanInfoResponse {
    // Pode adicionar campos adicionais específicos do frontend se necessário
}

/**
 * Recursos de um plano
 */
export interface PlanFeatures {
    monthlyUrlLimit: number;
    urlLimitDisplay: string;
    hasCustomUrls: boolean;
    hasAdvancedAnalytics: boolean;
    hasApiAccess: boolean;
    hasPrioritySupport: boolean;
}

/**
 * Uso do plano pelo usuário
 */
export interface PlanUsage {
    currentMonthUrlCount: number;
    monthlyUrlLimit: number;
    remainingUrls: number;
    usagePercentage: number;
    resetDate: string;
}

/**
 * Request para alterar plano
 */
export interface ChangePlanRequest {
    planType: PlanType;
}

/**
 * Comparação entre planos
 */
export interface PlanComparison {
    currentPlan: PlanInfo;
    targetPlan: PlanInfo;
    differences: {
        field: string;
        current: any;
        target: any;
        type: 'upgrade' | 'downgrade' | 'same';
    }[];
}

/**
 * Helpers para trabalhar com planos
 */
export const PlanHelpers = {
    /**
     * Verifica se o plano tem URLs ilimitadas
     */
    isUnlimited: (plan: PlanInfo | number): boolean => {
        if (typeof plan === 'number') {
            return plan === -1;
        }
        return plan.monthlyUrlLimit === -1;
    },

    /**
     * Verifica se é um plano pago
     */
    isPaid: (plan: PlanInfo | PlanType): boolean => {
        if (typeof plan === 'string') {
            return plan !== 'FREE';
        }
        return plan.monthlyPrice > 0;
    },

    /**
     * Obtém o preço formatado
     */
    getFormattedPrice: (price: number): string => {
        if (price === 0) return 'Gratuito';
        return `R$ ${price.toFixed(0)}/mês`;
    },

    /**
     * Obtém o display do limite de URLs
     */
    getUrlLimitDisplay: (limit: number): string => {
        if (limit === -1) return 'URLs ilimitadas';
        return `${limit} URLs/mês`;
    },

    /**
     * Obtém a descrição do plano
     */
    getPlanDescription: (planType: PlanType): string => {
        const descriptions = {
            'FREE': 'Perfeito para uso pessoal',
            'PREMIUM': 'Ideal para profissionais',
            'ENTERPRISE': 'Para equipes e empresas'
        };
        return descriptions[planType] || '';
    },

    /**
     * Obtém a cor do plano para UI
     */
    getPlanColor: (planType: PlanType): string => {
        const colors = {
            'FREE': 'blue',
            'PREMIUM': 'purple',
            'ENTERPRISE': 'yellow'
        };
        return colors[planType] || 'gray';
    }
};