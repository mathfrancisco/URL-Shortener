package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ter formato válido")
        String email
) {}
