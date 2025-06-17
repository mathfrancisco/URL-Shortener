package desafiourl.urlshortener.entities.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonFormat;

public record UrlAnalyticsResponse(
        String urlId,
        String shortUrl,
        String fullUrl,
        long totalClicks,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime lastClickAt,
        List<DailyClickStats> dailyStats,
        Map<String, Long> countryStats,
        Map<String, Long> refererStats,
        List<RecentClick> recentClicks
) {
    public record DailyClickStats(String date, Long clicks) {}

    public record RecentClick(
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime clickedAt,
            String country,
            String referer
    ) {}
}
