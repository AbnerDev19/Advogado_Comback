package com.vitorrocha.advocacia.security;

import com.vitorrocha.advocacia.model.Administrador;
import com.vitorrocha.advocacia.repository.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private AdministradorRepository adminRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Administrador admin = adminRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Admin não encontrado: " + email));

        return new User(
                admin.getEmail(),
                admin.getSenha(),
                List.of(new SimpleGrantedAuthority("ROLE_" + admin.getRole()))
        );
    }
}
