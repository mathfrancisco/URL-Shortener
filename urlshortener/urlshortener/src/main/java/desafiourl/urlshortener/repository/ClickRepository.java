package desafiourl.urlshortener.repository;

import desafiourl.urlshortener.entities.ClickEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface ClickRepository extends MongoRepository<ClickEntity, String> {

    List<ClickEntity> findByUrlIdOrderByClickedAtDesc(String urlId);

    @Query("{'urlId': ?0, 'clickedAt': {$gte: ?1, $lte: ?2}}")
    List<ClickEntity> findByUrlIdAndClickedAtBetween(String urlId, LocalDateTime start, LocalDateTime end);

    long countByUrlId(String urlId);

    @Query(value = "{'urlId': ?0}", fields = "{'country': 1}")
    List<ClickEntity> findCountriesByUrlId(String urlId);

    @Query(value = "{'urlId': ?0}", fields = "{'referer': 1}")
    List<ClickEntity> findReferersByUrlId(String urlId);

    @Query("{'clickedAt': {$gte: ?0}}")
    List<ClickEntity> findRecentClicks(LocalDateTime since);
}
