package desafiourl.urlshortener.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "URL Shortener API",
                version = "1.0.0",
                description = "API para encurtar URLs com sistema de analytics completo",
                contact = @Contact(
                        name = "URL Shortener Team",
                        email = "contato@urlshortener.com"
                ),
                license = @License(
                        name = "MIT License",
                        url = "https://opensource.org/license/mit"
                )
        ),
        servers = {
                @Server(
                        url = "http://localhost:8080",
                        description = "Servidor de Desenvolvimento"
                ),
                @Server(
                        url = "https://api.urlshortener.com",
                        description = "Servidor de Produção"
                )
        },
        tags = {
                @Tag(name = "URL Management", description = "Operações de gerenciamento de URLs"),
                @Tag(name = "Analytics", description = "Operações de analytics e estatísticas"),
                @Tag(name = "System", description = "Operações do sistema")
        }
)
public class OpenAPIConfig {
}