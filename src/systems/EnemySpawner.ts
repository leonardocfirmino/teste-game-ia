import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemies: Phaser.GameObjects.Group;
  private target: Phaser.Physics.Arcade.Sprite;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private difficultyTimer!: Phaser.Time.TimerEvent;
  private difficultyMultiplier: number = 1;
  private enemiesPerWave: number = 3;

  constructor(
    scene: Phaser.Scene,
    enemies: Phaser.GameObjects.Group,
    target: Phaser.Physics.Arcade.Sprite
  ) {
    this.scene = scene;
    this.enemies = enemies;
    this.target = target;

    this.startSpawning();
    this.startDifficultyScaling();
  }

  private startSpawning() {
    this.spawnTimer = this.scene.time.addEvent({
      delay: 2000,
      callback: () => this.spawnWave(),
      loop: true
    });
  }

  private startDifficultyScaling() {
    // Increase difficulty every 30 seconds
    this.difficultyTimer = this.scene.time.addEvent({
      delay: 30000,
      callback: () => {
        this.difficultyMultiplier += 0.3;
        this.enemiesPerWave += 1;
      },
      loop: true
    });
  }

  private spawnWave() {
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.spawnEnemy();
    }
  }

  private spawnEnemy() {
    const spawnPos = this.getRandomSpawnPosition();
    const enemy = new Enemy(
      this.scene,
      spawnPos.x,
      spawnPos.y,
      this.target,
      this.difficultyMultiplier
    );

    this.enemies.add(enemy);
  }

  private getRandomSpawnPosition(): { x: number; y: number } {
    const side = Phaser.Math.Between(0, 3);
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const margin = 50;

    switch (side) {
      case 0: // Top
        return { x: Phaser.Math.Between(0, width), y: -margin };
      case 1: // Right
        return { x: width + margin, y: Phaser.Math.Between(0, height) };
      case 2: // Bottom
        return { x: Phaser.Math.Between(0, width), y: height + margin };
      case 3: // Left
        return { x: -margin, y: Phaser.Math.Between(0, height) };
      default:
        return { x: 0, y: 0 };
    }
  }

  stop() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    if (this.difficultyTimer) {
      this.difficultyTimer.destroy();
    }
  }

  getDifficultyMultiplier(): number {
    return this.difficultyMultiplier;
  }
}
