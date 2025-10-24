package com.tolkien.pets.controller;

import com.tolkien.pets.dto.creature.CreateCreatureDto;
import com.tolkien.pets.dto.creature.UpdateCreatureDto;
import com.tolkien.pets.dto.creature.CreatureDto;
import com.tolkien.pets.security.CustomPrincipal;
import com.tolkien.pets.service.CreatureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creatures")
public class CreatureController {

    private static final Logger log = LoggerFactory.getLogger(CreatureController.class);

    private final CreatureService creatureService;

    public CreatureController(CreatureService creatureService) {
        this.creatureService = creatureService;
    }

    @GetMapping
    public ResponseEntity<List<CreatureDto>> getUserCreatures(
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        log.info("Fetching all creatures for user {}", principal.getEmail());
        List<CreatureDto> creatures = creatureService.getCreaturesByUserId(principal.getId());
        log.debug("User {} has {} creatures", principal.getEmail(), creatures.size());
        return ResponseEntity.ok(creatures);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreatureDto> getCreatureById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        log.info("User {} requesting creature details id={}", principal.getEmail(), id);
        CreatureDto creature = creatureService.getCreatureById(id, principal.getEmail());
        log.debug("Creature retrieved successfully id={}, owner={}", id, principal.getEmail());
        return ResponseEntity.ok(creature);
    }

    @PostMapping("/{id}/combat-result")
    public ResponseEntity<CreatureDto> resolveCombat(
            @PathVariable Long id,
            @RequestParam int damageReceived,
            @RequestParam boolean won,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        log.info("User {} resolving combat for creature id={}, damageReceived={}, won={}",
                principal.getEmail(), id, damageReceived, won);
        CreatureDto result = creatureService.resolveCombat(id, damageReceived, won, principal.getEmail());
        log.debug("Combat resolved for creature id={}, newHealth={}, newXP={}",
                id, result.getHealth(), result.getExperience());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<CreatureDto> createCreature(
            @RequestBody CreateCreatureDto dto,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        log.info("User {} creating new creature '{}'", principal.getEmail(), dto.getName());
        CreatureDto created = creatureService.createCreature(dto, principal.getEmail());
        log.info("Creature created successfully id={} for user {}", created.getId(), principal.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CreatureDto> updateCreature(
            @PathVariable Long id,
            @RequestBody UpdateCreatureDto dto,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        log.info("User {} updating creature id={}", principal.getEmail(), id);
        CreatureDto updated = creatureService.updateCreature(id, dto, principal.getEmail());
        log.debug("Creature updated successfully id={}, newName={}", id, updated.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCreature(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        log.warn("User {} deleting creature id={}", principal.getEmail(), id);
        creatureService.deleteCreature(id, principal.getEmail());
        log.info("Creature deleted successfully id={} by user {}", id, principal.getEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/train")
    public ResponseEntity<CreatureDto> trainCreature(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        log.info("User {} training creature id={}", principal.getEmail(), id);
        CreatureDto trained = creatureService.trainCreature(id, principal.getEmail());
        log.debug("Creature trained id={}, level={}, XP={}",
                trained.getId(), trained.getLevel(), trained.getExperience());
        return ResponseEntity.ok(trained);
    }

    @PostMapping("/{id}/rest")
    public ResponseEntity<CreatureDto> restCreature(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        log.info("User {} resting creature id={}", principal.getEmail(), id);
        CreatureDto rested = creatureService.restCreature(id, principal.getEmail());
        log.debug("Creature rested id={}, newHealth={}", rested.getId(), rested.getHealth());
        return ResponseEntity.ok(rested);
    }
}
