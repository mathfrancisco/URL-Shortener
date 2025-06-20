package desafiourl.urlshortener.entities.dto.response;

public record UserStatsResponse(
        int totalUrls,
        int activeUrls,
        long totalClicks,
        int urlsThisMonth,
        int remainingUrls,
        String planType,
        java.time.LocalDateTime memberSince
) {}
