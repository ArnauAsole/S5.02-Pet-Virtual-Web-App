package com.tolkien.pets.service.impl;

import com.tolkien.pets.dto.creature.CreateCreatureDto;
import com.tolkien.pets.dto.creature.UpdateCreatureDto;
import com.tolkien.pets.dto.creature.CreatureDto;
import com.tolkien.pets.exception.ResourceNotFoundException;
import com.tolkien.pets.model.Creature;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.CreatureRepo;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.service.CreatureService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class CreatureServiceImpl implements CreatureService {

    private final CreatureRepo creatureRepo;
    private final UserRepo userRepo;

    public CreatureServiceImpl(CreatureRepo creatureRepo, UserRepo userRepo) {
        this.creatureRepo = creatureRepo;
        this.userRepo = userRepo;
    }

    @Override
    @CacheEvict(value = {"creaturesByUser", "allCreatures"}, allEntries = true)
    public CreatureDto createCreature(CreateCreatureDto dto, String userEmail) {
        log.info("🪄 Creating creature for user: {}", userEmail);

        User owner = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = new Creature();
        creature.setName(dto.getName());
        creature.setRace(dto.getRace());
        creature.setCharacterClass(dto.getCharacterClass());
        creature.setLevel(1);
        creature.setExperience(0);
        creature.setHealth(100);
        creature.setAttack(10);
        creature.setDefense(10);
        creature.setInCombat(false);
        creature.setOwner(owner);
        creature.setImageUrl(dto.getImageUrl());

        Creature saved = creatureRepo.save(creature);
        log.debug("✅ Creature '{}' created with ID {}", saved.getName(), saved.getId());
        return mapToDto(saved);
    }

    @Override
    @CacheEvict(value = {"creaturesByUser", "allCreatures"}, allEntries = true)
    public CreatureDto updateCreature(Long id, UpdateCreatureDto dto, String userEmail) {
        log.info("✏️ Updating creature ID {} by user {}", id, userEmail);

        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature c = creatureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        if (!c.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para modificar esta criatura");
        }

        if (dto.getName() != null) c.setName(dto.getName());
        if (dto.getRace() != null) c.setRace(dto.getRace());
        if (dto.getCharacterClass() != null) c.setCharacterClass(dto.getCharacterClass());
        if (dto.getImageUrl() != null) c.setImageUrl(dto.getImageUrl());

        Creature updated = creatureRepo.save(c);
        log.debug("✅ Creature {} updated successfully.", updated.getId());
        return mapToDto(updated);
    }

    @Override
    @Cacheable(value = "creaturesByUser", key = "#userId")
    public List<CreatureDto> getCreaturesByUserId(Long userId) {
        log.info("📥 Fetching creatures for userId={} (from DB)", userId);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return creatureRepo.findByOwner(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "allCreatures")
    public List<CreatureDto> getAllCreatures() {
        log.info("🌍 Fetching all creatures (from DB)");
        return creatureRepo.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @CacheEvict(value = {"creaturesByUser", "allCreatures"}, allEntries = true)
    public void deleteCreature(Long id, String userEmail) {
        log.warn("🗑️ Deleting creature {} by user {}", id, userEmail);

        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = creatureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        if (!creature.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para borrar esta criatura");
        }

        creatureRepo.delete(creature);
        log.info("✅ Creature {} deleted successfully.", id);
    }

    private CreatureDto mapToDto(Creature c) {
        CreatureDto dto = new CreatureDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setRace(c.getRace());
        dto.setCharacterClass(c.getCharacterClass());
        dto.setLevel(c.getLevel());
        dto.setExperience(c.getExperience());
        dto.setHealth(c.getHealth());
        dto.setAttack(c.getAttack());
        dto.setDefense(c.getDefense());
        dto.setInCombat(c.isInCombat());
        dto.setImageUrl(c.getImageUrl());
        return dto;
    }

    @Override
    @Cacheable(value = "creaturesByOwner", key = "#ownerId")
    public List<CreatureDto> getCreaturesByOwnerId(Long ownerId) {
        log.info("📥 Fetching creatures for ownerId={} (from DB)", ownerId);
        User owner = userRepo.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return creatureRepo.findByOwner(owner)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @CacheEvict(value = {"creaturesByUser", "allCreatures"}, allEntries = true)
    public CreatureDto trainCreature(Long creatureId, String userEmail) {
        log.info("🏋️ Training creature {} by user {}", creatureId, userEmail);

        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = creatureRepo.findById(creatureId)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        if (!creature.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para entrenar esta criatura");
        }

        creature.setExperience(creature.getExperience() + 10);
        creature.setHealth(Math.max(0, creature.getHealth() - 10));

        if (creature.getExperience() >= 100) {
            creature.setLevel(creature.getLevel() + 1);
            creature.setExperience(0);
            creature.setAttack(creature.getAttack() + 5);
            creature.setDefense(creature.getDefense() + 3);
            creature.setHealth(100 + (creature.getLevel() * 10));
        }

        Creature updated = creatureRepo.save(creature);
        log.debug("✅ Creature {} trained. New level: {}", updated.getId(), updated.getLevel());
        return mapToDto(updated);
    }

    @Override
    @CacheEvict(value = {"creaturesByUser", "allCreatures"}, allEntries = true)
    public CreatureDto resolveCombat(Long creatureId, int damageReceived, boolean won, String userEmail) {
        log.info("⚔️ Resolving combat for creature {} (won: {})", creatureId, won);

        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = creatureRepo.findById(creatureId)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        if (!creature.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para esta criatura");
        }

        creature.setHealth(Math.max(0, creature.getHealth() - damageReceived));

        if (won) {
            creature.setExperience(creature.getExperience() + 30);
            if (creature.getExperience() >= 100) {
                creature.setLevel(creature.getLevel() + 1);
                creature.setExperience(0);
                creature.setAttack(creature.getAttack() + 5);
                creature.setDefense(creature.getDefense() + 3);
                creature.setHealth(100 + (creature.getLevel() * 10));
            }
        }

        Creature updated = creatureRepo.save(creature);
        log.debug("✅ Combat resolved for creature {} (Health: {})", updated.getId(), updated.getHealth());
        return mapToDto(updated);
    }

    @Override
    @CacheEvict(value = {"creaturesByUser", "allCreatures"}, allEntries = true)
    public CreatureDto restCreature(Long creatureId, String userEmail) {
        log.info("😴 Resting creature {} by user {}", creatureId, userEmail);

        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = creatureRepo.findById(creatureId)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        if (!creature.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para hacer descansar esta criatura");
        }

        int maxHealth = 100 + (creature.getLevel() * 10);
        creature.setHealth(Math.min(maxHealth, creature.getHealth() + 30));

        Creature updated = creatureRepo.save(creature);
        log.debug("✅ Creature {} rested. Current health: {}", updated.getId(), updated.getHealth());
        return mapToDto(updated);
    }

    @Override
    @CacheEvict(value = {"creaturesByUser", "allCreatures"}, allEntries = true)
    public void adminDeleteCreature(Long id) {
        log.warn("🗑️ [ADMIN] Deleting creature ID {}", id);
        Creature creature = creatureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));
        creatureRepo.delete(creature);
    }

    @Override
    @Cacheable(value = "creatureById", key = "#id")
    public CreatureDto getCreatureById(Long id, String userEmail) {
        log.info("🔍 Fetching creature by ID {} (from DB)", id);

        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Creature creature = creatureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criatura no encontrada"));

        if (!creature.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para ver esta criatura");
        }

        return mapToDto(creature);
    }
}
