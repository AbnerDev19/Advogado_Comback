package com.vitorrocha.advocacia.repository;

import com.vitorrocha.advocacia.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByEmail(String email);
    Optional<Cliente> findByTelefone(String telefone);
}
