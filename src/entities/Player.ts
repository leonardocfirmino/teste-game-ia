import Phaser from 'phaser';

export interface PlayerStats {
  maxHealth: number;
  currentHealth: number;
  moveSpeed: number;
  attackDamage: number;
  attackSpeed: number;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private stats: PlayerStats;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private lastAttackTime: number = 0;
  private scene: Phaser.Scene;
  private attackRange: number = 400;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    this.scene = scene;

    this.stats = {
      maxHealth: 100,
      currentHealth: 100,
      moveSpeed: 150,
      attackDamage: 10,
      attackSpeed: 1000, // ms between attacks
      level: 1,
      currentXP: 0,
      xpToNextLevel: 10
    };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);
  }

  setProjectileGroup(group: Phaser.Physics.Arcade.Group) {
    this.projectiles = group;
  }

  setEnemyGroup(group: Phaser.Physics.Arcade.Group) {
    this.enemies = group;
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    // Movement
    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
      velocityX = -this.stats.moveSpeed;
    } else if (cursors.right.isDown) {
      velocityX = this.stats.moveSpeed;
    }

    if (cursors.up.isDown) {
      velocityY = -this.stats.moveSpeed;
    } else if (cursors.down.isDown) {
      velocityY = this.stats.moveSpeed;
    }

    this.setVelocity(velocityX, velocityY);

    // Auto-attack nearest enemy
    this.autoAttack();
  }

  private autoAttack() {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastAttackTime < this.stats.attackSpeed) {
      return;
    }

    if (!this.enemies || this.enemies.getLength() === 0) {
      return;
    }

    // Find nearest enemy from the enemy group
    let nearestEnemy: any = null;
    let minDistance = Infinity;

    this.enemies.getChildren().forEach((enemy: any) => {
      if (enemy.active && enemy.body) {
        const distance = Phaser.Math.Distance.Between(
          this.x, this.y,
          enemy.x, enemy.y
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestEnemy = enemy;
        }
      }
    });

    // Always shoot at nearest enemy within range
    if (nearestEnemy && minDistance < this.attackRange) {
      this.shootAt(nearestEnemy.x, nearestEnemy.y);
      this.lastAttackTime = currentTime;

      // Visual feedback - show attack line
      this.showAttackLine(nearestEnemy);
    }
  }

  private showAttackLine(target: any) {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, 0xffff00, 0.5);
    graphics.lineBetween(this.x, this.y, target.x, target.y);
    graphics.setDepth(1);

    this.scene.time.delayedCall(100, () => {
      graphics.destroy();
    });
  }

  private shootAt(targetX: number, targetY: number) {
    if (!this.projectiles) return;

    const projectile = this.projectiles.get(this.x, this.y, 'projectile') as Phaser.Physics.Arcade.Sprite;

    if (!projectile) return;

    projectile.setActive(true);
    projectile.setVisible(true);
    projectile.setData('damage', this.stats.attackDamage);

    if (projectile.body) {
      projectile.body.enable = true;
      (projectile.body as Phaser.Physics.Arcade.Body).setSize(8, 8);
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const velocity = 400;

    projectile.setVelocity(
      Math.cos(angle) * velocity,
      Math.sin(angle) * velocity
    );

    this.scene.time.delayedCall(3000, () => {
      if (projectile.active) {
        projectile.setActive(false);
        projectile.setVisible(false);
        projectile.body.enable = false;
      }
    });
  }

  takeDamage(damage: number) {
    this.stats.currentHealth -= damage;

    // Visual feedback
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    if (this.stats.currentHealth <= 0) {
      this.stats.currentHealth = 0;
      this.die();
    }
  }

  addXP(amount: number): boolean {
    this.stats.currentXP += amount;

    if (this.stats.currentXP >= this.stats.xpToNextLevel) {
      this.levelUp();
      return true;
    }
    return false;
  }

  private levelUp() {
    this.stats.level++;
    this.stats.currentXP -= this.stats.xpToNextLevel;
    this.stats.xpToNextLevel = Math.floor(this.stats.xpToNextLevel * 1.5);

    // Heal on level up
    this.stats.currentHealth = Math.min(
      this.stats.currentHealth + 20,
      this.stats.maxHealth
    );
  }

  upgradeSpeed() {
    this.stats.moveSpeed += 20;
  }

  upgradeDamage() {
    this.stats.attackDamage += 5;
  }

  upgradeAttackSpeed() {
    this.stats.attackSpeed = Math.max(200, this.stats.attackSpeed - 100);
  }

  upgradeRange() {
    this.attackRange += 50;
  }

  getAttackRange(): number {
    return this.attackRange;
  }

  getStats(): PlayerStats {
    return { ...this.stats };
  }

  private die() {
    this.scene.scene.pause();
    this.scene.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000'
    }).setOrigin(0.5).setDepth(1000);
  }
}
