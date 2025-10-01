package com.tolkien.pets.security;

import com.tolkien.pets.model.Role;

import java.util.Set;

public record CustomPrincipal(Long id, String email, Set<Role> roles) {
}
