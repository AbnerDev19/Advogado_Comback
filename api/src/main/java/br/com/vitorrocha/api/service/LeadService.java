package br.com.vitorrocha.api.service;

import br.com.vitorrocha.api.dto.LeadDTO;
import br.com.vitorrocha.api.model.Lead;
import br.com.vitorrocha.api.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;

    public Lead criar(LeadDTO.Request dto) {
        Lead lead = new Lead();
        lead.setNome(dto.getNome());
        lead.setContato(dto.getContato());
        lead.setArea(dto.getArea());
        lead.setMotivo(dto.getMotivo());
        lead.setOrigem(dto.getOrigem() != null ? dto.getOrigem() : "FORMULARIO_SITE");
        lead.setStatus("NOVO_CONTATO");
        return leadRepository.save(lead);
    }

    public List<Lead> listarTodos() {
        return leadRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Lead> listarPorStatus(String status) {
        return leadRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public Lead buscarPorId(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead não encontrado: " + id));
    }

    public Lead atualizarStatus(Long id, String novoStatus) {
        Lead lead = buscarPorId(id);
        lead.setStatus(novoStatus.toUpperCase());
        return leadRepository.save(lead);
    }

    public Lead atualizarNotas(Long id, String notas) {
        Lead lead = buscarPorId(id);
        lead.setNotasInternas(notas);
        return leadRepository.save(lead);
    }

    public void excluir(Long id) {
        leadRepository.deleteById(id);
    }

    public LeadDTO.Stats estatisticas() {
        LeadDTO.Stats stats = new LeadDTO.Stats();
        stats.setTotal(leadRepository.count());
        stats.setNovos(leadRepository.countByStatus("NOVO_CONTATO"));
        stats.setEmAndamento(leadRepository.countByStatus("EM_ANDAMENTO"));
        stats.setConcluidos(leadRepository.countByStatus("CONCLUIDO"));
        stats.setArquivados(leadRepository.countByStatus("ARQUIVADO"));
        return stats;
    }
}
