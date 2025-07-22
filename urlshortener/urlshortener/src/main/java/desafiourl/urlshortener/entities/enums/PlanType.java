// src/main/java/desafiourl/urlshortener/entities/enums/PlanType.java
package desafiourl.urlshortener.entities.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PlanType {
    FREE("FREE", "Gratuito", 0.0, 100, false, false, false, false),
    PREMIUM("PREMIUM", "Premium", 29.0, -1, true, true, true, true),
    ENTERPRISE("ENTERPRISE", "Empresarial", 99.0, -1, true, true, true, true);

    private final String code;
    private final String displayName;
    private final Double monthlyPrice;
    private final Integer monthlyUrlLimit; // -1 = ilimitado
    private final boolean hasCustomUrls;
    private final boolean hasAdvancedAnalytics;
    private final boolean hasApiAccess;
    private final boolean hasPrioritySupport;

    /**
     * Verifica se o plano permite URLs ilimitadas
     */
    public boolean isUnlimited() {
        return monthlyUrlLimit == -1;
    }

    /**
     * Verifica se é um plano pago
     */
    public boolean isPaid() {
        return monthlyPrice > 0;
    }

    /**
     * Converte código string para enum
     * @param code Código do plano (FREE, PREMIUM, ENTERPRISE)
     * @return PlanType correspondente ou FREE como fallback
     */
    public static PlanType fromCode(String code) {
        if (code == null) return FREE;

        for (PlanType type : values()) {
            if (type.code.equalsIgnoreCase(code)) {
                return type;
            }
        }
        return FREE; // fallback seguro
    }

    /**
     * Obtém descrição amigável do plano
     */
    public String getDescription() {
        return switch (this) {
            case FREE -> "Perfeito para uso pessoal";
            case PREMIUM -> "Ideal para profissionais";
            case ENTERPRISE -> "Para equipes e empresas";
        };
    }

    /**
     * Formata o preço para exibição
     */
    public String getFormattedPrice() {
        if (monthlyPrice == 0) return "Gratuito";
        return String.format("R$ %.0f/mês", monthlyPrice);
    }
}