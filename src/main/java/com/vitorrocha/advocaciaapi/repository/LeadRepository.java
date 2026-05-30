package com.vitorrocha.advocaciaapi.repository;

import com.vitorrocha.advocaciaapi.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
}