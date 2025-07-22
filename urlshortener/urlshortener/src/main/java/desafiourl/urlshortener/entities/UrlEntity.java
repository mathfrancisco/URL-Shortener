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

    @Id
    private String id;

    private String fullUrl;

    private String customAlias;

    private LocalDateTime createdAt;

    @Indexed(expireAfter = "0")
    private LocalDateTime expirationDate;

    private String creatorIp;

    // 🆕 NOVO CAMPO: ID do usuário que criou a URL
    // Pode ser null para URLs criadas por usuários anônimos (antes da autenticação)
    @Indexed // Índice para consultas rápidas por usuário
    private String userId;

    private boolean isActive;

    private long clickCount;

    private String title;

    private String description;

    // 🆕 NOVO CAMPO: Flag para identificar se foi criada por usuário autenticado
    private boolean isAuthenticatedUser;

    /**
     * Construtor padrão - mantém compatibilidade com código existente
     */
    public UrlEntity() {
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
        this.clickCount = 0;
        this.isAuthenticatedUser = false; // Por padrão, assume usuário anônimo
    }

    /**
     * Construtor existente - mantém compatibilidade total
     * URLs criadas assim serão consideradas de usuários anônimos
     */
    public UrlEntity(String id, String fullUrl, String customAlias, LocalDateTime expirationDate, String creatorIp) {
        this();
        this.id = id;
        this.fullUrl = fullUrl;
        this.customAlias = customAlias;
        this.expirationDate = expirationDate;
        this.creatorIp = creatorIp;
        // userId fica null (usuário anônimo)
        this.isAuthenticatedUser = false;
    }

    /**
     * 🆕 NOVO CONSTRUTOR: Para URLs criadas por usuários autenticados
     * Este construtor associa a URL a um usuário específico
     */
    public UrlEntity(String id, String fullUrl, String customAlias, LocalDateTime expirationDate,
                     String creatorIp, String userId) {
        this();
        this.id = id;
        this.fullUrl = fullUrl;
        this.customAlias = customAlias;
        this.expirationDate = expirationDate;
        this.creatorIp = creatorIp;
        this.userId = userId; // 🎯 Aqui está a associação com o usuário
        this.isAuthenticatedUser = (userId != null); // Se tem userId, é usuário autenticado
    }

    /**
     * Incrementa contador de cliques
     */
    public void incrementClickCount() {
        this.clickCount++;
    }

    /**
     * 🆕 Verifica se esta URL pertence a um usuário específico
     * Útil para validações de ownership
     */
    public boolean belongsToUser(String userId) {
        return this.userId != null && this.userId.equals(userId);
    }

    /**
     * 🆕 Verifica se esta URL foi criada por usuário autenticado
     */
    public boolean isCreatedByAuthenticatedUser() {
        return this.userId != null && this.isAuthenticatedUser;
    }

    /**
     * 🆕 Verifica se esta URL foi criada anonimamente
     */
    public boolean isAnonymous() {
        return this.userId == null;
    }

    /**
     * 🆕 Método para associar URL existente a um usuário
     * Útil para migração de dados ou casos especiais
     */
    public void associateToUser(String userId) {
        this.userId = userId;
        this.isAuthenticatedUser = true;
    }

    /**
     * 🆕 Obtém identificador do criador (userId se autenticado, senão IP)
     * Útil para logs e análises
     */
    public String getCreatorIdentifier() {
        return isCreatedByAuthenticatedUser() ? userId : creatorIp;
    }

    /**
     * 🆕 Obtém tipo do criador para logs
     */
    public String getCreatorType() {
        return isCreatedByAuthenticatedUser() ? "AUTHENTICATED" : "ANONYMOUS";
    }
}