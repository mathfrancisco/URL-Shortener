package desafiourl.urlshortener.repository;

import desafiourl.urlshortener.entities.ClickEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickRepository extends MongoRepository<ClickEntity, String> {

    // ========== CONSULTAS BÁSICAS EXISTENTES ==========

    /**
     * Busca cliques de uma URL ordenados por data (mais recente primeiro)
     */
    List<ClickEntity> findByUrlIdOrderByClickedAtDesc(String urlId);

    /**
     * Busca cliques de uma URL em período específico
     */
    List<ClickEntity> findByUrlIdAndClickedAtBetween(String urlId, LocalDateTime startDate, LocalDateTime endDate);

    // ========== 🆕 CONSULTAS ESPECÍFICAS PARA ANALYTICS (RESOLVENDO DEPENDÊNCIAS) ==========

    /**
     * 🎯 MÉTODO PARA GEOLOCALIZAÇÃO: Busca cliques com dados de país
     * Usado no método getGeographicStats() do AnalyticsService
     */
    @Query("{'urlId': ?0}")
    List<ClickEntity> findCountriesByUrlId(String urlId);

    /**
     * 🎯 MÉTODO PARA REFERRERS: Busca cliques com dados de referrer
     * Usado no método getReferrerStats() do AnalyticsService
     */
    @Query("{'urlId': ?0}")
    List<ClickEntity> findReferersByUrlId(String urlId);

    /**
     * 🎯 MÉTODO PARA SISTEMA: Busca cliques recentes (para dashboard geral)
     * Usado no método getSystemStats() do AnalyticsService
     */
    @Query("{'clickedAt': {$gte: ?0}}")
    List<ClickEntity> findRecentClicks(LocalDateTime since);

    // ========== CONSULTAS PARA ANALYTICS AVANÇADAS ==========

    /**
     * Conta cliques únicos por IP (visitantes únicos)
     */
    @Query("{'urlId': ?0}")
    List<ClickEntity> findUniqueVisitorsByUrlId(String urlId);

    /**
     * Busca cliques por país específico
     */
    @Query("{'urlId': ?0, 'country': ?1}")
    List<ClickEntity> findByUrlIdAndCountry(String urlId, String country);

    /**
     * Busca cliques por cidade específica
     */
    @Query("{'urlId': ?0, 'city': ?1}")
    List<ClickEntity> findByUrlIdAndCity(String urlId, String city);

    /**
     * Busca cliques de um referrer específico
     */
    @Query("{'urlId': ?0, 'referer': {$regex: ?1, $options: 'i'}}")
    List<ClickEntity> findByUrlIdAndRefererContaining(String urlId, String refererPattern);

    /**
     * Busca cliques em horário específico (para análise de picos)
     */
    @Query("{'urlId': ?0, 'clickedAt': {$gte: ?1, $lte: ?2}}")
    List<ClickEntity> findByUrlIdAndTimeRange(String urlId, LocalDateTime startHour, LocalDateTime endHour);

    // ========== CONSULTAS PARA DASHBOARD DO USUÁRIO ==========

    /**
     * Busca cliques recentes de todas as URLs de um usuário
     * Útil para dashboard personalizado
     */
    @Query("{'urlId': {$in: ?0}, 'clickedAt': {$gte: ?1}}")
    List<ClickEntity> findRecentClicksForUserUrls(List<String> urlIds, LocalDateTime since);

    /**
     * Conta total de cliques de todas as URLs de um usuário
     */
    @Query("{'urlId': {$in: ?0}}")
    List<ClickEntity> findClicksForUserUrls(List<String> urlIds);

    // ========== CONSULTAS PARA PERFORMANCE E OTIMIZAÇÃO ==========

    /**
     * Busca apenas IPs únicos para cálculo de visitantes únicos (otimizado)
     */
    @Query(value = "{'urlId': ?0}", fields = "{'ipAddress': 1}")
    List<ClickEntity> findDistinctIpsByUrlId(String urlId);

    /**
     * Busca apenas dados de geolocalização (otimizado)
     */
    @Query(value = "{'urlId': ?0, 'country': {$ne: null}}", fields = "{'country': 1, 'city': 1}")
    List<ClickEntity> findGeoDataByUrlId(String urlId);

    /**
     * Busca apenas User-Agents para análise de dispositivos (otimizado)
     */
    @Query(value = "{'urlId': ?0, 'userAgent': {$ne: null}}", fields = "{'userAgent': 1}")
    List<ClickEntity> findUserAgentsByUrlId(String urlId);

    // ========== CONSULTAS ADMINISTRATIVAS ==========

    /**
     * Remove cliques antigos (para limpeza de dados)
     */
    @Query("{'clickedAt': {$lt: ?0}}")
    List<ClickEntity> findOldClicks(LocalDateTime olderThan);

    /**
     * Conta cliques por período (para relatórios administrativos)
     */
    @Query(value = "{'clickedAt': {$gte: ?0, $lte: ?1}}", count = true)
    long countClicksBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Busca cliques suspeitos (mesmo IP, muitos cliques em pouco tempo)
     */
    @Query("{'urlId': ?0, 'ipAddress': ?1, 'clickedAt': {$gte: ?2}}")
    List<ClickEntity> findSuspiciousClicks(String urlId, String ipAddress, LocalDateTime since);
}