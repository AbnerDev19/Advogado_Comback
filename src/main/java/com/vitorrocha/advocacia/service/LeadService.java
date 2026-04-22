package com.vitorrocha.advocacia.service;

import com.vitorrocha.advocacia.dto.LeadRequest;
import com.vitorrocha.advocacia.model.Lead;
import com.vitorrocha.advocacia.repository.LeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class LeadService {

    @Autowired
    private LeadRepository leadRepository;

    @Transactional
    public Lead criarLead(LeadRequest request) {
        Lead lead = new Lead();
        lead.setNome(request.getNome().trim());
        lead.setContato(request.getContato().trim());
        lead.setMotivo(request.getMotivo().trim());
        lead.setStatus(Lead.Status.novo_contato);
        lead.setDataRegistro(LocalDateTime.now());
        return leadRepository.save(lead);
    }

    public List<Lead> listarTodos() {
        return leadRepository.findAllByOrderByDataRegistroDesc();
    }

    public List<Lead> listarPorStatus(Lead.Status status) {
        return leadRepository.findByStatusOrderByDataRegistroDesc(status);
    }

    public Optional<Lead> buscarPorId(Long id) {
        return leadRepository.findById(id);
    }

    @Transactional
    public Optional<Lead> atualizarStatus(Long id, Lead.Status novoStatus) {
        return leadRepository.findById(id).map(lead -> {
            lead.setStatus(novoStatus);
            return leadRepository.save(lead);
        });
    }

    @Transactional
    public boolean deletar(Long id) {
        if (leadRepository.existsById(id)) {
            leadRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Map<String, Long> getEstatisticas() {
        long novos     = leadRepository.countByStatus(Lead.Status.novo_contato);
        long andamento = leadRepository.countByStatus(Lead.Status.em_andamento);
        long concluido = leadRepository.countByStatus(Lead.Status.concluido);
        long total     = leadRepository.count();

        return Map.of(
                "novos", novos,
                "em_andamento", andamento,
                "concluidos", concluido,
                "total", total
        );
    }
}
