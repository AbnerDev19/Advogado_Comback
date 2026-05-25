package com.vitorrocha.advocaciaapi.controller;

import com.vitorrocha.advocaciaapi.dto.LoginRequestDTO;
import com.vitorrocha.advocaciaapi.dto.LoginResponseDTO;
import com.vitorrocha.advocaciaapi.model.Usuario;
import com.vitorrocha.advocaciaapi.repository.UsuarioRepository;
import com.vitorrocha.advocaciaapi.security.JwtUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Autenticação")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        Optional<Usuario> userOpt = usuarioRepository.findByEmail(request.getEmail());
        
        // Verifica se o usuário existe e se a senha bate com o hash no banco
        if (userOpt.isPresent() && passwordEncoder.matches(request.getSenha(), userOpt.get().getSenha())) {
            String token = jwtUtil.generateToken(request.getEmail());
            return ResponseEntity.ok(new LoginResponseDTO(token));
        }
        return ResponseEntity.status(401).build();
    }
}