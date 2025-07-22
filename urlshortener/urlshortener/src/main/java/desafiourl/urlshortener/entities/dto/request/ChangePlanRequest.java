// src/main/java/desafiourl/urlshortener/entities/dto/request/ChangePlanRequest.java
package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangePlanRequest(
        @NotBlank(message = "Tipo do plano é obrigatório")
        @Pattern(regexp = "FREE|PREMIUM|ENTERPRISE", message = "Plano deve ser FREE, PREMIUM ou ENTERPRISE")
        String planType
) {}