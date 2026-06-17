package com.vitorrocha.advocaciaapi.controller;

import com.vitorrocha.advocaciaapi.model.Lead;
import com.vitorrocha.advocaciaapi.repository.LeadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*")
@Tag(name = "Contatos (Leads)", description = "Gerenciamento de solicitações de contato feitas pelo site")
public class LeadController {

    @Autowired
    private LeadRepository repository;

    @Operation(summary = "Criar um novo contato", description = "Salva um novo pedido de contato enviado pelo cliente através do formulário do site. Rota pública.")
    @ApiResponse(responseCode = "201", description = "Contato salvo com sucesso!")
    @PostMapping
    public ResponseEntity<Lead> criarLead(@RequestBody Lead lead) {
        // Rota pública: nunca confiar em um ID enviado pelo cliente.
        // Sem isto, qualquer pessoa sem login poderia reenviar um POST com o
        // ID de um lead existente e sobrescrever/arquivar os dados de outro
        // cliente, já que esta rota é permitAll no SecurityConfig.
        lead.setId(null);
        return ResponseEntity.status(201).body(repository.save(lead));
    }

    @Operation(summary = "Ver todos os contatos", description = "Mostra a lista de contatos recebidos. Exige Token JWT (cadeado verde).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de contatos carregada com sucesso."),
        @ApiResponse(responseCode = "403", description = "Erro: Você esqueceu de colocar o Token no cadeado verde.")
    })
    @GetMapping
    public ResponseEntity<List<Lead>> listarLeads() {
        return ResponseEntity.ok(repository.findAll());
    }

    @Operation(summary = "Atualizar status de um contato", description = "Atualiza o status (novo, em andamento, concluído, arquivado) de um lead existente. Exige Token (cadeado verde).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status atualizado com sucesso!"),
        @ApiResponse(responseCode = "404", description = "Erro: Nenhum contato encontrado com esse ID."),
        @ApiResponse(responseCode = "403", description = "Erro: Você esqueceu de colocar o Token no cadeado verde.")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<Lead> atualizarStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO body) {
        return repository.findById(id)
                .map(lead -> {
                    lead.setStatus(body.getStatus());
                    return ResponseEntity.ok(repository.save(lead));
                }).orElse(ResponseEntity.notFound().build());
    }

    public static class StatusUpdateDTO {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}