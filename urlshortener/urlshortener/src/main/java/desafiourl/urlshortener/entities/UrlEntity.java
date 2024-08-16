package desafiourl.urlshortener.entities;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "urls")

public class UrlEntity {
    @Id
    private String id;

    private String fullurl;

    @Indexed(expireAfterSeconds = 0)
    private LocalDateTime expirationDate;

    public UrlEntity() {
    }

    public UrlEntity(String id, String fullurl, LocalDateTime expirationDate) {
        this.id = id;
        this.fullurl = fullurl;
        this.expirationDate = expirationDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullurl() {
        return fullurl;
    }

    public void setFullurl(String fullurl) {
        this.fullurl = fullurl;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }
}
