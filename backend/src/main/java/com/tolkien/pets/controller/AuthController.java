package com.tolkien.pets.controller;

import com.tolkien.pets.dto.auth.LoginDto;
import com.tolkien.pets.dto.auth.RegisterDto;
import com.tolkien.pets.dto.auth.TokenDto;
import com.tolkien.pets.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<TokenDto> register(@RequestBody @Valid RegisterDto dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody @Valid LoginDto dto) {
        System.out.println("🔑 Login solicitado por: " + dto.getEmail());
        TokenDto token = authService.login(dto);
        System.out.println("✅ Token generado correctamente.");
        return ResponseEntity.ok(token);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null)
            return ResponseEntity.status(401).body("Usuario no autenticado");
        return ResponseEntity.ok(auth.getPrincipal());
    }
}
