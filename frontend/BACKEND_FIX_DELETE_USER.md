# Fix: Error 500 al Eliminar Usuarios

## Problema

Cuando un administrador intenta eliminar un usuario, se produce un error 500 (Internal Server Error) en el backend.

**Error en consola:**
\`\`\`
DELETE http://localhost:8080/api/admin/users/8 500 (Internal Server Error)
\`\`\`

## Causa

El método `deleteUser()` en `AdminController.java` no tiene la anotación `@Transactional`, lo que puede causar problemas al intentar eliminar múltiples entidades en secuencia (primero las criaturas, luego el usuario).

## Código Actual (Con Problema)

\`\`\`java
@DeleteMapping("/users/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    // si hay FK de creatures->ownerId, borra antes las criaturas del usuario:
    creatures.findByOwnerId(id).forEach(c -> creatures.deleteById(c.getId()));
    users.deleteById(id);
    return ResponseEntity.noContent().build();
}
\`\`\`

## Solución

Añade la anotación `@Transactional` al método y usa `deleteAll()` para mayor eficiencia:

\`\`\`java
import org.springframework.transaction.annotation.Transactional;

@Transactional
@DeleteMapping("/users/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    // Eliminar todas las criaturas del usuario primero
    List<Creature> userCreatures = creatures.findByOwnerId(id);
    creatures.deleteAll(userCreatures);
    
    // Luego eliminar el usuario
    users.deleteById(id);
    
    return ResponseEntity.noContent().build();
}
\`\`\`

## Verificación Adicional

Asegúrate de que tu `CreatureRepo` tiene el método `findByOwnerId`:

\`\`\`java
public interface CreatureRepo extends JpaRepository<Creature, Long> {
    List<Creature> findByOwnerId(Long ownerId);
    List<Creature> findByOwnerIdAndInCombatFalse(Long ownerId);
    Optional<Creature> findByIdAndOwnerId(Long id, Long ownerId);
}
\`\`\`

## Mejora Opcional: Manejo de Errores

Para mejor debugging, puedes añadir try-catch y logging:

\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Transactional
@DeleteMapping("/users/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    try {
        // Verificar que el usuario existe
        User user = users.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        // Eliminar todas las criaturas del usuario
        List<Creature> userCreatures = creatures.findByOwnerId(id);
        log.info("Eliminando {} criaturas del usuario {}", userCreatures.size(), id);
        creatures.deleteAll(userCreatures);
        
        // Eliminar el usuario
        log.info("Eliminando usuario {}", id);
        users.delete(user);
        
        return ResponseEntity.noContent().build();
    } catch (Exception e) {
        log.error("Error al eliminar usuario {}: {}", id, e.getMessage(), e);
        throw e;
    }
}
\`\`\`

## Alternativa: Cascade Delete en el Modelo

Si prefieres que la base de datos maneje la eliminación en cascada, puedes modificar el modelo `User.java`:

\`\`\`java
@OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Creature> creatures = new ArrayList<>();
\`\`\`

Con esta configuración, al eliminar un usuario, todas sus criaturas se eliminarán automáticamente.

## Estado del Frontend

El frontend ya está correctamente implementado con:
- Manejo de errores con toast notifications
- Diálogo de confirmación antes de eliminar
- Mensaje de advertencia: "Se eliminará permanentemente el usuario y todas sus criaturas"
- Invalidación de queries para actualizar la UI

Una vez apliques el fix en el backend, la funcionalidad funcionará correctamente.
