package com.tolkien.pets.dto.auth;

import com.tolkien.pets.model.Role;

import java.util.Set;

public record TokenDto(
        String token,
        Long id,
        String email,
        Set<Role> roles,
        String profileImage
) {
}
