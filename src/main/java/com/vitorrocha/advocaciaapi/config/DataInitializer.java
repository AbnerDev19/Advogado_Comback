package com.vitorrocha.advocaciaapi.config;

import com.vitorrocha.advocaciaapi.model.Usuario;
import com.vitorrocha.advocaciaapi.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Cria o usuário admin padrão se ele não existir
        if (usuarioRepository.findByEmail("admin@vitorrochaadv.com.br").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setEmail("admin@vitorrochaadv.com.br");
            admin.setSenha(passwordEncoder.encode("admin123")); // Senha encriptada!
            admin.setRole("ADMIN");
            usuarioRepository.save(admin);
            System.out.println("Usuário Admin criado com sucesso!");
        }
    }
}