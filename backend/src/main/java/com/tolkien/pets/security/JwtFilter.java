package com.tolkien.pets.security;

import com.tolkien.pets.model.Role; // 👈 importa el enum
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwt;

    public JwtFilter(JwtUtil jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String auth = req.getHeader(HttpHeaders.AUTHORIZATION);
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                var jws = jwt.parse(token);
                Claims c = jws.getBody();

                Long id = ((Number) c.get("id")).longValue();
                String email = c.getSubject();

                @SuppressWarnings("unchecked")
                List<String> roleNames = (List<String>) c.get("roles");           // ["ROLE_USER", "ROLE_ADMIN"]

                // Autoridades para Spring Security (siguen siendo String)
                var authorities = roleNames.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                // 👇 Conversión a enums para tu CustomPrincipal
                Set<Role> roleEnums = roleNames.stream()
                        .map(Role::valueOf)
                        .collect(Collectors.toSet());

                var principal = new CustomPrincipal(id, email, roleEnums);

                var authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception ignored) {
                // token inválido → se deja la request sin autenticación
            }
        }
        chain.doFilter(req, res);
    }
}
