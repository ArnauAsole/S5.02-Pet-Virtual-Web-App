# Cambios Necesarios en el Backend

## 1. Actualizar la Entidad User (✅ Ya está hecho)

El archivo `User.java` ya tiene el campo `profileImage`:

\`\`\`java
@Column(name = "profile_image")
private String profileImage;
\`\`\`

## 2. Actualizar UserDto.java (✅ Ya está hecho)

El archivo `UserDto.java` ya incluye el campo `profileImage`:

\`\`\`java
public record UserDto(
    Long id,
    String email,
    Set<Role> roles,
    String profileImage
) {}
\`\`\`

## 3. Actualizar RegisterDto.java (✅ Ya está hecho)

El archivo `RegisterDto.java` ya incluye el campo `profileImage`:

\`\`\`java
public record RegisterDto(
    @Email String email,
    @NotBlank @Size(min = 8, max = 100) String password,
    String profileImage
) {}
\`\`\`

## 4. Actualizar AuthService.java

**IMPORTANTE:** Debes modificar el método `register` en `AuthService.java` para guardar el `profileImage`:

\`\`\`java
public TokenDto register(RegisterDto registerDto) {
    if (userRepository.existsByEmail(registerDto.email())) {
        throw new RuntimeException("Email already exists");
    }

    User user = new User();
    user.setEmail(registerDto.email());
    user.setPassword(passwordEncoder.encode(registerDto.password()));
    
    if (registerDto.profileImage() != null && !registerDto.profileImage().isEmpty()) {
        user.setProfileImage(registerDto.profileImage());
    } else {
        user.setProfileImage("/images/profiles/default.jpg");
    }
    
    user.setRoles(Set.of("ROLE_USER"));
    
    userRepository.save(user);
    
    String token = jwtService.generateToken(user.getEmail());
    return new TokenDto(token);
}
\`\`\`

## 5. Actualizar CreatureServiceImpl.java (✅ Ya está hecho)

El archivo `CreatureServiceImpl.java` ya tiene los cambios necesarios:

### Método `train()` - Otorga 10 XP
\`\`\`java
public Creature train(Long id) {
    Creature creature = findById(id);
    creature.setXp(creature.getXp() + 10); // 10 XP por entrenar
    creature.setLevel(creature.getXp() / 100);
    return creatureRepository.save(creature);
}
\`\`\`

### Método `combat()` - Mantiene la vida y otorga 30 XP al ganador
\`\`\`java
public Creature combat(Long attackerId, Long defenderId) {
    Creature attacker = findById(attackerId);
    Creature defender = findById(defenderId);
    
    // Simular combate
    int attackerDamage = attacker.getAttackBase() + (int)(Math.random() * 20);
    int defenderDamage = defender.getAttackBase() + (int)(Math.random() * 20);
    
    // Aplicar daño (mínimo 1 HP)
    int newAttackerHealth = Math.max(1, attacker.getHealth() - defenderDamage);
    int newDefenderHealth = Math.max(1, defender.getHealth() - attackerDamage);
    
    attacker.setHealth(newAttackerHealth);
    defender.setHealth(newDefenderHealth);
    
    // Determinar ganador y otorgar 30 XP
    Creature winner;
    if (newDefenderHealth <= 1) {
        winner = attacker;
        attacker.setXp(attacker.getXp() + 30); // 30 XP por ganar combate
        attacker.setLevel(attacker.getXp() / 100);
    } else if (newAttackerHealth <= 1) {
        winner = defender;
        defender.setXp(defender.getXp() + 30); // 30 XP por ganar combate
        defender.setLevel(defender.getXp() / 100);
    } else {
        // Empate, ambos ganan 15 XP
        attacker.setXp(attacker.getXp() + 15);
        defender.setXp(defender.getXp() + 15);
        attacker.setLevel(attacker.getXp() / 100);
        defender.setLevel(defender.getXp() / 100);
        winner = attacker;
    }
    
    // Guardar ambas criaturas con su nueva vida
    creatureRepository.save(attacker);
    creatureRepository.save(defender);
    
    return winner;
}
\`\`\`

## 6. Actualizar UpdateCreatureDto.java

**IMPORTANTE:** Debes añadir el campo `health` a `UpdateCreatureDto.java` para permitir actualizar la vida de las criaturas después del combate:

\`\`\`java
public record UpdateCreatureDto(
    String name,
    String race,
    String color,
    Integer maxHealth,
    Integer attackBase,
    Integer defenseBase,
    List<String> accessories,
    Integer health  // Añadir campo health
) {}
\`\`\`

## 7. Actualizar CreatureController.java

**IMPORTANTE:** Debes modificar el método `update` en `CreatureController.java` para permitir actualizar el campo `health`:

\`\`\`java
@PutMapping("/{id}")
public ResponseEntity<CreatureDto> update(
    @PathVariable Long id,
    @RequestBody UpdateCreatureDto updateDto
) {
    Creature creature = creatureService.findById(id);
    
    if (updateDto.name() != null) creature.setName(updateDto.name());
    if (updateDto.race() != null) creature.setRace(updateDto.race());
    if (updateDto.color() != null) creature.setColor(updateDto.color());
    if (updateDto.maxHealth() != null) creature.setMaxHealth(updateDto.maxHealth());
    if (updateDto.attackBase() != null) creature.setAttackBase(updateDto.attackBase());
    if (updateDto.defenseBase() != null) creature.setDefenseBase(updateDto.defenseBase());
    if (updateDto.accessories() != null) creature.setAccessories(updateDto.accessories());
    
    if (updateDto.health() != null) {
        creature.setHealth(Math.max(1, updateDto.health())); // Mínimo 1 HP
    }
    
    Creature updated = creatureService.update(creature);
    return ResponseEntity.ok(creatureService.toDto(updated));
}
\`\`\`

## Resumen de Cambios

### ✅ Archivos que ya están correctos:
1. `User.java` - Ya tiene el campo `profileImage`
2. `UserDto.java` - Ya incluye `profileImage`
3. `RegisterDto.java` - Ya incluye `profileImage`
4. `CreatureServiceImpl.java` - Ya tiene la lógica de combate correcta

### ⚠️ Archivos que necesitas modificar:
1. **`AuthService.java`** - Añadir lógica para guardar `profileImage` en el registro
2. **`UpdateCreatureDto.java`** - Añadir campo `health`
3. **`CreatureController.java`** - Permitir actualizar el campo `health`

## Verificación

Después de hacer estos cambios, verifica que:

1. ✅ Los usuarios pueden registrarse con una imagen de perfil
2. ✅ La imagen de perfil aparece en el header del dashboard
3. ✅ Las criaturas mantienen su vida después del combate (mínimo 1 HP)
4. ✅ Las criaturas ganan 30 XP por ganar un combate
5. ✅ Las criaturas ganan 10 XP por entrenar
6. ✅ El sistema de combate tiene animaciones mejoradas
7. ✅ Los botones de acción (Atacar, Defender, Huir) tienen mejor diseño
