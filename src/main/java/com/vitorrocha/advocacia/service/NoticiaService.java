package com.vitorrocha.advocacia.service;

import com.vitorrocha.advocacia.dto.NoticiaRequest;
import com.vitorrocha.advocacia.model.*;
import com.vitorrocha.advocacia.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class NoticiaService {

    @Autowired private NoticiaRepository noticiaRepo;
    @Autowired private AdministradorRepository adminRepo;

    public List<Noticia> listarTodas() {
        return noticiaRepo.findAllByOrderByDataPublicacaoDesc();
    }

    public Optional<Noticia> buscarPorId(Long id) {
        return noticiaRepo.findById(id);
    }

    @Transactional
    public Noticia criar(NoticiaRequest req, String emailAdmin) {
        Administrador admin = adminRepo.findByEmail(emailAdmin)
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"));

        Noticia n = new Noticia();
        n.setTitulo(req.getTitulo().trim());
        n.setConteudo(req.getConteudo().trim());
        n.setCategoria(req.getCategoria() != null ? req.getCategoria().trim() : "Geral");
        n.setDataPublicacao(LocalDate.now());
        n.setAdministrador(admin);
        return noticiaRepo.save(n);
    }

    @Transactional
    public Optional<Noticia> atualizar(Long id, NoticiaRequest req) {
        return noticiaRepo.findById(id).map(n -> {
            n.setTitulo(req.getTitulo().trim());
            n.setConteudo(req.getConteudo().trim());
            if (req.getCategoria() != null) n.setCategoria(req.getCategoria().trim());
            return noticiaRepo.save(n);
        });
    }

    @Transactional
    public boolean deletar(Long id) {
        if (noticiaRepo.existsById(id)) {
            noticiaRepo.deleteById(id);
            return true;
        }
        return false;
    }
}
