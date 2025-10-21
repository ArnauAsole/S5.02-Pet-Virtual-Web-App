package com.tolkien.pets.controller;

import com.tolkien.pets.model.Creature;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.CreatureRepo;
import com.tolkien.pets.repo.RefreshTokenRepo;
import com.tolkien.pets.repo.UserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepo users;
    private final CreatureRepo creatures;
    private final RefreshTokenRepo tokens;

    public AdminController(UserRepo users, CreatureRepo creatures, RefreshTokenRepo tokens) {
        this.users = users;
        this.creatures = creatures;
        this.tokens = tokens;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(users.findAll());
    }

    @GetMapping("/creatures")
    public ResponseEntity<List<Creature>> getAllCreatures() {
        return ResponseEntity.ok(creatures.findAll());
    }

    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = users.findById(id).orElseThrow();
        tokens.deleteByUser(user);
        creatures.deleteAll(creatures.findByOwnerId(id));
        users.delete(user);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    @DeleteMapping("/creatures/{id}")
    public ResponseEntity<Void> deleteCreature(@PathVariable Long id) {
        creatures.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
