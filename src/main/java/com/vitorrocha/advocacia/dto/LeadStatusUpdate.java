package com.vitorrocha.advocacia.dto;

import com.vitorrocha.advocacia.model.Lead;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeadStatusUpdate {

    @NotNull(message = "Status é obrigatório")
    private Lead.Status status;
}
