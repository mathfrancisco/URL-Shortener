package desafiourl.urlshortener.service;

import desafiourl.urlshortener.entities.UserEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.url.base-url}")
    private String baseUrl;

    @Value("${app.name:URLShortener}")
    private String appName;

    public void sendEmailVerification(UserEntity user) {
        try {
            log.info("Iniciando envio de email de verificação para: {}", user.getEmail());

            // Validar se o token existe
            if (user.getEmailVerificationToken() == null || user.getEmailVerificationToken().trim().isEmpty()) {
                log.error("Token de verificação está vazio para usuário: {}", user.getEmail());
                throw new IllegalStateException("Token de verificação não encontrado");
            }

            // Log do token completo para debug
            log.debug("Token completo gerado: {}", user.getEmailVerificationToken());
            log.debug("Tamanho do token: {}", user.getEmailVerificationToken().length());

            Context context = createContext();
            context.setVariable("user", user);

            // Construir URL de verificação com encoding adequado
            String verificationUrl = buildVerificationUrl(user.getEmailVerificationToken());
            context.setVariable("verificationUrl", verificationUrl);
            context.setVariable("baseUrl", baseUrl);
            context.setVariable("token", user.getEmailVerificationToken()); // Adicionar token separado para debug

            log.debug("URL de verificação construída: {}", verificationUrl);

            String htmlContent = templateEngine.process("email-verification", context);

            // Log do conteúdo HTML para verificar se o token está completo
            if (log.isDebugEnabled()) {
                log.debug("Conteúdo HTML contém token: {}",
                        htmlContent.contains(user.getEmailVerificationToken()));
            }

            MimeMessage message = createMimeMessage(
                    user.getEmail(),
                    "Verificação de Email - " + appName,
                    htmlContent
            );

            mailSender.send(message);
            log.info("Email de verificação enviado com sucesso para: {} com token: {}",
                    user.getEmail(), user.getEmailVerificationToken().substring(0, 8) + "...");

        } catch (MessagingException e) {
            log.error("Erro de mensagem ao enviar email de verificação para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Falha ao criar email de verificação", e);
        } catch (MailException e) {
            log.error("Erro de envio ao enviar email de verificação para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Falha ao enviar email de verificação", e);
        } catch (Exception e) {
            log.error("Erro inesperado ao enviar email de verificação para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Falha inesperada ao enviar email de verificação", e);
        }
    }

    public void sendWelcomeEmail(UserEntity user) {
        try {
            log.info("Iniciando envio de email de boas-vindas para: {}", user.getEmail());

            Context context = createContext();
            context.setVariable("user", user);
            context.setVariable("dashboardUrl", frontendUrl + "/dashboard");
            context.setVariable("baseUrl", baseUrl);

            String htmlContent = templateEngine.process("welcome-email", context);

            MimeMessage message = createMimeMessage(
                    user.getEmail(),
                    "Bem-vindo ao " + appName + "! 🎉",
                    htmlContent
            );

            mailSender.send(message);
            log.info("Email de boas-vindas enviado com sucesso para: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Erro de mensagem ao enviar email de boas-vindas para {}: {}",
                    user.getEmail(), e.getMessage(), e);
        } catch (MailException e) {
            log.error("Erro de envio ao enviar email de boas-vindas para {}: {}",
                    user.getEmail(), e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao enviar email de boas-vindas para {}: {}",
                    user.getEmail(), e.getMessage(), e);
        }
    }

    public void sendPasswordReset(UserEntity user, String resetToken) {
        try {
            log.info("Iniciando envio de email de reset de senha para: {}", user.getEmail());

            // Validar token
            if (resetToken == null || resetToken.trim().isEmpty()) {
                log.error("Token de reset está vazio para usuário: {}", user.getEmail());
                throw new IllegalStateException("Token de reset não encontrado");
            }

            log.debug("Token de reset gerado: {} (tamanho: {})", resetToken, resetToken.length());

            Context context = createContext();
            context.setVariable("user", user);

            // Construir URL de reset com encoding adequado
            String resetUrl = buildResetUrl(resetToken);
            context.setVariable("resetUrl", resetUrl);
            context.setVariable("baseUrl", baseUrl);
            context.setVariable("token", resetToken); // Token separado para debug

            log.debug("URL de reset construída: {}", resetUrl);

            String htmlContent = templateEngine.process("password-reset", context);

            MimeMessage message = createMimeMessage(
                    user.getEmail(),
                    "Recuperação de Senha - " + appName,
                    htmlContent
            );

            mailSender.send(message);
            log.info("Email de reset de senha enviado com sucesso para: {} com token: {}",
                    user.getEmail(), resetToken.substring(0, 8) + "...");

        } catch (MessagingException e) {
            log.error("Erro de mensagem ao enviar email de reset de senha para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Falha ao criar email de recuperação de senha", e);
        } catch (MailException e) {
            log.error("Erro de envio ao enviar email de reset de senha para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Falha ao enviar email de recuperação de senha", e);
        } catch (Exception e) {
            log.error("Erro inesperado ao enviar email de reset de senha para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Falha inesperada ao enviar email de recuperação de senha", e);
        }
    }

    public void sendPasswordChangeNotification(UserEntity user) {
        try {
            log.info("Iniciando envio de notificação de alteração de senha para: {}", user.getEmail());

            Context context = createContext();
            context.setVariable("user", user);
            context.setVariable("baseUrl", baseUrl);
            context.setVariable("supportUrl", frontendUrl + "/support");

            String htmlContent = templateEngine.process("password-change", context);

            MimeMessage message = createMimeMessage(
                    user.getEmail(),
                    "Senha Alterada - " + appName,
                    htmlContent
            );

            mailSender.send(message);
            log.info("Notificação de alteração de senha enviada com sucesso para: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Erro de mensagem ao enviar notificação de alteração de senha para {}: {}",
                    user.getEmail(), e.getMessage(), e);
        } catch (MailException e) {
            log.error("Erro de envio ao enviar notificação de alteração de senha para {}: {}",
                    user.getEmail(), e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao enviar notificação de alteração de senha para {}: {}",
                    user.getEmail(), e.getMessage(), e);
        }
    }

    /**
     * Constrói a URL de verificação com encoding adequado
     */
    private String buildVerificationUrl(String token) {
        try {
            // Garantir que a URL base não termine com barra
            String cleanFrontendUrl = frontendUrl.endsWith("/") ?
                    frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;

            // Encode do token para garantir que caracteres especiais sejam tratados
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

            String url = cleanFrontendUrl + "/verify-email?token=" + encodedToken;

            log.debug("URL original: {}/verify-email?token={}", cleanFrontendUrl, token);
            log.debug("URL com encoding: {}", url);

            return url;
        } catch (Exception e) {
            log.error("Erro ao construir URL de verificação: {}", e.getMessage());
            // Fallback sem encoding se houver erro
            return frontendUrl + "/verify-email?token=" + token;
        }
    }

    /**
     * Constrói a URL de reset com encoding adequado
     */
    private String buildResetUrl(String token) {
        try {
            String cleanFrontendUrl = frontendUrl.endsWith("/") ?
                    frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;

            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
            String url = cleanFrontendUrl + "/reset-password?token=" + encodedToken;

            log.debug("URL de reset original: {}/reset-password?token={}", cleanFrontendUrl, token);
            log.debug("URL de reset com encoding: {}", url);

            return url;
        } catch (Exception e) {
            log.error("Erro ao construir URL de reset: {}", e.getMessage());
            return frontendUrl + "/reset-password?token=" + token;
        }
    }

    /**
     * Cria o contexto base para os templates de email
     */
    private Context createContext() {
        return new Context(Locale.forLanguageTag("pt-BR"));
    }

    /**
     * Cria uma mensagem MIME configurada para o Brevo
     */
    private MimeMessage createMimeMessage(String toEmail, String subject, String htmlContent)
            throws MessagingException, UnsupportedEncodingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, appName);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        // Headers adicionais recomendados para Brevo
        message.setHeader("X-Mailer", appName);
        message.setHeader("List-Unsubscribe", "<" + baseUrl + "/unsubscribe>");

        return message;
    }

    /**
     * Método utilitário para testar a conectividade com o Brevo
     */
    public boolean testConnection() {
        try {
            mailSender.createMimeMessage();
            log.info("Conexão com Brevo SMTP estabelecida com sucesso");
            return true;
        } catch (Exception e) {
            log.error("Falha ao conectar com Brevo SMTP: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Método para debug - verifica se o token está sendo processado corretamente
     */
    public void debugTokenProcessing(String token, String templateName) {
        if (!log.isDebugEnabled()) return;

        try {
            log.debug("=== DEBUG TOKEN PROCESSING ===");
            log.debug("Template: {}", templateName);
            log.debug("Token original: '{}'", token);
            log.debug("Token length: {}", token != null ? token.length() : "null");
            log.debug("Token encoded: '{}'", URLEncoder.encode(token != null ? token : "", StandardCharsets.UTF_8));

            Context context = createContext();
            context.setVariable("token", token);
            context.setVariable("verificationUrl", frontendUrl + "/verify-email?token=" + token);

            String processed = templateEngine.process(templateName, context);
            assert token != null;
            log.debug("Token encontrado no HTML processado: {}", processed.contains(token));
            log.debug("================================");

        } catch (Exception e) {
            log.error("Erro no debug do token: {}", e.getMessage());
        }
    }
}