package desafiourl.urlshortener.entities;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Setter
@Getter
@Document(collection = "urls")
public class UrlEntity {
    // Getters and Setters
    @Id
    private String id;
    private String fullUrl;
    private String customAlias;
    private LocalDateTime createdAt;
    @Indexed(expireAfter = "0")
    private LocalDateTime expirationDate;
    private String creatorIp;
    private boolean isActive;
    private long clickCount;
    private String title;
    private String description;

    public UrlEntity() {
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
        this.clickCount = 0;
    }

    public UrlEntity(String id, String fullUrl, LocalDateTime expirationDate) {
        this();
        this.id = id;
        this.fullUrl = fullUrl;
        this.expirationDate = expirationDate;
    }

    public UrlEntity(String id, String fullUrl, String customAlias, LocalDateTime expirationDate, String creatorIp) {
        this();
        this.id = id;
        this.fullUrl = fullUrl;
        this.customAlias = customAlias;
        this.expirationDate = expirationDate;
        this.creatorIp = creatorIp;
    }

    public void incrementClickCount() {
        this.clickCount++;
    }
}