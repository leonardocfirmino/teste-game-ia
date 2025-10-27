import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { XPGem } from '../entities/XPGem';
import { EnemySpawner } from '../systems/EnemySpawner';
import { UpgradeUI, UpgradeType } from '../ui/UpgradeUI';
import { GameHUD } from '../ui/GameHUD';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private xpGems!: Phaser.Physics.Arcade.Group;
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
    this.enemies = this.physics.add.group({
      runChildUpdate: true
    });

    this.xpGems = this.physics.add.group({
      runChildUpdate: true
    });

    this.projectiles = this.physics.add.group({
      defaultKey: 'projectile',
      maxSize: 100
    });

    // Create player
    this.player = new Player(this, 400, 300);
    this.player.setProjectileGroup(this.projectiles);
    this.player.setEnemyGroup(this.enemies);

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
    this.hud.update(this.player.getStats(), this.enemies.getLength(), this.player.getAttackRange());
  }

  private createGraphics() {
    // Player graphic with 3D effect
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Shadow
    playerGraphics.fillStyle(0x000000, 0.3);
    playerGraphics.fillEllipse(12, 20, 20, 6);
    // Body with gradient effect (3 layers for depth)
    playerGraphics.fillStyle(0x00aa00, 1);
    playerGraphics.fillCircle(12, 10, 13);
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(12, 10, 11);
    playerGraphics.fillStyle(0x66ff66, 1);
    playerGraphics.fillCircle(9, 8, 5);
    playerGraphics.generateTexture('player', 24, 24);
    playerGraphics.destroy();

    // Enemy graphic with 3D effect
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Shadow
    enemyGraphics.fillStyle(0x000000, 0.3);
    enemyGraphics.fillEllipse(10, 17, 16, 5);
    // Body with layers
    enemyGraphics.fillStyle(0xaa0000, 1);
    enemyGraphics.fillCircle(10, 8, 11);
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(10, 8, 9);
    enemyGraphics.fillStyle(0xff6666, 1);
    enemyGraphics.fillCircle(7, 6, 4);
    enemyGraphics.generateTexture('enemy', 20, 20);
    enemyGraphics.destroy();

    // Projectile graphic with glow
    const projectileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    projectileGraphics.fillStyle(0xffaa00, 0.6);
    projectileGraphics.fillCircle(4, 4, 6);
    projectileGraphics.fillStyle(0xffff00, 1);
    projectileGraphics.fillCircle(4, 4, 4);
    projectileGraphics.fillStyle(0xffff99, 1);
    projectileGraphics.fillCircle(4, 4, 2);
    projectileGraphics.generateTexture('projectile', 8, 8);
    projectileGraphics.destroy();

    // XP Gem graphic with 3D diamond shape
    const xpGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    // Shadow
    xpGraphics.fillStyle(0x000000, 0.3);
    xpGraphics.fillEllipse(8, 14, 12, 4);
    // Gem layers for 3D effect
    xpGraphics.fillStyle(0x0088cc, 1);
    xpGraphics.fillRect(2, 6, 12, 8);
    xpGraphics.fillStyle(0x00bfff, 1);
    xpGraphics.beginPath();
    xpGraphics.moveTo(8, 2);
    xpGraphics.lineTo(14, 8);
    xpGraphics.lineTo(8, 12);
    xpGraphics.lineTo(2, 8);
    xpGraphics.closePath();
    xpGraphics.fillPath();
    xpGraphics.fillStyle(0x66ddff, 1);
    xpGraphics.fillRect(4, 7, 8, 4);
    xpGraphics.generateTexture('xpGem', 16, 16);
    xpGraphics.destroy();
  }

  private setupCollisions() {
    // Projectiles hit enemies
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handleProjectileEnemyCollision,
      undefined,
      this
    );

    // Player collects XP
    this.physics.add.overlap(
      this.player,
      this.xpGems,
      this.handlePlayerXPCollision,
      undefined,
      this
    );

    // Enemies touch player (damage handled in Enemy class)
    this.physics.add.overlap(this.player, this.enemies);
  }

  private handleProjectileEnemyCollision(projectileObj: any, enemyObj: any) {
    const projectile = projectileObj as Phaser.Physics.Arcade.Sprite;
    const enemy = enemyObj as Enemy;

    if (!projectile.active || !enemy.active) return;

    const damage = projectile.getData('damage') || 10;
    enemy.takeDamage(damage);

    // Impact particles
    this.createImpactEffect(projectile.x, projectile.y);

    projectile.setActive(false);
    projectile.setVisible(false);
    if (projectile.body) {
      projectile.body.enable = false;
    }
  }

  private createImpactEffect(x: number, y: number) {
    // Create impact particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 100 + Math.random() * 50;
      const particle = this.add.circle(x, y, 2, 0xffff00);
      particle.setDepth(20);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  private handlePlayerXPCollision(playerObj: any, gemObj: any) {
    const gem = gemObj as XPGem;

    if (!gem.active) return;

    const leveledUp = this.player.addXP(gem.getXPValue());
    gem.destroy();

    if (leveledUp) {
      this.upgradeUI.show();
    }
  }

  private setupEvents() {
    // When enemy is killed, drop XP
    this.events.on('enemyKilled', (data: { x: number; y: number; xpValue: number }) => {
      // Death explosion effect
      this.createDeathExplosion(data.x, data.y);

      // Drop XP gem
      const gem = new XPGem(this, data.x, data.y, data.xpValue);
      this.xpGems.add(gem);
    });

    // When time is up, show victory
    this.events.on('timeUp', () => {
      this.showVictory();
    });
  }

  private createDeathExplosion(x: number, y: number) {
    // Create explosion particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      const size = 3 + Math.random() * 4;
      const particle = this.add.circle(x, y, size, 0xff0000);
      particle.setDepth(20);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    // Flash effect
    const flash = this.add.circle(x, y, 15, 0xffffff, 0.8);
    flash.setDepth(19);
    this.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => flash.destroy()
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
      case 'range':
        this.player.upgradeRange();
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
