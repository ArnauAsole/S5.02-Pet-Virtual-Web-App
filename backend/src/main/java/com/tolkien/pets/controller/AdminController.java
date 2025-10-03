package com.tolkien.pets.controller;

import com.tolkien.pets.repo.CreatureRepo;
import com.tolkien.pets.repo.UserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepo users;
    private final CreatureRepo creatures;

    public AdminController(UserRepo users, CreatureRepo creatures) {
        this.users = users;
        this.creatures = creatures;
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        // si hay FK de creatures->ownerId, borra antes las criaturas del usuario:
        creatures.findByOwnerId(id).forEach(c -> creatures.deleteById(c.getId()));
        users.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/creatures/{id}")
    public ResponseEntity<Void> deleteCreature(@PathVariable Long id) {
        creatures.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
