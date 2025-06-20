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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        UserEntity user = new UserEntity(
                request.email(),
                request.username(),
                passwordEncoder.encode(request.password()),
                request.firstName(),
                request.lastName()
        );

        user.setPhoneNumber(request.phoneNumber());
        user.setEmailVerificationToken(generateVerificationToken());

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

        // Gerar token JWT
        String token = jwtUtils.generateTokenFromUser(user);

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
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Tentativa de login para: {}", request.usernameOrEmail());

        try {
            // Buscar usuário por username ou email
            Optional<UserEntity> userOpt = userRepository.findByUsernameOrEmail(
                    request.usernameOrEmail(),
                    request.usernameOrEmail()
            );

            if (userOpt.isEmpty()) {
                throw new BadCredentialsException("Credenciais inválidas");
            }

            UserEntity user = userOpt.get();

            // Verificar se conta não está bloqueada
            if (!user.isAccountNonLocked()) {
                throw new DisabledException("Conta temporariamente bloqueada devido a múltiplas tentativas de login");
            }

            // Tentar autenticar
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            request.password()
                    )
            );

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

        } catch (AuthenticationException e) {
            // Increment failed attempts
            userRepository.findByUsernameOrEmail(request.usernameOrEmail(), request.usernameOrEmail())
                    .ifPresent(user -> {
                        user.incrementFailedLoginAttempts();
                        userRepository.save(user);
                    });

            log.error("Falha no login para {}: {}", request.usernameOrEmail(), e.getMessage());
            throw new BadCredentialsException("Credenciais inválidas");
        }
    }

    @Transactional
    public void verifyEmail(EmailVerificationRequest request) {
        log.info("Tentativa de verificação de email com token: {}", request.token());

        UserEntity user = userRepository.findByEmailVerificationToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Token de verificação inválido ou expirado"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email já verificado");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);

        // Enviar email de boas-vindas após verificação
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            log.error("Erro ao enviar email de boas-vindas: {}", e.getMessage());
        }

        log.info("Email verificado com sucesso para usuário: {}", user.getUsername());
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
        log.info("Solicitação de recuperação de senha para email: {}", request.email());

        UserEntity user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Email não encontrado"));

        // Gerar token de reset
        String resetToken = generatePasswordResetToken();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(2)); // Token válido por 2 horas

        userRepository.save(user);

        // Enviar email de reset
        emailService.sendPasswordReset(user, resetToken);
        log.info("Email de recuperação de senha enviado para: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Tentativa de reset de senha com token: {}", request.token());

        // Validar se as senhas coincidem
        if (!request.newPassword().equals(request.confirmNewPassword())) {
            throw new IllegalArgumentException("As senhas não coincidem");
        }

        UserEntity user = userRepository.findByPasswordResetToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Token de reset inválido"));

        // Verificar se token não expirou
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token de reset expirado");
        }

        // Atualizar senha
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        user.resetFailedLoginAttempts(); // Reset failed attempts

        userRepository.save(user);
        log.info("Senha resetada com sucesso para usuário: {}", user.getUsername());
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
}