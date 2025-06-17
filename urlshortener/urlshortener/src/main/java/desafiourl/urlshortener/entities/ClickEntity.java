package desafiourl.urlshortener.entities;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "clicks")
@Setter
@Getter
public class ClickEntity {
    // Getters and Setters
    @Id
    private String id;
    private String urlId;
    private LocalDateTime clickedAt;
    private String ipAddress;
    private String userAgent;
    private String referer;
    private String country;
    private String city;

    public ClickEntity() {
        this.clickedAt = LocalDateTime.now();
    }

    public ClickEntity(String urlId, String ipAddress, String userAgent, String referer) {
        this();
        this.urlId = urlId;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.referer = referer;
    }

}
