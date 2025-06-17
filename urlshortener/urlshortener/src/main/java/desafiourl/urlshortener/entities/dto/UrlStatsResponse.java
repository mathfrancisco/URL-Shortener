package desafiourl.urlshortener.entities.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

public record UrlStatsResponse(
        String id,
        String shortUrl,
        String fullUrl,
        String title,
        String description,
        long clickCount,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime expirationDate,
        boolean isActive,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime lastClickAt
) {}
