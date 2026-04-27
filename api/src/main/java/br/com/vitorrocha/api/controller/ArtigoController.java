package br.com.vitorrocha.api.controller;

import br.com.vitorrocha.api.dto.ArtigoDTO;
import br.com.vitorrocha.api.model.Artigo;
import br.com.vitorrocha.api.service.ArtigoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ArtigoController {

    private final ArtigoService artigoService;

    /**
     * GET /api/artigos  [PÚBLICO]
     * Lista artigos publicados para o site
     */
    @GetMapping("/api/artigos")
    public ResponseEntity<List<Artigo>> listar() {
        return ResponseEntity.ok(artigoService.listarPublicados());
    }

    /**
     * GET /api/admin/artigos  [PROTEGIDO]
     * Lista todos os artigos incluindo rascunhos
     */
    @GetMapping("/api/admin/artigos")
    public ResponseEntity<List<Artigo>> listarTodos() {
        return ResponseEntity.ok(artigoService.listarTodos());
    }

    /**
     * GET /api/artigos/{slug}  [PÚBLICO]
     * Busca artigo pelo slug para a página de leitura
     */
    @GetMapping("/api/artigos/{slug}")
    public ResponseEntity<Artigo> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(artigoService.buscarPorSlug(slug));
    }

    /**
     * POST /api/artigos  [PROTEGIDO]
     * Cria novo artigo
     */
    @PostMapping("/api/artigos")
    public ResponseEntity<Artigo> criar(@Valid @RequestBody ArtigoDTO.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(artigoService.criar(dto));
    }

    /**
     * PUT /api/artigos/{id}  [PROTEGIDO]
     */
    @PutMapping("/api/artigos/{id}")
    public ResponseEntity<Artigo> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ArtigoDTO.Request dto) {
        return ResponseEntity.ok(artigoService.atualizar(id, dto));
    }

    /**
     * DELETE /api/artigos/{id}  [PROTEGIDO]
     */
    @DeleteMapping("/api/artigos/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        artigoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
