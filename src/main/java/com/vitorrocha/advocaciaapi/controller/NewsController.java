package com.vitorrocha.advocaciaapi.controller;

import com.vitorrocha.advocaciaapi.model.News;
import com.vitorrocha.advocaciaapi.repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsRepository repository;

    @PostMapping
    public News criarNews(@RequestBody News news) {
        return repository.save(news);
    }

    @GetMapping
    public List<News> listarTodas() {
        return repository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<News> atualizarNews(@PathVariable Long id, @RequestBody News newsAtualizada) {
        return repository.findById(id)
                .map(news -> {
                    news.setTitulo(newsAtualizada.getTitulo());
                    news.setSlug(newsAtualizada.getSlug());
                    news.setCategoria(newsAtualizada.getCategoria());
                    news.setStatus(newsAtualizada.getStatus());
                    news.setResumo(newsAtualizada.getResumo());
                    news.setConteudo(newsAtualizada.getConteudo());
                    return ResponseEntity.ok(repository.save(news));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarNews(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}