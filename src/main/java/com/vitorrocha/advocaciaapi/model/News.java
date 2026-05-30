package com.vitorrocha.advocaciaapi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "news")
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo; //

    @Column(unique = true, nullable = false)
    private String slug; //

    private String categoria; //
    private String status = "Rascunho"; //

    @Column(columnDefinition = "TEXT")
    private String resumo; //

    @Column(columnDefinition = "TEXT")
    private String conteudo; //

    private LocalDateTime dataPublicacao = LocalDateTime.now();
}