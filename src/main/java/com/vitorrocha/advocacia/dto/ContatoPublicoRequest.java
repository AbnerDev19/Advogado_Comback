package com.vitorrocha.advocacia.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ContatoPublicoRequest {

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    // E-mail ou telefone (campo livre do site)
    @NotBlank(message = "Contato (e-mail ou telefone) é obrigatório")
    private String contato;

    @NotBlank(message = "Mensagem é obrigatória")
    private String mensagem;
}
