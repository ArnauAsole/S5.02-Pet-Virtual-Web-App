package com.tolkien.pets.controller;

import com.tolkien.pets.dto.creature.CreatureDto;
import com.tolkien.pets.model.User;
import com.tolkien.pets.service.CreatureService;
import com.tolkien.pets.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;
    private final CreatureService creatureService;

    public AdminController(UserService userService, CreatureService creatureService) {
        this.userService = userService;
        this.creatureService = creatureService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("Admin requested list of all users");
        List<User> users = userService.getAllUsers();
        log.debug("Found {} users in database", users.size());
        return ResponseEntity.ok(users);
    }

    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.warn("Admin deleting user with ID={}", id);

        try {
            List<CreatureDto> userCreatures = creatureService.getCreaturesByOwnerId(id);
            log.debug("User {} has {} creatures to delete", id, userCreatures.size());

            for (CreatureDto creature : userCreatures) {
                creatureService.deleteCreature(creature.getId(), userService.getUserById(id).getEmail());
                log.info("Deleted creature ID={} belonging to user ID={}", creature.getId(), id);
            }

            userService.deleteUser(id);
            log.info("User deleted successfully: ID={}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting user with ID={}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{userId}/creatures")
    public ResponseEntity<List<CreatureDto>> getUserCreatures(@PathVariable Long userId) {
        log.info("Admin fetching creatures for user ID={}", userId);
        try {
            List<CreatureDto> creatures = creatureService.getCreaturesByUserId(userId);
            log.debug("Found {} creatures for user ID={}", creatures.size(), userId);
            return ResponseEntity.ok(creatures);
        } catch (Exception e) {
            log.error("Error fetching creatures for user ID={}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/creatures/{id}")
    public ResponseEntity<Void> deleteCreatureById(@PathVariable Long id) {
        log.warn("Admin attempting to delete creature with ID={}", id);
        try {
            creatureService.adminDeleteCreature(id);
            log.info("Creature deleted successfully by admin: ID={}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting creature ID={} by admin: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
