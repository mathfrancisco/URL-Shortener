// src/main/java/desafiourl/urlshortener/controller/AnalyticsController.java
package desafiourl.urlshortener.controller;


import desafiourl.urlshortener.entities.UrlEntity;
import desafiourl.urlshortener.entities.dto.UrlAnalyticsResponse;
import desafiourl.urlshortener.service.AnalyticsService;
import desafiourl.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private UrlService urlService;

    @Autowired
    private AnalyticsService analyticsService;

    @Value("${app.url.base-url:http://localhost:8080}")
    private String baseUrl;

    @GetMapping("/url/{id}")
    public ResponseEntity<UrlAnalyticsResponse> getUrlAnalytics(
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        // Check if user owns this URL
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UrlAnalyticsResponse analytics = analyticsService.getUrlAnalytics(urlEntity, baseUrl);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/url/{id}/clicks")
    public ResponseEntity<Map<String, Object>> getUrlClicks(
            @PathVariable String id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        // Check if user owns this URL
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> clicksData = analyticsService.getUrlClicks(id, startDate, endDate, page, size);
        return ResponseEntity.ok(clicksData);
    }

    @GetMapping("/url/{id}/stats/summary")
    public ResponseEntity<Map<String, Object>> getUrlStatsSummary(
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        // Check if user owns this URL
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> summary = analyticsService.getUrlStatsSummary(id);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/url/{id}/stats/geographic")
    public ResponseEntity<Map<String, Object>> getGeographicStats(
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        // Check if user owns this URL
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> geoStats = analyticsService.getGeographicStats(id);
        return ResponseEntity.ok(geoStats);
    }

    @GetMapping("/url/{id}/stats/referrers")
    public ResponseEntity<Map<String, Object>> getReferrerStats(
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        // Check if user owns this URL
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> referrerStats = analyticsService.getReferrerStats(id);
        return ResponseEntity.ok(referrerStats);
    }

    @GetMapping("/url/{id}/stats/devices")
    public ResponseEntity<Map<String, Object>> getDeviceStats(
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        // Check if user owns this URL
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> deviceStats = analyticsService.getDeviceStats(id);
        return ResponseEntity.ok(deviceStats);
    }

    @GetMapping("/url/{id}/stats/timeline")
    public ResponseEntity<Map<String, Object>> getClickTimeline(
            @PathVariable String id,
            @RequestParam(defaultValue = "daily") String granularity, // daily, hourly, weekly
            @RequestParam(defaultValue = "30") int days,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        // Check if user owns this URL
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> timeline = analyticsService.getClickTimeline(id, granularity, days);
        return ResponseEntity.ok(timeline);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);

        Map<String, Object> dashboardStats = analyticsService.getDashboardStats(clientIp);
        return ResponseEntity.ok(dashboardStats);
    }

    @GetMapping("/top-urls")
    public ResponseEntity<Map<String, Object>> getTopUrls(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "clicks") String sortBy, // clicks, recent
            HttpServletRequest request) {

        String clientIp = getClientIpAddress(request);

        Map<String, Object> topUrls = analyticsService.getTopUrls(clientIp, limit, sortBy, baseUrl);
        return ResponseEntity.ok(topUrls);
    }

    @GetMapping("/export/{id}")
    public ResponseEntity<Map<String, Object>> exportAnalytics(
            @PathVariable String id,
            @RequestParam(defaultValue = "json") String format, // json, csv
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        // Check if user owns this URL
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> exportData = analyticsService.exportAnalytics(id, format);
        return ResponseEntity.ok(exportData);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getAnalyticsHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "analytics");

        try {
            Map<String, Object> stats = analyticsService.getSystemStats();
            health.put("stats", stats);
        } catch (Exception e) {
            health.put("status", "degraded");
            health.put("error", e.getMessage());
        }

        return ResponseEntity.ok(health);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }
}