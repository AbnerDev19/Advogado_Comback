package com.vitorrocha.advocaciaapi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "leads")
public class Lead {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; //
    private String contato; //
    private String area; //
    
    @Column(columnDefinition = "TEXT")
    private String motivo; //
    
    private String status = "novo_contato"; //
    private String origem = "formulario_site"; //
    
    private LocalDateTime dataCriacao = LocalDateTime.now();
}