package com.vitorrocha.advocaciaapi.repository;

import com.vitorrocha.advocaciaapi.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Filtrar leads por status (para o endpoint ?status=)
    List<Lead> findByStatus(String status);

    // Contagem por status (para o endpoint /stats)
    long countByStatus(String status);

    // Contagem excluindo um status (total de não-arquivados)
    long countByStatusNot(String status);
}
