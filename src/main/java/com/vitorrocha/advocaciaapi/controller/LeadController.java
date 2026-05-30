package com.vitorrocha.advocaciaapi.controller;

import com.vitorrocha.advocaciaapi.model.Lead;
import com.vitorrocha.advocaciaapi.model.Nota;
import com.vitorrocha.advocaciaapi.repository.LeadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*")
@Tag(name = "Contatos (Leads)")
public class LeadController {

    @Autowired
    private LeadRepository repository;

    // Criar lead — público (formulário do site)
    @Operation(summary = "Criar lead", description = "Recebe um novo contato do formulário do site. Público.")
    @PostMapping
    public ResponseEntity<Lead> criarLead(@RequestBody Lead lead) {
        return ResponseEntity.status(201).body(repository.save(lead));
    }

    // Listar leads — suporta filtro por status via ?status=
    @Operation(summary = "Listar leads", description = "Lista todos os leads. Filtro opcional: ?status=novo_contato|em_andamento|concluido|arquivado. Exige JWT.")
    @GetMapping
    public ResponseEntity<List<Lead>> listarLeads(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(repository.findByStatus(status));
        }
        return ResponseEntity.ok(repository.findAll());
    }

    // Detalhar lead por ID
    @Operation(summary = "Detalhar lead", description = "Retorna os dados completos de um lead. Exige JWT.")
    @GetMapping("/{id}")
    public ResponseEntity<Lead> buscarLead(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Stats por status — para os cards do dashboard
    @Operation(summary = "Contadores por status", description = "Retorna totais agrupados por status para os cards do dashboard. Exige JWT.")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        Map<String, Long> counts = Map.of(
                "novo_contato",  repository.countByStatus("novo_contato"),
                "em_andamento",  repository.countByStatus("em_andamento"),
                "concluido",     repository.countByStatus("concluido"),
                "arquivado",     repository.countByStatus("arquivado"),
                "total",         repository.countByStatusNot("arquivado")
        );
        return ResponseEntity.ok(counts);
    }

    // Atualizar status
    @Operation(summary = "Atualizar status", description = "Muda o status de um lead. Exige JWT.")
    @PutMapping("/{id}/status")
    public ResponseEntity<Lead> atualizarStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Lead> leadOpt = repository.findById(id);
        if (leadOpt.isPresent()) {
            Lead lead = leadOpt.get();
            lead.setStatus(body.get("status"));
            return ResponseEntity.ok(repository.save(lead));
        }
        return ResponseEntity.notFound().build();
    }

    // Adicionar nota interna
    @Operation(summary = "Adicionar nota interna", description = "Adiciona uma nota interna ao lead. Exige JWT.")
    @PostMapping("/{id}/notas")
    public ResponseEntity<Lead> adicionarNota(
            @PathVariable Long id, @RequestBody Nota nota) {
        Optional<Lead> leadOpt = repository.findById(id);
        if (leadOpt.isPresent()) {
            Lead lead = leadOpt.get();
            nota.setLead(lead);
            lead.getNotas().add(nota);
            return ResponseEntity.ok(repository.save(lead));
        }
        return ResponseEntity.notFound().build();
    }

    // Deletar lead permanentemente
    @Operation(summary = "Excluir lead", description = "Deleta permanentemente um lead. Exige JWT.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarLead(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
