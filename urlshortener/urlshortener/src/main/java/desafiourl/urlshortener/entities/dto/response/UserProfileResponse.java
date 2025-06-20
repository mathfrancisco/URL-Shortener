package desafiourl.urlshortener.entities.dto.response;

public record UserProfileResponse(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        boolean emailVerified,
        String planType,
        int monthlyUrlLimit,
        int currentMonthUrlCount,
        int remainingUrls,
        java.time.LocalDateTime createdAt,
        java.time.LocalDateTime lastLoginAt,
        boolean subscriptionActive
) {}
