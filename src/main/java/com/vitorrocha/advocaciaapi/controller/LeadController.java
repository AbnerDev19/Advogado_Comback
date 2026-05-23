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
}