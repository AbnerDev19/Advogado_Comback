package com.vitorrocha.advocacia.repository;

import com.vitorrocha.advocacia.model.Contato;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContatoRepository extends JpaRepository<Contato, Long> {
    List<Contato> findAllByOrderByDataEnvioDesc();
    List<Contato> findByStatusOrderByDataEnvioDesc(Contato.Status status);
    long countByStatus(Contato.Status status);
}
