export class Character {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 2.8;
        this.direction = 0;
        this.isMoving = false;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.gold = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.name = 'Странник';
        this.equipment = {
            weapon: 'Меч',
            shield: 'Щит',
            helmet: 'Шлем'
        };
    }
    
    attack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = 25;
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
    
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        return this.health === 0;
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}

export class NPC {
    constructor(x, y, name, dialog) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.dialog = dialog;
        this.title = 'Житель';
        this.portrait = '👤';
        this.radius = 18;
        this.isNear = false;
        this.isHighlighted = false;
        this.floatOffset = 0;
        this.floatSpeed = 0.015 + Math.random() * 0.015;
        this.phase = Math.random() * Math.PI * 2;
        this.walkTimer = 0;
        this.walkTarget = { x: x, y: y };
        this.isWalking = false;
        this.walkRadius = 40 + Math.random() * 40;
    }
    
    update(time) {
        this.phase += this.floatSpeed;
        this.floatOffset = Math.sin(this.phase) * 2;
        
        // Иногда ходит
        if (!this.isNear) {
            this.walkTimer += 0.01;
            if (this.walkTimer > 3 + Math.random() * 2) {
                this.walkTimer = 0;
                const angle = Math.random() * Math.PI * 2;
                this.walkTarget.x = this.x + Math.cos(angle) * this.walkRadius;
                this.walkTarget.y = this.y + Math.sin(angle) * this.walkRadius;
                this.isWalking = true;
            }
            
            if (this.isWalking) {
                const dx = this.walkTarget.x - this.x;
                const dy = this.walkTarget.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 2) {
                    this.x += (dx / dist) * 0.3;
                    this.y += (dy / dist) * 0.3;
                } else {
                    this.isWalking = false;
                }
            }
        }
    }
}