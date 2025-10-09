package com.tolkien.pets.dto.user;

import com.tolkien.pets.model.Role;
import lombok.Data;

import java.util.Set;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String profileImage;
    private Set<Role> roles;
}
