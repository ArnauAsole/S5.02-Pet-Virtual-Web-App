package com.tolkien.pets.repo;

import com.tolkien.pets.model.Creature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreatureRepo extends JpaRepository<Creature, Long> {

    // Todas las criaturas de un owner (por id del usuario)
    List<Creature> findByOwnerId(Long ownerId);

    // Todas las criaturas de un owner que NO están en combate
    List<Creature> findByOwnerIdAndInCombatFalse(Long ownerId);

    // (útil para checks de propiedad)
    Optional<Creature> findByIdAndOwnerId(Long id, Long ownerId);
}
