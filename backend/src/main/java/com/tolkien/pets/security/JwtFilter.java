package com.tolkien.pets.security;

import com.tolkien.pets.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
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
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = req.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            try {
                Jws<Claims> jws = jwt.parse(token);
                Claims claims = jws.getBody();

                Long id = claims.get("id", Number.class).longValue();
                String email = claims.getSubject();

                @SuppressWarnings("unchecked")
                List<String> roleNames = (List<String>) claims.get("roles");
                Set<Role> roleEnums = roleNames.stream()
                        .map(Role::valueOf)
                        .collect(Collectors.toSet());

                var authorities = roleEnums.stream()
                        .map(r -> new SimpleGrantedAuthority(r.name()))
                        .collect(Collectors.toSet());

                var principal = new CustomPrincipal(id, email, roleEnums);
                var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ignored) {
                // token inválido -> request seguirá sin autenticación
            }
        }
        chain.doFilter(req, res);
    }
}
