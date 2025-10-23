package com.tolkien.pets.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String tokenType;
    private String token;
    private long expiresIn;
    private UserSummary user;
}
