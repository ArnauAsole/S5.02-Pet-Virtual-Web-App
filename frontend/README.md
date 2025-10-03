# Tolkien Creatures - Frontend

Frontend completo en React/Next.js para la API TolkienCreatures. Gestiona criaturas del universo de J.R.R. Tolkien con autenticación, filtros avanzados, y una interfaz moderna.

## 🚀 Características

- ✅ **Autenticación JWT** con roles (USER/ADMIN)
- ✅ **CRUD completo** de criaturas (crear, leer, actualizar, eliminar)
- ✅ **Búsqueda y filtros** por nombre, raza, alineamiento y hábitat
- ✅ **Paginación y ordenación** en el listado
- ✅ **Validación robusta** con Zod y react-hook-form
- ✅ **React Query** para gestión de estado y caché
- ✅ **UI moderna** con shadcn/ui y Tailwind CSS
- ✅ **Modo oscuro** integrado
- ✅ **Responsive** para móviles y tablets
- ✅ **Manejo de errores** con toasts informativos

## 📋 Requisitos Previos

- **Node.js 18+** instalado
- **Backend Spring Boot** ejecutándose en `http://localhost:8080`
- Tu API debe exponer los siguientes endpoints:
  - `POST /api/auth/login` - Autenticación
  - `POST /api/auth/register` - Registro
  - `GET /api/creatures` - Listar criaturas (con paginación y filtros)
  - `GET /api/creatures/{id}` - Detalle de criatura
  - `POST /api/creatures` - Crear criatura (requiere rol ADMIN)
  - `PUT /api/creatures/{id}` - Actualizar criatura (requiere rol ADMIN)
  - `DELETE /api/creatures/{id}` - Eliminar criatura (requiere rol ADMIN)

## 🛠️ Instalación

\`\`\`bash
# 1. Instalar dependencias
npm install

# 2. Verificar variables de entorno
# El archivo .env.local debe contener:
# NEXT_PUBLIC_API_BASE=http://localhost:8080

# 3. Iniciar el servidor de desarrollo
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

\`\`\`
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Página de login
│   ├── register/page.tsx           # Página de registro
│   ├── dashboard/page.tsx          # Dashboard principal
│   ├── creatures/
│   │   ├── [id]/page.tsx          # Detalle de criatura
│   │   ├── [id]/edit/page.tsx     # Editar criatura
│   │   └── new/page.tsx           # Crear criatura
│   ├── layout.tsx                  # Layout principal
│   └── globals.css                 # Estilos globales
├── components/
│   ├── creatures-table.tsx         # Tabla con filtros y paginación
│   ├── creature-form.tsx           # Formulario crear/editar
│   └── ui/                         # Componentes de shadcn/ui
├── lib/
│   ├── api.ts                      # Cliente HTTP con axios
│   ├── auth.ts                     # Gestión de autenticación
│   ├── types.ts                    # Tipos TypeScript
│   ├── schemas.ts                  # Esquemas de validación Zod
│   ├── query-provider.tsx          # Configuración React Query
│   └── utils.ts                    # Utilidades
├── hooks/
│   └── use-debounce.ts             # Hook para debounce
├── .env.local                      # Variables de entorno
└── package.json                    # Dependencias
\`\`\`

## 🎯 Uso

### 1. Registro e Inicio de Sesión

1. Accede a la página principal en `http://localhost:3000`
2. Haz clic en "Registrarse" para crear una cuenta
3. Completa el formulario con:
   - Usuario (mínimo 3 caracteres)
   - Email (opcional)
   - Contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número)
4. Inicia sesión con tus credenciales

### 2. Explorar Criaturas

- **Buscar**: Usa la barra de búsqueda para filtrar por nombre
- **Filtrar**: Selecciona raza y alineamiento en los selectores
- **Ordenar**: Haz clic en las cabeceras de la tabla
- **Paginar**: Usa los botones "Anterior" y "Siguiente"
- **Ver detalle**: Haz clic en el icono de ojo

