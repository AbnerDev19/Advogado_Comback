package com.vitorrocha.advocacia.repository;

import com.vitorrocha.advocacia.model.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    List<Noticia> findAllByOrderByDataPublicacaoDesc();
    List<Noticia> findByCategoriaIgnoreCaseOrderByDataPublicacaoDesc(String categoria);
}
