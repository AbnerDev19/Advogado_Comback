package com.vitorrocha.advocacia.controller;

import com.vitorrocha.advocacia.dto.NoticiaRequest;
import com.vitorrocha.advocacia.model.Noticia;
import com.vitorrocha.advocacia.service.NoticiaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {

    @Autowired private NoticiaService service;

    // ── PÚBLICO — página noticias.html ────────────────────────────────────────
    @GetMapping("/publicas")
    public ResponseEntity<List<Noticia>> listarPublicas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/publicas/{id}")
    public ResponseEntity<Noticia> buscarPublica(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── PRIVADOS — painel admin (exige JWT) ───────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Noticia>> listarAdmin() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody NoticiaRequest req,
                                   Authentication auth) {
        Noticia n = service.criar(req, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensagem", "Notícia publicada com sucesso.",
                "id", n.getIdNoticia()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id,
                                       @Valid @RequestBody NoticiaRequest req) {
        return service.atualizar(id, req)
                .map(n -> ResponseEntity.ok(Map.of("mensagem", "Notícia atualizada.")))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        return service.deletar(id)
                ? ResponseEntity.ok(Map.of("mensagem", "Notícia removida."))
                : ResponseEntity.notFound().build();
    }
}
