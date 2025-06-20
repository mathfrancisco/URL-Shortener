package desafiourl.urlshortener.entities.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ShortenUrlRequest(
        @NotBlank(message = "URL is required")
        String url,

        @Size(min = 3, max = 50, message = "Custom alias must be between 3 and 50 characters")
        String customAlias,

        @Positive(message = "Expiration hours must be positive")
        Integer expirationHours
) {
}