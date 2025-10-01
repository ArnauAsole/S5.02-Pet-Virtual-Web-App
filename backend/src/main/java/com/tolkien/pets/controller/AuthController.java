package com.tolkien.pets.controller;

import com.tolkien.pets.dto.auth.LoginDto;
import com.tolkien.pets.dto.auth.RegisterDto;
import com.tolkien.pets.dto.auth.TokenDto;
import com.tolkien.pets.model.Role;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserRepo userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthController(UserRepo userRepo, PasswordEncoder encoder, JwtUtil jwt) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterDto dto) {
        if (userRepo.existsByEmail(dto.email())) {
            return ResponseEntity.badRequest().build();
        }
        var u = new User(null, dto.email(), encoder.encode(dto.password()), Set.of(Role.ROLE_USER));
        userRepo.save(u);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public TokenDto login(@Valid @RequestBody LoginDto dto) {
        var u = userRepo.findByEmail(dto.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!encoder.matches(dto.password(), u.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return new TokenDto(jwt.generateToken(u.getId(), u.getEmail(), u.getRoles()));
    }
}
