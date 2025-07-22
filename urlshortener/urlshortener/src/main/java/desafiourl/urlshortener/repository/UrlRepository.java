package desafiourl.urlshortener.repository;

import desafiourl.urlshortener.entities.UrlEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends MongoRepository<UrlEntity, String> {

    // ========== CONSULTAS BÁSICAS EXISTENTES ==========

    /**
     * Busca URL por alias customizado
     */
    Optional<UrlEntity> findByCustomAlias(String customAlias);

    /**
     * Conta URLs criadas por IP específico após determinada data
     */
    long countByCreatorIpAndCreatedAtAfter(String creatorIp, LocalDateTime date);

    /**
     * Busca URLs por IP do criador ordenadas por data
     */
    List<UrlEntity> findByCreatorIpOrderByCreatedAtDesc(String creatorIp);

    // ========== CONSULTAS PARA USUÁRIOS AUTENTICADOS ==========

    /**
     * Busca todas as URLs de um usuário específico
     */
    List<UrlEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Conta quantas URLs um usuário criou após determinada data
     */
    long countByUserIdAndCreatedAtAfter(String userId, LocalDateTime date);

    /**
     * Busca URLs ativas de um usuário específico
     */
    List<UrlEntity> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(String userId);

    /**
     * Conta URLs ativas de um usuário
     */
    long countByUserIdAndIsActiveTrue(String userId);

    // ========== 🆕 CONSULTAS PARA ANALYTICS (RESOLVENDO O ERRO) ==========

    /**
     * 🎯 MÉTODO QUE ESTAVA FALTANDO: Busca URLs ativas que não expiraram
     * Este método resolve o erro de compilação no AnalyticsService
     */
    @Query("{'isActive': true, 'expirationDate': {$gte: ?0}}")
    List<UrlEntity> findActiveUrls(LocalDateTime currentDateTime);

    /**
     * Conta URLs ativas que não expiraram (versão otimizada para contagem)
     */
    @Query(value = "{'isActive': true, 'expirationDate': {$gte: ?0}}", count = true)
    long countActiveUrls(LocalDateTime currentDateTime);

    /**
     * Busca URLs mais populares (ordenadas por cliques)
     * Útil para analytics de "top URLs"
     */
    @Query("{'isActive': true}")
    List<UrlEntity> findTopUrlsByClicks(org.springframework.data.domain.Pageable pageable);

    /**
     * Busca URLs criadas em período específico
     * Fundamental para relatórios temporais
     */
    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
    List<UrlEntity> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Conta URLs criadas por período
     */
    @Query(value = "{'createdAt': {$gte: ?0, $lte: ?1}}", count = true)
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Busca URLs que expiram em período específico
     */
    @Query("{'expirationDate': {$gte: ?0, $lte: ?1}, 'isActive': true}")
    List<UrlEntity> findByExpirationDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // ========== CONSULTAS PARA USUÁRIOS ANÔNIMOS ==========

    /**
     * Conta URLs anônimas (sem userId) criadas por IP após determinada data
     */
    @Query("{'creatorIp': ?0, 'userId': null, 'createdAt': {$gte: ?1}}")
    long countByCreatorIpAndUserIdIsNullAndCreatedAtAfter(String creatorIp, LocalDateTime date);

    /**
     * Busca URLs anônimas por IP
     */
    @Query("{'creatorIp': ?0, 'userId': null}")
    List<UrlEntity> findAnonymousUrlsByCreatorIp(String creatorIp);

    // ========== CONSULTAS PARA DASHBOARD E ESTATÍSTICAS ==========

    /**
     * Busca URLs de um usuário com mais cliques (para dashboard)
     */
    @Query("{'userId': ?0, 'isActive': true}")
    List<UrlEntity> findTopUrlsByUserOrderByClicks(String userId,
                                                   org.springframework.data.domain.Pageable pageable);

    /**
     * Busca URLs recentes de um usuário (para "recent activity")
     */
    @Query("{'userId': ?0, 'createdAt': {$gte: ?1}}")
    List<UrlEntity> findRecentUrlsByUser(String userId, LocalDateTime since);

    /**
     * Conta total de cliques de todas as URLs de um usuário
     * Útil para estatísticas agregadas
     */
    @Query("{'userId': ?0}")
    List<UrlEntity> findUrlsForTotalClickCount(String userId);

    // ========== CONSULTAS ADMINISTRATIVAS ==========

    /**
     * Busca URLs que precisam de limpeza (inativas e antigas)
     */
    @Query("{'isActive': false, 'createdAt': {$lt: ?0}}")
    List<UrlEntity> findInactiveOldUrls(LocalDateTime olderThan);

    /**
     * Busca URLs expiradas
     */
    @Query("{'expirationDate': {$lt: ?0}}")
    List<UrlEntity> findExpiredUrls(LocalDateTime currentDateTime);

    /**
     * Estatísticas por tipo de plano (para admin)
     */
    @Query("{'userId': {$ne: null}}")
    List<UrlEntity> findAllAuthenticatedUrls();

    /**
     * Busca URLs sem interação (zero cliques) criadas há mais de X dias
     */
    @Query("{'clickCount': 0, 'createdAt': {$lt: ?0}}")
    List<UrlEntity> findUnusedOldUrls(LocalDateTime olderThan);
}