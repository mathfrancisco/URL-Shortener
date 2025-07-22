// src/main/java/desafiourl/urlshortener/service/PlanService.java
package desafiourl.urlshortener.service;

import desafiourl.urlshortener.entities.UserEntity;
import desafiourl.urlshortener.entities.dto.response.PlanInfoResponse;
import desafiourl.urlshortener.entities.enums.PlanType;
import desafiourl.urlshortener.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanService {

    private final UserRepository userRepository;

    /**
     * Retorna todos os planos disponíveis
     */
    public List<PlanInfoResponse> getAllPlans() {
        return Arrays.stream(PlanType.values())
                .map(PlanInfoResponse::fromPlanType)
                .toList();
    }

    /**
     * Verifica se o usuário pode criar uma nova URL baseado no seu plano
     */
    public boolean canCreateUrl(UserEntity user) {
        // Primeiro, reseta o contador mensal se necessário
        resetMonthlyCountIfNeeded(user);

        PlanType planType = PlanType.fromCode(user.getPlanType());

        // Planos ilimitados sempre podem criar
        if (planType.isUnlimited()) {
            return true;
        }

        // Verificar se ainda não excedeu o limite mensal
        return user.getCurrentMonthUrlCount() < planType.getMonthlyUrlLimit();
    }

    /**
     * Verifica se o usuário pode usar URLs customizadas
     */
    public boolean canUseCustomUrls(UserEntity user) {
        PlanType planType = PlanType.fromCode(user.getPlanType());
        return planType.isHasCustomUrls();
    }

    /**
     * Verifica se o usuário tem acesso a analytics avançadas
     */
    public boolean hasAdvancedAnalytics(UserEntity user) {
        PlanType planType = PlanType.fromCode(user.getPlanType());
        return planType.isHasAdvancedAnalytics();
    }

    /**
     * Verifica se o usuário tem acesso à API
     */
    public boolean hasApiAccess(UserEntity user) {
        PlanType planType = PlanType.fromCode(user.getPlanType());
        return planType.isHasApiAccess();
    }

    /**
     * Atualiza o plano do usuário
     */
    @Transactional
    public void updateUserPlan(UserEntity user, PlanType newPlan) {
        PlanType oldPlan = PlanType.fromCode(user.getPlanType());

        user.setPlanType(newPlan.getCode());
        user.setMonthlyUrlLimit(newPlan.getMonthlyUrlLimit());

        // Se mudou para um plano pago, definir expiração
        if (newPlan.isPaid()) {
            user.setPlanExpiresAt(LocalDateTime.now().plusMonths(1));
        } else {
            user.setPlanExpiresAt(null);
        }

        // Salvar alterações
        userRepository.save(user);

        log.info("Plano do usuário {} alterado de {} para {}",
                user.getUsername(), oldPlan.getDisplayName(), newPlan.getDisplayName());
    }

    /**
     * Verifica se o plano do usuário está ativo (não expirado)
     */
    public boolean isPlanActive(UserEntity user) {
        // Plano gratuito nunca expira
        if (user.getPlanExpiresAt() == null) {
            return true;
        }
        return LocalDateTime.now().isBefore(user.getPlanExpiresAt());
    }

    /**
     * Reseta o contador mensal se necessário
     */
    @Transactional
    public void resetMonthlyCountIfNeeded(UserEntity user) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime resetDate = user.getMonthlyCountResetDate();

        // Se não há data de reset ou já passou um mês
        if (resetDate == null || now.isAfter(resetDate.plusMonths(1))) {
            user.setCurrentMonthUrlCount(0);
            user.setMonthlyCountResetDate(
                    now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
            );

            userRepository.save(user);
            log.info("Contador mensal resetado para usuário: {}", user.getUsername());
        }
    }


    /**
     * Verifica quantas URLs o usuário ainda pode criar este mês
     */
    @Transactional
    public int getRemainingUrls(UserEntity user) {
        resetMonthlyCountIfNeeded(user);

        PlanType planType = PlanType.fromCode(user.getPlanType());
        if (planType.isUnlimited()) {
            return -1; // Ilimitado
        }

        return Math.max(0, planType.getMonthlyUrlLimit() - user.getCurrentMonthUrlCount());
    }

    /**
     * Obtém informações detalhadas do plano atual do usuário
     */
    public PlanInfoResponse getUserPlanInfo(UserEntity user) {
        PlanType planType = PlanType.fromCode(user.getPlanType());
        return PlanInfoResponse.fromPlanType(planType);
    }
}