import Phaser from 'phaser';

export type UpgradeType = 'speed' | 'damage' | 'attackSpeed';

export interface UpgradeOption {
  type: UpgradeType;
  name: string;
  description: string;
  icon: string;
}

export class UpgradeUI {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private onUpgradeSelected: (type: UpgradeType) => void;
  private isVisible: boolean = false;

  private upgradeOptions: UpgradeOption[] = [
    {
      type: 'speed',
      name: 'Velocidade de Movimento',
      description: '+20 velocidade',
      icon: '⚡'
    },
    {
      type: 'damage',
      name: 'Dano de Ataque',
      description: '+5 dano',
      icon: '⚔️'
    },
    {
      type: 'attackSpeed',
      name: 'Velocidade de Ataque',
      description: '-100ms entre ataques',
      icon: '🔥'
    }
  ];

  constructor(scene: Phaser.Scene, onUpgradeSelected: (type: UpgradeType) => void) {
    this.scene = scene;
    this.onUpgradeSelected = onUpgradeSelected;
    this.createUI();
  }

  private createUI() {
    this.container = this.scene.add.container(400, 300);
    this.container.setDepth(1000);
    this.container.setVisible(false);

    // Background overlay
    const overlay = this.scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
    overlay.setOrigin(0.5);
    this.container.add(overlay);

    // Title
    const title = this.scene.add.text(0, -200, 'LEVEL UP!', {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.container.add(title);

    const subtitle = this.scene.add.text(0, -150, 'Escolha um upgrade:', {
      fontSize: '24px',
      color: '#ffffff'
    });
    subtitle.setOrigin(0.5);
    this.container.add(subtitle);
  }

  show() {
    if (this.isVisible) return;

    this.isVisible = true;
    this.scene.physics.pause();
    this.container.setVisible(true);

    // Clear previous options
    this.container.list.forEach((obj, index) => {
      if (index > 2) { // Keep overlay, title, and subtitle
        obj.destroy();
      }
    });

    // Randomly select 3 upgrade options
    const shuffled = [...this.upgradeOptions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    // Create upgrade cards
    selected.forEach((upgrade, index) => {
      this.createUpgradeCard(upgrade, index - 1);
    });
  }

  private createUpgradeCard(upgrade: UpgradeOption, position: number) {
    const x = position * 220;
    const y = 0;

    // Card background
    const card = this.scene.add.rectangle(x, y, 200, 250, 0x2c3e50);
    card.setStrokeStyle(3, 0x3498db);
    card.setInteractive({ useHandCursor: true });

    // Icon
    const icon = this.scene.add.text(x, y - 60, upgrade.icon, {
      fontSize: '64px'
    });
    icon.setOrigin(0.5);

    // Name
    const name = this.scene.add.text(x, y + 20, upgrade.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 180 }
    });
    name.setOrigin(0.5);

    // Description
    const desc = this.scene.add.text(x, y + 70, upgrade.description, {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center'
    });
    desc.setOrigin(0.5);

    // Hover effects
    card.on('pointerover', () => {
      card.setFillStyle(0x34495e);
      card.setStrokeStyle(3, 0x52b8ff);
    });

    card.on('pointerout', () => {
      card.setFillStyle(0x2c3e50);
      card.setStrokeStyle(3, 0x3498db);
    });

    card.on('pointerdown', () => {
      this.selectUpgrade(upgrade.type);
    });

    this.container.add([card, icon, name, desc]);
  }

  private selectUpgrade(type: UpgradeType) {
    this.hide();
    this.onUpgradeSelected(type);
  }

  hide() {
    this.isVisible = false;
    this.container.setVisible(false);
    this.scene.physics.resume();
  }

  destroy() {
    this.container.destroy();
  }
}
