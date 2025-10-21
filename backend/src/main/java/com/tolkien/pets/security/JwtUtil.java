package com.tolkien.pets.security;

import com.tolkien.pets.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String email, Set<Role> roles) {
        final Date now = new Date();
        final Date exp = new Date(now.getTime() + expiration);

        String rolesCsv = (roles == null || roles.isEmpty())
                ? ""
                : roles.stream().map(Enum::name).collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(email)
                .claim("uid", userId)
                .claim("roles", rolesCsv)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            Claims claims = parseClaims(token);
            String subject = claims.getSubject();
            Date exp = claims.getExpiration();
            return subject != null
                    && subject.equals(userDetails.getUsername())
                    && exp != null
                    && exp.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractRoles(String token) {
        Object v = parseClaims(token).get("roles");
        return v == null ? null : v.toString();
    }
}
