# Estructura de Imágenes de Criaturas

## Organización

### races/
Imágenes genéricas por raza. Estas se usan como avatares por defecto cuando una criatura no tiene imagen específica.

Razas disponibles:
- elves/ - Elfs
- men/ - Men
- dwarves/ - Dwarfs
- orcs/ - Orcs
- maia/ - Maiar (Gandalf, Saruman, etc.)
- other/ - others

Ejemplo: `races/elves/elf-warrior-1.jpg`, `races/elves/elf-mage-1.jpg`

### characters/
Imágenes específicas de criaturas con nombre propio.

Ejemplo: `characters/legolas.jpg`, `characters/gimli.jpg`

## Uso en el código

\`\`\`typescript
// Imagen específica de personaje
const imageUrl = `/images/creatures/characters/${creatureName.toLowerCase()}.jpg`

// Imagen genérica por raza
const imageUrl = `/images/creatures/races/${race.toLowerCase()}/${race.toLowerCase()}-${variant}.jpg`
