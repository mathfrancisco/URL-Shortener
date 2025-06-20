package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 50, message = "Nome deve ter entre 2 e 50 caracteres")
        String firstName,

        @Size(min = 2, max = 50, message = "Sobrenome deve ter entre 2 e 50 caracteres")
        String lastName,

        String phoneNumber
) {}
