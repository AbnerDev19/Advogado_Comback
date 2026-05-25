package com.vitorrocha.advocaciaapi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "leads")
public class Lead {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; 
    private String contato; 
    private String area; 
    
    @Column(columnDefinition = "TEXT")
    private String motivo; 
    
    private String status = "novo_contato"; 
    private String origem = "formulario_site"; 
    
    private LocalDateTime dataCriacao = LocalDateTime.now();

    // NOVO: Relacionamento com as notas internas
    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Nota> notas = new ArrayList<>();
}