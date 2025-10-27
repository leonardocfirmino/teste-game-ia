# Survivor Game - Phaser 3 + TypeScript

Um jogo estilo Vampire Survivors com sistema de upgrades, ondas de inimigos e progressão.

## Recursos

- **Phaser 3** - Engine 2D poderosa
- **TypeScript** - Desenvolvimento type-safe
- **Vite** - Build tool rápida e dev server
- **Sistema de Combate Automático** - Ataque automático aos inimigos próximos
- **Sistema de XP e Níveis** - Progressão através de experiência
- **Sistema de Upgrades** - Escolha entre 3 power-ups ao upar de nível
- **Ondas de Inimigos** - Inimigos surgem continuamente nas bordas da tela
- **Escalada de Dificuldade** - Inimigos ficam mais fortes com o tempo
- **Timer de 10 Minutos** - Sobreviva até o final para vencer!

## Como Jogar

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Build para produção:
```bash
npm run build
```

## Controles

- **Setas do Teclado** - Mover o jogador (círculo verde)
- **R** - Reiniciar (após vitória/derrota)

## Mecânicas do Jogo

### Combate
- O jogador ataca automaticamente o inimigo mais próximo
- Projéteis brilhantes com efeitos de impacto
- Inimigos explodem em partículas ao morrer
- Efeitos visuais 3D com sombras e profundidade

### Sistema de XP
- Colete cristais de XP para encher a barra de experiência
- Ao completar a barra, você sobe de nível
- XP é atraído magneticamente quando você se aproxima
- **Cura completa** ao upar + aumento de vida máxima!

### Upgrades Poderosos (FORTE!)
1. **⚡ Super Velocidade** - +40 velocidade (muito rápido!)
2. **⚔️ Poder Devastador** - +15 dano por projétil (brutal!)
3. **🔥 Rajada Rápida** - Ataque muito mais rápido
4. **🎯 Alcance Supremo** - +100 alcance (dobro!)

### Balanceamento
- **Player mais forte**: Começa com mais vida (150 HP) e dano (25)
- **Upgrades muito mais poderosos**: Valores triplicados!
- **Inimigos mais fracos**: Menos vida e dano
- **Progressão mais suave**: Dificuldade aumenta mais devagar
- **Ondas menores no início**: 2 inimigos a cada 3 segundos

### Progressão
- Inimigos surgem em ondas crescentes
- A cada 45 segundos, inimigos ficam mais fortes
- Quantidade de inimigos só aumenta após 2 minutos
- Objetivo: Sobreviver por 10 minutos

## Estrutura do Projeto

```
├── src/
│   ├── main.ts              # Inicialização do jogo
│   ├── scenes/
│   │   └── GameScene.ts     # Cena principal do jogo
│   ├── entities/
│   │   ├── Player.ts        # Jogador com combate e stats
│   │   ├── Enemy.ts         # Inimigo com IA perseguição
│   │   └── XPGem.ts         # Cristal de XP com efeito magnético
│   ├── systems/
│   │   └── EnemySpawner.ts  # Sistema de spawn de ondas
│   └── ui/
│       ├── UpgradeUI.ts     # Interface de seleção de upgrades
│       └── GameHUD.ts       # HUD com HP, XP, timer e stats
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## HUD (Interface)

- **Barra de HP** - Verde/Amarelo/Vermelho conforme a saúde
- **Barra de XP** - Azul, mostra progresso para próximo nível
- **Level** - Nível atual do jogador
- **Timer** - Tempo restante (10 minutos)
- **Contador de Inimigos** - Quantidade de inimigos ativos
- **Stats** - Velocidade, dano e velocidade de ataque atuais

## Próximas Melhorias

- Adicionar mais tipos de inimigos
- Implementar diferentes tipos de armas
- Sistema de raridade para upgrades
- Mais power-ups (área de efeito, projéteis múltiplos, etc)
- Diferentes mapas e biomas
- Bosses especiais
- Sistema de conquistas
