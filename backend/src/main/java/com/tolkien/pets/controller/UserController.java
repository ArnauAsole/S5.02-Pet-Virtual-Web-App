package com.tolkien.pets.controller;

import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserRepo userRepo;

    public UserController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        log.info("Request received to fetch user with ID={}", id);
        Optional<User> user = userRepo.findById(id);

        if (user.isPresent()) {
            log.debug("User found: {}", user.get().getEmail());
            return ResponseEntity.ok(user.get());
        } else {
            log.warn("User with ID={} not found", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User updatedData) {
        log.info("Request to update user profile ID={}", id);

        return userRepo.findById(id).map(existing -> {
            log.debug("Updating user: oldEmail={}, newEmail={}", existing.getEmail(), updatedData.getEmail());

            existing.setEmail(updatedData.getEmail());
            existing.setProfileImage(updatedData.getProfileImage());

            userRepo.save(existing);
            log.info("User updated successfully ID={}, email={}", id, existing.getEmail());
            return ResponseEntity.ok(existing);

        }).orElseGet(() -> {
            log.warn("User with ID={} not found, cannot update", id);
            return ResponseEntity.notFound().build();
        });
    }
}
