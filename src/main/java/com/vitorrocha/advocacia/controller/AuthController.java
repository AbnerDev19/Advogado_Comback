package com.vitorrocha.advocacia.controller;

import com.vitorrocha.advocacia.dto.Auth;
import com.vitorrocha.advocacia.model.Usuario;
import com.vitorrocha.advocacia.repository.UsuarioRepository;
import com.vitorrocha.advocacia.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody Auth.LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtils.generateToken(userDetails);

            Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                    .orElseThrow();

            return ResponseEntity.ok(new Auth.LoginResponse(token, usuario.getNome(), usuario.getEmail()));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("erro", "E-mail ou senha incorretos."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("erro", "Não autenticado"));
        }
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .map(u -> ResponseEntity.ok(Map.of(
                        "nome", u.getNome(),
                        "email", u.getEmail(),
                        "role", u.getRole()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
