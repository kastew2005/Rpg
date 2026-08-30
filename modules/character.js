export class Character {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 16;
        this.speed = 2.5;
        this.direction = 0;
        this.isMoving = false;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.gold = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.name = 'Странник';
        this.sprite = '⚔️';
    }
    
    attack() {
        if (this.attackCooldown > 0) return;
        this.isAttacking = true;
        this.attackTimer = 20;
        this.attackCooldown = 15;
    }
    
    update() {
        if (this.attackTimer > 0) {
            this.attackTimer--;
            if (this.attackTimer === 0) {
                this.isAttacking = false;
            }
        }
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }
    
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        return this.health === 0;
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    addExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            this.level++;
            this.expToNext = Math.floor(this.expToNext * 1.5);
            this.maxHealth += 10;
            this.health = this.maxHealth;
        }
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
        this.radius = 16;
        this.health = 50;
        this.maxHealth = 50;
        this.isNear = false;
        this.isHighlighted = false;
        this.floatOffset = 0;
        this.floatSpeed = 0.015 + Math.random() * 0.015;
        this.phase = Math.random() * Math.PI * 2;
        this.walkTimer = 0;
        this.walkTarget = { x: x, y: y };
        this.isWalking = false;
        this.walkRadius = 40 + Math.random() * 40;
        this.direction = 0;
        this.isDead = false;
        this.respawnTimer = 0;
    }
    
    update(time) {
        if (this.isDead) {
            this.respawnTimer--;
            if (this.respawnTimer <= 0) {
                this.isDead = false;
                this.health = this.maxHealth;
            }
            return;
        }
        
        this.phase += this.floatSpeed;
        this.floatOffset = Math.sin(this.phase) * 1.5;
        
        // Случайное хождение
        if (!this.isNear) {
            this.walkTimer += 0.01;
            if (this.walkTimer > 2 + Math.random() * 2) {
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
                    this.x += (dx / dist) * 0.5;
                    this.y += (dy / dist) * 0.5;
                    this.direction = Math.atan2(dy, dx);
                } else {
                    this.isWalking = false;
                }
            }
        }
    }
    
    takeDamage(damage) {
        if (this.isDead) return;
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            this.respawnTimer = 300; // 5 секунд
        }
    }
    
    respawn() {
        this.isDead = false;
        this.health = this.maxHealth;
        this.respawnTimer = 0;
    }
}