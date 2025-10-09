package com.tolkien.pets.controller;

import com.tolkien.pets.dto.creature.CreateCreatureDto;
import com.tolkien.pets.dto.creature.CreatureDto;
import com.tolkien.pets.dto.creature.UpdateCreatureDto;
import com.tolkien.pets.security.CustomPrincipal;
import com.tolkien.pets.service.CreatureService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Creatures")
@SecurityRequirement(name = "bearer-key")
@RestController
@RequestMapping("/api/creatures")
public class CreatureController {

    private final CreatureService service;

    public CreatureController(CreatureService service) {
        this.service = service;
    }

    /* Helpers */
    private Long userId(Authentication a) {
        return ((CustomPrincipal) a.getPrincipal()).id();
    }
    private boolean isAdmin(Authentication a) {
        return ((CustomPrincipal) a.getPrincipal()).roles()
                .stream().anyMatch(r -> r.equals("ROLE_ADMIN"));
    }

    /* Listar mis criaturas (por defecto excluye las que están en combate) */
    @GetMapping
    public List<CreatureDto> listMine(
            @Parameter(hidden = true) Authentication a,
            @RequestParam(defaultValue = "false") boolean includeInCombat) {
        return service.listMine(userId(a), includeInCombat);
    }

    /* Obtener una criatura (si no eres admin, debe ser tuya) */
    @GetMapping("/{id}")
    public CreatureDto getById(@PathVariable Long id,
                               @Parameter(hidden = true) Authentication a) {
        return service.getById(id, userId(a), isAdmin(a));
    }

    /* Crear criatura */
    @PostMapping
    public ResponseEntity<CreatureDto> create(@Valid @RequestBody CreateCreatureDto dto,
                                              @Parameter(hidden = true) Authentication a) {
        CreatureDto created = service.create(dto, userId(a)); // <-- orden corregido
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /* Actualizar criatura */
    @PutMapping("/{id}")
    public CreatureDto update(@PathVariable Long id,
                              @Valid @RequestBody UpdateCreatureDto dto,
                              @Parameter(hidden = true) Authentication a) {
        return service.update(id, dto, userId(a), isAdmin(a)); // <-- orden corregido
    }

    /* Borrar criatura */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @Parameter(hidden = true) Authentication a) {
        service.delete(id, userId(a), isAdmin(a));
        return ResponseEntity.noContent().build();
    }

    /* Acciones */
    @PutMapping("/{id}/train")
    public CreatureDto train(@PathVariable Long id,
                             @Parameter(hidden = true) Authentication a) {
        return service.train(id, userId(a), isAdmin(a));
    }

    @PutMapping("/{id}/rest")
    public CreatureDto rest(@PathVariable Long id,
                            @Parameter(hidden = true) Authentication a) {
        return service.rest(id, userId(a), isAdmin(a));
    }

    @PutMapping("/{attackerId}/fight/{opponentId}")
    public CreatureDto fight(@PathVariable Long attackerId,
                             @PathVariable Long opponentId,
                             @Parameter(hidden = true) Authentication a) {
        return service.fight(attackerId, opponentId, userId(a), isAdmin(a));
    }
}
