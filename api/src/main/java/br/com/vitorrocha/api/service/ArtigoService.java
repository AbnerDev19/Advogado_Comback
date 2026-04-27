package br.com.vitorrocha.api.service;

import br.com.vitorrocha.api.dto.ArtigoDTO;
import br.com.vitorrocha.api.model.Artigo;
import br.com.vitorrocha.api.repository.ArtigoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtigoService {

    private final ArtigoRepository artigoRepository;

    public List<Artigo> listarPublicados() {
        return artigoRepository.findByStatusOrderByPublicadoEmDesc("PUBLICADO");
    }

    public List<Artigo> listarTodos() {
        return artigoRepository.findAll();
    }

    public Artigo buscarPorSlug(String slug) {
        return artigoRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Artigo não encontrado: " + slug));
    }

    public Artigo criar(ArtigoDTO.Request dto) {
        Artigo artigo = new Artigo();
        artigo.setTitulo(dto.getTitulo());
        artigo.setSlug(gerarSlug(dto.getTitulo()));
        artigo.setResumo(dto.getResumo());
        artigo.setConteudo(dto.getConteudo());
        artigo.setCategoria(dto.getCategoria());
        artigo.setStatus(dto.getStatus() != null ? dto.getStatus() : "RASCUNHO");

        if ("PUBLICADO".equals(artigo.getStatus())) {
            artigo.setPublicadoEm(LocalDateTime.now());
        }

        return artigoRepository.save(artigo);
    }

    public Artigo atualizar(Long id, ArtigoDTO.Request dto) {
        Artigo artigo = artigoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artigo não encontrado: " + id));

        artigo.setTitulo(dto.getTitulo());
        artigo.setResumo(dto.getResumo());
        artigo.setConteudo(dto.getConteudo());
        artigo.setCategoria(dto.getCategoria());

        if ("PUBLICADO".equals(dto.getStatus()) && !"PUBLICADO".equals(artigo.getStatus())) {
            artigo.setPublicadoEm(LocalDateTime.now());
        }
        artigo.setStatus(dto.getStatus());

        return artigoRepository.save(artigo);
    }

    public void excluir(Long id) {
        artigoRepository.deleteById(id);
    }

    private String gerarSlug(String titulo) {
        String slug = Normalizer.normalize(titulo, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();

        // Garantir slug único
        String slugFinal = slug;
        int contador = 1;
        while (artigoRepository.existsBySlug(slugFinal)) {
            slugFinal = slug + "-" + contador++;
        }
        return slugFinal;
    }
}
