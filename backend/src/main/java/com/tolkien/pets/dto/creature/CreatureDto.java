package com.tolkien.pets.dto.creature;

import java.util.List;

public record CreatureDto(
        Long id,
        String name,
        String race,
        String color,
        int level,
        int xp,
        int attackBase,
        int defenseBase,
        int maxHealth,
        int health,
        boolean inCombat,
        Long ownerId,
        List<String> accessories
) {
}
