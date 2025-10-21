package com.tolkien.pets.controller;

import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.UserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepo userRepo;

    public UserController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        Optional<User> user = userRepo.findById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User updatedData) {
        return userRepo.findById(id).map(existing -> {
            // Solo se actualizan campos editables del perfil
            existing.setEmail(updatedData.getEmail());
            existing.setProfileImage(updatedData.getProfileImage());
            // ⚠️ No cambiamos contraseña aquí (eso iría en otro endpoint)
            userRepo.save(existing);
            return ResponseEntity.ok(existing);
        }).orElse(ResponseEntity.notFound().build());
    }
}
