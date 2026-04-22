package com.vitorrocha.advocacia.controller;

import com.vitorrocha.advocacia.dto.LeadRequest;
import com.vitorrocha.advocacia.dto.LeadStatusUpdate;
import com.vitorrocha.advocacia.model.Lead;
import com.vitorrocha.advocacia.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    @Autowired
    private LeadService leadService;

    // ────────────────────────────────────────────────
    // ROTA PÚBLICA — recebe o formulário do site
    // ────────────────────────────────────────────────
    @PostMapping("/publico")
    public ResponseEntity<?> enviarContato(@Valid @RequestBody LeadRequest request) {
        Lead lead = leadService.criarLead(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensagem", "Solicitação recebida com sucesso. Retornaremos em breve!",
                        "id", lead.getId()
                ));
    }

    // ────────────────────────────────────────────────
    // ROTAS PRIVADAS — painel admin (requer JWT)
    // ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Lead>> listar(@RequestParam(required = false) String status) {
        if (status != null && !status.equals("all")) {
            try {
                Lead.Status statusEnum = Lead.Status.valueOf(status);
                return ResponseEntity.ok(leadService.listarPorStatus(statusEnum));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(leadService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lead> buscarPorId(@PathVariable Long id) {
        return leadService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable Long id,
                                              @Valid @RequestBody LeadStatusUpdate body) {
        return leadService.atualizarStatus(id, body.getStatus())
                .map(lead -> ResponseEntity.ok(Map.of(
                        "mensagem", "Status atualizado com sucesso.",
                        "status", lead.getStatus().name()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        if (leadService.deletar(id)) {
            return ResponseEntity.ok(Map.of("mensagem", "Lead removido com sucesso."));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> estatisticas() {
        return ResponseEntity.ok(leadService.getEstatisticas());
    }
}
