package desafiourl.urlshortener.entities.dto.response;

public record AuthResponse(
        String token,
        String type,
        String username,
        String email,
        String fullName,
        String planType,
        boolean emailVerified,
        long expiresIn
) {}
