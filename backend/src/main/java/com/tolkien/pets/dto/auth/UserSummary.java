package com.tolkien.pets.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class UserSummary {
    private Long id;
    private String email;
    private Set<String> roles;
    private String profileImage;
}
