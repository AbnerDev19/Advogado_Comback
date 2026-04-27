package br.com.vitorrocha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class LeadDTO {

    @Data
    public static class Request {
        @NotBlank(message = "Nome é obrigatório")
        private String nome;

        @NotBlank(message = "Contato é obrigatório")
        private String contato;

        private String area;

        @NotBlank(message = "Motivo é obrigatório")
        private String motivo;

        private String origem = "FORMULARIO_SITE";
    }

    @Data
    public static class StatusUpdate {
        @NotBlank(message = "Status é obrigatório")
        private String status;
    }

    @Data
    public static class NotasUpdate {
        private String notasInternas;
    }

    @Data
    public static class Stats {
        private long total;
        private long novos;
        private long emAndamento;
        private long concluidos;
        private long arquivados;
    }
}
