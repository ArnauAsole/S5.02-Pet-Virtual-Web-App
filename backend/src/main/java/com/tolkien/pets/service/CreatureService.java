package com.tolkien.pets.service;

import com.tolkien.pets.model.Creature;

import java.util.List;
import java.util.Optional;

public interface CreatureService {

    List<Creature> getAllCreatures();

    List<Creature> getCreaturesByOwnerId(Long ownerId);

    Optional<Creature> getCreatureById(Long id);

    Creature createCreature(Creature creature, String ownerEmail);

    // Métodos nuevos que faltan
    Creature trainCreature(Long id, String userEmail);

    Creature restCreature(Long id, String userEmail);

    void deleteCreature(Long id, String userEmail);
}