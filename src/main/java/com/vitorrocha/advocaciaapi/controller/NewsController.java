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

    // --- ROTA DE CRIAR NOTÍCIA ---
    @Operation(summary = "Criar uma nova notícia", description = "Publica um novo artigo no banco de dados. Atenção: Exige que o advogado esteja logado com o Token (cadeado verde).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notícia salva com sucesso!"),
        @ApiResponse(responseCode = "403", description = "Erro: Você esqueceu de colocar o Token no cadeado verde.")
    })
    @PostMapping
    public News criarNews(@RequestBody News news) {
        return repository.save(news);
    }

    // --- ROTA DE VER NOTÍCIAS ---
    @Operation(summary = "Ver todas as notícias", description = "Mostra uma lista com todos os artigos já publicados no site. Qualquer pessoa pode ver (não precisa de token).")
    @ApiResponse(responseCode = "200", description = "Deu tudo certo! Lista carregada.")
    @GetMapping
    public List<News> listarTodas() {
        return repository.findAll();
    }

    // --- ROTA DE ATUALIZAR NOTÍCIA ---
    @Operation(summary = "Editar uma notícia", description = "Atualiza os textos de uma publicação que já existe. Exige Token (cadeado verde).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notícia atualizada com sucesso!"),
        @ApiResponse(responseCode = "404", description = "Erro: Nenhuma notícia encontrada com esse ID."),
        @ApiResponse(responseCode = "403", description = "Erro: Você esqueceu de colocar o Token no cadeado verde.")
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

    // --- ROTA DE DELETAR NOTÍCIA ---
    @Operation(summary = "Apagar uma notícia", description = "Deleta permanentemente um artigo do blog. Exige Token (cadeado verde).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notícia apagada com sucesso!"),
        @ApiResponse(responseCode = "404", description = "Erro: Nenhuma notícia encontrada com esse ID para apagar."),
        @ApiResponse(responseCode = "403", description = "Erro: Você esqueceu de colocar o Token no cadeado verde.")
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