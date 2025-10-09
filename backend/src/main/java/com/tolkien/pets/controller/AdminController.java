package com.tolkien.pets.controller;

import com.tolkien.pets.dto.user.UserDto;
import com.tolkien.pets.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin")
@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = "bearer-key")
@PreAuthorize("hasRole('ADMIN')") // <- TODA LA CLASE SOLO ADMIN
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userService.listAll();
    }

    @PostMapping("/users/{id}/grant-admin")
    public UserDto grantAdmin(@PathVariable Long id) {
        return userService.grantAdmin(id);
    }

    @PostMapping("/users/{id}/revoke-admin")
    public UserDto revokeAdmin(@PathVariable Long id) {
        return userService.revokeAdmin(id);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
