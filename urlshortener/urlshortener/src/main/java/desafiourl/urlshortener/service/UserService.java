package desafiourl.urlshortener.service;

import desafiourl.urlshortener.config.JwtAuthenticationFilter;
import desafiourl.urlshortener.entities.UserEntity;
import desafiourl.urlshortener.entities.dto.request.*;
import desafiourl.urlshortener.entities.dto.response.AuthResponse;
import desafiourl.urlshortener.entities.dto.response.UserProfileResponse;
import desafiourl.urlshortener.entities.dto.response.UserStatsResponse;
import desafiourl.urlshortener.repository.UserRepository;
import desafiourl.urlshortener.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Tentativa de registro para email: {}", request.email());

        // Validar se as senhas coincidem
        if (!request.password().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("As senhas não coincidem");
        }

        // Verificar se email já existe
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        // Verificar se username já existe
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username já cadastrado");
        }

        // Criar novo usuário
        UserEntity user = new UserEntity();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPlanType("FREE");
        user.setEmailVerified(false);
        user.setActive(true);
        user.setRoles(List.of("USER"));
        user.setCreatedAt(LocalDateTime.now());

        // GERAR TOKEN DE VERIFICAÇÃO DE EMAIL (NÃO JWT!)
        String emailVerificationToken = generateEmailVerificationToken();
        user.setEmailVerificationToken(emailVerificationToken);

        // Salvar usuário
        user = userRepository.save(user);
        log.info("Usuário registrado com sucesso: {}", user.getUsername());

        // Enviar email de verificação
        try {
            emailService.sendEmailVerification(user);
            log.info("Email de verificação enviado para: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erro ao enviar email de verificação para {}: {}", user.getEmail(), e.getMessage());
        }

        // Gerar JWT para resposta de autenticação
        String jwtToken = jwtUtils.generateTokenFromUser(user);

        return new AuthResponse(
                jwtToken,
                "Bearer",
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPlanType(),
                user.isEmailVerified(),
                jwtUtils.getExpirationTime()
        );
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Tentativa de login para: {}", request.usernameOrEmail());

        try {
            // Buscar o usuário primeiro
            Optional<UserEntity> userOpt = userRepository.findByUsernameOrEmail(request.usernameOrEmail());

            if (userOpt.isEmpty()) {
                log.warn("Usuário não encontrado: {}", request.usernameOrEmail());
                throw new BadCredentialsException("Credenciais inválidas");
            }

            UserEntity user = userOpt.get();
            log.debug("Usuário encontrado: {} - Ativo: {} - Email verificado: {}",
                    user.getUsername(), user.isActive(), user.isEmailVerified());

            // Verificar se conta não está bloqueada
            if (!user.isAccountNonLocked()) {
                log.warn("Conta bloqueada: {}", user.getUsername());
                throw new DisabledException("Conta temporariamente bloqueada devido a múltiplas tentativas de login");
            }

            // Verificar se a conta está ativa
            if (!user.isActive()) {
                log.warn("Conta inativa: {}", user.getUsername());
                throw new DisabledException("Conta desativada");
            }

            // Usar o AuthenticationManager para autenticar
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.usernameOrEmail(),
                            request.password()
                    )
            );

            // Se chegou até aqui, a autenticação foi bem-sucedida
            log.info("Autenticação bem-sucedida para: {}", user.getUsername());

            // Reset failed attempts on successful login
            user.resetFailedLoginAttempts();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            // Gerar token JWT
            String token = jwtUtils.generateTokenFromUser(user);

            log.info("Login realizado com sucesso para: {}", user.getUsername());

            return new AuthResponse(
                    token,
                    "Bearer",
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getPlanType(),
                    user.isEmailVerified(),
                    jwtUtils.getExpirationTime()
            );

        } catch (BadCredentialsException e) {
            // Incrementar tentativas falhadas apenas para credenciais inválidas
            try {
                Optional<UserEntity> userOpt = userRepository.findByUsernameOrEmail(request.usernameOrEmail());
                if (userOpt.isPresent()) {
                    UserEntity user = userOpt.get();
                    user.incrementFailedLoginAttempts();
                    userRepository.save(user);
                    log.warn("Tentativa de login falhada para usuário: {} - Tentativas: {}",
                            user.getUsername(), user.getFailedLoginAttempts());
                }
            } catch (Exception ex) {
                log.error("Erro ao incrementar tentativas de login falhadas: {}", ex.getMessage());
            }

            log.error("Credenciais inválidas para {}", request.usernameOrEmail());
            throw new BadCredentialsException("Credenciais inválidas");

        } catch (DisabledException e) {
            log.error("Conta desabilitada para {}: {}", request.usernameOrEmail(), e.getMessage());
            throw e;

        } catch (Exception e) {
            log.error("Erro inesperado no login para {}: {}", request.usernameOrEmail(), e.getMessage(), e);
            throw new RuntimeException("Erro interno no sistema de autenticação: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void verifyEmail(EmailVerificationRequest request) {
        String token = request.token();

        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token de verificação é obrigatório");
        }

        // Buscar usuário pelo token de verificação
        UserEntity user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de verificação inválido ou expirado"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email já verificado");
        }

        // Verificar se o token não expirou (opcional - implementar expiração)
        // Você pode adicionar um campo emailVerificationTokenExpiry na entidade

        // Marcar como verificado e limpar o token
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null); // Limpar o token após uso
        user.setEmailVerifiedAt(LocalDateTime.now()); // Se tiver este campo

        userRepository.save(user);

        // Enviar email de boas-vindas
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            log.error("Erro ao enviar email de boas-vindas: {}", e.getMessage());
        }

        log.info("Email verificado com sucesso para usuário: {}", user.getEmail());
    }

    @Transactional
    public void resendEmailVerification() {
        UserEntity currentUser = getCurrentUserEntity();

        if (currentUser.isEmailVerified()) {
            throw new IllegalStateException("Email já verificado");
        }

        // Gerar novo token se necessário
        if (currentUser.getEmailVerificationToken() == null) {
            currentUser.setEmailVerificationToken(generateVerificationToken());
            userRepository.save(currentUser);
        }

        // Reenviar email
        emailService.sendEmailVerification(currentUser);
        log.info("Email de verificação reenviado para: {}", currentUser.getEmail());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        UserEntity user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Email não encontrado"));

        // Gerar token de reset (NÃO JWT!)
        String resetToken = UUID.randomUUID().toString().replace("-", "") +
                System.currentTimeMillis();

        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1)); // 1 hora para expirar

        userRepository.save(user);

        // Enviar email de reset
        emailService.sendPasswordReset(user, resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmNewPassword())) {
            throw new IllegalArgumentException("Senhas não coincidem");
        }

        UserEntity user = userRepository.findByPasswordResetToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Token inválido ou expirado"));

        // Verificar se o token não expirou
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expirado");
        }

        // Alterar senha
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null); // Limpar token
        user.setPasswordResetTokenExpiry(null);

        userRepository.save(user);

        // Enviar notificação de alteração
        emailService.sendPasswordChangeNotification(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserEntity currentUser = getCurrentUserEntity();

        // Validar se as novas senhas coincidem
        if (!request.newPassword().equals(request.confirmNewPassword())) {
            throw new IllegalArgumentException("As novas senhas não coincidem");
        }

        // Verificar senha atual
        if (!passwordEncoder.matches(request.currentPassword(), currentUser.getPassword())) {
            throw new IllegalArgumentException("Senha atual incorreta");
        }

        // Verificar se nova senha é diferente da atual
        if (passwordEncoder.matches(request.newPassword(), currentUser.getPassword())) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da atual");
        }

        // Atualizar senha
        currentUser.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(currentUser);

        log.info("Senha alterada com sucesso para usuário: {}", currentUser.getUsername());
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        UserEntity currentUser = getCurrentUserEntity();

        currentUser.setFirstName(request.firstName());
        currentUser.setLastName(request.lastName());
        currentUser.setPhoneNumber(request.phoneNumber());

        currentUser = userRepository.save(currentUser);
        log.info("Perfil atualizado para usuário: {}", currentUser.getUsername());

        return buildUserProfileResponse(currentUser);
    }

    public UserProfileResponse getUserProfile() {
        UserEntity currentUser = getCurrentUserEntity();
        return buildUserProfileResponse(currentUser);
    }

    public UserStatsResponse getUserStats() {
        UserEntity currentUser = getCurrentUserEntity();

        // TODO: Implementar contadores de URLs quando o serviço de URLs estiver pronto
        return new UserStatsResponse(
                0, // totalUrls - será implementado
                0, // activeUrls - será implementado
                0L, // totalClicks - será implementado
                currentUser.getCurrentMonthUrlCount(),
                currentUser.getMonthlyUrlLimit() - currentUser.getCurrentMonthUrlCount(),
                currentUser.getPlanType(),
                currentUser.getCreatedAt()
        );
    }

    // Admin methods
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserEntity> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }

    public List<UserEntity> getUnverifiedUsers() {
        return userRepository.findByEmailVerifiedFalse();
    }

    public List<UserEntity> getUsersByPlan(String planType) {
        return userRepository.findByPlanType(planType);
    }

    @Transactional
    public void unlockExpiredAccounts() {
        List<UserEntity> usersToUnlock = userRepository.findUsersToUnlock(LocalDateTime.now());
        usersToUnlock.forEach(user -> {
            user.resetFailedLoginAttempts();
            log.info("Conta desbloqueada automaticamente: {}", user.getUsername());
        });
        userRepository.saveAll(usersToUnlock);
    }

    // Helper methods
    private UserEntity getCurrentUserEntity() {
        UserEntity currentUser = JwtAuthenticationFilter.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("Usuário não autenticado");
        }

        // Buscar dados atualizados do banco
        return userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Usuário não encontrado"));
    }

    private UserProfileResponse buildUserProfileResponse(UserEntity user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.isEmailVerified(),
                user.getPlanType(),
                user.getMonthlyUrlLimit(),
                user.getCurrentMonthUrlCount(),
                user.getMonthlyUrlLimit() - user.getCurrentMonthUrlCount(),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                user.isSubscriptionActive()
        );
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String generatePasswordResetToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder token = new StringBuilder();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for (int i = 0; i < 32; i++) {
            token.append(chars.charAt(random.nextInt(chars.length())));
        }

        return token.toString();
    }

    public String generateEmailVerificationToken() {
        // Gera um token simples e seguro para verificação de email
        return UUID.randomUUID().toString().replace("-", "") +
                System.currentTimeMillis();
    }
}