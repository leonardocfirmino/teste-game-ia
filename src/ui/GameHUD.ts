import Phaser from 'phaser';
import { PlayerStats } from '../entities/Player';

export class GameHUD {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;

  private healthBar!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private xpBarBg!: Phaser.GameObjects.Graphics;

  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;

  private startTime: number;
  private maxTime: number = 600000; // 10 minutes in ms

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.startTime = scene.time.now;
    this.createHUD();
  }

  private createHUD() {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setScrollFactor(0);

    // Health bar background
    this.healthBarBg = this.scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.5);
    this.healthBarBg.fillRect(10, 10, 204, 24);
    this.container.add(this.healthBarBg);

    // Health bar
    this.healthBar = this.scene.add.graphics();
    this.container.add(this.healthBar);

    // Health text
    const healthLabel = this.scene.add.text(15, 13, 'HP', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.container.add(healthLabel);

    // XP bar background
    this.xpBarBg = this.scene.add.graphics();
    this.xpBarBg.fillStyle(0x000000, 0.5);
    this.xpBarBg.fillRect(10, 40, 204, 14);
    this.container.add(this.xpBarBg);

    // XP bar
    this.xpBar = this.scene.add.graphics();
    this.container.add(this.xpBar);

    // Level text
    this.levelText = this.scene.add.text(10, 60, 'Level: 1', {
      fontSize: '18px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.container.add(this.levelText);

    // Timer (top center)
    this.timerText = this.scene.add.text(400, 10, '10:00', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.timerText.setOrigin(0.5, 0);
    this.container.add(this.timerText);

    // Enemy count (top right)
    this.enemyCountText = this.scene.add.text(790, 10, 'Inimigos: 0', {
      fontSize: '18px',
      color: '#ff6b6b',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.enemyCountText.setOrigin(1, 0);
    this.container.add(this.enemyCountText);

    // Stats display (left side)
    const statsY = 90;
    const statsText = this.scene.add.text(10, statsY, '', {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    statsText.setName('statsText');
    this.container.add(statsText);
  }

  update(stats: PlayerStats, enemyCount: number, attackRange?: number) {
    // Update health bar
    this.healthBar.clear();
    const healthPercent = stats.currentHealth / stats.maxHealth;
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(healthColor, 1);
    this.healthBar.fillRect(12, 12, 200 * healthPercent, 20);

    // Update XP bar
    this.xpBar.clear();
    const xpPercent = stats.currentXP / stats.xpToNextLevel;
    this.xpBar.fillStyle(0x00bfff, 1);
    this.xpBar.fillRect(12, 42, 200 * xpPercent, 10);

    // Update level
    this.levelText.setText(`Level: ${stats.level}`);

    // Update timer
    const elapsed = this.scene.time.now - this.startTime;
    const remaining = Math.max(0, this.maxTime - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);

    // Change timer color when time is running out
    if (remaining < 60000) {
      this.timerText.setColor('#ff0000');
    } else if (remaining < 180000) {
      this.timerText.setColor('#ffff00');
    }

    // Check if time is up
    if (remaining === 0) {
      this.scene.events.emit('timeUp');
    }

    // Update enemy count
    this.enemyCountText.setText(`Inimigos: ${enemyCount}`);

    // Update stats display
    const statsText = this.container.getByName('statsText') as Phaser.GameObjects.Text;
    if (statsText) {
      statsText.setText(
        `Velocidade: ${stats.moveSpeed}\n` +
        `Dano: ${stats.attackDamage}\n` +
        `Vel. Ataque: ${(1000 / stats.attackSpeed).toFixed(1)}/s\n` +
        `Alcance: ${attackRange || 400}`
      );
    }
  }

  destroy() {
    this.container.destroy();
  }
}
