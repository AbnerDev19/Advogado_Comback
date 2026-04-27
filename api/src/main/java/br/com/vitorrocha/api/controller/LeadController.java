package br.com.vitorrocha.api.controller;

import br.com.vitorrocha.api.dto.LeadDTO;
import br.com.vitorrocha.api.model.Lead;
import br.com.vitorrocha.api.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    /**
     * POST /api/leads  [PÚBLICO]
     * Recebe contato do formulário do site
     */
    @PostMapping
    public ResponseEntity<Lead> criar(@Valid @RequestBody LeadDTO.Request dto) {
        Lead lead = leadService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(lead);
    }

    /**
     * GET /api/leads  [PROTEGIDO]
     * Lista todos os leads. Filtra por status se informado: ?status=NOVO_CONTATO
     */
    @GetMapping
    public ResponseEntity<List<Lead>> listar(
            @RequestParam(required = false) String status) {
        List<Lead> leads = (status != null)
                ? leadService.listarPorStatus(status.toUpperCase())
                : leadService.listarTodos();
        return ResponseEntity.ok(leads);
    }

    /**
     * GET /api/leads/stats  [PROTEGIDO]
     * Retorna contadores por status para o dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<LeadDTO.Stats> stats() {
        return ResponseEntity.ok(leadService.estatisticas());
    }

    /**
     * GET /api/leads/{id}  [PROTEGIDO]
     */
    @GetMapping("/{id}")
    public ResponseEntity<Lead> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.buscarPorId(id));
    }

    /**
     * PUT /api/leads/{id}/status  [PROTEGIDO]
     * Body: { "status": "EM_ANDAMENTO" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Lead> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeadDTO.StatusUpdate dto) {
        return ResponseEntity.ok(leadService.atualizarStatus(id, dto.getStatus()));
    }

    /**
     * PUT /api/leads/{id}/notas  [PROTEGIDO]
     * Body: { "notasInternas": "..." }
     */
    @PutMapping("/{id}/notas")
    public ResponseEntity<Lead> atualizarNotas(
            @PathVariable Long id,
            @RequestBody LeadDTO.NotasUpdate dto) {
        return ResponseEntity.ok(leadService.atualizarNotas(id, dto.getNotasInternas()));
    }

    /**
     * DELETE /api/leads/{id}  [PROTEGIDO]
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        leadService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
