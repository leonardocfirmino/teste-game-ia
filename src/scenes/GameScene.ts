import Phaser from 'phaser';
import { AIAgent } from '../ai/AIAgent';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private aiAgent!: Phaser.Physics.Arcade.Sprite;
  private aiController!: AIAgent;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private score: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Create simple colored rectangles as sprites
    this.createPlayerGraphics();
    this.createAIGraphics();
  }

  create() {
    // Add title
    this.add.text(400, 30, 'AI Game Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Add instructions
    this.add.text(400, 70, 'Use Arrow Keys to Move | AI will chase you!', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // Create player
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // Create AI agent
    this.aiAgent = this.physics.add.sprite(100, 100, 'ai');
    this.aiAgent.setCollideWorldBounds(true);

    // Initialize AI controller
    this.aiController = new AIAgent(this.aiAgent, this.player);

    // Setup keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add score text
    this.scoreText = this.add.text(16, 16, 'Time Survived: 0s', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // Add collision detection
    this.physics.add.overlap(this.player, this.aiAgent, this.handleCollision, undefined, this);

    // Start score timer
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score++;
        this.scoreText.setText(`Time Survived: ${this.score}s`);
      },
      loop: true
    });
  }

  update() {
    // Player movement
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // Update AI behavior
    this.aiController.update();
  }

  private createPlayerGraphics() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  private createAIGraphics() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ai', 32, 32);
    graphics.destroy();
  }

  private handleCollision() {
    this.scene.restart();
    this.score = 0;
  }
}
