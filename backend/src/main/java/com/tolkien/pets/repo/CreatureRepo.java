package com.tolkien.pets.repo;

import com.tolkien.pets.model.Creature;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CreatureRepo extends JpaRepository<Creature, Long> {
    List<Creature> findByOwnerId(Long ownerId);
}
