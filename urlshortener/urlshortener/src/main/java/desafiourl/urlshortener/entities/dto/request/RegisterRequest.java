package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ter formato válido")
        String email,

        @NotBlank(message = "Username é obrigatório")
        @Size(min = 3, max = 20, message = "Username deve ter entre 3 e 20 caracteres")
        String username,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, max = 100, message = "Senha deve ter entre 6 e 100 caracteres")
        String password,

        @NotBlank(message = "Confirmação de senha é obrigatória")
        String confirmPassword,

        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 50, message = "Nome deve ter entre 2 e 50 caracteres")
        String firstName,

        @NotBlank(message = "Sobrenome é obrigatório")
        @Size(min = 2, max = 50, message = "Sobrenome deve ter entre 2 e 50 caracteres")
        String lastName,

        String phoneNumber,

        // Novo campo para seleção de plano
        @Pattern(regexp = "FREE|PREMIUM|ENTERPRISE", message = "Plano deve ser FREE, PREMIUM ou ENTERPRISE")
        String selectedPlan
) {}
