package desafiourl.urlshortener.service;

import desafiourl.urlshortener.entities.UserEntity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Autowired
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.mail.from:noreply@urlshortener.com}")
    private String fromEmail;

    @Value("${app.name:URL Shortener}")
    private String appName;

    public void sendEmailVerification(UserEntity user) {
        try {
            Context context = new Context(Locale.getDefault());
            context.setVariable("userName", user.getFullName());
            context.setVariable("appName", appName);
            context.setVariable("verificationUrl",
                    frontendUrl + "/verify-email?token=" + user.getEmailVerificationToken());

            String htmlContent = templateEngine.process("email-verification", context);

            sendEmail(
                    user.getEmail(),
                    "Verificação de Email - " + appName,
                    htmlContent
            );

            log.info("Email de verificação enviado para: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erro ao enviar email de verificação para {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Erro ao enviar email de verificação", e);
        }
    }

    public void sendPasswordReset(UserEntity user, String resetToken) {
        try {
            Context context = new Context(Locale.getDefault());
            context.setVariable("userName", user.getFullName());
            context.setVariable("appName", appName);
            context.setVariable("resetUrl",
                    frontendUrl + "/reset-password?token=" + resetToken);

            String htmlContent = templateEngine.process("password-reset", context);

            sendEmail(
                    user.getEmail(),
                    "Recuperação de Senha - " + appName,
                    htmlContent
            );

            log.info("Email de recuperação de senha enviado para: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erro ao enviar email de recuperação para {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Erro ao enviar email de recuperação", e);
        }
    }

    public void sendWelcomeEmail(UserEntity user) {
        try {
            Context context = new Context(Locale.getDefault());
            context.setVariable("userName", user.getFullName());
            context.setVariable("appName", appName);
            context.setVariable("username", user.getUsername());
            context.setVariable("planType", user.getPlanType());
            context.setVariable("monthlyLimit", user.getMonthlyUrlLimit());
            context.setVariable("dashboardUrl", frontendUrl + "/dashboard");

            String htmlContent = templateEngine.process("welcome-email", context);

            sendEmail(
                    user.getEmail(),
                    "Bem-vindo ao " + appName + "!",
                    htmlContent
            );

            log.info("Email de boas-vindas enviado para: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erro ao enviar email de boas-vindas para {}: {}", user.getEmail(), e.getMessage());
            // Não lança exceção aqui para não interromper o fluxo principal
        }
    }

    public void sendPasswordChangedNotification(UserEntity user) {
        try {
            Context context = new Context(Locale.getDefault());
            context.setVariable("userName", user.getFullName());
            context.setVariable("appName", appName);
            context.setVariable("loginUrl", frontendUrl + "/login");

            String htmlContent = templateEngine.process("password-changed", context);

            sendEmail(
                    user.getEmail(),
                    "Senha Alterada - " + appName,
                    htmlContent
            );

            log.info("Email de notificação de senha alterada enviado para: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erro ao enviar notificação de senha alterada para {}: {}", user.getEmail(), e.getMessage());
            // Não lança exceção aqui para não interromper o fluxo principal
        }
    }

    public void sendAccountLockNotification(UserEntity user) {
        try {
            Context context = new Context(Locale.getDefault());
            context.setVariable("userName", user.getFullName());
            context.setVariable("appName", appName);
            context.setVariable("unlockTime", user.getLockoutUntil());
            context.setVariable("supportEmail", fromEmail);

            String htmlContent = templateEngine.process("account-locked", context);

            sendEmail(
                    user.getEmail(),
                    "Conta Temporariamente Bloqueada - " + appName,
                    htmlContent
            );

            log.info("Email de notificação de conta bloqueada enviado para: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erro ao enviar notificação de conta bloqueada para {}: {}", user.getEmail(), e.getMessage());
            // Não lança exceção aqui para não interromper o fluxo principal
        }
    }

    public void sendPlanUpgradeNotification(UserEntity user, String oldPlan, String newPlan) {
        try {
            Context context = new Context(Locale.getDefault());
            context.setVariable("userName", user.getFullName());
            context.setVariable("appName", appName);
            context.setVariable("oldPlan", oldPlan);
            context.setVariable("newPlan", newPlan);
            context.setVariable("newLimit", user.getMonthlyUrlLimit());
            context.setVariable("dashboardUrl", frontendUrl + "/dashboard");

            String htmlContent = templateEngine.process("plan-upgrade", context);

            sendEmail(
                    user.getEmail(),
                    "Plano Atualizado - " + appName,
                    htmlContent
            );

            log.info("Email de upgrade de plano enviado para: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erro ao enviar email de upgrade de plano para {}: {}", user.getEmail(), e.getMessage());
            // Não lança exceção aqui para não interromper o fluxo principal
        }
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);

            log.debug("Email enviado com sucesso para: {} com assunto: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Erro ao enviar email para {}: {}", to, e.getMessage());
            throw new RuntimeException("Erro ao enviar email", e);
        } catch (Exception e) {
            log.error("Erro inesperado ao enviar email para {}: {}", to, e.getMessage());
            throw new RuntimeException("Erro inesperado ao enviar email", e);
        }
    }
}