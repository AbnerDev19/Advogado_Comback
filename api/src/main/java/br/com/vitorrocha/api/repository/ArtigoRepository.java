package br.com.vitorrocha.api.repository;

import br.com.vitorrocha.api.model.Artigo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtigoRepository extends JpaRepository<Artigo, Long> {
    List<Artigo> findByStatusOrderByPublicadoEmDesc(String status);
    Optional<Artigo> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
