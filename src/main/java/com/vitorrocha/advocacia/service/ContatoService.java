package com.vitorrocha.advocacia.service;

import com.vitorrocha.advocacia.dto.ContatoPublicoRequest;
import com.vitorrocha.advocacia.model.*;
import com.vitorrocha.advocacia.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ContatoService {

    @Autowired private ContatoRepository contatoRepo;
    @Autowired private ClienteRepository clienteRepo;

    /**
     * Recebe o formulário público.
     * Detecta se o campo "contato" é e-mail ou telefone.
     * Reutiliza um Cliente já existente ou cria um novo.
     */
    @Transactional
    public Contato receberContato(ContatoPublicoRequest req) {
        String contatoStr = req.getContato().trim();
        boolean isEmail = contatoStr.contains("@");

        // Busca cliente existente pelo e-mail ou telefone
        Optional<Cliente> existente = isEmail
                ? clienteRepo.findByEmail(contatoStr)
                : clienteRepo.findByTelefone(contatoStr);

        Cliente cliente = existente.orElseGet(() -> {
            Cliente novo = new Cliente();
            novo.setNome(req.getNome().trim());
            if (isEmail) {
                novo.setEmail(contatoStr);
            } else {
                novo.setTelefone(contatoStr);
            }
            return clienteRepo.save(novo);
        });

        Contato contato = new Contato();
        contato.setMensagem(req.getMensagem().trim());
        contato.setDataEnvio(LocalDateTime.now());
        contato.setStatus(Contato.Status.pendente);
        contato.setCliente(cliente);
        return contatoRepo.save(contato);
    }

    public List<Contato> listarTodos() {
        return contatoRepo.findAllByOrderByDataEnvioDesc();
    }

    public List<Contato> listarPorStatus(Contato.Status status) {
        return contatoRepo.findByStatusOrderByDataEnvioDesc(status);
    }

    public Optional<Contato> buscarPorId(Long id) {
        return contatoRepo.findById(id);
    }

    @Transactional
    public Optional<Contato> atualizarStatus(Long id, Contato.Status novoStatus) {
        return contatoRepo.findById(id).map(c -> {
            c.setStatus(novoStatus);
            return contatoRepo.save(c);
        });
    }

    @Transactional
    public boolean deletar(Long id) {
        if (contatoRepo.existsById(id)) {
            contatoRepo.deleteById(id);
            return true;
        }
        return false;
    }

    public Map<String, Long> getStats() {
        return Map.of(
                "pendentes",  contatoRepo.countByStatus(Contato.Status.pendente),
                "atendidos",  contatoRepo.countByStatus(Contato.Status.atendido),
                "total",      contatoRepo.count()
        );
    }
}
