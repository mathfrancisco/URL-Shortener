package desafiourl.urlshortener.service;

import desafiourl.urlshortener.entities.ClickEntity;
import desafiourl.urlshortener.entities.UrlEntity;
import desafiourl.urlshortener.entities.dto.response.ShortenUrlResponse;
import desafiourl.urlshortener.entities.dto.request.UpdateUrlMetadataRequest;
import desafiourl.urlshortener.entities.dto.response.UrlStatsResponse;
import desafiourl.urlshortener.exception.InvalidUrlException;
import desafiourl.urlshortener.exception.UrlNotFoundException;
import desafiourl.urlshortener.repository.ClickRepository;
import desafiourl.urlshortener.repository.UrlRepository;
import desafiourl.urlshortener.utils.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UrlService {

    @Autowired
    private UrlRepository urlRepository;

    @Autowired
    private ClickRepository clickRepository;

    @Autowired
    private ValidationService validationService;

    @Autowired
    private IdGenerator idGenerator;

    @Autowired
    private AnalyticsService analyticsService;

    @Value("${app.url.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.url.default-expiration-hours:24}")
    private int defaultExpirationHours;

    @Value("${app.rate-limit.requests-per-hour:100}")
    private int requestsPerHour;

    public ShortenUrlResponse createShortUrl(String originalUrl, String customAlias, Integer expirationHours, String creatorIp) {
        // Validate URL
        String validatedUrl = validationService.validateAndNormalizeUrl(originalUrl);

        // Validate custom alias if provided
        if (customAlias != null && !customAlias.trim().isEmpty()) {
            validationService.validateCustomAlias(customAlias);
            if (urlRepository.findByCustomAlias(customAlias).isPresent()) {
                throw new InvalidUrlException("Custom alias already exists");
            }
        }

        // Check rate limiting
        checkRateLimit(creatorIp);

        // Generate or use custom ID
        String urlId;
        if (customAlias != null && !customAlias.trim().isEmpty()) {
            urlId = customAlias.trim();
        } else {
            do {
                urlId = idGenerator.generateId();
            } while (urlRepository.existsById(urlId));
        }

        // Set expiration
        int hoursToExpire = expirationHours != null ? expirationHours : defaultExpirationHours;
        LocalDateTime expirationDate = LocalDateTime.now().plusHours(hoursToExpire);

        // Create and save entity
        UrlEntity urlEntity = new UrlEntity(urlId, validatedUrl, customAlias, expirationDate, creatorIp);
        urlRepository.save(urlEntity);

        String shortUrl = baseUrl + "/" + urlEntity.getId();
        return new ShortenUrlResponse(shortUrl);
    }

    public String processRedirect(String id, String clientIp, String userAgent, String referer) {
        UrlEntity urlEntity = findActiveUrl(id);
        recordClick(urlEntity, clientIp, userAgent, referer);
        return urlEntity.getFullUrl();
    }

    public UrlStatsResponse getUrlStats(String id) {
        UrlEntity urlEntity = findActiveUrl(id);

        // Get last click date
        LocalDateTime lastClickAt = clickRepository.findByUrlIdOrderByClickedAtDesc(id)
                .stream()
                .findFirst()
                .map(ClickEntity::getClickedAt)
                .orElse(null);

        return new UrlStatsResponse(
                urlEntity.getId(),
                baseUrl + "/" + urlEntity.getId(),
                urlEntity.getFullUrl(),
                urlEntity.getTitle(),
                urlEntity.getDescription(),
                urlEntity.getClickCount(),
                urlEntity.getCreatedAt(),
                urlEntity.getExpirationDate(),
                urlEntity.isActive(),
                lastClickAt
        );
    }

    public List<UrlStatsResponse> getUserUrls(String creatorIp) {
        List<UrlEntity> userUrls = urlRepository.findByCreatorIpOrderByCreatedAtDesc(creatorIp);

        return userUrls.stream()
                .map(urlEntity -> {
                    LocalDateTime lastClickAt = clickRepository.findByUrlIdOrderByClickedAtDesc(urlEntity.getId())
                            .stream()
                            .findFirst()
                            .map(ClickEntity::getClickedAt)
                            .orElse(null);

                    return new UrlStatsResponse(
                            urlEntity.getId(),
                            baseUrl + "/" + urlEntity.getId(),
                            urlEntity.getFullUrl(),
                            urlEntity.getTitle(),
                            urlEntity.getDescription(),
                            urlEntity.getClickCount(),
                            urlEntity.getCreatedAt(),
                            urlEntity.getExpirationDate(),
                            urlEntity.isActive(),
                            lastClickAt
                    );
                })
                .collect(Collectors.toList());
    }

    public void deactivateUrl(String id, String clientIp) {
        UrlEntity urlEntity = findActiveUrl(id);
        validateOwnership(urlEntity, clientIp);

        urlEntity.setActive(false);
        urlRepository.save(urlEntity);
    }

    public UrlStatsResponse updateUrlMetadata(String id, UpdateUrlMetadataRequest request, String clientIp) {
        UrlEntity urlEntity = findActiveUrl(id);
        validateOwnership(urlEntity, clientIp);

        urlEntity.setTitle(request.title());
        urlEntity.setDescription(request.description());
        UrlEntity updatedEntity = urlRepository.save(urlEntity);

        LocalDateTime lastClickAt = clickRepository.findByUrlIdOrderByClickedAtDesc(id)
                .stream()
                .findFirst()
                .map(ClickEntity::getClickedAt)
                .orElse(null);

        return new UrlStatsResponse(
                updatedEntity.getId(),
                baseUrl + "/" + updatedEntity.getId(),
                updatedEntity.getFullUrl(),
                updatedEntity.getTitle(),
                updatedEntity.getDescription(),
                updatedEntity.getClickCount(),
                updatedEntity.getCreatedAt(),
                updatedEntity.getExpirationDate(),
                updatedEntity.isActive(),
                lastClickAt
        );
    }

    public void deleteUrl(String id, String clientIp) {
        UrlEntity urlEntity = findActiveUrl(id);
        validateOwnership(urlEntity, clientIp);

        urlRepository.delete(urlEntity);
    }

    public UrlEntity findActiveUrl(String id) {
        UrlEntity urlEntity = urlRepository.findById(id)
                .orElseThrow(() -> new UrlNotFoundException("URL not found"));

        if (!urlEntity.isActive()) {
            throw new UrlNotFoundException("URL is not active");
        }

        if (urlEntity.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new UrlNotFoundException("URL has expired");
        }

        return urlEntity;
    }

    private void recordClick(UrlEntity urlEntity, String ipAddress, String userAgent, String referer) {
        // Increment click count
        urlEntity.incrementClickCount();
        urlRepository.save(urlEntity);

        // Record detailed analytics
        analyticsService.recordClick(urlEntity.getId(), ipAddress, userAgent, referer);
    }

    private void checkRateLimit(String creatorIp) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentCount = urlRepository.countByCreatorIpAndCreatedAtAfter(creatorIp, oneHourAgo);

        if (recentCount >= requestsPerHour) {
            throw new InvalidUrlException("Rate limit exceeded. Please try again later.");
        }
    }

    private void validateOwnership(UrlEntity urlEntity, String clientIp) {
        if (!urlEntity.getCreatorIp().equals(clientIp)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}