package com.tolkien.pets.controller;

import com.tolkien.pets.dto.creature.CreatureDto;
import com.tolkien.pets.model.User;
import com.tolkien.pets.service.CreatureService;
import com.tolkien.pets.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final CreatureService creatureService;

    public AdminController(UserService userService, CreatureService creatureService) {
        this.userService = userService;
        this.creatureService = creatureService;
    }


    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }


    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {

        List<CreatureDto> userCreatures = creatureService.getCreaturesByOwnerId(id);


        for (CreatureDto creature : userCreatures) {
            creatureService.deleteCreature(creature.getId(), userService.getUserById(id).getEmail());
        }


        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/users/{userId}/creatures")
    public ResponseEntity<List<CreatureDto>> getUserCreatures(@PathVariable Long userId) {
        try {
            List<CreatureDto> creatures = creatureService.getCreaturesByUserId(userId);
            return ResponseEntity.ok(creatures);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @DeleteMapping("/creatures/{id}")
    public ResponseEntity<Void> deleteCreatureById(@PathVariable Long id) {
        try {
            creatureService.adminDeleteCreature(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
