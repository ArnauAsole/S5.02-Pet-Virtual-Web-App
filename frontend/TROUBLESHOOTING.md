# Guía de Solución de Problemas - Tolkien Creatures Frontend

## Problema: "No se ha podido crear el usuario" al registrarse

### Diagnóstico Rápido

Cuando intentas registrarte y ves el error "No se ha podido crear el usuario", sigue estos pasos:

#### 1. Verifica que tu API Spring Boot esté ejecutándose

Abre una terminal y verifica que tu backend esté corriendo:

\`\`\`bash
# Debería mostrar que el servidor está activo en el puerto 8080
curl http://localhost:8080/api/auth/register
\`\`\`

Si no responde, inicia tu aplicación Spring Boot:

\`\`\`bash
# Desde el directorio de tu proyecto Spring Boot
./mvnw spring-boot:run
# o
gradle bootRun
\`\`\`

#### 2. Verifica la URL de la API

Abre el navegador en `http://localhost:3000` y mira en la parte superior del formulario. Debería mostrar:

\`\`\`
API: http://localhost:8080/api
\`\`\`

Si muestra "⚠️ No configurada" o una URL incorrecta:

1. Verifica que existe el archivo `.env.local` en la raíz del proyecto
2. Asegúrate que contiene: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
3. Reinicia el servidor de Next.js (Ctrl+C y luego `npm run dev`)

#### 3. Revisa la Consola del Navegador

Abre las DevTools del navegador (F12) y ve a la pestaña "Console". Busca mensajes que empiecen con `[v0]`:

**Ejemplo de error de conexión:**
\`\`\`
[v0] API Error: {
  message: "Failed to fetch"
}
\`\`\`
→ **Solución:** Tu API no está ejecutándose o está en un puerto diferente.

**Ejemplo de error CORS:**
\`\`\`
Access to fetch at 'http://localhost:8080/api/auth/register' from origin 'http://localhost:3000' 
has been blocked by CORS policy
\`\`\`
→ **Solución:** Necesitas configurar CORS en Spring Boot (ver sección siguiente).

**Ejemplo de error 404:**
\`\`\`
[v0] API Error: {
  status: 404,
  url: "/auth/register"
}
\`\`\`
→ **Solución:** El endpoint no existe. Verifica tu controlador en Spring Boot.

#### 4. Configura CORS en Spring Boot

Tu backend debe permitir peticiones desde `http://localhost:3000`. Crea o actualiza esta clase:

\`\`\`java
package com.tuproyecto.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
\`\`\`

#### 5. Verifica los Endpoints de tu API

Tu API Spring Boot debe tener estos endpoints:

**POST /api/auth/register**
- Recibe: `{ "username": "string", "password": "string", "email": "string", "role": "USER" }`
- Devuelve: `{ "token": "jwt_token", "user": {...} }` o simplemente `{ "token": "jwt_token" }`

**POST /api/auth/login**
- Recibe: `{ "username": "string", "password": "string" }`
- Devuelve: `{ "token": "jwt_token", "user": {...} }`

**GET /api/creatures**
- Requiere header: `Authorization: Bearer {token}`
- Devuelve: Array de criaturas o `{ "content": [...] }`

#### 6. Ejemplo de Controlador Spring Boot

\`\`\`java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Tu lógica de registro aquí
            User user = authService.register(request);
            String token = jwtService.generateToken(user);
            
            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Tu lógica de login aquí
        // ...
    }
}
\`\`\`

### Checklist de Verificación

- [ ] El backend Spring Boot está ejecutándose en `http://localhost:8080`
- [ ] El archivo `.env.local` existe y tiene `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
- [ ] Has reiniciado el servidor de Next.js después de crear/modificar `.env.local`
- [ ] CORS está configurado en Spring Boot para permitir `http://localhost:3000`
- [ ] Los endpoints `/api/auth/register` y `/api/auth/login` existen en tu backend
- [ ] Los endpoints devuelven un objeto con la propiedad `token`

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Failed to fetch" | Backend no está ejecutándose | Inicia tu aplicación Spring Boot |
| "CORS policy" | CORS no configurado | Añade configuración CORS en Spring Boot |
| "404 Not Found" | Endpoint incorrecto | Verifica la ruta en tu controlador |
| "400 Bad Request" | Datos inválidos | Revisa que los campos coincidan con tu DTO |
| "409 Conflict" | Usuario ya existe | Usa un nombre de usuario diferente |

### Comandos Útiles

\`\`\`bash
# Verificar que el backend responde
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@test.com","role":"USER"}'

# Ver logs del frontend
npm run dev

# Reiniciar el frontend
# Presiona Ctrl+C y luego:
npm run dev
\`\`\`

### Contacto

Si después de seguir todos estos pasos el problema persiste, comparte:
1. Los logs de la consola del navegador (mensajes con `[v0]`)
2. Los logs de tu aplicación Spring Boot
3. El código de tu controlador de autenticación
