package com.tolkien.pets.dto.creature;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tolkien.pets.model.CharacterClass;
import lombok.Data;

@Data
public class CreatureDto {
    private Long id;
    private String name;
    private String race;

    @JsonProperty("characterClass")
    private CharacterClass characterClass;

    private int level;
    private int experience;
    private int health;
    private int attack;
    private int defense;
    private boolean inCombat;
    private Long ownerId;
    private String imageUrl;
}
