package com.tolkien.pets.dto.creature;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tolkien.pets.model.CharacterClass;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class UpdateCreatureDto {
    @Size(max = 100)
    private String name;

    @Size(max = 50)
    private String race;

    @JsonProperty("class")
    private CharacterClass characterClass; // opcional

    @URL @Size(max = 512)
    private String imageUrl; // opcional
}
