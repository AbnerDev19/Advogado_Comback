package com.vitorrocha.advocacia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

public class Auth {

    @Getter
    @Setter
    public static class LoginRequest {
        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        private String email;

        @NotBlank(message = "Senha é obrigatória")
        private String password;
    }

    @Getter
    @Setter
    public static class LoginResponse {
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
}
