package com.vitorrocha.advocacia.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginResponse {
    private String token;
    private String nome;
    private String email;
    private String tipo = "Bearer";

    public LoginResponse(String token, String nome, String email) {
        this.token = token;
        this.nome = nome;
        this.email = email;
    }
}
