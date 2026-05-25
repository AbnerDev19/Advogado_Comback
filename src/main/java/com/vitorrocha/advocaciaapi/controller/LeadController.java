package com.vitorrocha.advocaciaapi.controller;

import com.vitorrocha.advocaciaapi.model.Lead;
import com.vitorrocha.advocaciaapi.model.Nota;
import com.vitorrocha.advocaciaapi.repository.LeadRepository;
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

    @PostMapping
    public ResponseEntity<Lead> criarLead(@RequestBody Lead lead) {
        return ResponseEntity.status(201).body(repository.save(lead));
    }

    @GetMapping
    public ResponseEntity<List<Lead>> listarLeads() {
        return ResponseEntity.ok(repository.findAll());
    }

    // NOVO: Atualizar Status
    @PutMapping("/{id}/status")
    public ResponseEntity<Lead> atualizarStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Lead> leadOpt = repository.findById(id);
        if (leadOpt.isPresent()) {
            Lead lead = leadOpt.get();
            lead.setStatus(body.get("status"));
            return ResponseEntity.ok(repository.save(lead));
        }
        return ResponseEntity.notFound().build();
    }

    // NOVO: Deletar Lead
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarLead(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // NOVO: Adicionar Nota Interna
    @PostMapping("/{id}/notas")
    public ResponseEntity<Lead> adicionarNota(@PathVariable Long id, @RequestBody Nota nota) {
        Optional<Lead> leadOpt = repository.findById(id);
        if (leadOpt.isPresent()) {
            Lead lead = leadOpt.get();
            nota.setLead(lead);
            lead.getNotas().add(nota);
            return ResponseEntity.ok(repository.save(lead));
        }
        return ResponseEntity.notFound().build();
    }
}