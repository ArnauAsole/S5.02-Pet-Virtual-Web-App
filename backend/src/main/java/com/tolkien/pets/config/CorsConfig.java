package com.tolkien.pets.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 🔓 Permitir el frontend local
        config.setAllowedOrigins(List.of("http://localhost:3000"));

        // 🔄 Métodos HTTP permitidos
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 🎟️ Cabeceras permitidas
        config.setAllowedHeaders(List.of("*"));

        // 🔑 Permitir credenciales (para Authorization headers y cookies)
        config.setAllowCredentials(true);

        // 📤 Exponer cabeceras de respuesta
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        // 🌍 Aplicar configuración a todas las rutas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
