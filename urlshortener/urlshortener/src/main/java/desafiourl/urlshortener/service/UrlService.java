package desafiourl.urlshortener.service;

import desafiourl.urlshortener.entities.ClickEntity;
import desafiourl.urlshortener.entities.UrlEntity;
import desafiourl.urlshortener.entities.UserEntity;
import desafiourl.urlshortener.entities.dto.request.ShortenUrlRequest;
import desafiourl.urlshortener.entities.dto.response.ShortenUrlResponse;
import desafiourl.urlshortener.entities.dto.request.UpdateUrlMetadataRequest;
import desafiourl.urlshortener.entities.dto.response.UrlStatsResponse;
import desafiourl.urlshortener.exception.InvalidUrlException;
import desafiourl.urlshortener.exception.UrlNotFoundException;
import desafiourl.urlshortener.repository.ClickRepository;
import desafiourl.urlshortener.repository.UrlRepository;
import desafiourl.urlshortener.utils.IdGenerator;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;
    private final ValidationService validationService;
    private final IdGenerator idGenerator;
    private final AnalyticsService analyticsService;
    private final PlanService planService;
    private final UserService userService;

    @Value("${app.url.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.url.default-expiration-hours:24}")
    private int defaultExpirationHours;

    @Value("${app.rate-limit.requests-per-hour:100}")
    private int requestsPerHour;

    /**
     * 🎯 MÉTODO PRINCIPAL CORRIGIDO COM LOGGING DETALHADO
     *
     * Este método demonstra como usar logging de forma eficaz:
     * - log.info() para marcos importantes do fluxo
     * - log.warn() para situações que merecem atenção
     * - log.debug() para detalhes técnicos
     * - log.error() para erros (seria usado em catch blocks)
     */
    @Transactional
    public ShortenUrlResponse createShortUrl(ShortenUrlRequest request, String creatorIp) {
        log.info("Iniciando criação de URL curta. Original: {}", request.url());

        // 🔍 PASSO 1: Identificar se há usuário autenticado
        UserEntity currentUser = getCurrentUserIfAuthenticated();
        boolean isAuthenticated = (currentUser != null);

        log.info("Usuário autenticado: {} | User ID: {}",
                isAuthenticated, isAuthenticated ? currentUser.getId() : "N/A");

        // 🔍 PASSO 2: Validar URL de entrada
        String validatedUrl = validationService.validateAndNormalizeUrl(request.url());

        // 🔍 PASSO 3: Aplicar validações de plano (apenas para usuários autenticados)
        if (isAuthenticated) {
            log.info("Aplicando validações de plano para usuário: {}", currentUser.getUsername());

            // Verificar se pode criar URL baseado no plano
            userService.validateUrlCreation(currentUser);

            // Verificar se pode usar URL customizada
            if (request.customAlias() != null && !request.customAlias().trim().isEmpty()) {
                if (!planService.canUseCustomUrls(currentUser)) {
                    log.warn("Usuário {} tentou usar alias customizado sem permissão. Plano: {}",
                            currentUser.getUsername(), currentUser.getPlanType());
                    throw new IllegalArgumentException(
                            "URLs customizadas disponíveis apenas nos planos Premium e Empresarial. " +
                                    "Faça upgrade do seu plano para usar esta funcionalidade."
                    );
                }
            }
        } else {
            log.info("Usuário anônimo - aplicando validações básicas");

            // Para usuários anônimos, não permitir URLs customizadas
            if (request.customAlias() != null && !request.customAlias().trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "URLs customizadas disponíveis apenas para usuários cadastrados. " +
                                "Faça login ou crie uma conta para usar esta funcionalidade."
                );
            }
        }

        // 🔍 PASSO 4: Validar alias customizado se fornecido
        if (request.customAlias() != null && !request.customAlias().trim().isEmpty()) {
            validationService.validateCustomAlias(request.customAlias());
            if (urlRepository.findByCustomAlias(request.customAlias()).isPresent()) {
                throw new InvalidUrlException("Alias '" + request.customAlias() + "' já está em uso");
            }
        }

        // 🔍 PASSO 5: Verificar rate limiting
        // Para usuários autenticados, usar limite mais generoso
        if (isAuthenticated) {
            checkAuthenticatedUserRateLimit(currentUser.getId());
        } else {
            checkAnonymousRateLimit(creatorIp);
        }

        // 🔍 PASSO 6: Gerar ID único para a URL
        String urlId;
        if (request.customAlias() != null && !request.customAlias().trim().isEmpty()) {
            urlId = request.customAlias().trim();
            log.info("Usando alias customizado: {}", urlId);
        } else {
            // Gerar ID único
            do {
                urlId = idGenerator.generateId();
            } while (urlRepository.existsById(urlId));
            log.info("ID gerado automaticamente: {}", urlId);
        }

        // 🔍 PASSO 7: Definir tempo de expiração
        int hoursToExpire = request.expirationHours() != null ?
                request.expirationHours() : defaultExpirationHours;
        LocalDateTime expirationDate = LocalDateTime.now().plusHours(hoursToExpire);

        // 🔍 PASSO 8: Criar entidade URL com a estratégia correta
        UrlEntity urlEntity;
        if (isAuthenticated) {
            // 🎯 Usar construtor que associa ao usuário
            urlEntity = new UrlEntity(urlId, validatedUrl, request.customAlias(),
                    expirationDate, creatorIp, currentUser.getId());
            log.info("URL associada ao usuário autenticado: {} (ID: {})",
                    currentUser.getUsername(), currentUser.getId());
        } else {
            // 🎯 Usar construtor para usuário anônimo
            urlEntity = new UrlEntity(urlId, validatedUrl, request.customAlias(),
                    expirationDate, creatorIp);
            log.info("URL criada para usuário anônimo. IP: {}", creatorIp);
        }

        // 🔍 PASSO 9: Salvar no banco de dados
        urlEntity = urlRepository.save(urlEntity);
        log.info("URL salva com sucesso. ID: {} | Tipo: {}",
                urlEntity.getId(), urlEntity.getCreatorType());

        // 🔍 PASSO 10: Incrementar contador do usuário (se autenticado)
        if (isAuthenticated) {
            userService.incrementUserUrlCount(currentUser);
            log.info("Contador de URLs incrementado para usuário: {}. " +
                            "Total este mês: {}/{}",
                    currentUser.getUsername(),
                    currentUser.getCurrentMonthUrlCount() + 1,
                    currentUser.getMonthlyUrlLimit() == -1 ? "∞" : currentUser.getMonthlyUrlLimit());
        }

        // 🔍 PASSO 11: Construir resposta
        String shortUrl = baseUrl + "/" + urlEntity.getId();
        log.info("URL curta criada com sucesso: {}", shortUrl);

        return new ShortenUrlResponse(shortUrl);
    }

    /**
     * 🆕 Método auxiliar para buscar usuário atual de forma segura
     * Retorna null se não houver usuário autenticado (sem lançar exceção)
     */
    private UserEntity getCurrentUserIfAuthenticated() {
        try {
            return userService.getCurrentUserEntity();
        } catch (IllegalStateException e) {
            // Usuário não autenticado - retorna null
            log.debug("Usuário não autenticado: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 🆕 Rate limiting específico para usuários autenticados
     * Usuários autenticados têm limites mais generosos
     */
    private void checkAuthenticatedUserRateLimit(String userId) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentCount = urlRepository.countByUserIdAndCreatedAtAfter(userId, oneHourAgo);

        int authenticatedUserLimit = requestsPerHour * 2; // 2x o limite de usuários anônimos

        if (recentCount >= authenticatedUserLimit) {
            log.warn("Rate limit excedido para usuário autenticado: {} ({}/{})",
                    userId, recentCount, authenticatedUserLimit);
            throw new InvalidUrlException(
                    String.format("Limite de %d URLs por hora excedido. Tente novamente em alguns minutos.",
                            authenticatedUserLimit)
            );
        }
    }

    /**
     * 🆕 Rate limiting para usuários anônimos (método original adaptado)
     */
    private void checkAnonymousRateLimit(String creatorIp) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        // Contar apenas URLs anônimas (sem userId) deste IP
        long recentCount = urlRepository.countByCreatorIpAndUserIdIsNullAndCreatedAtAfter(creatorIp, oneHourAgo);

        if (recentCount >= requestsPerHour) {
            log.warn("Rate limit excedido para IP anônimo: {} ({}/{})",
                    creatorIp, recentCount, requestsPerHour);
            throw new InvalidUrlException(
                    String.format("Limite de %d URLs por hora excedido. " +
                                    "Crie uma conta para limites maiores ou tente novamente em alguns minutos.",
                            requestsPerHour)
            );
        }
    }

    /**
     * Processa redirecionamento da URL curta para a original
     */
    public String processRedirect(String id, String clientIp, String userAgent, String referer) {
        log.info("Processando redirecionamento para URL: {}", id);

        UrlEntity urlEntity = findActiveUrl(id);
        recordClick(urlEntity, clientIp, userAgent, referer);

        log.info("Redirecionamento processado com sucesso. URL destino: {}", urlEntity.getFullUrl());
        return urlEntity.getFullUrl();
    }

    /**
     * Obtém estatísticas de uma URL específica
     */
    public UrlStatsResponse getUrlStats(String id) {
        log.debug("Buscando estatísticas para URL: {}", id);

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

    /**
     * 🔄 MÉTODO ATUALIZADO: Busca URLs do usuário (agora suporta autenticados e anônimos)
     */
    public List<UrlStatsResponse> getUserUrls(String identifier, boolean isUserId) {
        log.info("Buscando URLs para {}: {}", isUserId ? "usuário" : "IP", identifier);

        List<UrlEntity> userUrls;

        if (isUserId) {
            // Buscar por ID do usuário (usuários autenticados)
            userUrls = urlRepository.findByUserIdOrderByCreatedAtDesc(identifier);
        } else {
            // Buscar por IP (usuários anônimos ou compatibilidade)
            userUrls = urlRepository.findByCreatorIpOrderByCreatedAtDesc(identifier);
        }

        log.info("Encontradas {} URLs para o {}: {}",
                userUrls.size(), isUserId ? "usuário" : "IP", identifier);

        return userUrls.stream()
                .map(this::buildUrlStatsResponse)
                .collect(Collectors.toList());
    }

    /**
     * 🆕 Método de conveniência para usuários autenticados
     */
    public List<UrlStatsResponse> getAuthenticatedUserUrls(String userId) {
        return getUserUrls(userId, true);
    }

    /**
     * 🆕 Método de conveniência para usuários anônimos
     */
    public List<UrlStatsResponse> getAnonymousUserUrls(String creatorIp) {
        return getUserUrls(creatorIp, false);
    }

    /**
     * Desativa uma URL
     */
    public void deactivateUrl(String id, String clientIp) {
        log.info("Tentativa de desativação da URL: {} pelo IP: {}", id, clientIp);

        UrlEntity urlEntity = findActiveUrl(id);
        UserEntity currentUser = getCurrentUserIfAuthenticated();
        validateOwnership(urlEntity, clientIp, currentUser);

        urlEntity.setActive(false);
        urlRepository.save(urlEntity);

        log.info("URL desativada com sucesso: {}", id);
    }

    /**
     * Atualiza metadados de uma URL
     */
    public UrlStatsResponse updateUrlMetadata(String id, UpdateUrlMetadataRequest request, String clientIp) {
        log.info("Atualizando metadados da URL: {}", id);

        UrlEntity urlEntity = findActiveUrl(id);
        UserEntity currentUser = getCurrentUserIfAuthenticated();
        validateOwnership(urlEntity, clientIp, currentUser);

        urlEntity.setTitle(request.title());
        urlEntity.setDescription(request.description());
        UrlEntity updatedEntity = urlRepository.save(urlEntity);

        log.info("Metadados atualizados para URL: {}", id);

        return buildUrlStatsResponse(updatedEntity);
    }

    /**
     * 🔄 Método de validação de ownership atualizado
     * Agora suporta tanto usuários autenticados quanto anônimos
     */
    private void validateOwnership(UrlEntity urlEntity, String clientIp, UserEntity currentUser) {
        if (currentUser != null) {
            // Usuário autenticado - verificar se a URL pertence a ele
            if (!urlEntity.belongsToUser(currentUser.getId())) {
                log.warn("Usuário {} tentou acessar URL {} que não lhe pertence",
                        currentUser.getUsername(), urlEntity.getId());
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Você não tem permissão para acessar esta URL");
            }
        } else {
            // Usuário anônimo - verificar por IP (método original)
            if (!urlEntity.isAnonymous() || !urlEntity.getCreatorIp().equals(clientIp)) {
                log.warn("IP {} tentou acessar URL {} sem permissão", clientIp, urlEntity.getId());
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
            }
        }
    }

    /**
     * Deleta uma URL permanentemente
     */
    public void deleteUrl(String id, String clientIp) {
        log.info("Tentativa de exclusão da URL: {} pelo IP: {}", id, clientIp);

        UrlEntity urlEntity = findActiveUrl(id);
        UserEntity currentUser = getCurrentUserIfAuthenticated();
        validateOwnership(urlEntity, clientIp, currentUser);

        urlRepository.delete(urlEntity);

        log.info("URL excluída com sucesso: {}", id);
    }

    /**
     * Encontra uma URL ativa pelo ID
     */
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

    /**
     * Registra um clique na URL
     */
    private void recordClick(UrlEntity urlEntity, String ipAddress, String userAgent, String referer) {
        log.debug("Registrando clique na URL: {} do IP: {}", urlEntity.getId(), ipAddress);

        // Incrementar contador de cliques
        urlEntity.incrementClickCount();
        urlRepository.save(urlEntity);

        // Registrar analytics detalhadas
        analyticsService.recordClick(urlEntity.getId(), ipAddress, userAgent, referer);
    }

    /**
     * 🆕 Método auxiliar para construir resposta de estatísticas
     */
    private UrlStatsResponse buildUrlStatsResponse(UrlEntity urlEntity) {
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
    }

    // 📝 MÉTODOS LEGADOS MANTIDOS PARA COMPATIBILIDADE
    // Estes métodos ainda funcionam, mas recomendo migrar para os novos

    /**
     * @deprecated Use checkAnonymousRateLimit() em vez deste método
     */
    @Deprecated
    private void checkRateLimit(String creatorIp) {
        checkAnonymousRateLimit(creatorIp);
    }

    /**
     * @deprecated Use validateOwnership(urlEntity, clientIp, currentUser) em vez deste método
     */
    @Deprecated
    private void validateOwnership(UrlEntity urlEntity, String clientIp) {
        validateOwnership(urlEntity, clientIp, null);
    }
}