package com.vitorrocha.advocacia.dto;

import com.vitorrocha.advocacia.model.Contato;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ContatoStatusUpdate {
    @NotNull(message = "Status é obrigatório")
    private Contato.Status status;
}
