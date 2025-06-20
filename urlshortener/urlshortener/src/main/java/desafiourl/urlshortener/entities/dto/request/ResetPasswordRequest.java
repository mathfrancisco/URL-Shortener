package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token é obrigatório")
        String token,

        @NotBlank(message = "Nova senha é obrigatória")
        @Size(min = 6, max = 100, message = "Nova senha deve ter entre 6 e 100 caracteres")
        String newPassword,

        @NotBlank(message = "Confirmação da nova senha é obrigatória")
        String confirmNewPassword
) {}
