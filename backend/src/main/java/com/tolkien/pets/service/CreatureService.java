package com.tolkien.pets.service;

import com.tolkien.pets.dto.creature.CreateCreatureDto;
import com.tolkien.pets.dto.creature.UpdateCreatureDto;
import com.tolkien.pets.dto.creature.CreatureDto;

import java.util.List;

public interface CreatureService {

    CreatureDto createCreature(CreateCreatureDto dto, String userEmail);

    CreatureDto updateCreature(Long id, UpdateCreatureDto dto, String userEmail);

    List<CreatureDto> getCreaturesByUserId(Long userId);

    List<CreatureDto> getCreaturesByOwnerId(Long ownerId);

    List<CreatureDto> getAllCreatures();

    void deleteCreature(Long id, String userEmail);

    CreatureDto trainCreature(Long creatureId, String userEmail);

    CreatureDto restCreature(Long creatureId, String userEmail);

    CreatureDto getCreatureById(Long id, String userEmail);

    CreatureDto resolveCombat(Long creatureId, int damageReceived, boolean won, String userEmail);

    void adminDeleteCreature(Long id);

}
