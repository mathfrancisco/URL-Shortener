// src/main/java/desafiourl/urlshortener/controller/PlanController.java
package desafiourl.urlshortener.controller;

import desafiourl.urlshortener.entities.dto.response.PlanInfoResponse;
import desafiourl.urlshortener.entities.enums.PlanType;
import desafiourl.urlshortener.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Plan Management", description = "APIs para gerenciamento de planos de assinatura")
public class PlanController {

    private final PlanService planService;

    @Operation(
            summary = "Listar todos os planos",
            description = "Retorna informações detalhadas de todos os planos disponíveis"
    )
    @ApiResponse(responseCode = "200", description = "Lista de planos obtida com sucesso")
    @GetMapping("/available")
    public ResponseEntity<List<PlanInfoResponse>> getAvailablePlans() {
        List<PlanInfoResponse> plans = planService.getAllPlans();
        return ResponseEntity.ok(plans);
    }

    @Operation(
            summary = "Obter detalhes de um plano específico",
            description = "Retorna informações detalhadas de um plano específico"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Detalhes do plano obtidos com sucesso"),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado")
    })
    @GetMapping("/{planCode}")
    public ResponseEntity<PlanInfoResponse> getPlanDetails(
            @Parameter(description = "Código do plano (FREE, PREMIUM, ENTERPRISE)", required = true)
            @PathVariable String planCode) {
        try {
            PlanType planType = PlanType.fromCode(planCode.toUpperCase());
            PlanInfoResponse plan = PlanInfoResponse.fromPlanType(planType);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Comparar planos",
            description = "Retorna uma comparação entre dois planos"
    )
    @GetMapping("/compare/{plan1}/{plan2}")
    public ResponseEntity<List<PlanInfoResponse>> comparePlans(
            @PathVariable String plan1,
            @PathVariable String plan2) {
        try {
            PlanType planType1 = PlanType.fromCode(plan1.toUpperCase());
            PlanType planType2 = PlanType.fromCode(plan2.toUpperCase());

            List<PlanInfoResponse> comparison = List.of(
                    PlanInfoResponse.fromPlanType(planType1),
                    PlanInfoResponse.fromPlanType(planType2)
            );

            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}