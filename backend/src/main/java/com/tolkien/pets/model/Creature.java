package com.tolkien.pets.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "creatures")
@Getter @Setter
public class Creature {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    private String name;

    @NotBlank @Size(max = 50)
    private String race;

    // NUEVO: enum guardado como STRING; en JSON es "class"
    @Enumerated(EnumType.STRING)
    @Column(name = "character_class", length = 50, nullable = false)
    @JsonProperty("class")
    private CharacterClass characterClass;

    private int level;
    private int experience;
    private int health;
    private int attack;
    private int defense;

    private boolean inCombat;

    @Column(length = 512)
    private String imageUrl;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User owner;
}
