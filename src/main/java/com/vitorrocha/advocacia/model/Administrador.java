package com.vitorrocha.advocacia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "administrador")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Administrador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_admin")
    private Long idAdmin;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    // role interno para Spring Security (não está no DER mas necessário)
    @Column(nullable = false)
    private String role = "ADMIN";
}
