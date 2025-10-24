package com.tolkien.pets.controller;

import com.tolkien.pets.dto.auth.LoginDto;
import com.tolkien.pets.dto.auth.RegisterDto;
import com.tolkien.pets.dto.auth.TokenDto;
import com.tolkien.pets.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<TokenDto> register(@RequestBody @Valid RegisterDto dto) {
        log.info("Registration requested for email={}", dto.getEmail());
        TokenDto token = authService.register(dto);
        log.info("User registered successfully email={}", dto.getEmail());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody @Valid LoginDto dto) {
        log.info("Login attempt email={}", dto.getEmail());
        TokenDto token = authService.login(dto);
        log.info("Login success email={}", dto.getEmail());
        return ResponseEntity.ok(token);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            log.warn("Unauthorized /me access attempt");
            return ResponseEntity.status(401).body("Usuario no autenticado");
        }
        log.debug("Returning /me for principal={}", auth.getName());
        return ResponseEntity.ok(auth.getPrincipal());
    }
}
