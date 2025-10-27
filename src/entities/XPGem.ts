import Phaser from 'phaser';

export class XPGem extends Phaser.Physics.Arcade.Sprite {
  private xpValue: number;
  private magnetRadius: number = 100;
  private attracted: boolean = false;
  private target: Phaser.Physics.Arcade.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, xpValue: number) {
    super(scene, x, y, 'xpGem');

    this.xpValue = xpValue;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(3);
    this.setData('isXP', true);

    // Add floating animation
    scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(player: Phaser.Physics.Arcade.Sprite) {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );

    if (distance < this.magnetRadius) {
      this.attracted = true;
      this.target = player;
    }

    if (this.attracted && this.target) {
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );

      const speed = 300;
      this.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    }
  }

  getXPValue(): number {
    return this.xpValue;
  }
}
