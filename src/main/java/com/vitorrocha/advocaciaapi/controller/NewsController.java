package com.vitorrocha.advocaciaapi.controller;

import com.vitorrocha.advocaciaapi.model.News;
import com.vitorrocha.advocaciaapi.repository.NewsRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
@Tag(name = "Notícias", description = "Gerenciamento das publicações do blog")
public class NewsController {

    @Autowired
    private NewsRepository repository;

    // GET público — lista artigos publicados (usado pelo site noticias.html)
    @Operation(summary = "Listar artigos publicados", description = "Retorna apenas artigos com status 'Publicado'. Público, sem token.")
    @GetMapping
    public ResponseEntity<List<News>> listarPublicados() {
        return ResponseEntity.ok(repository.findByStatus("Publicado"));
    }

    // GET autenticado — lista todos (incluindo rascunhos) para o dashboard
    @Operation(summary = "Listar todos os artigos (admin)", description = "Retorna todos os artigos incluindo rascunhos. Exige JWT.")
    @GetMapping("/admin")
    public ResponseEntity<List<News>> listarTodos() {
        return ResponseEntity.ok(repository.findAll());
    }

    // GET por slug — para abrir um artigo específico no site
    @Operation(summary = "Buscar artigo por slug")
    @GetMapping("/{slug}")
    public ResponseEntity<News> buscarPorSlug(@PathVariable String slug) {
        return repository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST — criar artigo (requer JWT)
    @Operation(summary = "Criar artigo")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Artigo criado com sucesso."),
        @ApiResponse(responseCode = "403", description = "Token inválido ou ausente.")
    })
    @PostMapping
    public ResponseEntity<News> criarNews(@RequestBody News news) {
        // Gera slug automaticamente se não for enviado
        if (news.getSlug() == null || news.getSlug().isBlank()) {
            news.setSlug(gerarSlug(news.getTitulo()));
        }
        return ResponseEntity.status(201).body(repository.save(news));
    }

    // PUT — editar artigo (requer JWT)
    @Operation(summary = "Editar artigo")
    @PutMapping("/{id}")
    public ResponseEntity<News> atualizarNews(
            @PathVariable Long id, @RequestBody News newsAtualizada) {
        return repository.findById(id)
                .map(news -> {
                    news.setTitulo(newsAtualizada.getTitulo());
                    if (newsAtualizada.getSlug() != null && !newsAtualizada.getSlug().isBlank()) {
                        news.setSlug(newsAtualizada.getSlug());
                    }
                    news.setCategoria(newsAtualizada.getCategoria());
                    news.setStatus(newsAtualizada.getStatus());
                    news.setResumo(newsAtualizada.getResumo());
                    news.setConteudo(newsAtualizada.getConteudo());
                    return ResponseEntity.ok(repository.save(news));
                }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE — excluir artigo (requer JWT)
    @Operation(summary = "Excluir artigo")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarNews(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Utilitário: gera slug a partir do título
    private String gerarSlug(String titulo) {
        if (titulo == null) return "";
        return titulo.toLowerCase()
                .replaceAll("[àáâãä]", "a")
                .replaceAll("[èéêë]", "e")
                .replaceAll("[ìíîï]", "i")
                .replaceAll("[òóôõö]", "o")
                .replaceAll("[ùúûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
    }
}
