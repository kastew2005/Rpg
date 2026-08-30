import { CONFIG } from './modules/config.js';
import { Character, NPC } from './modules/character.js';
import { Physics } from './modules/physics.js';
import { Graphics } from './modules/graphics.js';
import { VillageGenerator } from './modules/village.js';
import { UI } from './modules/ui.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Инициализация модулей
        this.physics = new Physics();
        this.graphics = new Graphics(this.ctx);
        this.village = new VillageGenerator();
        this.ui = new UI();
        
        // Игровой мир
        this.world = {
            width: 1200,
            height: 1200
        };
        
        // Камера
        this.camera = {
            x: 0,
            y: 0
        };
        
        // Персонаж
        this.player = new Character(600, 600);
        
        // NPC
        this.npcs = [];
        this.spawnNPCs();
        
        // Состояние игры
        this.keys = {};
        this.joystick = { x: 0, y: 0 };
        this.selectedNPC = null;
        this.dialogueActive = false;
        
        // Тени и эффекты
        this.time = 0;
        this.particles = [];
        
        this.setupControls();
        this.gameLoop();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    spawnNPCs() {
        const villageData = this.village.generate();
        const npcConfigs = [
            { name: 'Мудрец', x: 450, y: 450, dialog: 'Приветствую, путник! Я вижу в тебе великий потенциал.' },
            { name: 'Торговец', x: 550, y: 380, dialog: 'Лучшие товары в деревне! Что желаешь?' },
            { name: 'Фермер', x: 700, y: 500, dialog: 'Урожай в этом году отличный!' },
            { name: 'Кузнец', x: 300, y: 550, dialog: 'Мой молот всегда готов к работе.' },
            { name: 'Староста', x: 480, y: 300, dialog: 'Добро пожаловать в нашу деревню!' }
        ];
        
        npcConfigs.forEach((cfg, i) => {
            const npc = new NPC(cfg.x, cfg.y, cfg.name, cfg.dialog);
            npc.sprite = i % 2 === 0 ? '🏘️' : '👤';
            this.npcs.push(npc);
        });
    }
    
    setupControls() {
        // Джойстик
        const joystick = document.getElementById('joystick');
        const joystickArea = document.getElementById('joystick-area');
        let isDragging = false;
        
        const handleJoystick = (e) => {
            e.preventDefault();
            const rect = joystickArea.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let clientX, clientY;
            if (e.touches) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            const dx = clientX - centerX;
            const dy = clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = rect.width / 2 - 25;
            
            let normalizedX = 0;
            let normalizedY = 0;
            
            if (distance > 0) {
                const clampedDistance = Math.min(distance, maxDistance);
                const ratio = clampedDistance / distance;
                normalizedX = (dx / maxDistance) * ratio;
                normalizedY = (dy / maxDistance) * ratio;
            }
            
            this.joystick.x = Math.max(-1, Math.min(1, normalizedX));
            this.joystick.y = Math.max(-1, Math.min(1, normalizedY));
            
            // Визуальное обновление джойстика
            const joystickX = normalizedX * maxDistance;
            const joystickY = normalizedY * maxDistance;
            joystick.style.transform = `translate(calc(-50% + ${joystickX}px), calc(-50% + ${joystickY}px))`;
        };
        
        const resetJoystick = () => {
            isDragging = false;
            this.joystick.x = 0;
            this.joystick.y = 0;
            joystick.style.transform = 'translate(-50%, -50%)';
        };
        
        joystickArea.addEventListener('touchstart', (e) => {
            isDragging = true;
            handleJoystick(e);
        });
        
        joystickArea.addEventListener('touchmove', handleJoystick);
        joystickArea.addEventListener('touchend', resetJoystick);
        joystickArea.addEventListener('touchcancel', resetJoystick);
        
        // Клики для ПК (для отладки)
        joystickArea.addEventListener('mousedown', (e) => {
            isDragging = true;
            handleJoystick(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) handleJoystick(e);
        });
        
        document.addEventListener('mouseup', resetJoystick);
        
        // Кнопка действия
        document.getElementById('action-btn').addEventListener('click', () => {
            this.handleAction();
        });
        
        // Кнопки взаимодействия
        document.getElementById('talk-btn').addEventListener('click', () => {
            if (this.selectedNPC) {
                this.showDialogue(this.selectedNPC.dialog);
            }
        });
        
        document.getElementById('trade-btn').addEventListener('click', () => {
            if (this.selectedNPC) {
                this.showDialogue(`💰 ${this.selectedNPC.name}: "У меня есть отличные товары!"`);
            }
        });
        
        document.getElementById('dialogue-close').addEventListener('click', () => {
            this.closeDialogue();
        });
    }
    
    handleAction() {
        if (this.dialogueActive) {
            this.closeDialogue();
            return;
        }
        
        // Поиск ближайшего NPC
        let nearest = null;
        let minDist = 100;
        
        for (const npc of this.npcs) {
            const dx = npc.x - this.player.x;
            const dy = npc.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = npc;
            }
        }
        
        if (nearest) {
            this.selectedNPC = nearest;
            document.getElementById('interaction-panel').style.display = 'flex';
            
            // Подсветка NPC
            nearest.isHighlighted = true;
        } else {
            // Анимация атаки
            this.player.attack();
            this.spawnAttackEffect();
        }
    }
    
    spawnAttackEffect() {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                size: 3 + Math.random() * 5,
                color: `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 30}%)`
            });
        }
    }
    
    showDialogue(text) {
        this.dialogueActive = true;
        document.getElementById('dialogue-box').style.display = 'block';
        document.getElementById('dialogue-text').textContent = text;
        document.getElementById('interaction-panel').style.display = 'none';
    }
    
    closeDialogue() {
        this.dialogueActive = false;
        document.getElementById('dialogue-box').style.display = 'none';
        if (this.selectedNPC) {
            this.selectedNPC.isHighlighted = false;
            this.selectedNPC = null;
        }
        document.getElementById('interaction-panel').style.display = 'none';
    }
    
    update() {
        this.time += 0.016;
        
        // Движение игрока
        const speed = CONFIG.playerSpeed;
        let dx = this.joystick.x * speed;
        let dy = this.joystick.y * speed;
        
        // Проверка коллизий с границами мира
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (newX > 20 && newX < this.world.width - 20) {
            this.player.x = newX;
        }
        if (newY > 20 && newY < this.world.height - 20) {
            this.player.y = newY;
        }
        
        // Обновление камеры
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        
        // Обновление NPC
        for (const npc of this.npcs) {
            npc.update();
        }
        
        // Обновление частиц
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.life--;
            return p.life > 0;
        });
        
        // Проверка взаимодействия с NPC
        this.selectedNPC = null;
        for (const npc of this.npcs) {
            const dist = Math.sqrt(
                (npc.x - this.player.x) ** 2 + 
                (npc.y - this.player.y) ** 2
            );
            
            if (dist < 80) {
                npc.isNear = true;
                if (dist < 60) {
                    this.selectedNPC = npc;
                    npc.isHighlighted = true;
                }
            } else {
                npc.isNear = false;
                npc.isHighlighted = false;
            }
        }
        
        // Показ панели взаимодействия
        if (this.selectedNPC && !this.dialogueActive) {
            document.getElementById('interaction-panel').style.display = 'flex';
        } else if (!this.dialogueActive) {
            document.getElementById('interaction-panel').style.display = 'none';
        }
    }
    
    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Очистка
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Фон
        this.graphics.drawBackground(ctx, this.camera);
        
        // Сохранение контекста для трансформации камеры
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Отрисовка деревни
        this.village.render(ctx, this.camera);
        
        // Отрисовка теней
        this.graphics.drawShadows(ctx, this.player, this.npcs, this.camera);
        
        // Отрисовка NPC
        for (const npc of this.npcs) {
            this.graphics.drawNPC(ctx, npc, this.camera);
        }
        
        // Отрисовка игрока
        this.graphics.drawPlayer(ctx, this.player, this.camera);
        
        // Отрисовка частиц
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        
        ctx.restore();
        
        // Визуальные эффекты (блики и т.д.)
        this.graphics.drawVignette(ctx, canvas);
        this.graphics.drawTimeEffects(ctx, canvas, this.time);
        
        // UI отрисовка поверх всего
        this.graphics.drawInteractionHints(ctx, this.selectedNPC, this.camera, canvas);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Запуск игры
new Game();
