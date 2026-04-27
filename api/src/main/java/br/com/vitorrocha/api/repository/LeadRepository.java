package br.com.vitorrocha.api.repository;

import br.com.vitorrocha.api.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByStatusOrderByCreatedAtDesc(String status);
    List<Lead> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.status = :status")
    Long countByStatus(String status);
}