### 3. Gestionar Criaturas (Solo ADMIN)

- **Crear**: Haz clic en "Nueva Criatura" en el dashboard
- **Editar**: Haz clic en el icono de lápiz en la tabla o en el detalle
- **Eliminar**: Haz clic en el icono de papelera (requiere confirmación)

## 🔧 Configuración del Backend

Tu API Spring Boot debe tener configurado CORS para permitir peticiones desde el frontend:

\`\`\`java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
\`\`\`

### Respuesta de Login Esperada

\`\`\`json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "roles": ["USER"] // o ["ADMIN"]
}
\`\`\`

## 🐛 Solución de Problemas

### Error: "No se puede conectar con el servidor"

1. Verifica que tu backend Spring Boot esté ejecutándose en `http://localhost:8080`
2. Comprueba que CORS esté configurado correctamente
3. Revisa la consola del navegador (F12) para ver los logs con `[v0]`

### Error: "Este usuario ya existe"

El usuario que intentas registrar ya existe en la base de datos. Prueba con otro nombre de usuario.

### Error 401: "No autorizado"

Tu token JWT ha expirado o es inválido. Cierra sesión y vuelve a iniciar sesión.

### Error 403: "No tienes permisos"

Estás intentando realizar una acción que requiere rol ADMIN. Solo los administradores pueden crear, editar o eliminar criaturas.

### La tabla no muestra datos

1. Verifica que tu backend tenga criaturas en la base de datos
2. Revisa la consola del navegador para ver si hay errores
3. Comprueba que el endpoint `GET /api/creatures` esté funcionando

## 📦 Scripts Disponibles

\`\`\`bash
npm run dev      # Inicia el servidor de desarrollo en http://localhost:3000
npm run build    # Construye la aplicación para producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta el linter de código
\`\`\`

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **UI**: React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes**: shadcn/ui
- **Formularios**: react-hook-form + Zod
- **Estado**: TanStack Query (React Query)
- **HTTP**: Axios
- **Iconos**: Lucide React
- **Notificaciones**: Sonner (toasts)
- **Fechas**: date-fns

## 📝 Tipos de Datos

### Creature

\`\`\`typescript
interface Creature {
  id: number
  name: string
  race: 'Elf' | 'Orc' | 'Dwarf' | 'Hobbit' | 'Man' | 'Ent' | 'Maiar' | 'Other'
  habitat?: string
  abilities?: string[]
  alignment: 'GOOD' | 'EVIL' | 'NEUTRAL'
  lore?: string
  createdAt: string
  updatedAt: string
}
\`\`\`

### Validaciones

- **name**: 2-60 caracteres, requerido
- **race**: Enum de razas, requerido
- **habitat**: 0-60 caracteres, opcional
- **abilities**: Array de strings (2-30 chars cada uno), máximo 10, opcional
- **alignment**: GOOD/EVIL/NEUTRAL, requerido
- **lore**: 0-2000 caracteres, opcional

## 🎨 Personalización

### Cambiar colores del tema

Edita `app/globals.css` y modifica las variables CSS:

\`\`\`css
@theme inline {
  --color-primary: #d97706; /* Cambia el color primario */
  --color-background: #ffffff;
  /* ... más variables */
}
\`\`\`

### Cambiar el puerto de desarrollo

\`\`\`bash
npm run dev -- -p 3001
\`\`\`

## 🚀 Despliegue

### Vercel (Recomendado)

1. Sube tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura la variable de entorno `NEXT_PUBLIC_API_BASE` con la URL de tu API en producción
4. Despliega

### Build manual

\`\`\`bash
npm run build
npm run start
\`\`\`

## 📄 Licencia

Este proyecto es parte de un ejercicio educativo para aprender Next.js y Spring Boot.

## 🤝 Contribuir

Si encuentras algún bug o tienes sugerencias, no dudes en abrir un issue o pull request.

---

**Desarrollado con ❤️ usando Next.js y Spring Boot**
