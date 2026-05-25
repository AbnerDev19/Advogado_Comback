package com.vitorrocha.advocaciaapi.config;

import com.vitorrocha.advocaciaapi.model.Usuario;
import com.vitorrocha.advocaciaapi.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // CORRIGIDO: Credenciais antes estavam hardcoded no código.
    // Agora vêm do application.properties (que por sua vez aceita variáveis de ambiente).
    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.findByEmail(adminEmail).isEmpty()) {
            Usuario admin = new Usuario();
            admin.setEmail(adminEmail);
            admin.setSenha(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            usuarioRepository.save(admin);
            System.out.println("Usuário Admin criado: " + adminEmail);
        }
    }
}
