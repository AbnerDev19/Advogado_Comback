package com.vitorrocha.advocaciaapi.controller;

import com.vitorrocha.advocaciaapi.model.Lead;
import com.vitorrocha.advocaciaapi.repository.LeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*") // Permite que o front-end acesse a API sem bloqueio de CORS
public class LeadController {

    @Autowired
    private LeadRepository repository;

    @PostMapping
    public Lead criarLead(@RequestBody Lead lead) {
        return repository.save(lead);
    }

    @GetMapping
    public List<Lead> listarTodos() {
        return repository.findAll();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Lead> atualizarStatus(@PathVariable Long id, @RequestBody Lead leadAtualizado) {
        return repository.findById(id)
                .map(lead -> {
                    lead.setStatus(leadAtualizado.getStatus());
                    return ResponseEntity.ok(repository.save(lead));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarLead(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}