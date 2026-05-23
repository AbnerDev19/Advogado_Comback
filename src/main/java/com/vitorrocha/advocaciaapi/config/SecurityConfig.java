package com.vitorrocha.advocaciaapi.config;

import com.vitorrocha.advocaciaapi.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configure(http))
            .csrf(csrf -> csrf.disable())
            
            // Dizemos ao Spring para não guardar sessão (porque quem manda é o Token JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // AQUI DEFINIMOS AS REGRAS!
            .authorizeHttpRequests(auth -> auth
                // ROTAS PÚBLICAS (Qualquer pessoa pode aceder sem Token)
                
                // ---> NOVO: Liberando o acesso para a documentação do Swagger
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // Suas regras anteriores continuam iguais
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll() // Para poder fazer login
                .requestMatchers(HttpMethod.POST, "/api/leads").permitAll()      // Para o cliente do site conseguir enviar mensagem
                .requestMatchers(HttpMethod.GET, "/api/news").permitAll()        // Para o site conseguir listar as notícias
                
                // ROTAS PRIVADAS (Todas as outras exigem Token válido - ex: Dashboard, deletar leads, etc.)
                .anyRequest().authenticated() 
            )
            // Coloca o nosso "Porteiro" na porta da frente
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}