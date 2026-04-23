package com.vitorrocha.advocacia.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contato")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Contato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contato")
    private Long idContato;

    @Column(nullable = false, length = 2000)
    private String mensagem;

    @Column(name = "data_envio", nullable = false)
    private LocalDateTime dataEnvio = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.pendente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    public enum Status {
        pendente,
        atendido
    }
}
