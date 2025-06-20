package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.NotBlank;

public record EmailVerificationRequest(
        @NotBlank(message = "Token é obrigatório")
        String token
) {}
