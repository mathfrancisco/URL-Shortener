package desafiourl.urlshortener.controller;

import desafiourl.urlshortener.entities.dto.ShortenUrlRequest;
import desafiourl.urlshortener.entities.dto.ShortenUrlResponse;
import desafiourl.urlshortener.entities.dto.UpdateUrlMetadataRequest;
import desafiourl.urlshortener.entities.dto.UrlStatsResponse;
import desafiourl.urlshortener.service.UrlService;
import desafiourl.urlshortener.exception.UrlNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
public class UrlController {

    @Autowired
    private UrlService urlService;

    @PostMapping("/url/shorten")
    public ResponseEntity<ShortenUrlResponse> shortenUrl(
            @Valid @RequestBody ShortenUrlRequest request,
            HttpServletRequest servletRequest) {

        String clientIp = getClientIpAddress(servletRequest);

        ShortenUrlResponse response = urlService.createShortUrl(
                request.url(),
                request.customAlias(),
                request.expirationHours(),
                clientIp
        );

        return ResponseEntity.ok(response);
    }

    // Rota para redirecionamento - deve estar na raiz para funcionar com URLs encurtadas
    @GetMapping("/{id}")
    public ResponseEntity<Void> redirectUrl(
            @PathVariable String id,
            HttpServletRequest request) {

        try {
            String clientIp = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            String referer = request.getHeader("Referer");

            String redirectUrl = urlService.processRedirect(id, clientIp, userAgent, referer);

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(redirectUrl));

            return ResponseEntity.status(HttpStatus.FOUND).headers(headers).build();

        } catch (UrlNotFoundException e) {
            // Retorna 404 se a URL não for encontrada
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Log do erro para debug
            System.err.println("Erro no redirecionamento para ID: " + id + " - " + e.getMessage());
            e.printStackTrace();
            // Retorna 500 com mais informações
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/url/{id}/stats")
    public ResponseEntity<UrlStatsResponse> getUrlStats(@PathVariable String id) {
        try {
            UrlStatsResponse stats = urlService.getUrlStats(id);
            return ResponseEntity.ok(stats);
        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/url/urls")
    public ResponseEntity<List<UrlStatsResponse>> getUserUrls(HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);
        List<UrlStatsResponse> statsResponses = urlService.getUserUrls(clientIp);
        return ResponseEntity.ok(statsResponses);
    }

    @PutMapping("/url/{id}/deactivate")
    public ResponseEntity<Void> deactivateUrl(
            @PathVariable String id,
            HttpServletRequest request) {

        try {
            String clientIp = getClientIpAddress(request);
            urlService.deactivateUrl(id, clientIp);
            return ResponseEntity.ok().build();
        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/url/{id}/metadata")
    public ResponseEntity<UrlStatsResponse> updateUrlMetadata(
            @PathVariable String id,
            @RequestBody UpdateUrlMetadataRequest request,
            HttpServletRequest servletRequest) {

        try {
            String clientIp = getClientIpAddress(servletRequest);
            UrlStatsResponse stats = urlService.updateUrlMetadata(id, request, clientIp);
            return ResponseEntity.ok(stats);
        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/url/{id}")
    public ResponseEntity<Void> deleteUrl(
            @PathVariable String id,
            HttpServletRequest request) {

        try {
            String clientIp = getClientIpAddress(request);
            urlService.deleteUrl(id, clientIp);
            return ResponseEntity.noContent().build();
        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
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