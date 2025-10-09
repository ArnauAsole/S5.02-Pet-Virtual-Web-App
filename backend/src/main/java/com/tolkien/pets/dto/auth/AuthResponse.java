package com.tolkien.pets.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String tokenType;   // "Bearer"
    private String token;       // JWT
    private long   expiresIn;   // milisegundos
    private UserSummary user;   // info básica del usuario
}
