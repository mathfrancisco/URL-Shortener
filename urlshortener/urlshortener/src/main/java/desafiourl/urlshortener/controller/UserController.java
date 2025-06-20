package desafiourl.urlshortener.controller;

import desafiourl.urlshortener.entities.UserEntity;
import desafiourl.urlshortener.entities.dto.request.*;
import desafiourl.urlshortener.entities.dto.response.*;
import desafiourl.urlshortener.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.ArraySchema;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "User Management", description = "APIs para gerenciamento de usuários, autenticação e perfil")
public class UserController {

    private final UserService userService;

    // ========== AUTH ENDPOINTS ==========

    @Operation(
            summary = "Registrar novo usuário",
            description = "Cria uma nova conta de usuário no sistema com validação de dados e envio de email de verificação"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário registrado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou usuário já existe",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(
            @Parameter(description = "Dados para registro do usuário", required = true)
            @Valid @RequestBody RegisterRequest request,
            BindingResult result,
            HttpServletRequest httpRequest) {

        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("Dados inválidos: " + errors, "VALIDATION_ERROR", 400, httpRequest.getRequestURI()));
        }

        try {
            AuthResponse response = userService.register(request);
            log.info("Usuário registrado com sucesso: {}", request.username());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Erro no registro: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(e.getMessage(), "REGISTRATION_ERROR", 400, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno no registro: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Fazer login",
            description = "Autentica um usuário no sistema usando username/email e senha"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(
            @Parameter(description = "Credenciais de login", required = true)
            @Valid @RequestBody LoginRequest request,
            BindingResult result,
            HttpServletRequest httpRequest) {

        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("Dados inválidos: " + errors, "VALIDATION_ERROR", 400, httpRequest.getRequestURI()));
        }

        try {
            AuthResponse response = userService.login(request);
            log.info("Login realizado com sucesso para: {}", request.usernameOrEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Erro no login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.of(e.getMessage(), "AUTHENTICATION_ERROR", 401, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno no login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Verificar email",
            description = "Verifica o endereço de email do usuário usando o token enviado por email"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email verificado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SuccessResponse.class))),
            @ApiResponse(responseCode = "400", description = "Token inválido ou dados incorretos",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/auth/verify-email")
    public ResponseEntity<?> verifyEmail(
            @Parameter(description = "Token de verificação de email", required = true)
            @Valid @RequestBody EmailVerificationRequest request,
            BindingResult result,
            HttpServletRequest httpRequest) {

        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("Dados inválidos: " + errors, "VALIDATION_ERROR", 400, httpRequest.getRequestURI()));
        }

        try {
            userService.verifyEmail(request);
            return ResponseEntity.ok(new SuccessResponse("Email verificado com sucesso"));
        } catch (IllegalArgumentException e) {
            log.error("Erro na verificação de email: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(e.getMessage(), "EMAIL_VERIFICATION_ERROR", 400, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno na verificação de email: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Reenviar verificação de email",
            description = "Reenvia o email de verificação para o usuário autenticado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email de verificação reenviado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SuccessResponse.class))),
            @ApiResponse(responseCode = "400", description = "Email já verificado ou erro na operação",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/auth/resend-verification")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> resendEmailVerification(HttpServletRequest httpRequest) {
        try {
            userService.resendEmailVerification();
            return ResponseEntity.ok(new SuccessResponse("Email de verificação reenviado"));
        } catch (IllegalStateException e) {
            log.error("Erro ao reenviar verificação: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(e.getMessage(), "RESEND_VERIFICATION_ERROR", 400, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno ao reenviar verificação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Esqueci minha senha",
            description = "Envia um email com instruções para redefinir a senha"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email de recuperação enviado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SuccessResponse.class))),
            @ApiResponse(responseCode = "400", description = "Email não encontrado ou dados inválidos",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/auth/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Parameter(description = "Email para recuperação de senha", required = true)
            @Valid @RequestBody ForgotPasswordRequest request,
            BindingResult result,
            HttpServletRequest httpRequest) {

        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("Dados inválidos: " + errors, "VALIDATION_ERROR", 400, httpRequest.getRequestURI()));
        }

        try {
            userService.forgotPassword(request);
            return ResponseEntity.ok(new SuccessResponse("Email de recuperação enviado"));
        } catch (IllegalArgumentException e) {
            log.error("Erro na recuperação de senha: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(e.getMessage(), "FORGOT_PASSWORD_ERROR", 400, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno na recuperação de senha: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Redefinir senha",
            description = "Redefine a senha do usuário usando o token de recuperação"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Senha alterada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SuccessResponse.class))),
            @ApiResponse(responseCode = "400", description = "Token inválido, expirado ou senhas não coincidem",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/auth/reset-password")
    public ResponseEntity<?> resetPassword(
            @Parameter(description = "Dados para redefinição de senha", required = true)
            @Valid @RequestBody ResetPasswordRequest request,
            BindingResult result,
            HttpServletRequest httpRequest) {

        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("Dados inválidos: " + errors, "VALIDATION_ERROR", 400, httpRequest.getRequestURI()));
        }

        try {
            userService.resetPassword(request);
            return ResponseEntity.ok(new SuccessResponse("Senha alterada com sucesso"));
        } catch (IllegalArgumentException e) {
            log.error("Erro no reset de senha: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(e.getMessage(), "RESET_PASSWORD_ERROR", 400, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno no reset de senha: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    // ========== USER PROFILE ENDPOINTS ==========

    @Operation(
            summary = "Obter perfil do usuário",
            description = "Retorna as informações do perfil do usuário autenticado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil obtido com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserProfileResponse.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/user/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserProfile(HttpServletRequest httpRequest) {
        try {
            UserProfileResponse profile = userService.getUserProfile();
            return ResponseEntity.ok(profile);
        } catch (IllegalStateException e) {
            log.error("Erro ao buscar perfil: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.of(e.getMessage(), "UNAUTHORIZED", 401, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno ao buscar perfil: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Atualizar perfil do usuário",
            description = "Atualiza as informações do perfil do usuário autenticado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserProfileResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/user/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(
            @Parameter(description = "Dados para atualização do perfil", required = true)
            @Valid @RequestBody UpdateProfileRequest request,
            BindingResult result,
            HttpServletRequest httpRequest) {

        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("Dados inválidos: " + errors, "VALIDATION_ERROR", 400, httpRequest.getRequestURI()));
        }

        try {
            UserProfileResponse profile = userService.updateProfile(request);
            return ResponseEntity.ok(profile);
        } catch (IllegalStateException e) {
            log.error("Erro ao atualizar perfil: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.of(e.getMessage(), "UNAUTHORIZED", 401, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno ao atualizar perfil: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Alterar senha",
            description = "Altera a senha do usuário autenticado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Senha alterada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SuccessResponse.class))),
            @ApiResponse(responseCode = "400", description = "Senha atual incorreta ou senhas não coincidem",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/user/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(
            @Parameter(description = "Dados para alteração de senha", required = true)
            @Valid @RequestBody ChangePasswordRequest request,
            BindingResult result,
            HttpServletRequest httpRequest) {

        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("Dados inválidos: " + errors, "VALIDATION_ERROR", 400, httpRequest.getRequestURI()));
        }

        try {
            userService.changePassword(request);
            return ResponseEntity.ok(new SuccessResponse("Senha alterada com sucesso"));
        } catch (IllegalArgumentException e) {
            log.error("Erro ao alterar senha: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(e.getMessage(), "CHANGE_PASSWORD_ERROR", 400, httpRequest.getRequestURI()));
        } catch (IllegalStateException e) {
            log.error("Erro ao alterar senha: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.of(e.getMessage(), "UNAUTHORIZED", 401, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno ao alterar senha: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Obter estatísticas do usuário",
            description = "Retorna estatísticas de uso do usuário autenticado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estatísticas obtidas com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserStatsResponse.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/user/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserStats(HttpServletRequest httpRequest) {
        try {
            UserStatsResponse stats = userService.getUserStats();
            return ResponseEntity.ok(stats);
        } catch (IllegalStateException e) {
            log.error("Erro ao buscar estatísticas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.of(e.getMessage(), "UNAUTHORIZED", 401, httpRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Erro interno ao buscar estatísticas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    @Operation(
            summary = "Listar todos os usuários (Admin)",
            description = "Retorna lista completa de usuários - acesso restrito a administradores"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuários obtida com sucesso",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = UserEntity.class)))),
            @ApiResponse(responseCode = "403", description = "Acesso negado - apenas administradores",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(HttpServletRequest httpRequest) {
        try {
            List<UserEntity> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Erro ao buscar todos os usuários: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Listar usuários ativos (Admin)",
            description = "Retorna lista de usuários ativos - acesso restrito a administradores"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuários ativos obtida com sucesso",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = UserEntity.class)))),
            @ApiResponse(responseCode = "403", description = "Acesso negado - apenas administradores",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/users/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getActiveUsers(HttpServletRequest httpRequest) {
        try {
            List<UserEntity> users = userService.getActiveUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Erro ao buscar usuários ativos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Listar usuários não verificados (Admin)",
            description = "Retorna lista de usuários com email não verificado - acesso restrito a administradores"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuários não verificados obtida com sucesso",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = UserEntity.class)))),
            @ApiResponse(responseCode = "403", description = "Acesso negado - apenas administradores",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/users/unverified")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUnverifiedUsers(HttpServletRequest httpRequest) {
        try {
            List<UserEntity> users = userService.getUnverifiedUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Erro ao buscar usuários não verificados: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }

    @Operation(
            summary = "Listar usuários por plano (Admin)",
            description = "Retorna lista de usuários filtrados por tipo de plano - acesso restrito a administradores"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuários por plano obtida com sucesso",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = UserEntity.class)))),
            @ApiResponse(responseCode = "403", description = "Acesso negado - apenas administradores",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/users/plan/{planType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByPlan(@PathVariable String planType, HttpServletRequest httpRequest) {
        try {
            List<UserEntity> users = userService.getUsersByPlan(planType);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Erro ao buscar usuários por plano: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("Erro interno do servidor", "INTERNAL_SERVER_ERROR", 500, httpRequest.getRequestURI()));
        }
    }
}