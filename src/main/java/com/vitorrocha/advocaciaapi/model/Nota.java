package com.vitorrocha.advocaciaapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notas")
public class Nota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String texto;

    private LocalDateTime data = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "lead_id")
    @JsonIgnore // Evita loop infinito no JSON
    private Lead lead;
}