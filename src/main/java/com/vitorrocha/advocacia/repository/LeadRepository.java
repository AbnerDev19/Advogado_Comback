package com.vitorrocha.advocacia.repository;

import com.vitorrocha.advocacia.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    List<Lead> findByStatusOrderByDataRegistroDesc(Lead.Status status);

    List<Lead> findAllByOrderByDataRegistroDesc();

    long countByStatus(Lead.Status status);
}
