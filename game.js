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
        
        // Мини-карта
        this.miniMapCanvas = document.getElementById('miniMapCanvas');
        this.miniMapCtx = this.miniMapCanvas.getContext('2d');
        
        this.physics = new Physics();
        this.graphics = new Graphics(this.ctx);
        this.village = new VillageGenerator();
        this.ui = new UI();
        
        this.world = {
            width: CONFIG.worldWidth,
            height: CONFIG.worldHeight
        };
        
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
        
        this.player = new Character(
            this.world.width / 2,
            this.world.height / 2
        );
        
        this.npcs = [];
        this.spawnNPCs();
        
        this.joystick = { x: 0, y: 0 };
        this.selectedNPC = null;
        this.dialogueActive = false;
        this.isMoving = false;
        
        this.time = 0;
        this.particles = [];
        this.floatingTexts = [];
        
        this.setupControls();
        this.gameLoop();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 300);
        });
    }
    
    resizeCanvas() {
        const container = document.getElementById('game-container');
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Мини-карта
        const mmSize = Math.min(70, window.innerWidth * 0.08);
        this.miniMapCanvas.width = mmSize * 2;
        this.miniMapCanvas.height = mmSize * 2;
        this.miniMapCanvas.style.width = mmSize + 'px';
        this.miniMapCanvas.style.height = mmSize + 'px';
    }
    
    spawnNPCs() {
        const npcData = [
            { name: 'Мудрец Эльдор', x: 550, y: 480, dialog: 'Мудрость древних говорит: "Путь героя начинается с первого шага".', title: 'Хранитель знаний', portrait: '🧙' },
            { name: 'Торговец Роланд', x: 750, y: 420, dialog: 'Лучшие товары во всем королевстве!', title: 'Купец', portrait: '🧳' },
            { name: 'Фермер Генри', x: 850, y: 580, dialog: 'Урожай в этом году благословили боги!', title: 'Земледелец', portrait: '🌾' },
            { name: 'Кузнец Торн', x: 400, y: 580, dialog: 'Мой молот звенит, кузня горит!', title: 'Мастер-кузнец', portrait: '🔨' },
            { name: 'Староста Альдрик', x: 600, y: 350, dialog: 'Добро пожаловать в нашу деревню!', title: 'Староста', portrait: '👑' },
            { name: 'Трактирщица Марта', x: 500, y: 650, dialog: 'Лучший эль в округе!', title: 'Хозяйка трактира', portrait: '🍺' }
        ];
        
        npcData.forEach((data) => {
            const npc = new NPC(data.x, data.y, data.name, data.dialog);
            npc.title = data.title;
            npc.portrait = data.portrait;
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
            const maxDistance = rect.width / 2 - 20;
            
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
            
            const joystickX = normalizedX * maxDistance;
            const joystickY = normalizedY * maxDistance;
            joystick.style.transform = `translate(calc(-50% + ${joystickX}px), calc(-50% + ${joystickY}px))`;
            
            this.isMoving = distance > 10;
        };
        
        const resetJoystick = () => {
            isDragging = false;
            this.joystick.x = 0;
            this.joystick.y = 0;
            this.isMoving = false;
            joystick.style.transform = 'translate(-50%, -50%)';
        };
        
        // Touch события
        joystickArea.addEventListener('touchstart', (e) => {
            isDragging = true;
            handleJoystick(e);
        });
        
        joystickArea.addEventListener('touchmove', handleJoystick);
        joystickArea.addEventListener('touchend', resetJoystick);
        joystickArea.addEventListener('touchcancel', resetJoystick);
        
        // Mouse события (для десктопа)
        joystickArea.addEventListener('mousedown', (e) => {
            isDragging = true;
            handleJoystick(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) handleJoystick(e);
        });
        
        document.addEventListener('mouseup', resetJoystick);
        
        // Кнопка действия (атака)
        document.getElementById('action-btn').addEventListener('click', () => {
            this.handleAction();
        });
        
        // Кнопка взаимодействия
        document.getElementById('interact-btn').addEventListener('click', () => {
            this.handleInteract();
        });
        
        // Кнопки диалога
        document.getElementById('talk-btn').addEventListener('click', () => {
            if (this.selectedNPC) {
                this.showDialogue(this.selectedNPC.dialog, this.selectedNPC.name, this.selectedNPC.portrait);
            }
        });
        
        document.getElementById('trade-btn').addEventListener('click', () => {
            if (this.selectedNPC) {
                this.showDialogue(
                    `"Добро пожаловать в мою лавку!\n🪙 Золотая монета\n⚔️ Стальной меч - 50 монет\n🛡️ Деревянный щит - 30 монет"`,
                    this.selectedNPC.name,
                    this.selectedNPC.portrait
                );
            }
        });
        
        document.getElementById('quest-btn').addEventListener('click', () => {
            if (this.selectedNPC) {
                const quests = [
                    'Принеси мне 10 шкур волков! Награда: 100 монет.',
                    'Найди древний артефакт в старой башне.',
                    'Помоги фермеру собрать урожай.',
                    'Очисти подвал от крыс.'
                ];
                const quest = quests[Math.floor(Math.random() * quests.length)];
                this.showDialogue(
                    `"${quest}"\n\n📜 Возьмешься за задание?`,
                    this.selectedNPC.name,
                    this.selectedNPC.portrait
                );
            }
        });
        
        document.getElementById('dialogue-close').addEventListener('click', () => {
            this.closeDialogue();
        });
        
        // Сенсорное управление для всей игры (перетаскивание для камеры)
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Два пальца - зуминг
                this.lastPinchDistance = this.getPinchDistance(e);
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const distance = this.getPinchDistance(e);
                const delta = distance - this.lastPinchDistance;
                this.camera.zoom = Math.max(0.5, Math.min(2, this.camera.zoom + delta * 0.01));
                this.lastPinchDistance = distance;
            }
        });
    }
    
    getPinchDistance(e) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    handleAction() {
        if (this.dialogueActive) {
            this.closeDialogue();
            return;
        }
        
        // Атака
        this.player.attack();
        this.spawnAttackEffect();
        this.camera.shakeIntensity = 4;
        
        // Проверка попадания по NPC
        for (const npc of this.npcs) {
            const dist = this.physics.distance(this.player.x, this.player.y, npc.x, npc.y);
            if (dist < 80) {
                this.spawnFloatingText(npc.x, npc.y - 30, '💥', '#ff4444');
                npc.takeDamage(10);
                if (npc.health <= 0) {
                    this.spawnFloatingText(npc.x, npc.y - 50, '💀 Побежден!', '#ffd700');
                    // Воскрешаем через некоторое время
                    setTimeout(() => npc.respawn(), 5000);
                }
            }
        }
    }
    
    handleInteract() {
        if (this.dialogueActive) {
            this.closeDialogue();
            return;
        }
        
        // Поиск ближайшего NPC
        let nearest = null;
        let minDist = 100;
        
        for (const npc of this.npcs) {
            const dist = this.physics.distance(this.player.x, this.player.y, npc.x, npc.y);
            if (dist < minDist && npc.health > 0) {
                minDist = dist;
                nearest = npc;
            }
        }
        
        if (nearest) {
            this.selectedNPC = nearest;
            document.getElementById('interaction-panel').style.display = 'flex';
            nearest.isHighlighted = true;
            this.spawnFloatingText(nearest.x, nearest.y - 40, '👆', '#8bc34a');
        }
    }
    
    spawnAttackEffect() {
        const colors = ['#ff6b35', '#ffd700', '#ff4444', '#ffaa00'];
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 20 + Math.random() * 20,
                maxLife: 40,
                size: 3 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                type: 'spark'
            });
        }
    }
    
    spawnFloatingText(x, y, text, color) {
        this.floatingTexts.push({
            x, y,
            text,
            color: color || '#ffffff',
            life: 60,
            maxLife: 60,
            vy: -1.5
        });
    }
    
    showDialogue(text, name, portrait) {
        this.dialogueActive = true;
        document.getElementById('dialogue-box').style.display = 'flex';
        document.getElementById('dialogue-text').textContent = text;
        document.getElementById('dialogue-name').textContent = name || 'Незнакомец';
        document.getElementById('dialogue-portrait').textContent = portrait || '👤';
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
        const speed = CONFIG.playerSpeed * this.camera.zoom;
        let dx = this.joystick.x * speed;
        let dy = this.joystick.y * speed;
        
        if (this.isMoving) {
            this.player.direction = Math.atan2(dy, dx);
        }
        
        this.player.isMoving = this.isMoving;
        
        // Применение движения с коллизиями
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // Границы мира
        const margin = 30;
        if (newX > margin && newX < this.world.width - margin) {
            this.player.x = newX;
        }
        if (newY > margin && newY < this.world.height - margin) {
            this.player.y = newY;
        }
        
        // Камера следует за игроком
        this.camera.x = this.player.x - this.canvas.width / (2 * this.camera.zoom);
        this.camera.y = this.player.y - this.canvas.height / (2 * this.camera.zoom);
        
        // Обновление NPC
        for (const npc of this.npcs) {
            npc.update(this.time);
        }
        
        // Обновление частиц
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.vx *= 0.98;
            p.life--;
            return p.life > 0;
        });
        
        // Обновление плавающих текстов
        this.floatingTexts = this.floatingTexts.filter(ft => {
            ft.y += ft.vy;
            ft.life--;
            return ft.life > 0;
        });
        
        // Проверка взаимодействия
        this.selectedNPC = null;
        for (const npc of this.npcs) {
            if (npc.health <= 0) continue;
            const dist = this.physics.distance(this.player.x, this.player.y, npc.x, npc.y);
            
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
        
        // UI обновление
        this.ui.updateHealth(this.player.health, this.player.maxHealth);
        this.ui.updateGold(this.player.gold);
        this.ui.updateLevel(this.player.level, this.player.exp, this.player.expToNext);
        
        if (this.selectedNPC && !this.dialogueActive) {
            document.getElementById('interaction-panel').style.display = 'flex';
        } else if (!this.dialogueActive) {
            document.getElementById('interaction-panel').style.display = 'none';
        }
        
        this.player.update();
    }
    
    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Фон
        this.graphics.drawBackground(ctx, this.camera, this.time);
        
        // Сохраняем для трансформации камеры
        ctx.save();
        ctx.translate(-this.camera.x * this.camera.zoom, -this.camera.y * this.camera.zoom);
        ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // Рендеринг деревни
        this.village.render(ctx, this.camera, this.time);
        
        // Тени
        this.graphics.drawShadows(ctx, this.player, this.npcs, this.camera);
        
        // NPC
        for (const npc of this.npcs) {
            this.graphics.drawNPC(ctx, npc, this.camera, this.time);
        }
        
        // Игрок
        this.graphics.drawPlayer(ctx, this.player, this.camera, this.time);
        
        // Частицы
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        
        // Плавающие тексты
        for (const ft of this.floatingTexts) {
            const alpha = ft.life / ft.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 18px "MedievalSharp", cursive';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        
        ctx.restore();
        
        // Виньетка
        this.graphics.drawVignette(ctx, canvas);
        
        // Мини-карта
        this.renderMiniMap();
    }
    
    renderMiniMap() {
        const ctx = this.miniMapCtx;
        const w = this.miniMapCanvas.width;
        const h = this.miniMapCanvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Фон
        ctx.fillStyle = 'rgba(20, 12, 8, 0.8)';
        ctx.fillRect(0, 0, w, h);
        
        // Здания
        ctx.fillStyle = '#5a3d2e';
        for (const building of this.village.buildings) {
            const bx = (building.x / this.world.width) * w;
            const by = (building.y / this.world.height) * h;
            const bw = (building.width / this.world.width) * w;
            const bh = (building.height / this.world.height) * h;
            ctx.fillRect(bx, by, Math.max(2, bw), Math.max(2, bh));
        }
        
        // NPC
        ctx.fillStyle = '#8bc34a';
        for (const npc of this.npcs) {
            if (npc.health <= 0) continue;
            const nx = (npc.x / this.world.width) * w;
            const ny = (npc.y / this.world.height) * h;
            ctx.beginPath();
            ctx.arc(nx, ny, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Игрок
        ctx.fillStyle = '#ffd700';
        const px = (this.player.x / this.world.width) * w;
        const py = (this.player.y / this.world.height) * h;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Рамка
        ctx.strokeStyle = 'rgba(90, 61, 46, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

new Game();