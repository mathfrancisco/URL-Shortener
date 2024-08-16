package desafiourl.urlshortener.repository;


import desafiourl.urlshortener.entities.UrlEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UrlRepository extends MongoRepository<UrlEntity,String> {
}
