package desafiourl.urlshortener.repository;

import desafiourl.urlshortener.entities.UserEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<UserEntity, String> {

    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByUsernameOrEmail(String username, String email);

    Optional<UserEntity> findByEmailVerificationToken(String token);

    Optional<UserEntity> findByPasswordResetToken(String token);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    List<UserEntity> findByActiveTrue();

    List<UserEntity> findByEmailVerifiedFalse();

    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
    List<UserEntity> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'planType': ?0}")
    List<UserEntity> findByPlanType(String planType);

    @Query("{'planExpiresAt': {$lt: ?0}}")
    List<UserEntity> findExpiredSubscriptions(LocalDateTime now);

    @Query("{'lockoutUntil': {$lt: ?0}}")
    List<UserEntity> findUsersToUnlock(LocalDateTime now);

    long countByActiveTrue();

    long countByEmailVerifiedTrue();

    long countByPlanType(String planType);
}