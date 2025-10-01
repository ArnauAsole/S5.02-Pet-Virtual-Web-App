package com.tolkien.pets.service;

import com.tolkien.pets.dto.creature.*;

import java.util.List;

public interface CreatureService {
    List<CreatureDto> listFor(Long currentUserId, boolean isAdmin);

    CreatureDto getById(Long id, Long currentUserId, boolean isAdmin);

    CreatureDto create(Long ownerId, CreateCreatureDto dto);

    CreatureDto update(Long id, Long currentUserId, boolean isAdmin, UpdateCreatureDto dto);

    void delete(Long id, Long currentUserId, boolean isAdmin);

    CreatureDto train(Long id, Long currentUserId, boolean isAdmin);  // +XP, -salud

    CreatureDto rest(Long id, Long currentUserId, boolean isAdmin);   // +salud (si no inCombat)

    CreatureDto fight(Long attackerId, Long opponentId, Long currentUserId, boolean isAdmin); // combate
}
