package com.tolkien.pets.service.impl;

import com.tolkien.pets.dto.creature.CreateCreatureDto;
import com.tolkien.pets.dto.creature.CreatureDto;
import com.tolkien.pets.dto.creature.UpdateCreatureDto;
import com.tolkien.pets.exception.ForbiddenOperationException;
import com.tolkien.pets.exception.ResourceNotFoundException;
import com.tolkien.pets.model.Creature;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.CreatureRepo;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.service.CreatureService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CreatureServiceImpl implements CreatureService {

    private final CreatureRepo creatureRepo;
    private final UserRepo userRepo;

    public CreatureServiceImpl(CreatureRepo creatureRepo, UserRepo userRepo) {
        this.creatureRepo = creatureRepo;
        this.userRepo = userRepo;
    }

    private CreatureDto toDto(Creature c) {
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
        dto.setOwnerId(c.getOwner().getId());
        dto.setImageUrl(c.getImageUrl());
        return dto;
    }

    private Creature ownedOrAdmin(Long id, Long requesterId, boolean admin) {
        Creature c = creatureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Creature " + id + " not found"));
        if (!admin && !c.getOwner().getId().equals(requesterId)) {
            throw new ForbiddenOperationException("Not your creature");
        }
        return c;
    }

    @Override
    public List<CreatureDto> listMine(Long ownerId, boolean includeInCombat) {
        List<Creature> list = includeInCombat
                ? creatureRepo.findByOwnerId(ownerId)
                : creatureRepo.findByOwnerIdAndInCombatFalse(ownerId);
        return list.stream().map(this::toDto).toList();
    }

    @Override
    public CreatureDto getById(Long id, Long requesterId, boolean admin) {
        return toDto(ownedOrAdmin(id, requesterId, admin));
    }

    @Override
    @Transactional
    public CreatureDto create(CreateCreatureDto dto, Long ownerId) {
        User owner = userRepo.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        Creature c = new Creature();
        c.setName(dto.getName());
        c.setRace(dto.getRace());
        c.setCharacterClass(dto.getCharacterClass());
        c.setImageUrl(dto.getImageUrl());
        c.setLevel(1);
        c.setExperience(0);
        c.setHealth(100);
        c.setAttack(10);
        c.setDefense(10);
        c.setInCombat(false);
        c.setOwner(owner);

        return toDto(creatureRepo.save(c));
    }

    @Override
    @Transactional
    public CreatureDto update(Long id, UpdateCreatureDto dto, Long requesterId, boolean admin) {
        Creature c = ownedOrAdmin(id, requesterId, admin);
        if (dto.getName() != null) c.setName(dto.getName());
        if (dto.getRace() != null) c.setRace(dto.getRace());
        if (dto.getCharacterClass() != null) c.setCharacterClass(dto.getCharacterClass());
        if (dto.getImageUrl() != null) c.setImageUrl(dto.getImageUrl());
        return toDto(creatureRepo.save(c));
    }

    @Override
    @Transactional
    public void delete(Long id, Long requesterId, boolean admin) {
        Creature c = ownedOrAdmin(id, requesterId, admin);
        creatureRepo.delete(c);
    }

    @Override
    @Transactional
    public CreatureDto train(Long id, Long requesterId, boolean admin) {
        Creature c = ownedOrAdmin(id, requesterId, admin);
        if (c.isInCombat()) throw new ForbiddenOperationException("Creature is in combat");
        c.setExperience(c.getExperience() + 10);
        if (c.getExperience() >= 100) {
            c.setLevel(c.getLevel() + 1);
            c.setExperience(0);
            c.setAttack(c.getAttack() + 2);
            c.setDefense(c.getDefense() + 2);
            c.setHealth(Math.min(100 + c.getLevel() * 5, c.getHealth() + 5));
        }
        return toDto(creatureRepo.save(c));
    }

    @Override
    @Transactional
    public CreatureDto rest(Long id, Long requesterId, boolean admin) {
        Creature c = ownedOrAdmin(id, requesterId, admin);
        if (c.isInCombat()) throw new ForbiddenOperationException("Creature is in combat");
        c.setHealth(Math.min(c.getHealth() + 20, 100 + c.getLevel() * 5));
        return toDto(creatureRepo.save(c));
    }

    @Override
    @Transactional
    public CreatureDto fight(Long attackerId, Long opponentId, Long requesterId, boolean admin) {
        Creature attacker = ownedOrAdmin(attackerId, requesterId, admin);
        Creature opponent = creatureRepo.findById(opponentId)
                .orElseThrow(() -> new ResourceNotFoundException("Opponent not found"));

        if (attacker.isInCombat() || opponent.isInCombat())
            throw new ForbiddenOperationException("One of the creatures is already in combat");

        attacker.setInCombat(true);
        opponent.setInCombat(true);

        int damageToOpponent = Math.max(1, attacker.getAttack() - opponent.getDefense()/2);
        int damageToAttacker = Math.max(0, opponent.getAttack()/2 - attacker.getDefense()/3);

        opponent.setHealth(Math.max(0, opponent.getHealth() - damageToOpponent));
        attacker.setHealth(Math.max(0, attacker.getHealth() - damageToAttacker));

        attacker.setInCombat(false);
        opponent.setInCombat(false);

        attacker.setExperience(attacker.getExperience() + (opponent.getHealth() == 0 ? 25 : 10));
        if (attacker.getExperience() >= 100) {
            attacker.setLevel(attacker.getLevel() + 1);
            attacker.setExperience(0);
            attacker.setAttack(attacker.getAttack() + 2);
            attacker.setDefense(attacker.getDefense() + 2);
        }

        creatureRepo.save(opponent);
        return toDto(creatureRepo.save(attacker));
    }
}
