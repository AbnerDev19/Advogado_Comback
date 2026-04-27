package br.com.vitorrocha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// ─── Auth ───────────────────────────────────────
public class AuthDTO {

    @Data
    public static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String senha;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private String tipo = "Bearer";
        private String nome;
        private String email;

        public LoginResponse(String token, String nome, String email) {
            this.token = token;
            this.nome  = nome;
            this.email = email;
        }
    }
}
