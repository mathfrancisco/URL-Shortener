package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.NotBlank;

// Login Request
public record LoginRequest(
        @NotBlank(message = "Username ou email é obrigatório")
        String usernameOrEmail,

        @NotBlank(message = "Senha é obrigatória")
        String password
) {}
