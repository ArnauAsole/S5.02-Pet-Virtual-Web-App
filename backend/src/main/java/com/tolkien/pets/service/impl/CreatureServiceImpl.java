package com.tolkien.pets.service.impl;

import com.tolkien.pets.exception.ForbiddenOperationException;
import com.tolkien.pets.exception.ResourceNotFoundException;
import com.tolkien.pets.model.Creature;
import com.tolkien.pets.model.Role;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.CreatureRepo;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.service.CreatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CreatureServiceImpl implements CreatureService {

    private final CreatureRepo creatureRepo;
    private final UserRepo userRepo;

    @Override
    public List<Creature> getAllCreatures() {
        return creatureRepo.findAll();
    }

    @Override
    public List<Creature> getCreaturesByOwnerId(Long ownerId) {
        return creatureRepo.findByOwnerId(ownerId);
    }

    @Override
    public Optional<Creature> getCreatureById(Long id) {
        return creatureRepo.findById(id);
    }

    @Override
    @Transactional
    public Creature createCreature(Creature creature, String ownerEmail) {
        User owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        creature.setOwner(owner);

        // Inicializar estadísticas si no están establecidas (0 es el valor por defecto de int)
        if (creature.getLevel() == 0) creature.setLevel(1);
        if (creature.getHealth() == 0) creature.setHealth(100);
        if (creature.getAttack() == 0) creature.setAttack(10);
        if (creature.getDefense() == 0) creature.setDefense(10);
        // experience puede quedarse en 0
        // inCombat ya tiene valor por defecto false

        return creatureRepo.save(creature);
    }

    @Override
    @Transactional
    public Creature trainCreature(Long id, String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = creatureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        // Verificar permisos: debe ser el dueño o admin
        boolean isOwner = creature.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.name().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenOperationException("No tienes permiso para entrenar esta criatura");
        }

        // Entrenar: aumentar ataque y defensa, reducir salud
        int attackIncrease = Math.max(1, (int) Math.floor(creature.getAttack() * 0.1));
        int defenseIncrease = Math.max(1, (int) Math.floor(creature.getDefense() * 0.1));
        int healthDecrease = Math.max(1, (int) Math.floor(creature.getHealth() * 0.1));

        creature.setAttack(creature.getAttack() + attackIncrease);
        creature.setDefense(creature.getDefense() + defenseIncrease);
        creature.setHealth(Math.max(1, creature.getHealth() - healthDecrease));

        // Aumentar experiencia
        creature.setExperience(creature.getExperience() + 10);

        // Subir de nivel cada 100 puntos de experiencia
        if (creature.getExperience() >= creature.getLevel() * 100) {
            creature.setLevel(creature.getLevel() + 1);
            creature.setExperience(0);
        }

        return creatureRepo.save(creature);
    }

    @Override
    @Transactional
    public Creature restCreature(Long id, String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = creatureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        // Verificar permisos: debe ser el dueño o admin
        boolean isOwner = creature.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.name().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenOperationException("No tienes permiso para hacer descansar esta criatura");
        }

        // Descansar: restaurar salud a 100
        creature.setHealth(100);

        return creatureRepo.save(creature);
    }

    @Override
    @Transactional
    public void deleteCreature(Long id, String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = creatureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        // Verificar permisos: debe ser el dueño o admin
        boolean isOwner = creature.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.name().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenOperationException("No tienes permiso para eliminar esta criatura");
        }

        creatureRepo.delete(creature);
    }
}