package desafiourl.urlshortener.entities.dto;

import java.time.LocalDateTime;

public record ErrorResponse(
        String message,
        String error,
        int status,
        LocalDateTime timestamp,
        String path
) {
    public static ErrorResponse of(String message, String error, int status, String path) {
        return new ErrorResponse(message, error, status, LocalDateTime.now(), path);
    }
}
