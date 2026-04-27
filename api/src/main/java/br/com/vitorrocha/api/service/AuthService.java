package br.com.vitorrocha.api.service;

import br.com.vitorrocha.api.dto.AuthDTO;
import br.com.vitorrocha.api.model.Usuario;
import br.com.vitorrocha.api.repository.UsuarioRepository;
import br.com.vitorrocha.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest request) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        String token = jwtUtil.gerarToken(auth.getName());

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow();

        return new AuthDTO.LoginResponse(token, usuario.getNome(), usuario.getEmail());
    }
}
