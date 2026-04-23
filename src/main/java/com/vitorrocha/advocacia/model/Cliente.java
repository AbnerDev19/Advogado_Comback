package com.vitorrocha.advocacia.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "cliente")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(nullable = false)
    private String nome;

    @Column
    private String email;

    @Column
    private String telefone;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Contato> contatos;
}
