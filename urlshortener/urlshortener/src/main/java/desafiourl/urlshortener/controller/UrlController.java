package desafiourl.urlshortener.controller;

import desafiourl.urlshortener.entities.dto.request.ShortenUrlRequest;
import desafiourl.urlshortener.entities.dto.response.ShortenUrlResponse;
import desafiourl.urlshortener.entities.dto.request.UpdateUrlMetadataRequest;
import desafiourl.urlshortener.entities.dto.response.UrlStatsResponse;
import desafiourl.urlshortener.service.UrlService;
import desafiourl.urlshortener.exception.UrlNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.ArraySchema;

import java.net.URI;
import java.util.List;

@RestController
@Tag(name = "URL Management", description = "APIs para criar, gerenciar e redirecionar URLs encurtadas")
public class UrlController {

    @Autowired
    private UrlService urlService;

    @Operation(
            summary = "Encurtar URL",
            description = "Cria uma versão encurtada de uma URL longa com opções de customização e expiração"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL encurtada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ShortenUrlResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
                    content = @Content),
            @ApiResponse(responseCode = "409", description = "Alias customizado já existe",
                    content = @Content)
    })
    @PostMapping("/url/shorten")
    public ResponseEntity<ShortenUrlResponse> shortenUrl(
            @Parameter(description = "Dados para criação da URL encurtada", required = true)
            @Valid @RequestBody ShortenUrlRequest request,
            HttpServletRequest servletRequest) {

        String clientIp = getClientIpAddress(servletRequest);

        ShortenUrlResponse response = urlService.createShortUrl(
                request.url(),
                request.customAlias(),
                request.expirationHours(),
                clientIp
        );

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Redirecionar URL",
            description = "Redireciona para a URL original usando o ID da URL encurtada e registra o clique"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "302", description = "Redirecionamento realizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada ou expirada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Void> redirectUrl(
            @Parameter(description = "ID da URL encurtada", required = true, example = "abc123")
            @PathVariable String id,
            HttpServletRequest request) {

        try {
            String clientIp = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            String referer = request.getHeader("Referer");

            String redirectUrl = urlService.processRedirect(id, clientIp, userAgent, referer);

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(redirectUrl));

            return ResponseEntity.status(HttpStatus.FOUND).headers(headers).build();

        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro no redirecionamento para ID: " + id + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Obter estatísticas da URL",
            description = "Retorna estatísticas básicas de uma URL específica"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estatísticas obtidas com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UrlStatsResponse.class))),
            @ApiResponse(responseCode = "404", description = "URL não encontrada")
    })
    @GetMapping("/url/{id}/stats")
    public ResponseEntity<UrlStatsResponse> getUrlStats(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id) {
        try {
            UrlStatsResponse stats = urlService.getUrlStats(id);
            return ResponseEntity.ok(stats);
        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Listar URLs do usuário",
            description = "Retorna todas as URLs criadas pelo usuário atual (baseado no IP)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de URLs obtida com sucesso",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = UrlStatsResponse.class))))
    })
    @GetMapping("/url/urls")
    public ResponseEntity<List<UrlStatsResponse>> getUserUrls(HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);
        List<UrlStatsResponse> statsResponses = urlService.getUserUrls(clientIp);
        return ResponseEntity.ok(statsResponses);
    }

    @Operation(
            summary = "Desativar URL",
            description = "Desativa uma URL, impedindo novos redirecionamentos"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL desativada com sucesso"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada"),
            @ApiResponse(responseCode = "403", description = "Não autorizado - URL não pertence ao usuário")
    })
    @PutMapping("/url/{id}/deactivate")
    public ResponseEntity<Void> deactivateUrl(
            @Parameter(description = "ID da URL para desativar", required = true, example = "abc123")
            @PathVariable String id,
            HttpServletRequest request) {

        try {
            String clientIp = getClientIpAddress(request);
            urlService.deactivateUrl(id, clientIp);
            return ResponseEntity.ok().build();
        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Atualizar metadados da URL",
            description = "Atualiza título e descrição de uma URL"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Metadados atualizados com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UrlStatsResponse.class))),
            @ApiResponse(responseCode = "404", description = "URL não encontrada"),
            @ApiResponse(responseCode = "403", description = "Não autorizado - URL não pertence ao usuário")
    })
    @PutMapping("/url/{id}/metadata")
    public ResponseEntity<UrlStatsResponse> updateUrlMetadata(
            @Parameter(description = "ID da URL", required = true, example = "abc123")
            @PathVariable String id,
            @Parameter(description = "Novos metadados da URL", required = true)
            @RequestBody UpdateUrlMetadataRequest request,
            HttpServletRequest servletRequest) {

        try {
            String clientIp = getClientIpAddress(servletRequest);
            UrlStatsResponse stats = urlService.updateUrlMetadata(id, request, clientIp);
            return ResponseEntity.ok(stats);
        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Deletar URL",
            description = "Remove permanentemente uma URL do sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "URL deletada com sucesso"),
            @ApiResponse(responseCode = "404", description = "URL não encontrada"),
            @ApiResponse(responseCode = "403", description = "Não autorizado - URL não pertence ao usuário")
    })
    @DeleteMapping("/url/{id}")
    public ResponseEntity<Void> deleteUrl(
            @Parameter(description = "ID da URL para deletar", required = true, example = "abc123")
            @PathVariable String id,
            HttpServletRequest request) {

        try {
            String clientIp = getClientIpAddress(request);
            urlService.deleteUrl(id, clientIp);
            return ResponseEntity.noContent().build();
        } catch (UrlNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }
}