// src/main/java/desafiourl/urlshortener/entities/dto/response/PlanInfoResponse.java
package desafiourl.urlshortener.entities.dto.response;

import desafiourl.urlshortener.entities.enums.PlanType;
import lombok.Builder;

import java.util.Arrays;
import java.util.List;

@Builder
public record PlanInfoResponse(
        String code,
        String name,
        String description,
        Double monthlyPrice,
        String formattedPrice,
        Integer monthlyUrlLimit,
        String urlLimitDisplay,
        boolean hasCustomUrls,
        boolean hasAdvancedAnalytics,
        boolean hasApiAccess,
        boolean hasPrioritySupport,
        List<String> features,
        List<String> limitations,
        boolean popular
) {

    /**
     * Converte PlanType para PlanInfoResponse
     */
    public static PlanInfoResponse fromPlanType(PlanType planType) {
        return PlanInfoResponse.builder()
                .code(planType.getCode())
                .name(planType.getDisplayName())
                .description(planType.getDescription())
                .monthlyPrice(planType.getMonthlyPrice())
                .formattedPrice(planType.getFormattedPrice())
                .monthlyUrlLimit(planType.getMonthlyUrlLimit())
                .urlLimitDisplay(planType.isUnlimited() ? "Ilimitadas" : planType.getMonthlyUrlLimit() + " URLs/mês")
                .hasCustomUrls(planType.isHasCustomUrls())
                .hasAdvancedAnalytics(planType.isHasAdvancedAnalytics())
                .hasApiAccess(planType.isHasApiAccess())
                .hasPrioritySupport(planType.isHasPrioritySupport())
                .features(getFeaturesForPlan(planType))
                .limitations(getLimitationsForPlan(planType))
                .popular(planType == PlanType.PREMIUM)
                .build();
    }

    /**
     * Lista de recursos por plano
     */
    private static List<String> getFeaturesForPlan(PlanType planType) {
        return switch (planType) {
            case FREE -> Arrays.asList(
                    "Até 100 URLs por mês",
                    "Estatísticas básicas",
                    "URLs com expiração",
                    "Suporte por email"
            );
            case PREMIUM -> Arrays.asList(
                    "URLs ilimitadas",
                    "URLs customizadas",
                    "Estatísticas avançadas",
                    "QR Codes personalizados",
                    "Análises detalhadas",
                    "API access",
                    "Suporte prioritário"
            );
            case ENTERPRISE -> Arrays.asList(
                    "Tudo do Premium",
                    "Múltiplos usuários",
                    "Dashboard de equipe",
                    "Branded domains",
                    "Integrações avançadas",
                    "Suporte 24/7",
                    "SLA garantido"
            );
        };
    }

    /**
     * Lista de limitações por plano
     */
    private static List<String> getLimitationsForPlan(PlanType planType) {
        return switch (planType) {
            case FREE -> Arrays.asList(
                    "Sem URLs customizadas",
                    "Sem análises avançadas",
                    "Sem API access"
            );
            case PREMIUM, ENTERPRISE -> List.of();
        };
    }
}