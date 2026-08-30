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