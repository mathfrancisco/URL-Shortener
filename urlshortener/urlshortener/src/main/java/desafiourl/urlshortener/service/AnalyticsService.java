package desafiourl.urlshortener.service;

import desafiourl.urlshortener.entities.dto.GeoLocationInfo;
import desafiourl.urlshortener.entities.dto.response.UrlAnalyticsResponse;
import desafiourl.urlshortener.entities.ClickEntity;
import desafiourl.urlshortener.entities.UrlEntity;
import desafiourl.urlshortener.repository.ClickRepository;
import desafiourl.urlshortener.repository.UrlRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private ClickRepository clickRepository;

    @Autowired
    private UrlRepository urlRepository;

    @Autowired
    private GeoLocationService geoLocationService;

    public void recordClick(String urlId, String ipAddress, String userAgent, String referer) {
        try {
            ClickEntity click = new ClickEntity(urlId, ipAddress, userAgent, referer);

            // Implementar geolocalização
            if (geoLocationService.isDatabaseAvailable()) {
                try {
                    GeoLocationInfo locationInfo = geoLocationService.getLocationInfo(ipAddress);
                    click.setCountry(locationInfo.country());
                    click.setCity(locationInfo.city());

                    logger.debug("Geolocation resolved for IP {}: {} / {}",
                            ipAddress, locationInfo.country(), locationInfo.city());
                } catch (Exception e) {
                    logger.warn("Failed to resolve geolocation for IP {}: {}", ipAddress, e.getMessage());
                    // Continue without geolocation data
                }
            } else {
                logger.debug("GeoIP database not available, skipping geolocation for IP: {}", ipAddress);
            }

            clickRepository.save(click);
            logger.debug("Click recorded successfully for URL {} from IP {}", urlId, ipAddress);

        } catch (Exception e) {
            logger.error("Failed to record click for URL {} from IP {}: {}", urlId, ipAddress, e.getMessage());
            throw e;
        }
    }

    public UrlAnalyticsResponse getUrlAnalytics(UrlEntity urlEntity, String baseUrl) {
        String urlId = urlEntity.getId();
        List<ClickEntity> clicks = clickRepository.findByUrlIdOrderByClickedAtDesc(urlId);

        // Daily stats for last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<ClickEntity> recentClicks = clickRepository.findByUrlIdAndClickedAtBetween(
                urlId, thirtyDaysAgo, LocalDateTime.now()
        );

        List<UrlAnalyticsResponse.DailyClickStats> dailyStats = recentClicks.stream()
                .collect(Collectors.groupingBy(
                        click -> click.getClickedAt().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .map(entry -> new UrlAnalyticsResponse.DailyClickStats(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // Country stats
        Map<String, Long> countryStats = clicks.stream()
                .filter(click -> click.getCountry() != null && !click.getCountry().isEmpty())
                .collect(Collectors.groupingBy(
                        ClickEntity::getCountry,
                        Collectors.counting()
                ));

        // Referer stats
        Map<String, Long> refererStats = clicks.stream()
                .filter(click -> click.getReferer() != null && !click.getReferer().isEmpty())
                .collect(Collectors.groupingBy(
                        ClickEntity::getReferer,
                        Collectors.counting()
                ));

        // Recent clicks
        List<UrlAnalyticsResponse.RecentClick> recentClicksList = clicks.stream()
                .limit(10)
                .map(click -> new UrlAnalyticsResponse.RecentClick(
                        click.getClickedAt(),
                        click.getCountry(),
                        click.getReferer()
                ))
                .collect(Collectors.toList());

        LocalDateTime lastClickAt = clicks.isEmpty() ? null : clicks.getFirst().getClickedAt();

        return new UrlAnalyticsResponse(
                urlId,
                baseUrl + "/" + urlId,
                urlEntity.getFullUrl(),
                urlEntity.getClickCount(),
                urlEntity.getCreatedAt(),
                lastClickAt,
                dailyStats,
                countryStats,
                refererStats,
                recentClicksList
        );
    }

    public Map<String, Object> getUrlClicks(String urlId, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        List<ClickEntity> clicks;

        if (startDate != null && endDate != null) {
            clicks = clickRepository.findByUrlIdAndClickedAtBetween(urlId, startDate, endDate);
        } else {
            clicks = clickRepository.findByUrlIdOrderByClickedAtDesc(urlId);
        }

        // Implement pagination
        int start = page * size;
        int end = Math.min(start + size, clicks.size());
        List<ClickEntity> paginatedClicks = clicks.subList(start, end);

        Map<String, Object> result = new HashMap<>();
        result.put("clicks", paginatedClicks);
        result.put("totalCount", clicks.size());
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (clicks.size() + size - 1) / size);

        return result;
    }

    public Map<String, Object> getUrlStatsSummary(String urlId) {
        List<ClickEntity> clicks = clickRepository.findByUrlIdOrderByClickedAtDesc(urlId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalClicks", clicks.size());
        summary.put("uniqueVisitors", clicks.stream().map(ClickEntity::getIpAddress).distinct().count());
        summary.put("avgClicksPerDay", calculateAvgClicksPerDay(clicks));
        summary.put("peakDay", findPeakDay(clicks));
        summary.put("clicksToday", getClicksToday(clicks));
        summary.put("clicksThisWeek", getClicksThisWeek(clicks));
        summary.put("clicksThisMonth", getClicksThisMonth(clicks));

        return summary;
    }

    public Map<String, Object> getGeographicStats(String urlId) {
        logger.info("Getting geographic stats for URL: {}", urlId);

        List<ClickEntity> allClicks = clickRepository.findCountriesByUrlId(urlId);
        logger.info("Total clicks found for URL {}: {}", urlId, allClicks.size());

        // Filtrar países válidos (não "Unknown" ou "Local")
        Map<String, Long> countryStats = allClicks.stream()
                .filter(click -> {
                    String country = click.getCountry();
                    return country != null &&
                            !country.trim().isEmpty() &&
                            !"Unknown".equalsIgnoreCase(country) &&
                            !"Local".equalsIgnoreCase(country);
                })
                .collect(Collectors.groupingBy(
                        ClickEntity::getCountry,
                        Collectors.counting()
                ));

        // Filtrar cidades válidas (não "Unknown" ou "Local")
        Map<String, Long> cityStats = allClicks.stream()
                .filter(click -> {
                    String city = click.getCity();
                    String country = click.getCountry();

                    // Cidade deve existir e não ser "Unknown" ou "Local"
                    boolean validCity = city != null &&
                            !city.trim().isEmpty() &&
                            !"Unknown".equalsIgnoreCase(city) &&
                            !"Local".equalsIgnoreCase(city);

                    // País deve existir e não ser "Unknown" ou "Local"
                    boolean validCountry = country != null &&
                            !country.trim().isEmpty() &&
                            !"Unknown".equalsIgnoreCase(country) &&
                            !"Local".equalsIgnoreCase(country);

                    return validCity && validCountry;
                })
                .collect(Collectors.groupingBy(
                        click -> click.getCity() + ", " + click.getCountry(),
                        Collectors.counting()
                ));

        // Contar estatísticas para debug
        long totalClicks = allClicks.size();
        long validCountryClicks = countryStats.values().stream().mapToLong(Long::longValue).sum();
        long validCityClicks = cityStats.values().stream().mapToLong(Long::longValue).sum();
        long localClicks = allClicks.stream()
                .filter(click -> {
                    String country = click.getCountry();
                    return country == null ||
                            "Unknown".equalsIgnoreCase(country) ||
                            "Local".equalsIgnoreCase(country);
                })
                .mapToLong(click -> 1L)
                .sum();

        boolean geoAvailable = geoLocationService.isDatabaseAvailable();

        logger.info("Geographic stats for URL {}: {} countries, {} cities, {} local/unknown, geoService available: {}",
                urlId, countryStats.size(), cityStats.size(), localClicks, geoAvailable);

        Map<String, Object> geoStats = new HashMap<>();
        geoStats.put("countries", countryStats);
        geoStats.put("cities", cityStats);
        geoStats.put("topCountry", getTopEntry(countryStats));
        geoStats.put("topCity", getTopEntry(cityStats));
        geoStats.put("geoDataAvailable", geoAvailable);

        // Estatísticas detalhadas
        geoStats.put("totalClicks", totalClicks);
        geoStats.put("validCountryClicks", validCountryClicks);
        geoStats.put("validCityClicks", validCityClicks);
        geoStats.put("localOrUnknownClicks", localClicks);

        // Adicionar informação sobre cobertura
        if (totalClicks > 0) {
            double coveragePercentage = (double) validCountryClicks / totalClicks * 100;
            geoStats.put("geoCoveragePercentage", Math.round(coveragePercentage * 10.0) / 10.0);
        }

        return geoStats;
    }

    public Map<String, Object> getReferrerStats(String urlId) {
        List<ClickEntity> clicks = clickRepository.findReferersByUrlId(urlId);

        Map<String, Long> referrerStats = clicks.stream()
                .filter(click -> click.getReferer() != null && !click.getReferer().isEmpty())
                .collect(Collectors.groupingBy(
                        ClickEntity::getReferer,
                        Collectors.counting()
                ));

        Map<String, Object> stats = new HashMap<>();
        stats.put("referrers", referrerStats);
        stats.put("topReferrer", getTopEntry(referrerStats));
        stats.put("directTraffic", clicks.stream().filter(click ->
                click.getReferer() == null || click.getReferer().isEmpty()).count());

        return stats;
    }

    public Map<String, Object> getDeviceStats(String urlId) {
        List<ClickEntity> clicks = clickRepository.findByUrlIdOrderByClickedAtDesc(urlId);

        Map<String, Long> deviceStats = clicks.stream()
                .filter(click -> click.getUserAgent() != null)
                .collect(Collectors.groupingBy(
                        click -> parseDeviceType(click.getUserAgent()),
                        Collectors.counting()
                ));

        Map<String, Long> browserStats = clicks.stream()
                .filter(click -> click.getUserAgent() != null)
                .collect(Collectors.groupingBy(
                        click -> parseBrowser(click.getUserAgent()),
                        Collectors.counting()
                ));

        Map<String, Object> stats = new HashMap<>();
        stats.put("devices", deviceStats);
        stats.put("browsers", browserStats);
        stats.put("topDevice", getTopEntry(deviceStats));
        stats.put("topBrowser", getTopEntry(browserStats));

        return stats;
    }

    public Map<String, Object> getClickTimeline(String urlId, String granularity, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        List<ClickEntity> clicks = clickRepository.findByUrlIdAndClickedAtBetween(urlId, startDate, endDate);

        Map<String, Long> timeline;

        switch (granularity.toLowerCase()) {
            case "hourly":
                timeline = clicks.stream()
                        .collect(Collectors.groupingBy(
                                click -> click.getClickedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00")),
                                Collectors.counting()
                        ));
                break;
            case "weekly":
                timeline = clicks.stream()
                        .collect(Collectors.groupingBy(
                                click -> click.getClickedAt().format(DateTimeFormatter.ofPattern("yyyy-'W'ww")),
                                Collectors.counting()
                        ));
                break;
            default: // daily
                timeline = clicks.stream()
                        .collect(Collectors.groupingBy(
                                click -> click.getClickedAt().format(DateTimeFormatter.ISO_LOCAL_DATE),
                                Collectors.counting()
                        ));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("timeline", timeline);
        result.put("granularity", granularity);
        result.put("days", days);
        result.put("totalClicks", clicks.size());

        return result;
    }

    public Map<String, Object> getDashboardStats(String creatorIp) {
        List<UrlEntity> userUrls = urlRepository.findByCreatorIpOrderByCreatedAtDesc(creatorIp);

        long totalUrls = userUrls.size();
        long totalClicks = userUrls.stream().mapToLong(UrlEntity::getClickCount).sum();
        long activeUrls = userUrls.stream().filter(UrlEntity::isActive).count();

        LocalDateTime weekAgo = LocalDateTime.now().minusWeeks(1);
        long recentUrls = userUrls.stream()
                .filter(url -> url.getCreatedAt().isAfter(weekAgo))
                .count();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalUrls", totalUrls);
        dashboard.put("totalClicks", totalClicks);
        dashboard.put("activeUrls", activeUrls);
        dashboard.put("recentUrls", recentUrls);
        dashboard.put("avgClicksPerUrl", totalUrls > 0 ? (double) totalClicks / totalUrls : 0);

        return dashboard;
    }

    public Map<String, Object> getTopUrls(String creatorIp, int limit, String sortBy, String baseUrl) {
        List<UrlEntity> userUrls = urlRepository.findByCreatorIpOrderByCreatedAtDesc(creatorIp);

        List<UrlEntity> sortedUrls;
        if ("clicks".equals(sortBy)) {
            sortedUrls = userUrls.stream()
                    .sorted((a, b) -> Long.compare(b.getClickCount(), a.getClickCount()))
                    .limit(limit)
                    .collect(Collectors.toList());
        } else {
            sortedUrls = userUrls.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> topUrlsData = sortedUrls.stream()
                .map(url -> {
                    Map<String, Object> urlData = new HashMap<>();
                    urlData.put("id", url.getId());
                    urlData.put("shortUrl", baseUrl + "/" + url.getId());
                    urlData.put("fullUrl", url.getFullUrl());
                    urlData.put("title", url.getTitle());
                    urlData.put("clickCount", url.getClickCount());
                    urlData.put("createdAt", url.getCreatedAt());
                    return urlData;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("urls", topUrlsData);
        result.put("sortBy", sortBy);
        result.put("limit", limit);

        return result;
    }

    public Map<String, Object> exportAnalytics(String urlId, String format) {
        List<ClickEntity> clicks = clickRepository.findByUrlIdOrderByClickedAtDesc(urlId);

        Map<String, Object> exportData = new HashMap<>();
        exportData.put("urlId", urlId);
        exportData.put("format", format);
        exportData.put("exportedAt", LocalDateTime.now());
        exportData.put("totalClicks", clicks.size());

        if ("csv".equals(format)) {
            String csvData = generateCSV(clicks);
            exportData.put("data", csvData);
            exportData.put("contentType", "text/csv");
        } else {
            exportData.put("data", clicks);
            exportData.put("contentType", "application/json");
        }

        return exportData;
    }

    // MÉTODOS AUXILIARES IMPLEMENTADOS
    private double calculateAvgClicksPerDay(List<ClickEntity> clicks) {
        if (clicks.isEmpty()) return 0.0;

        LocalDate firstDate = clicks.getLast().getClickedAt().toLocalDate();
        LocalDate lastDate = clicks.getFirst().getClickedAt().toLocalDate();
        long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(firstDate, lastDate) + 1;

        return daysDiff > 0 ? (double) clicks.size() / daysDiff : clicks.size();
    }

    private String findPeakDay(List<ClickEntity> clicks) {
        if (clicks.isEmpty()) return null;

        Map<String, Long> dailyClicksMap = clicks.stream()
                .collect(Collectors.groupingBy(
                        click -> click.getClickedAt().toLocalDate().toString(),
                        Collectors.counting()
                ));

        return dailyClicksMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private long getClicksToday(List<ClickEntity> clicks) {
        LocalDate today = LocalDate.now();
        return clicks.stream()
                .filter(click -> click.getClickedAt().toLocalDate().equals(today))
                .count();
    }

    private long getClicksThisWeek(List<ClickEntity> clicks) {
        LocalDateTime weekAgo = LocalDateTime.now().minusWeeks(1);
        return clicks.stream()
                .filter(click -> click.getClickedAt().isAfter(weekAgo))
                .count();
    }

    private long getClicksThisMonth(List<ClickEntity> clicks) {
        LocalDateTime monthAgo = LocalDateTime.now().minusMonths(1);
        return clicks.stream()
                .filter(click -> click.getClickedAt().isAfter(monthAgo))
                .count();
    }

    private String getTopEntry(Map<String, Long> stats) {
        if (stats == null || stats.isEmpty()) {
            return "N/A";
        }

        return stats.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }

    private String parseDeviceType(String userAgent) {
        if (userAgent == null) return "Unknown";

        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
            return "Mobile";
        } else if (userAgent.contains("tablet") || userAgent.contains("ipad")) {
            return "Tablet";
        }
        return "Desktop";
    }

    private String parseBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";

        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("chrome")) return "Chrome";
        if (userAgent.contains("firefox")) return "Firefox";
        if (userAgent.contains("safari")) return "Safari";
        if (userAgent.contains("edge")) return "Edge";
        if (userAgent.contains("opera")) return "Opera";
        return "Other";
    }

    private String generateCSV(List<ClickEntity> clicks) {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,URL_ID,CLICKED_AT,IP_ADDRESS,USER_AGENT,REFERER,COUNTRY,CITY\n");

        for (ClickEntity click : clicks) {
            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
                    click.getId() != null ? click.getId() : "",
                    click.getUrlId() != null ? click.getUrlId() : "",
                    click.getClickedAt() != null ? click.getClickedAt().toString() : "",
                    click.getIpAddress() != null ? click.getIpAddress() : "",
                    click.getUserAgent() != null ? click.getUserAgent().replace(",", ";") : "",
                    click.getReferer() != null ? click.getReferer() : "",
                    click.getCountry() != null ? click.getCountry() : "",
                    click.getCity() != null ? click.getCity() : ""
            ));
        }

        return csv.toString();
    }

    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            long totalUrls = urlRepository.count();
            long totalClicks = clickRepository.count();
            long activeUrls = urlRepository.findActiveUrls(LocalDateTime.now()).size();

            LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            List<ClickEntity> todayClicks = clickRepository.findRecentClicks(today);

            stats.put("totalUrls", totalUrls);
            stats.put("totalClicks", totalClicks);
            stats.put("activeUrls", activeUrls);
            stats.put("clicksToday", todayClicks.size());
            stats.put("avgClicksPerUrl", totalUrls > 0 ? (double) totalClicks / totalUrls : 0);
            stats.put("geoLocationEnabled", geoLocationService.isDatabaseAvailable());

        } catch (Exception e) {
            stats.put("error", "Failed to retrieve system stats: " + e.getMessage());
        }

        return stats;
    }
}