package com.tolkien.pets.service;

import com.tolkien.pets.dto.creature.CreateCreatureDto;
import com.tolkien.pets.dto.creature.CreatureDto;
import com.tolkien.pets.dto.creature.UpdateCreatureDto;

import java.util.List;

public interface CreatureService {
    List<CreatureDto> listMine(Long ownerId, boolean includeInCombat);

    CreatureDto getById(Long id, Long requesterId, boolean admin);

    CreatureDto create(CreateCreatureDto dto, Long ownerId);

    CreatureDto update(Long id, UpdateCreatureDto dto, Long requesterId, boolean admin);

    void delete(Long id, Long requesterId, boolean admin);

    CreatureDto train(Long id, Long requesterId, boolean admin);

    CreatureDto rest(Long id, Long requesterId, boolean admin);

    CreatureDto fight(Long attackerId, Long opponentId, Long requesterId, boolean admin);
}
