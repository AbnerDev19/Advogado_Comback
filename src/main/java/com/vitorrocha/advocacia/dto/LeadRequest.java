package com.vitorrocha.advocacia.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// DTO para receber o formulário de contato do site
@Getter
@Setter
public class LeadRequest {

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "Contato é obrigatório")
    private String contato;

    @NotBlank(message = "Motivo é obrigatório")
    private String motivo;
}
