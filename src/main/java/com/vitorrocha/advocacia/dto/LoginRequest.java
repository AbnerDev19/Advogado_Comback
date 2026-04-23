package com.vitorrocha.advocacia.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginRequest {
    @NotBlank public String email;
    @NotBlank public String password;
}
