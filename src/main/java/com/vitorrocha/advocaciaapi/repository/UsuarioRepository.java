package com.vitorrocha.advocaciaapi.repository;

import com.vitorrocha.advocaciaapi.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método mágico do Spring que busca o usuário pelo email
    Optional<Usuario> findByEmail(String email);
}