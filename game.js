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
        
        this.physics = new Physics();
        this.graphics = new Graphics(this.ctx);
        this.village = new VillageGenerator();
        this.ui = new UI();
        
        this.world = {
            width: 1400,
            height: 1400
        };
        
        this.camera = {
            x: 0,
            y: 0,
            shakeX: 0,
            shakeY: 0,
            shakeIntensity: 0
        };
        
        this.player = new Character(700, 700);
        this.player.name = 'Странник';
        
        this.npcs = [];
        this.spawnNPCs();
        
        this.keys = {};
        this.joystick = { x: 0, y: 0 };
        this.selectedNPC = null;
        this.dialogueActive = false;
        
        this.time = 0;
        this.particles = [];
        this.weather = {
            type: 'clear', // clear, rain, fog
            intensity: 0
        };
        
        this.setupControls();
        this.gameLoop();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    spawnNPCs() {
        const npcData = [
            { 
                name: 'Мудрец Эльдор', 
                x: 550, y: 480, 
                dialog: 'Мудрость древних говорит: "Путь героя начинается с первого шага".',
                title: 'Хранитель знаний',
                portrait: '🧙'
            },
            { 
                name: 'Торговец Роланд', 
                x: 750, y: 420, 
                dialog: 'Лучшие товары во всем королевстве! Только сегодня особые цены!',
                title: 'Купец',
                portrait: '🧳'
            },
            { 
                name: 'Фермер Генри', 
                x: 850, y: 580, 
                dialog: 'Урожай в этом году благословили боги! Пшеница выше головы!',
                title: 'Земледелец',
                portrait: '🌾'
            },
            { 
                name: 'Кузнец Торн', 
                x: 400, y: 580, 
                dialog: 'Мой молот звенит, кузня горит - любой меч скую!',
                title: 'Мастер-кузнец',
                portrait: '🔨'
            },
            { 
                name: 'Староста Альдрик', 
                x: 600, y: 350, 
                dialog: 'Добро пожаловать в нашу деревню, путник. Чувствуй себя как дома.',
                title: 'Староста',
                portrait: '👑'
            },
            { 
                name: 'Трактирщица Марта', 
                x: 500, y: 650, 
                dialog: 'Лучший эль в округе! И горячий ужин для уставших путников.',
                title: 'Хозяйка трактира',
                portrait: '🍺'
            }
        ];
        
        npcData.forEach((data) => {
            const npc = new NPC(data.x, data.y, data.name, data.dialog);
            npc.title = data.title;
            npc.portrait = data.portrait;
            this.npcs.push(npc);
        });
    }
    
    setupControls() {
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
        
        joystickArea.addEventListener('mousedown', (e) => {
            isDragging = true;
            handleJoystick(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) handleJoystick(e);
        });
        
        document.addEventListener('mouseup', resetJoystick);
        
        document.getElementById('action-btn').addEventListener('click', () => {
            this.handleAction();
        });
        
        document.getElementById('talk-btn').addEventListener('click', () => {
            if (this.selectedNPC) {
                this.showDialogue(this.selectedNPC.dialog, this.selectedNPC.name, this.selectedNPC.portrait);
            }
        });
        
        document.getElementById('trade-btn').addEventListener('click', () => {
            if (this.selectedNPC) {
                this.showDialogue(
                    `"Добро пожаловать в мою лавку! Вот что я могу предложить:\n🪙 Золотая монета - 1 шт.\n⚔️ Стальной меч - 50 монет\n🛡️ Деревянный щит - 30 монет"`,
                    this.selectedNPC.name,
                    this.selectedNPC.portrait
                );
            }
        });
        
        document.getElementById('quest-btn').addEventListener('click', () => {
            if (this.selectedNPC) {
                const quests = [
                    'Принеси мне 10 шкур волков! Награда: 100 монет.',
                    'Найди древний артефакт в старой башне к северу отсюда.',
                    'Помоги фермеру собрать урожай - получишь 50 монет.',
                    'Очисти подвал от крыс - награда: 30 монет и зелье здоровья.'
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
    }
    
    handleAction() {
        if (this.dialogueActive) {
            this.closeDialogue();
            return;
        }
        
        let nearest = null;
        let minDist = 120;
        
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
            nearest.isHighlighted = true;
            
            this.camera.shakeIntensity = 3;
        } else {
            this.player.attack();
            this.spawnAttackEffect();
            this.camera.shakeIntensity = 5;
        }
    }
    
    spawnAttackEffect() {
        const colors = ['#ff6b35', '#ffd700', '#ff4444', '#ffaa00'];
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 25 + Math.random() * 25,
                maxLife: 50,
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                type: 'spark'
            });
        }
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
        
        // Тряска камеры
        if (this.camera.shakeIntensity > 0) {
            this.camera.shakeX = (Math.random() - 0.5) * this.camera.shakeIntensity * 2;
            this.camera.shakeY = (Math.random() - 0.5) * this.camera.shakeIntensity * 2;
            this.camera.shakeIntensity *= 0.92;
            if (this.camera.shakeIntensity < 0.1) {
                this.camera.shakeIntensity = 0;
                this.camera.shakeX = 0;
                this.camera.shakeY = 0;
            }
        }
        
        const speed = CONFIG.playerSpeed * (1 + this.player.level * 0.05);
        let dx = this.joystick.x * speed;
        let dy = this.joystick.y * speed;
        
        // Обновление направления персонажа
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            this.player.isMoving = true;
            this.player.direction = Math.atan2(dy, dx);
        } else {
            this.player.isMoving = false;
        }
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (newX > 30 && newX < this.world.width - 30) {
            this.player.x = newX;
        }
        if (newY > 30 && newY < this.world.height - 30) {
            this.player.y = newY;
        }
        
        this.camera.x = this.player.x - this.canvas.width / 2 + this.camera.shakeX;
        this.camera.y = this.player.y - this.canvas.height / 2 + this.camera.shakeY;
        
        for (const npc of this.npcs) {
            npc.update(this.time);
        }
        
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.vx *= 0.98;
            p.life--;
            return p.life > 0;
        });
        
        // Погода
        this.weather.intensity = 0.3 + Math.sin(this.time * 0.01) * 0.2;
        
        // Взаимодействие с NPC
        this.selectedNPC = null;
        for (const npc of this.npcs) {
            const dist = Math.sqrt(
                (npc.x - this.player.x) ** 2 + 
                (npc.y - this.player.y) ** 2
            );
            
            if (dist < 100) {
                npc.isNear = true;
                if (dist < 70) {
                    this.selectedNPC = npc;
                    npc.isHighlighted = true;
                }
            } else {
                npc.isNear = false;
                npc.isHighlighted = false;
            }
        }
        
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
        
        this.graphics.drawBackground(ctx, this.camera, this.time);
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        this.village.render(ctx, this.camera, this.time);
        
        this.graphics.drawShadows(ctx, this.player, this.npcs, this.camera);
        
        for (const npc of this.npcs) {
            this.graphics.drawNPC(ctx, npc, this.camera, this.time);
        }
        
        this.graphics.drawPlayer(ctx, this.player, this.camera, this.time);
        
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            
            if (p.type === 'spark') {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 20;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha * 0.8, 0, Math.PI * 2);
                ctx.fill();
                
                // Хвост частицы
                ctx.shadowBlur = 10;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha * 0.3;
                ctx.beginPath();
                ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.size * alpha * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        ctx.globalAlpha = 1;
        
        ctx.restore();
        
        this.graphics.drawVignette(ctx, canvas);
        this.graphics.drawWeather(ctx, canvas, this.weather, this.time);
        this.graphics.drawCompass(ctx, canvas, this.player);
        this.graphics.drawInteractionHints(ctx, this.selectedNPC, this.camera, canvas);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

new Game();