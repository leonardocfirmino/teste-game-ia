import Phaser from 'phaser';

export class AIAgent {
  private agent: Phaser.Physics.Arcade.Sprite;
  private target: Phaser.Physics.Arcade.Sprite;
  private speed: number = 150;
  private chaseDistance: number = 500;

  constructor(agent: Phaser.Physics.Arcade.Sprite, target: Phaser.Physics.Arcade.Sprite) {
    this.agent = agent;
    this.target = target;
  }

  update() {
    // Calculate distance to target
    const distance = Phaser.Math.Distance.Between(
      this.agent.x,
      this.agent.y,
      this.target.x,
      this.target.y
    );

    // AI Decision Making
    if (distance < this.chaseDistance) {
      this.chaseTarget();
    } else {
      this.wander();
    }
  }

  private chaseTarget() {
    // Simple AI: move towards target
    const angle = Phaser.Math.Angle.Between(
      this.agent.x,
      this.agent.y,
      this.target.x,
      this.target.y
    );

    this.agent.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  private wander() {
    // Random wandering behavior
    if (Math.random() < 0.02) {
      const randomAngle = Math.random() * Math.PI * 2;
      this.agent.setVelocity(
        Math.cos(randomAngle) * (this.speed * 0.5),
        Math.sin(randomAngle) * (this.speed * 0.5)
      );
    }
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  setChaseDistance(distance: number) {
    this.chaseDistance = distance;
  }
}
