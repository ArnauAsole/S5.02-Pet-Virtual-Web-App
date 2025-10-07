package com.tolkien.pets.dto.creature;

import jakarta.validation.constraints.*;

import java.util.List;

public record UpdateCreatureDto(
        @NotBlank String name,
        @NotBlank String race,
        @Size(max = 20) String color,
        @Min(1) @Max(200) Integer maxHealth,
        @Min(0) @Max(50) Integer attackBase,
        @Min(0) @Max(50) Integer defenseBase,
        List<@Size(max = 20) String> accessories,
        String imageUrl
) {
}
