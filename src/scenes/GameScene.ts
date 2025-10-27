import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { XPGem } from '../entities/XPGem';
import { EnemySpawner } from '../systems/EnemySpawner';
import { UpgradeUI, UpgradeType } from '../ui/UpgradeUI';
import { GameHUD } from '../ui/GameHUD';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private xpGems!: Phaser.GameObjects.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private enemySpawner!: EnemySpawner;
  private upgradeUI!: UpgradeUI;
  private hud!: GameHUD;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.createGraphics();
  }

  create() {
    // Create background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Create groups
    this.enemies = this.add.group({
      runChildUpdate: true
    });

    this.xpGems = this.add.group({
      runChildUpdate: true
    });

    this.projectiles = this.physics.add.group({
      defaultKey: 'projectile',
      maxSize: 100
    });

    // Create player
    this.player = new Player(this, 400, 300);
    this.player.setProjectileGroup(this.projectiles);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Create enemy spawner
    this.enemySpawner = new EnemySpawner(this, this.enemies, this.player);

    // Create UI
    this.upgradeUI = new UpgradeUI(this, (type: UpgradeType) => {
      this.handleUpgrade(type);
    });

    this.hud = new GameHUD(this);

    // Setup collisions
    this.setupCollisions();

    // Setup events
    this.setupEvents();

    // Add instructions
    const instructions = this.add.text(400, 550, 'Use SETAS para mover | Sobreviva 10 minutos!', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    instructions.setOrigin(0.5);
    instructions.setScrollFactor(0);
    instructions.setDepth(100);
  }

  update() {
    // Update player
    this.player.update(this.cursors);

    // Update enemies
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy instanceof Enemy) {
        enemy.update();
      }
    });

    // Update XP gems with magnet effect
    this.xpGems.getChildren().forEach((gem) => {
      if (gem instanceof XPGem) {
        gem.update(this.player);
      }
    });

    // Update HUD
    this.hud.update(this.player.getStats(), this.enemies.getLength());
  }

  private createGraphics() {
    // Player graphic
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(12, 12, 12);
    playerGraphics.generateTexture('player', 24, 24);
    playerGraphics.destroy();

    // Enemy graphic
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(10, 10, 10);
    enemyGraphics.generateTexture('enemy', 20, 20);
    enemyGraphics.destroy();

    // Projectile graphic
    const projectileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    projectileGraphics.fillStyle(0xffff00, 1);
    projectileGraphics.fillCircle(4, 4, 4);
    projectileGraphics.generateTexture('projectile', 8, 8);
    projectileGraphics.destroy();

    // XP Gem graphic
    const xpGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    xpGraphics.fillStyle(0x00bfff, 1);
    xpGraphics.fillRect(0, 4, 8, 8);
    xpGraphics.fillRect(4, 0, 8, 8);
    xpGraphics.fillRect(4, 8, 8, 8);
    xpGraphics.fillRect(8, 4, 8, 8);
    xpGraphics.generateTexture('xpGem', 16, 16);
    xpGraphics.destroy();
  }

  private setupCollisions() {
    // Projectiles hit enemies
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (projectile, enemy) => {
        if (projectile instanceof Phaser.Physics.Arcade.Sprite && enemy instanceof Enemy) {
          const damage = projectile.getData('damage') || 10;
          enemy.takeDamage(damage);
          projectile.setActive(false);
          projectile.setVisible(false);
        }
      }
    );

    // Player collects XP
    this.physics.add.overlap(
      this.player,
      this.xpGems,
      (player, gem) => {
        if (gem instanceof XPGem) {
          const leveledUp = this.player.addXP(gem.getXPValue());
          gem.destroy();

          if (leveledUp) {
            this.upgradeUI.show();
          }
        }
      }
    );

    // Enemies touch player (damage handled in Enemy class)
    this.physics.add.overlap(this.player, this.enemies);
  }

  private setupEvents() {
    // When enemy is killed, drop XP
    this.events.on('enemyKilled', (data: { x: number; y: number; xpValue: number }) => {
      const gem = new XPGem(this, data.x, data.y, data.xpValue);
      this.xpGems.add(gem);
    });

    // When time is up, show victory
    this.events.on('timeUp', () => {
      this.showVictory();
    });
  }

  private handleUpgrade(type: UpgradeType) {
    switch (type) {
      case 'speed':
        this.player.upgradeSpeed();
        break;
      case 'damage':
        this.player.upgradeDamage();
        break;
      case 'attackSpeed':
        this.player.upgradeAttackSpeed();
        break;
    }
  }

  private showVictory() {
    this.physics.pause();
    this.enemySpawner.stop();

    const victory = this.add.container(400, 300);
    victory.setDepth(2000);

    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.9);
    const title = this.add.text(0, -100, 'VITÓRIA!', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    const stats = this.player.getStats();
    const message = this.add.text(0, 0,
      `Você sobreviveu 10 minutos!\n\n` +
      `Level Final: ${stats.level}\n` +
      `Inimigos Derrotados: ${this.enemies.getLength()}`, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    message.setOrigin(0.5);

    const restartText = this.add.text(0, 120, 'Pressione R para reiniciar', {
      fontSize: '18px',
      color: '#aaaaaa'
    });
    restartText.setOrigin(0.5);

    victory.add([bg, title, message, restartText]);

    this.input.keyboard!.on('keydown-R', () => {
      this.scene.restart();
    });
  }
}
