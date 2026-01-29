# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Owlbear Rodeo Dice - A 3D dice roller extension for d20-based tabletop RPG systems. Works both as a standalone web app (https://dice.owlbear.rodeo/) and as an Owlbear Rodeo VTT extension.

**Tech Stack:** React 18 + Three.js + Rapier (physics) + Zustand + Vite

## Commands

```bash
yarn          # Install dependencies
yarn dev      # Development server
yarn build    # Production build (tsc && vite build)
yarn preview  # Preview production build
```

## Architecture

### Build Entry Points

Three separate entry points configured in Vite:
- `index.html` - Main dice roller UI
- `popover.html` - Popover UI for displaying other players' rolls in VTT
- `background.html` - Background script for extension

### State Management

Multiple Zustand stores with Immer middleware:
- **`controls/store.ts`** - Dice selection, counts, advantage/disadvantage, bonus, hidden state
- **`dice/store.ts`** - Active roll lifecycle: values, transforms, throws, reroll logic
- **`debug/store.ts`** - Development flags

### Hierarchical Dice Data Model

The `Dice` type (`types/Dice.ts`) is recursive, enabling:
- Advantage/disadvantage (multiple dice, pick HIGHEST/LOWEST)
- D100 rolls (D100 + D10 combined)
- Grouped rolls with different combination modes (SUM, HIGHEST, LOWEST, NONE)

```typescript
Die: { id, style, type }
Dice: { dice: (Die | Dice)[], combination?, bonus? }
DiceRoll extends Dice: { hidden? }
```

### Physics Pipeline

1. **DiceThrower.ts** - Generates random initial velocity/rotation
2. **PhysicsDice.tsx** - Rapier rigid bodies, collision detection, roll completion detection
3. **getValueFromDiceGroup.ts** - Reads die orientation via quaternion to determine result

Rapier's determinism enables network sync by only sharing initial throw parameters.

### Key Directories

- **`src/tray/`** - 3D tray rendering with Three.js
- **`src/dice/`** - Dice components, physics, roll state
- **`src/controls/`** - UI sidebar (MUI), dice picking, roll history
- **`src/plugin/`** - Owlbear Rodeo SDK integration, multi-player tray management
- **`src/materials/`** - PBR materials per dice style (nebula, galaxy, gemstone, etc.)
- **`src/meshes/`** - 3D geometry for each die type
- **`src/colliders/`** - Simplified physics collider geometry

### Adding Dice Styles

To add a new dice style, create files in four folders:
1. `materials/` - PBR material definitions
2. `meshes/` - 3D geometry (.glb)
3. `colliders/` - Simplified collider geometry
4. `previews/` - 2D preview images

To add a new dice set with existing styles, edit `sets/diceSets.ts`.

## When to Use Context7 MCP

Use the context7 MCP tools (`resolve-library-id` and `query-docs`) when:

1. **Unfamiliar library APIs** - When working with libraries you're uncertain about (e.g., Rapier physics API, Owlbear Rodeo SDK, Three.js specifics)
2. **Version-specific features** - When you need to verify if a feature exists in the version used by this project
3. **Best practices** - When implementing patterns that should follow library-recommended approaches
4. **Debugging library issues** - When errors suggest misuse of a library API

**Do NOT use context7 for:**
- Standard React patterns (hooks, components, state)
- Basic TypeScript/JavaScript syntax
- Well-known patterns you're confident about
- When the codebase already has clear examples of the pattern needed

**Process:**
1. First call `resolve-library-id` with the library name to get the Context7 ID
2. Then call `query-docs` with the ID and your specific question
