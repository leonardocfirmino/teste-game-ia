# AI Game - Phaser 3 + TypeScript

A game engine setup optimized for coding games with AI.

## Features

- **Phaser 3** - Powerful 2D game engine
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **AI Agent System** - Ready-to-extend AI framework

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Game Controls

- **Arrow Keys** - Move the player (green circle)
- **Objective** - Avoid the AI agent (red circle)

## AI System

The game includes a basic AI agent in `src/ai/AIAgent.ts` that:
- Chases the player when within range
- Wanders randomly when player is far away
- Can be easily extended with more complex behaviors

## Project Structure

```
├── src/
│   ├── main.ts           # Game initialization
│   ├── scenes/
│   │   └── GameScene.ts  # Main game scene
│   └── ai/
│       └── AIAgent.ts    # AI controller
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Extending the AI

You can enhance the AI by:
- Adding pathfinding algorithms (A*, Dijkstra)
- Implementing state machines
- Adding neural networks for learning
- Creating decision trees
- Implementing flocking behaviors
- Adding perception systems

## Next Steps

- Add more AI agents with different behaviors
- Implement learning algorithms
- Add obstacles and pathfinding
- Create different game modes
- Add power-ups and collectibles
