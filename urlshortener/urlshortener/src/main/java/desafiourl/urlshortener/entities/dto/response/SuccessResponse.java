package desafiourl.urlshortener.entities.dto.response;

public record SuccessResponse(
        String message,
        boolean success,
        java.time.LocalDateTime timestamp
) {
    public SuccessResponse(String message) {
        this(message, true, java.time.LocalDateTime.now());
    }
}
