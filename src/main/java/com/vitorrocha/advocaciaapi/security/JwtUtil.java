package com.vitorrocha.advocaciaapi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    // Chave secreta usada para assinar o token.
    // IMPORTANTE: antes esta chave era gerada aleatoriamente (Keys.secretKeyFor)
    // a cada vez que a aplicação iniciava. Isso significa que, a cada novo
    // deploy/reinício, todos os tokens já emitidos viravam inválidos, e que
    // duas instâncias rodando ao mesmo tempo teriam chaves diferentes e não
    // conseguiriam validar os tokens uma da outra. Agora a chave vem da
    // propriedade app.jwt.secret (defina a variável de ambiente JWT_SECRET).
    private final Key secretKey;

    public JwtUtil(@Value("${app.jwt.secret:}") String configuredSecret) {
        if (configuredSecret != null && configuredSecret.length() >= 32) {
            this.secretKey = Keys.hmacShaKeyFor(configuredSecret.getBytes());
        } else {
            logger.warn("app.jwt.secret não foi configurado (ou é muito curto). Gerando uma chave " +
                    "temporária válida apenas enquanto esta instância estiver no ar. " +
                    "Configure a variável de ambiente JWT_SECRET para evitar isso em produção.");
            this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    // Tempo de validade do token: 24 horas (em milissegundos)
    private static final long EXPIRATION_TIME = 86400000;

    // 1. Gera um novo token quando o utilizador faz login com sucesso
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(secretKey)
                .compact();
    }

    // 2. Extrai o email que está "escondido" dentro do token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 3. Verifica se o token já passou da validade (se já passaram 24h)
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 4. Valida se o token pertence àquele utilizador e não expirou
    public Boolean validateToken(String token, String email) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(email) && !isTokenExpired(token));
    }
}