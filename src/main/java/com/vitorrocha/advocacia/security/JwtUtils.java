package com.vitorrocha.advocacia.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private Key getKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(UserDetails user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token, UserDetails user) {
        try {
            String email = getEmailFromToken(token);
            Date exp = Jwts.parserBuilder().setSigningKey(getKey()).build()
                    .parseClaimsJws(token).getBody().getExpiration();
            return email.equals(user.getUsername()) && exp.after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
