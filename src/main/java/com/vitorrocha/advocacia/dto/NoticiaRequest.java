package com.vitorrocha.advocacia.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class NoticiaRequest {

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    @NotBlank(message = "Conteúdo é obrigatório")
    private String conteudo;

    private String categoria;
}
