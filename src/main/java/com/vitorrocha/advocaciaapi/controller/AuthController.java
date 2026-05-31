package com.vitorrocha.advocaciaapi.controller;

import com.vitorrocha.advocaciaapi.dto.LoginRequestDTO;
import com.vitorrocha.advocaciaapi.dto.LoginResponseDTO;
import com.vitorrocha.advocaciaapi.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Autenticação", description = "Geração de tokens JWT para acesso às rotas protegidas")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil; // Ferramenta que gera o token real injetada aqui

    @Operation(summary = "Fazer login no sistema", description = "Recebe e-mail e senha do administrador e retorna o Token JWT para autorização no Swagger.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login efetuado com sucesso! Token gerado."),
        @ApiResponse(responseCode = "401", description = "Erro: E-mail ou senha incorretos.")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        
        if ("admin@vitorrochaadv.com.br".equals(request.getEmail()) && "admin123".equals(request.getSenha())) {
            // Gera o token criptografado de verdade usando o e-mail
            String tokenDeVerdade = jwtUtil.generateToken(request.getEmail());
            return ResponseEntity.ok(new LoginResponseDTO(tokenDeVerdade));
        }
        return ResponseEntity.status(401).build();
    }
}