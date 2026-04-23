package com.vitorrocha.advocacia.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "noticia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Noticia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_noticia")
    private Long idNoticia;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 5000)
    private String conteudo;

    @Column
    private String categoria;

    @Column(name = "data_publicacao", nullable = false)
    private LocalDate dataPublicacao = LocalDate.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_admin", nullable = false)
    private Administrador administrador;
}
