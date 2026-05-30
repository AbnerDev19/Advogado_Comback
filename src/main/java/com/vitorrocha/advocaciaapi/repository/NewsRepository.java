package com.vitorrocha.advocaciaapi.repository;

import com.vitorrocha.advocaciaapi.model.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    // Busca por slug (para o endpoint público /{slug})
    Optional<News> findBySlug(String slug);

    // Filtra por status (para listar apenas "Publicado" no site)
    List<News> findByStatus(String status);
}
