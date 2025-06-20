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

    // Nome da aplicação para usar no "From" do email
    @Value("${app.name:URLShortener}")
    private String appName;

    public void sendEmailVerification(UserEntity user) {
        try {
            log.info("Iniciando envio de email de verificação para: {}", user.getEmail());

            Context context = createContext();
            context.setVariable("user", user);
            context.setVariable("verificationUrl",
                    frontendUrl + "/verify-email?token=" + user.getEmailVerificationToken());
            context.setVariable("baseUrl", baseUrl);

            String htmlContent = templateEngine.process("email-verification", context);

            MimeMessage message = createMimeMessage(
                    user.getEmail(),
                    "Verificação de Email - " + appName,
                    htmlContent
            );

            mailSender.send(message);
            log.info("Email de verificação enviado com sucesso para: {}", user.getEmail());

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
            // Não lança exceção para não quebrar o fluxo de cadastro
        } catch (MailException e) {
            log.error("Erro de envio ao enviar email de boas-vindas para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            // Não lança exceção para não quebrar o fluxo de cadastro
        } catch (Exception e) {
            log.error("Erro inesperado ao enviar email de boas-vindas para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            // Não lança exceção para não quebrar o fluxo de cadastro
        }
    }

    public void sendPasswordReset(UserEntity user, String resetToken) {
        try {
            log.info("Iniciando envio de email de reset de senha para: {}", user.getEmail());

            Context context = createContext();
            context.setVariable("user", user);
            context.setVariable("resetUrl",
                    frontendUrl + "/reset-password?token=" + resetToken);
            context.setVariable("baseUrl", baseUrl);

            String htmlContent = templateEngine.process("password-reset", context);

            MimeMessage message = createMimeMessage(
                    user.getEmail(),
                    "Recuperação de Senha - " + appName,
                    htmlContent
            );

            mailSender.send(message);
            log.info("Email de reset de senha enviado com sucesso para: {}", user.getEmail());

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
            // Não lança exceção pois é apenas uma notificação
        } catch (MailException e) {
            log.error("Erro de envio ao enviar notificação de alteração de senha para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            // Não lança exceção pois é apenas uma notificação
        } catch (Exception e) {
            log.error("Erro inesperado ao enviar notificação de alteração de senha para {}: {}",
                    user.getEmail(), e.getMessage(), e);
            // Não lança exceção pois é apenas uma notificação
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

        // Configurações específicas para Brevo
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

}