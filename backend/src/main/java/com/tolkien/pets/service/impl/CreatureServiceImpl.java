package com.tolkien.pets.service.impl;

import com.tolkien.pets.dto.creature.*;
import com.tolkien.pets.exception.ForbiddenOperationException;
import com.tolkien.pets.exception.ResourceNotFoundException;
import com.tolkien.pets.model.Creature;
import com.tolkien.pets.repo.CreatureRepo;
import com.tolkien.pets.service.CreatureService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class CreatureServiceImpl implements CreatureService {

    private final CreatureRepo repo;

    public CreatureServiceImpl(CreatureRepo repo) {
        this.repo = repo;
    }

    @Override
    public List<CreatureDto> listFor(Long currentUserId, boolean isAdmin) {
        var list = isAdmin ? repo.findAll() : repo.findByOwnerId(currentUserId);
        return list.stream().map(this::toDto).toList();
    }

    @Override
    public CreatureDto getById(Long id, Long currentUserId, boolean isAdmin) {
        var c = getOr404(id);
        assertOwnerOrAdmin(c, currentUserId, isAdmin);
        return toDto(c);
    }

    @Override
    @Transactional
    public CreatureDto create(Long ownerId, CreateCreatureDto dto) {
        var c = new Creature();
        c.setOwnerId(ownerId);
        c.setName(dto.name());
        c.setRace(dto.race());
        c.setColor(dto.color());
        c.setImageUrl(dto.imageUrl());  // Set imageUrl from DTO
        if (dto.maxHealth() != null) {
            c.setMaxHealth(dto.maxHealth());
            c.setHealth(dto.maxHealth());
        }
        if (dto.attackBase() != null) c.setAttackBase(dto.attackBase());
        if (dto.defenseBase() != null) c.setDefenseBase(dto.defenseBase());
        c.setAccessories(dto.accessories() == null ? List.of() : dto.accessories());
        return toDto(repo.save(c));
    }

    @Override
    @Transactional
    public CreatureDto update(Long id, Long currentUserId, boolean isAdmin, UpdateCreatureDto dto) {
        var c = getOr404(id);
        assertOwnerOrAdmin(c, currentUserId, isAdmin);
        if (c.isInCombat()) throw new ForbiddenOperationException("Cannot update creature while in combat");

        c.setName(dto.name());
        c.setRace(dto.race());
        c.setColor(dto.color());
        c.setImageUrl(dto.imageUrl());  // Update imageUrl from DTO
        if (dto.maxHealth() != null) {
            c.setMaxHealth(dto.maxHealth());
            if (c.getHealth() > dto.maxHealth()) c.setHealth(dto.maxHealth());
        }
        if (dto.attackBase() != null) c.setAttackBase(dto.attackBase());
        if (dto.defenseBase() != null) c.setDefenseBase(dto.defenseBase());
        c.setAccessories(dto.accessories() == null ? List.of() : dto.accessories());
        return toDto(c);
    }

    @Override
    @Transactional
    public void delete(Long id, Long currentUserId, boolean isAdmin) {
        var c = getOr404(id);
        assertOwnerOrAdmin(c, currentUserId, isAdmin);
        if (c.isInCombat()) throw new ForbiddenOperationException("Cannot delete creature while in combat");
        repo.delete(c);
    }

    @Override
    @Transactional
    public CreatureDto train(Long id, Long currentUserId, boolean isAdmin) {
        var c = getOr404(id);
        assertOwnerOrAdmin(c, currentUserId, isAdmin);
        if (c.isInCombat()) throw new ForbiddenOperationException("Cannot train while in combat");
        if (c.getHealth() <= 5) throw new ForbiddenOperationException("Not enough health to train");

        // Entrenar: +10 XP, -5 salud
        addXpAndMaybeLevelUp(c, 20);
        c.setHealth(Math.max(1, c.getHealth() - 15));

        return toDto(c);
    }

    @Override
    @Transactional
    public CreatureDto rest(Long id, Long currentUserId, boolean isAdmin) {
        var c = getOr404(id);
        assertOwnerOrAdmin(c, currentUserId, isAdmin);
        if (c.isInCombat()) throw new ForbiddenOperationException("Cannot rest while in combat");

        // Descansar: +15 salud (cap a maxHealth)
        c.setHealth(Math.min(c.getMaxHealth(), c.getHealth() + 15));
        return toDto(c);
    }

    @Override
    @Transactional
    public CreatureDto fight(Long attackerId, Long opponentId, Long currentUserId, boolean isAdmin) {
        if (attackerId.equals(opponentId))
            throw new ForbiddenOperationException("A creature cannot fight itself");

        var a = getOr404(attackerId);
        var b = getOr404(opponentId);

        // Solo puedes iniciar combate con tu atacante (o ADMIN)
        assertOwnerOrAdmin(a, currentUserId, isAdmin);

        if (a.isInCombat() || b.isInCombat())
            throw new ForbiddenOperationException("One of the creatures is already in combat");

        // Marcar combate (evita descansar/entrenar mientras dura)
        a.setInCombat(true);
        b.setInCombat(true);

        // Simulación sincrónica por turnos (máx 30 rondas)
        var rnd = ThreadLocalRandom.current();
        int rounds = 0;
        while (a.getHealth() > 0 && b.getHealth() > 0 && rounds < 30) {
            rounds++;

            int aAtk = a.getAttackBase() + (a.getLevel() - 1) * 2;
            int bDef = b.getDefenseBase() + (b.getLevel() - 1) * 2;
            int dmgAB = Math.max(1, aAtk - (bDef / 2) + rnd.nextInt(0, 3)); // +0..2
            b.setHealth(Math.max(0, b.getHealth() - dmgAB));
            if (b.getHealth() <= 0) break;

            int bAtk = b.getAttackBase() + (b.getLevel() - 1) * 2;
            int aDef = a.getDefenseBase() + (a.getLevel() - 1) * 2;
            int dmgBA = Math.max(1, bAtk - (aDef / 2) + rnd.nextInt(0, 3));
            a.setHealth(Math.max(0, a.getHealth() - dmgBA));
        }

        // Resultado y recompensas
        boolean aWins = a.getHealth() > 0 && (b.getHealth() == 0 || a.getHealth() >= b.getHealth());
        if (aWins) {
            addXpAndMaybeLevelUp(a, 30);
            addXpAndMaybeLevelUp(b, 10);
        } else {
            addXpAndMaybeLevelUp(a, 10);
            addXpAndMaybeLevelUp(b, 30);
        }

        // Fin de combate
        a.setInCombat(false);
        b.setInCombat(false);

        // Garantiza que ninguno se vaya negativo y límites de salud
        a.setHealth(Math.max(0, Math.min(a.getHealth(), a.getMaxHealth())));
        b.setHealth(Math.max(0, Math.min(b.getHealth(), b.getMaxHealth())));

        return toDto(a); // devolvemos el atacante actualizado
    }

    // Helpers

    private Creature getOr404(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Creature " + id + " not found"));
    }

    private void assertOwnerOrAdmin(Creature c, Long userId, boolean isAdmin) {
        if (!isAdmin && !c.getOwnerId().equals(userId)) {
            throw new ForbiddenOperationException("This creature does not belong to you");
        }
    }

    private void addXpAndMaybeLevelUp(Creature c, int deltaXp) {
        int xp = c.getXp() + deltaXp;
        int lvl = c.getLevel();
        while (xp >= 100) {
            xp -= 100;
            lvl++;
            // Opcional: buff al subir nivel
            c.setMaxHealth(c.getMaxHealth() + 5);
            c.setHealth(Math.min(c.getMaxHealth(), c.getHealth() + 5));
        }
        c.setXp(xp);
        c.setLevel(lvl);
    }

    private CreatureDto toDto(Creature c) {
        return new CreatureDto(
                c.getId(), c.getName(), c.getRace(), c.getColor(),
                c.getLevel(), c.getXp(),
                c.getAttackBase(), c.getDefenseBase(),
                c.getMaxHealth(), c.getHealth(),
                c.isInCombat(), c.getOwnerId(), c.getAccessories(),
                c.getImageUrl()  // Include imageUrl in DTO mapping
        );
    }
}
