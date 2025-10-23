package com.tolkien.pets.dto.creature;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tolkien.pets.model.CharacterClass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class CreateCreatureDto {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String race;

    @NotNull
    @JsonProperty("characterClass")
    private CharacterClass characterClass;

    @URL
    @Size(max = 512)
    private String imageUrl;
}
