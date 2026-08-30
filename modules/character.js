export class Character {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.speed = 3;
        this.direction = 0; // 0-вниз, 1-влево, 2-вправо, 3-вверх
        this.isMoving = false;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.gold = 100;
        this.health = 100;
        this.maxHealth = 100;
    }
    
    attack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = 20;
        }
    }
    
    update() {
        if (this.attackTimer > 0) {
            this.attackTimer--;
            if (this.attackTimer === 0) {
                this.isAttacking = false;
            }
        }
    }
}

export class NPC {
    constructor(x, y, name, dialog) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.dialog = dialog;
        this.radius = 18;
        this.sprite = '👤';
        this.isNear = false;
        this.isHighlighted = false;
        this.floatOffset = 0;
        this.floatSpeed = 0.02 + Math.random() * 0.02;
        this.phase = Math.random() * Math.PI * 2;
    }
    
    update() {
        this.phase += this.floatSpeed;
        this.floatOffset = Math.sin(this.phase) * 3;
    }
}
