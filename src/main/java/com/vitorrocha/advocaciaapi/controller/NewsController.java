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
@Tag(name = "Notícias", description = "Área para o advogado gerenciar as publicações do blog")
public class NewsController {

    @Autowired
    private NewsRepository repository;

    @Operation(summary = "Criar uma nova notícia", description = "Publica um novo artigo no banco de dados. Exige Token.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notícia criada com sucesso!"),
        @ApiResponse(responseCode = "403", description = "Erro: Token inválido ou ausente.")
    })
    @PostMapping
    // CORRIGIDO: Antes retornava News diretamente (sempre HTTP 200).
    // O correto ao criar um recurso é retornar ResponseEntity com status 201 Created.
    public ResponseEntity<News> criarNews(@RequestBody News news) {
        return ResponseEntity.status(201).body(repository.save(news));
    }

    @Operation(summary = "Ver todas as notícias", description = "Lista todos os artigos publicados. Público, não precisa de token.")
    @ApiResponse(responseCode = "200", description = "Lista carregada com sucesso.")
    @GetMapping
    public List<News> listarTodas() {
        return repository.findAll();
    }

    @Operation(summary = "Editar uma notícia", description = "Atualiza os textos de uma publicação existente. Exige Token.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notícia atualizada com sucesso!"),
        @ApiResponse(responseCode = "404", description = "Notícia não encontrada."),
        @ApiResponse(responseCode = "403", description = "Erro: Token inválido ou ausente.")
    })
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

    @Operation(summary = "Apagar uma notícia", description = "Deleta permanentemente um artigo. Exige Token.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notícia apagada com sucesso!"),
        @ApiResponse(responseCode = "404", description = "Notícia não encontrada."),
        @ApiResponse(responseCode = "403", description = "Erro: Token inválido ou ausente.")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarNews(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
