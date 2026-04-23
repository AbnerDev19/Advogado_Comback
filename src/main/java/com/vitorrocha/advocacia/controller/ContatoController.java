package com.vitorrocha.advocacia.controller;

import com.vitorrocha.advocacia.dto.ContatoPublicoRequest;
import com.vitorrocha.advocacia.dto.ContatoStatusUpdate;
import com.vitorrocha.advocacia.model.Contato;
import com.vitorrocha.advocacia.service.ContatoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contatos")
public class ContatoController {

    @Autowired private ContatoService service;

    // ── PÚBLICO — formulário do site ──────────────────────────────────────────
    @PostMapping("/publico")
    public ResponseEntity<?> enviar(@Valid @RequestBody ContatoPublicoRequest req) {
        Contato c = service.receberContato(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensagem", "Mensagem recebida com sucesso! Retornaremos em breve.",
                "id", c.getIdContato()
        ));
    }

    // ── PRIVADOS — painel admin (exige JWT) ───────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Contato>> listar(@RequestParam(required = false) String status) {
        if (status != null && !status.equals("all")) {
            try {
                return ResponseEntity.ok(service.listarPorStatus(Contato.Status.valueOf(status)));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contato> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable Long id,
                                              @Valid @RequestBody ContatoStatusUpdate body) {
        return service.atualizarStatus(id, body.getStatus())
                .map(c -> ResponseEntity.ok(Map.of(
                        "mensagem", "Status atualizado.",
                        "status", c.getStatus().name()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        return service.deletar(id)
                ? ResponseEntity.ok(Map.of("mensagem", "Contato removido."))
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        return ResponseEntity.ok(service.getStats());
    }
}
