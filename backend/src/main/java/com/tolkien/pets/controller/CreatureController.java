package com.tolkien.pets.controller;

import com.tolkien.pets.dto.creature.CreateCreatureDto;
import com.tolkien.pets.dto.creature.UpdateCreatureDto;
import com.tolkien.pets.dto.creature.CreatureDto;
import com.tolkien.pets.security.CustomPrincipal;
import com.tolkien.pets.service.CreatureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creatures")
public class CreatureController {

    private final CreatureService creatureService;

    public CreatureController(CreatureService creatureService) {
        this.creatureService = creatureService;
    }

    // ✅ Obtener todas las criaturas del usuario autenticado
    @GetMapping
    public ResponseEntity<List<CreatureDto>> getUserCreatures(
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        List<CreatureDto> creatures = creatureService.getCreaturesByUserId(principal.getId());
        return ResponseEntity.ok(creatures);
    }

    // ✅ Obtener una criatura por ID (nuevo endpoint necesario)
    @GetMapping("/{id}")
    public ResponseEntity<CreatureDto> getCreatureById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        CreatureDto creature = creatureService.getCreatureById(id, principal.getEmail());
        return ResponseEntity.ok(creature);
    }

    @PostMapping("/{id}/combat-result")
    public ResponseEntity<CreatureDto> resolveCombat(
            @PathVariable Long id,
            @RequestParam int damageReceived,
            @RequestParam boolean won,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        CreatureDto result = creatureService.resolveCombat(id, damageReceived, won, principal.getEmail());
        return ResponseEntity.ok(result);
    }


    // Crear nueva criatura
    @PostMapping
    public ResponseEntity<CreatureDto> createCreature(
            @RequestBody CreateCreatureDto dto,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        CreatureDto created = creatureService.createCreature(dto, principal.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Actualizar criatura existente
    @PutMapping("/{id}")
    public ResponseEntity<CreatureDto> updateCreature(
            @PathVariable Long id,
            @RequestBody UpdateCreatureDto dto,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        CreatureDto updated = creatureService.updateCreature(id, dto, principal.getEmail());
        return ResponseEntity.ok(updated);
    }

    // Eliminar criatura
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCreature(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        creatureService.deleteCreature(id, principal.getEmail());
        return ResponseEntity.noContent().build();
    }

    // Entrenar criatura
    @PostMapping("/{id}/train")
    public ResponseEntity<CreatureDto> trainCreature(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        CreatureDto trained = creatureService.trainCreature(id, principal.getEmail());
        return ResponseEntity.ok(trained);
    }

    // Restablecer criatura
    @PostMapping("/{id}/rest")
    public ResponseEntity<CreatureDto> restCreature(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        CreatureDto rested = creatureService.restCreature(id, principal.getEmail());
        return ResponseEntity.ok(rested);
    }
}
