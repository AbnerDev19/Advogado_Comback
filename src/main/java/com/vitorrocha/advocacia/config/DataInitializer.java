package com.vitorrocha.advocacia.config;

import com.vitorrocha.advocacia.model.Administrador;
import com.vitorrocha.advocacia.repository.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private AdministradorRepository adminRepo;
    @Autowired private PasswordEncoder encoder;

    @Value("${app.admin.nome}")    private String nome;
    @Value("${app.admin.email}")   private String email;
    @Value("${app.admin.password}") private String password;

    @Override
    public void run(String... args) {
        if (!adminRepo.existsByEmail(email)) {
            Administrador admin = new Administrador();
            admin.setNome(nome);
            admin.setEmail(email);
            admin.setSenha(encoder.encode(password));
            admin.setRole("ADMIN");
            adminRepo.save(admin);
            System.out.println("✅ Admin criado: " + email + " / senha: " + password);
        }
    }
}
