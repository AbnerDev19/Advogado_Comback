package com.vitorrocha.advocacia.controller;

import com.vitorrocha.advocacia.dto.LoginRequest;
import com.vitorrocha.advocacia.dto.LoginResponse;
import com.vitorrocha.advocacia.model.Administrador;
import com.vitorrocha.advocacia.repository.AdministradorRepository;
import com.vitorrocha.advocacia.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private AdministradorRepository adminRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

            UserDetails user = (UserDetails) auth.getPrincipal();
            String token = jwtUtils.generateToken(user);
            Administrador admin = adminRepo.findByEmail(req.getEmail()).orElseThrow();

            return ResponseEntity.ok(new LoginResponse(token, admin.getNome(), admin.getEmail()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("erro", "E-mail ou senha incorretos."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("erro", "Não autenticado"));
        return adminRepo.findByEmail(auth.getName())
                .map(a -> ResponseEntity.ok(Map.of("nome", a.getNome(), "email", a.getEmail())))
                .orElse(ResponseEntity.notFound().build());
    }
}
