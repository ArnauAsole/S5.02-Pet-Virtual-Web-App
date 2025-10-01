package com.tolkien.pets.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Creature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String race;      // Human, Elf, Dwarf, Orc, Maia...
    private String color;

    // Progresión
    private int level = 1;
    private int xp = 0;

    // Stats base
    private int attackBase = 5;
    private int defenseBase = 3;

    // Salud
    private int maxHealth = 100;
    private int health = 100;

    // Estado del juego
    private boolean inCombat = false;

    // Propietario (id de User)
    private Long ownerId;

    @ElementCollection
    private List<String> accessories = new ArrayList<>();

    @Version
    private Long version;

    public Creature() {
    }

    // Getters/setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRace() {
        return race;
    }

    public void setRace(String race) {
        this.race = race;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getAttackBase() {
        return attackBase;
    }

    public void setAttackBase(int attackBase) {
        this.attackBase = attackBase;
    }

    public int getDefenseBase() {
        return defenseBase;
    }

    public void setDefenseBase(int defenseBase) {
        this.defenseBase = defenseBase;
    }

    public int getMaxHealth() {
        return maxHealth;
    }

    public void setMaxHealth(int maxHealth) {
        this.maxHealth = maxHealth;
    }

    public int getHealth() {
        return health;
    }

    public void setHealth(int health) {
        this.health = health;
    }

    public boolean isInCombat() {
        return inCombat;
    }

    public void setInCombat(boolean inCombat) {
        this.inCombat = inCombat;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public List<String> getAccessories() {
        return accessories;
    }

    public void setAccessories(List<String> accessories) {
        this.accessories = accessories;
    }
}
