package com.tolkien.pets.controller;

import com.tolkien.pets.model.Creature;
import com.tolkien.pets.security.CustomPrincipal;
import com.tolkien.pets.service.CreatureService;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/creatures")
public class CreatureController {

    private final CreatureService service;

    public CreatureController(CreatureService service) {
        this.service = service;
    }

    // Obtener el CustomPrincipal de forma segura
    private CustomPrincipal getPrincipal(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("No hay usuario autenticado.");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof CustomPrincipal cp) {
            return cp;
        }

        throw new IllegalStateException(
                "Tipo inesperado de principal: " + principal.getClass().getName()
        );
    }

    private Long getUserId(Authentication auth) {
        return getPrincipal(auth).getId();
    }

    private boolean isAdmin(Authentication auth) {
        return getPrincipal(auth)
                .getRoles()
                .stream()
                .anyMatch(r -> r.name().equals("ROLE_ADMIN"));
    }

    /* Listar criaturas del usuario autenticado */
    @GetMapping
    public ResponseEntity<?> listAll(@Parameter(hidden = true) Authentication auth) {
        try {
            CustomPrincipal cp = getPrincipal(auth);
            Long userId = cp.getId();

            List<Creature> creatures = service.getCreaturesByOwnerId(userId);

            return ResponseEntity.ok(creatures);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error de autenticación: " + e.getMessage());
        }
    }

    /* Obtener una criatura por ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id,
            @Parameter(hidden = true) Authentication auth) {

        try {
            boolean admin = isAdmin(auth);
            Long userId = getUserId(auth);

            return service.getCreatureById(id)
                    .filter(c -> admin || (c.getOwner() != null && c.getOwner().getId().equals(userId)))
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Criatura no encontrada o sin acceso."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error de autenticación: " + e.getMessage());
        }
    }

    /* Crear una nueva criatura */
    @PostMapping
    public ResponseEntity<?> createCreature(
            @RequestBody Creature creature,
            @Parameter(hidden = true) Authentication auth) {

        try {
            CustomPrincipal cp = getPrincipal(auth);
            Creature created = service.createCreature(creature, cp.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error de autenticación: " + e.getMessage());
        }
    }

    /* Entrenar una criatura */
    @PutMapping("/{id}/train")
    public ResponseEntity<?> trainCreature(
            @PathVariable Long id,
            @Parameter(hidden = true) Authentication auth) {

        try {
            boolean admin = isAdmin(auth);
            Long userId = getUserId(auth);
            String userEmail = getPrincipal(auth).getUsername();

            // Verificar que la criatura existe y el usuario tiene permisos
            Optional<Creature> creatureOpt = service.getCreatureById(id);

            if (creatureOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Criatura no encontrada.");
            }

            Creature creature = creatureOpt.get();
            boolean isOwner = creature.getOwner() != null && creature.getOwner().getId().equals(userId);

            if (!admin && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("No tienes permiso para entrenar esta criatura.");
            }

            // Entrenar la criatura
            Creature trained = service.trainCreature(id, userEmail);
            return ResponseEntity.ok(trained);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al entrenar criatura: " + e.getMessage());
        }
    }

    /* Hacer descansar una criatura */
    @PutMapping("/{id}/rest")
    public ResponseEntity<?> restCreature(
            @PathVariable Long id,
            @Parameter(hidden = true) Authentication auth) {

        try {
            boolean admin = isAdmin(auth);
            Long userId = getUserId(auth);
            String userEmail = getPrincipal(auth).getUsername();

            // Verificar que la criatura existe y el usuario tiene permisos
            Optional<Creature> creatureOpt = service.getCreatureById(id);

            if (creatureOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Criatura no encontrada.");
            }

            Creature creature = creatureOpt.get();
            boolean isOwner = creature.getOwner() != null && creature.getOwner().getId().equals(userId);

            if (!admin && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("No tienes permiso para hacer descansar esta criatura.");
            }

            // Hacer descansar la criatura
            Creature rested = service.restCreature(id, userEmail);
            return ResponseEntity.ok(rested);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al hacer descansar criatura: " + e.getMessage());
        }
    }

    /* Eliminar una criatura */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCreature(
            @PathVariable Long id,
            @Parameter(hidden = true) Authentication auth) {

        try {
            boolean admin = isAdmin(auth);
            Long userId = getUserId(auth);
            String userEmail = getPrincipal(auth).getUsername();

            // Verificar que la criatura existe y el usuario tiene permisos
            Optional<Creature> creatureOpt = service.getCreatureById(id);

            if (creatureOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Criatura no encontrada.");
            }

            Creature creature = creatureOpt.get();
            boolean isOwner = creature.getOwner() != null && creature.getOwner().getId().equals(userId);

            if (!admin && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("No tienes permiso para eliminar esta criatura.");
            }

            // Eliminar la criatura
            service.deleteCreature(id, userEmail);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar criatura: " + e.getMessage());
        }
    }
}