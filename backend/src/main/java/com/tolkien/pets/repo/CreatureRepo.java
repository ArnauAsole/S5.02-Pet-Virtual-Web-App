package com.tolkien.pets.repo;

import com.tolkien.pets.model.Creature;
import com.tolkien.pets.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreatureRepo extends JpaRepository<Creature, Long> {

    List<Creature> findByOwner(User owner);

    List<Creature> findByOwnerId(Long ownerId);
}
