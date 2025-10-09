package com.tolkien.pets.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enum de clases de personaje. Nombres en español sin acentos para evitar líos
 * (el JSON saldrá en minúsculas: "mago", "caballero", ...).
 */
public enum CharacterClass {
    MAGO,
    CABALLERO,
    LADRON,
    EXPLORADOR,
    CLERIGO,
    BARDO,
    DRUIDA,
    PALADIN,
    ASESINO,
    BRUJO,
    MONJE,
    BARBARO;

    @JsonCreator
    public static CharacterClass from(String raw) {
        if (raw == null) return null;
        String key = raw.trim()
                .toUpperCase()
                .replace('Á','A').replace('É','E').replace('Í','I').replace('Ó','O').replace('Ú','U')
                .replace('Ä','A').replace('Ë','E').replace('Ï','I').replace('Ö','O').replace('Ü','U')
                .replace('Ñ','N')
                .replace('-', '_')
                .replace(' ', '_');
        return CharacterClass.valueOf(key);
    }

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}
