import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private damage: number;
  private moveSpeed: number;
  private xpValue: number;
  private target: Phaser.Physics.Arcade.Sprite;
  private lastDamageTime: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Phaser.Physics.Arcade.Sprite,
    difficultyMultiplier: number = 1
  ) {
    super(scene, x, y, 'enemy');

    this.health = 20 * difficultyMultiplier;
    this.maxHealth = this.health;
    this.damage = 5 * difficultyMultiplier;
    this.moveSpeed = 50 + (difficultyMultiplier - 1) * 20;
    this.xpValue = Math.floor(3 * difficultyMultiplier);
    this.target = target;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setData('isEnemy', true);
    this.setCollideWorldBounds(true);
    this.setDepth(5);

    // Set collision body size
    if (this.body) {
      this.body.setSize(20, 20);
    }
  }

  update() {
    if (!this.active || !this.target.active) return;

    // Move towards player
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );

    this.setVelocity(
      Math.cos(angle) * this.moveSpeed,
      Math.sin(angle) * this.moveSpeed
    );

    // Attack player if touching
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );

    if (distance < 30) {
      this.attackPlayer();
    }
  }

  private attackPlayer() {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastDamageTime > 1000) {
      (this.target as any).takeDamage(this.damage);
      this.lastDamageTime = currentTime;
    }
  }

  takeDamage(damage: number) {
    this.health -= damage;

    // Visual feedback
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      this.clearTint();
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    // Emit event with XP value and position
    this.scene.events.emit('enemyKilled', {
      x: this.x,
      y: this.y,
      xpValue: this.xpValue
    });

    this.destroy();
  }

  getXPValue(): number {
    return this.xpValue;
  }
}
