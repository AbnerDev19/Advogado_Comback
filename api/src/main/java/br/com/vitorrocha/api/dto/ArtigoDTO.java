package br.com.vitorrocha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class ArtigoDTO {

    @Data
    public static class Request {
        @NotBlank(message = "Título é obrigatório")
        private String titulo;

        private String slug; // gerado automaticamente se não informado

        @NotBlank(message = "Resumo é obrigatório")
        private String resumo;

        @NotBlank(message = "Conteúdo é obrigatório")
        private String conteudo;

        @NotBlank(message = "Categoria é obrigatória")
        private String categoria;

        private String status = "RASCUNHO";
    }
}
