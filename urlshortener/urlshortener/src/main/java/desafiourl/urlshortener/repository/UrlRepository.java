package desafiourl.urlshortener.repository;


import desafiourl.urlshortener.entities.UrlEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UrlRepository extends MongoRepository<UrlEntity, String> {

    Optional<UrlEntity> findByCustomAlias(String customAlias);

    List<UrlEntity> findByCreatorIpOrderByCreatedAtDesc(String creatorIp);

    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
    List<UrlEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("{'isActive': true, 'expirationDate': {$gt: ?0}}")
    List<UrlEntity> findActiveUrls(LocalDateTime now);

    long countByCreatorIpAndCreatedAtAfter(String creatorIp, LocalDateTime after);

    @Query("{'clickCount': {$gt: 0}}")
    List<UrlEntity> findUrlsWithClicks();
}

