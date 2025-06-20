package desafiourl.urlshortener.controller;

import desafiourl.urlshortener.entities.UrlEntity;
import desafiourl.urlshortener.entities.dto.response.UrlAnalyticsResponse;
import desafiourl.urlshortener.service.AnalyticsService;
import desafiourl.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "APIs para análise e estatísticas detalhadas das URLs")
public class AnalyticsController {

    @Autowired
    private UrlService urlService;

    @Autowired
    private AnalyticsService analyticsService;

    @Value("${app.url.base-url:http://localhost:8080}")
    private String baseUrl;

    @Operation(
            summary = "Obter analytics da URL",
            description = "Retorna análise completa de uma URL com estatísticas detalhadas"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Analytics obtidos com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UrlAnalyticsResponse.class))),
            @ApiResponse(responseCode = "403", description = "Acesso negado - URL não pertence ao usuário"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
    @GetMapping("/url/{id}")
    public ResponseEntity<UrlAnalyticsResponse> getUrlAnalytics(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UrlAnalyticsResponse analytics = analyticsService.getUrlAnalytics(urlEntity, baseUrl);
        return ResponseEntity.ok(analytics);
    }

    @Operation(
            summary = "Obter cliques da URL",
            description = "Retorna lista paginada de cliques de uma URL com filtros de data"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliques obtidos com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado - URL não pertence ao usuário"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
    @GetMapping("/url/{id}/clicks")
    public ResponseEntity<Map<String, Object>> getUrlClicks(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id,
            @Parameter(description = "Data de início (ISO 8601)", example = "2024-01-01T00:00:00")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "Data de fim (ISO 8601)", example = "2024-12-31T23:59:59")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Número da página", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamanho da página", example = "50")
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> clicksData = analyticsService.getUrlClicks(id, startDate, endDate, page, size);
        return ResponseEntity.ok(clicksData);
    }

    @Operation(
            summary = "Obter resumo de estatísticas",
            description = "Retorna resumo executivo das estatísticas de uma URL"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resumo obtido com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado - URL não pertence ao usuário"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
    @GetMapping("/url/{id}/stats/summary")
    public ResponseEntity<Map<String, Object>> getUrlStatsSummary(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> summary = analyticsService.getUrlStatsSummary(id);
        return ResponseEntity.ok(summary);
    }

    @Operation(
            summary = "Obter estatísticas geográficas",
            description = "Retorna distribuição geográfica dos cliques por país/região"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estatísticas geográficas obtidas com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado - URL não pertence ao usuário"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
    @GetMapping("/url/{id}/stats/geographic")
    public ResponseEntity<Map<String, Object>> getGeographicStats(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> geoStats = analyticsService.getGeographicStats(id);
        return ResponseEntity.ok(geoStats);
    }

    @Operation(
            summary = "Obter estatísticas de referenciadores",
            description = "Retorna quais sites/fontes direcionaram tráfego para a URL"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estatísticas de referenciadores obtidas com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado - URL não pertence ao usuário"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
    @GetMapping("/url/{id}/stats/referrers")
    public ResponseEntity<Map<String, Object>> getReferrerStats(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> referrerStats = analyticsService.getReferrerStats(id);
        return ResponseEntity.ok(referrerStats);
    }

    @Operation(
            summary = "Obter estatísticas de dispositivos",
            description = "Retorna distribuição por tipos de dispositivos e navegadores"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estatísticas de dispositivos obtidas com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado - URL não pertence ao usuário"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
    @GetMapping("/url/{id}/stats/devices")
    public ResponseEntity<Map<String, Object>> getDeviceStats(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> deviceStats = analyticsService.getDeviceStats(id);
        return ResponseEntity.ok(deviceStats);
    }

    @Operation(
            summary = "Obter timeline de cliques",
            description = "Retorna evolução temporal dos cliques com diferentes granularidades"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Timeline obtida com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado - URL não pertence ao usuário"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
    @GetMapping("/url/{id}/stats/timeline")
    public ResponseEntity<Map<String, Object>> getClickTimeline(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id,
            @Parameter(description = "Granularidade da timeline", example = "daily",
                    schema = @Schema(allowableValues = {"daily", "hourly", "weekly"}))
            @RequestParam(defaultValue = "daily") String granularity,
            @Parameter(description = "Número de dias para análise", example = "30")
            @RequestParam(defaultValue = "30") int days,
            HttpServletRequest request) {

        UrlEntity urlEntity = urlService.findActiveUrl(id);
        String clientIp = getClientIpAddress(request);

        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> timeline = analyticsService.getClickTimeline(id, granularity, days);
        return ResponseEntity.ok(timeline);
    }

    @Operation(
            summary = "Obter dashboard geral",
            description = "Retorna estatísticas gerais de todas as URLs do usuário"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dashboard obtido com sucesso")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);

        Map<String, Object> dashboardStats = analyticsService.getDashboardStats(clientIp);
        return ResponseEntity.ok(dashboardStats);
    }

    @Operation(
            summary = "Obter top URLs",
            description = "Retorna ranking das URLs mais populares do usuário"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Top URLs obtidas com sucesso")
    })
    @GetMapping("/top-urls")
    public ResponseEntity<Map<String, Object>> getTopUrls(
            @Parameter(description = "Limite de resultados", example = "10")
            @RequestParam(defaultValue = "10") int limit,
            @Parameter(description = "Critério de ordenação", example = "clicks",
                    schema = @Schema(allowableValues = {"clicks", "recent"}))
            @RequestParam(defaultValue = "clicks") String sortBy,
            HttpServletRequest request) {

        String clientIp = getClientIpAddress(request);

        Map<String, Object> topUrls = analyticsService.getTopUrls(clientIp, limit, sortBy, baseUrl);
        return ResponseEntity.ok(topUrls);
    }
    @Operation(
            summary = "Exportar analytics",
            description = "Exporta dados de analytics em diferentes formatos"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dados exportados com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado - URL não pertence ao usuário"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
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