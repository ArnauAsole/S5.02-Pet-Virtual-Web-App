# Solución a los Problemas Reportados

## Problemas identificados:

1. **Necesidad de crear más usuarios para pruebas**
2. **Las criaturas se muestran a todos los usuarios (deberían filtrarse por propietario)**
3. **El admin no puede listar usuarios ni sus criaturas**
4. **El filtro de búsqueda por raza no funciona**

---

## Soluciones implementadas:

### 1. Crear más usuarios de prueba

**Archivo modificado:** `backend/AdminSeeder.java`

Se añadieron 3 usuarios de prueba adicionales:
- `ana@example.com` (password: `password123`)
- `juan@example.com` (password: `password123`)
- `maria@example.com` (password: `password123`)

Todos con rol `ROLE_USER`.

---

### 2. Filtro de criaturas por propietario

**El backend YA está correctamente implementado** en `CreatureServiceImpl.java`:

\`\`\`java
public List<CreatureDto> listFor(Long currentUserId, boolean isAdmin) {
    var list = isAdmin ? repo.findAll() : repo.findByOwnerId(currentUserId);
    return list.stream().map(this::toDto).toList();
}
\`\`\`

**Comportamiento:**
- **Admin**: Ve TODAS las criaturas de todos los usuarios
- **User**: Ve SOLO sus propias criaturas

**Si un usuario ve criaturas de otros**, el problema está en la base de datos:
- Las criaturas no tienen el `ownerId` correcto
- Solución: Verificar que al crear criaturas, se asigne correctamente el `ownerId`

---

### 3. Panel de administración completo

**Archivos ya implementados:**

1. **Backend - AdminController.java:**
   - `GET /admin/users` - Lista todos los usuarios
   - `DELETE /admin/users/{id}` - Elimina usuario y sus criaturas
   - `DELETE /admin/creatures/{id}` - Elimina criatura individual

2. **Backend - UserDto.java:**
   - DTO para devolver información del usuario sin password
   - Ubicación: `dto/user/UserDto.java`

3. **Frontend - app/dashboard/admin/page.tsx:**
   - Lista de usuarios a la izquierda
   - Al hacer clic en un usuario, muestra sus criaturas a la derecha
   - Botones para eliminar usuarios y criaturas

4. **Frontend - lib/api.ts:**
   - `AdminAPI.listUsers()` - Obtiene todos los usuarios
   - `AdminAPI.getUserCreatures(ownerId)` - Obtiene criaturas de un usuario
   - `AdminAPI.deleteUser(id)` - Elimina usuario
   - `AdminAPI.deleteCreature(id)` - Elimina criatura

---

### 4. Filtro de búsqueda por raza corregido

**Archivo modificado:** `components/creatures-table.tsx`

**Problema:** Las razas en el filtro no coincidían con las del backend.

**Antes:**
\`\`\`typescript
const RACES = ["Elf", "Orc", "Dwarf", "Hobbit", "Man", "Ent", "Maiar", "Other"]
\`\`\`

**Después:**
\`\`\`typescript
const RACES = ["Elfs", "Orcs", "Dwarfs", "Hobbits", "Men", "Maiar", "Others"]
\`\`\`

Ahora el filtro coincide exactamente con los nombres de razas que usa el backend.

---

## Verificación de funcionamiento:

### Para verificar que todo funciona correctamente:

1. **Usuarios de prueba:**
   - Reinicia el backend para que se creen los nuevos usuarios
   - Intenta hacer login con: `ana@example.com` / `password123`
   - Intenta hacer login con: `juan@example.com` / `password123`
   - Intenta hacer login con: `maria@example.com` / `password123`

2. **Filtro por propietario:**
   - Crea criaturas con `ana@example.com`
   - Crea criaturas con `juan@example.com`
   - Verifica que cada usuario solo ve sus propias criaturas
   - Verifica que el admin ve todas las criaturas

3. **Panel de administración:**
   - Haz login como `admin@tolkien.local` / `admin123`
   - Ve al "Panel de Administración"
   - Deberías ver la lista de usuarios (admin, ana, juan, maria)
   - Haz clic en un usuario para ver sus criaturas
   - Prueba eliminar una criatura
   - Prueba eliminar un usuario (no admin)

4. **Filtro de búsqueda:**
   - En el dashboard, usa el filtro de razas
   - Selecciona "Elfs" - deberían aparecer solo elfos
   - Selecciona "Orcs" - deberían aparecer solo orcos
   - Busca por nombre en el campo de búsqueda

---

## Archivos del backend que necesitas actualizar:

1. **AdminSeeder.java** - Añadir usuarios de prueba
2. **UserDto.java** - Crear en `dto/user/UserDto.java`
3. **AdminController.java** - Ya está implementado correctamente

---

## Posibles problemas adicionales:

### Si las criaturas aún se muestran a todos los usuarios:

**Causa:** Las criaturas en la base de datos no tienen el `ownerId` correcto.

**Solución:**
1. Verifica en la base de datos que las criaturas tengan el campo `owner_id` poblado
2. Si no lo tienen, ejecuta este SQL:
   \`\`\`sql
   -- Ver criaturas sin owner
   SELECT * FROM creature WHERE owner_id IS NULL;
   
   -- Asignar un owner por defecto (reemplaza 1 con el ID del usuario)
   UPDATE creature SET owner_id = 1 WHERE owner_id IS NULL;
   \`\`\`

3. O simplemente elimina todas las criaturas y créalas de nuevo:
   \`\`\`sql
   DELETE FROM creature;
   \`\`\`

### Si el panel de admin no carga usuarios:

**Causa:** El endpoint `/admin/users` no está respondiendo.

**Solución:**
1. Verifica que `UserDto.java` esté en `dto/user/UserDto.java`
2. Verifica que el `AdminController` tenga el método `listUsers()`
3. Verifica en la consola del navegador si hay errores 403 o 404
4. Verifica que el token JWT tenga el rol `ROLE_ADMIN`

---

## Resumen de cambios:

- ✅ AdminSeeder.java - Añadidos 3 usuarios de prueba
- ✅ creatures-table.tsx - Corregidas las razas en el filtro
- ✅ AdminController.java - Ya implementado correctamente
- ✅ UserDto.java - Creado en dto/user/
- ✅ app/dashboard/admin/page.tsx - Panel completo implementado
- ✅ lib/api.ts - Funciones de admin implementadas
