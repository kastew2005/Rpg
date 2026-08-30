import { CONFIG } from './config.js';

export class Graphics {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    drawBackground(ctx, camera, time) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Небо с градиентом
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        const hour = (Math.sin(time * 0.005) + 1) * 12;
        const isDay = hour > 6 && hour < 18;
        
        if (isDay) {
            skyGrad.addColorStop(0, '#87CEEB');
            skyGrad.addColorStop(0.4, '#B5D8E8');
            skyGrad.addColorStop(1, '#6B8E6B');
        } else {
            skyGrad.addColorStop(0, '#0a0a1a');
            skyGrad.addColorStop(0.4, '#1a1a2e');
            skyGrad.addColorStop(1, '#1a2a1a');
        }
        
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);
        
        // Солнце или луна
        const celestialY = isDay ? 80 : 80;
        const celestialX = w * 0.8;
        
        if (isDay) {
            const grad = ctx.createRadialGradient(celestialX, celestialY, 10, celestialX, celestialY, 80);
            grad.addColorStop(0, 'rgba(255, 230, 150, 1)');
            grad.addColorStop(0.3, 'rgba(255, 200, 50, 0.8)');
            grad.addColorStop(1, 'rgba(255, 200, 50, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(celestialX, celestialY, 80, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFE88A';
            ctx.shadowColor = '#FFE88A';
            ctx.shadowBlur = 40;
            ctx.beginPath();
            ctx.arc(celestialX, celestialY, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#E8E8D0';
            ctx.shadowColor = '#E8E8D0';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(celestialX, celestialY, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Облака
        if (isDay) {
            for (let i = 0; i < 5; i++) {
                const cx = ((i * 200 + time * 10) % (w + 200)) - 100;
                const cy = 50 + i * 15 + Math.sin(i * 2 + time * 0.5) * 10;
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.beginPath();
                ctx.ellipse(cx, cy, 80 + i * 20, 20 + i * 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(cx - 40, cy + 5, 50 + i * 10, 18 + i * 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(cx + 40, cy + 3, 45 + i * 12, 16 + i * 4, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Дальний план - холмы
        ctx.fillStyle = isDay ? 'rgba(60, 90, 50, 0.3)' : 'rgba(20, 30, 20, 0.4)';
        for (let i = 0; i < 4; i++) {
            const hx = (i * 400 - camera.x * 0.1) % (w + 400) - 200;
            const hy = h - 100 + i * 30 - Math.sin(i * 1.5) * 20;
            ctx.beginPath();
            ctx.ellipse(hx, hy, 300 + i * 50, 60 + i * 20, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawShadows(ctx, player, npcs, camera) {
        const all = [{ x: player.x, y: player.y + 28, r: 25, alpha: 0.3 }];
        for (const npc of npcs) {
            all.push({ x: npc.x, y: npc.y + 25, r: 20, alpha: 0.25 });
        }
        
        for (const s of all) {
            const sx = s.x - camera.x;
            const sy = s.y - camera.y;
            
            const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r);
            grad.addColorStop(0, `rgba(0,0,0,${s.alpha})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(sx, sy, s.r, s.r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawPlayer(ctx, player, camera, time) {
        const x = player.x - camera.x;
        const y = player.y - camera.y;
        
        // Свечение
        const glow = ctx.createRadialGradient(x, y, 5, x, y, 60);
        glow.addColorStop(0, 'rgba(255,215,0,0.08)');
        glow.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.fill();
        
        // Тело персонажа - средневековый воин
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 15;
        
        // Плащ
        ctx.fillStyle = '#2a1a0a';
        ctx.beginPath();
        ctx.moveTo(x - 18, y + 5);
        ctx.quadraticCurveTo(x - 25, y + 25, x - 15, y + 35);
        ctx.quadraticCurveTo(x, y + 38, x + 15, y + 35);
        ctx.quadraticCurveTo(x + 25, y + 25, x + 18, y + 5);
        ctx.fill();
        
        // Доспех
        const armorGrad = ctx.createLinearGradient(x - 18, y - 15, x + 18, y + 15);
        armorGrad.addColorStop(0, '#7a8a8a');
        armorGrad.addColorStop(0.3, '#9aaa9a');
        armorGrad.addColorStop(0.7, '#7a8a7a');
        armorGrad.addColorStop(1, '#5a6a5a');
        
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.moveTo(x - 18, y + 5);
        ctx.quadraticCurveTo(x - 22, y - 8, x - 16, y - 18);
        ctx.quadraticCurveTo(x, y - 22, x + 16, y - 18);
        ctx.quadraticCurveTo(x + 22, y - 8, x + 18, y + 5);
        ctx.closePath();
        ctx.fill();
        
        // Голова
        const headGrad = ctx.createRadialGradient(x - 4, y - 22, 3, x, y - 16, 14);
        headGrad.addColorStop(0, '#e8c8a0');
        headGrad.addColorStop(1, '#c8a880');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(x, y - 16, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // Шлем
        ctx.fillStyle = '#6a7a7a';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(x, y - 18, 15, Math.PI, 0);
        ctx.fill();
        
        // Гребень шлема
        ctx.fillStyle = '#4a5a5a';
        ctx.fillRect(x - 2, y - 32, 4, 12);
        ctx.fillRect(x - 6, y - 30, 2, 8);
        ctx.fillRect(x + 4, y - 30, 2, 8);
        
        // Глаза
        ctx.fillStyle = '#1a1a2a';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x - 5, y - 18, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5, y - 18, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Брови (суровый взгляд)
        ctx.strokeStyle = '#2a1a0a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 22);
        ctx.lineTo(x - 3, y - 21);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, y - 22);
        ctx.lineTo(x + 3, y - 21);
        ctx.stroke();
        
        // Меч (всегда при себе)
        ctx.fillStyle = '#c0c0c0';
        ctx.shadowColor = '#c0c0c0';
        ctx.shadowBlur = 8;
        ctx.fillRect(x + 20, y - 15, 3, 25);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 19, y - 16, 5, 4);
        ctx.shadowBlur = 0;
        
        ctx.shadowBlur = 0;
        
        // Анимация атаки
        if (player.isAttacking) {
            const progress = 1 - player.attackTimer / 25;
            const angle = progress * Math.PI * 1.2 - 0.6;
            
            ctx.save();
            ctx.translate(x + 20, y);
            ctx.rotate(angle);
            
            ctx.strokeStyle = 'rgba(255,215,0,0.6)';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'rgba(255,215,0,0.4)';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(30 + Math.sin(progress * 10) * 3, -5);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }
    
    drawNPC(ctx, npc, camera, time) {
        const x = npc.x - camera.x;
        const y = npc.y - camera.y + npc.floatOffset;
        
        // Подсветка
        if (npc.isHighlighted) {
            ctx.shadowColor = 'rgba(255,215,0,0.3)';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = 'rgba(255,215,0,0.2)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(x, y, 32, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
        }
        
        // Имя и титул
        ctx.textAlign = 'center';
        ctx.font = 'bold 13px "MedievalSharp", cursive';
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillText(npc.name, x + 1, y - 32 + 1);
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(npc.name, x, y - 32);
        
        ctx.font = '10px "MedievalSharp", cursive';
        ctx.fillStyle = 'rgba(180, 160, 140, 0.7)';
        ctx.shadowBlur = 0;
        ctx.fillText(npc.title || 'Житель', x, y - 20);
        ctx.shadowBlur = 0;
        
        // Тело NPC
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 10;
        
        // Одежда
        const clothColors = ['#5a3a2a', '#4a2a1a', '#6a4a3a', '#3a2a1a', '#4a3a2a'];
        const color = clothColors[Math.floor(Math.random() * clothColors.length)];
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 16, y + 2);
        ctx.quadraticCurveTo(x - 20, y + 10, x - 18, y + 25);
        ctx.quadraticCurveTo(x, y + 30, x + 18, y + 25);
        ctx.quadraticCurveTo(x + 20, y + 10, x + 16, y + 2);
        ctx.closePath();
        ctx.fill();
        
        // Пояс
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(x - 16, y + 12, 32, 4);
        
        // Голова
        const headGrad = ctx.createRadialGradient(x - 3, y - 12, 3, x, y - 8, 13);
        headGrad.addColorStop(0, '#e8d0b8');
        headGrad.addColorStop(1, '#c8b098');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(x, y - 8, 13, 0, Math.PI * 2);
        ctx.fill();
        
        // Волосы
        ctx.fillStyle = '#3a2a1a';
        ctx.beginPath();
        ctx.arc(x, y - 13, 13, 0.2, Math.PI - 0.2);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#1a1a2a';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x - 4, y - 9, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 4, y - 9, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Портрет (эмодзи)
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(npc.portrait || '👤', x, y + 2);
        
        // Индикатор близости
        if (npc.isNear) {
            ctx.fillStyle = 'rgba(255,215,0,0.06)';
            ctx.beginPath();
            ctx.arc(x, y, 45, 0, Math.PI * 2);
            ctx.fill();
            
            // Иконка диалога
            ctx.font = '16px sans-serif';
            ctx.fillText('💬', x + 30, y - 25);
        }
        
        ctx.shadowBlur = 0;
    }
    
    drawInteractionHints(ctx, selectedNPC, camera, canvas) {
        if (selectedNPC) {
            const x = selectedNPC.x - camera.x;
            const y = selectedNPC.y - camera.y - 55;
            
            if (x > -50 && x < canvas.width + 50 && y > -50 && y < canvas.height + 50) {
                ctx.fillStyle = 'rgba(20, 12, 8, 0.8)';
                ctx.roundRect(x - 35, y - 8, 70, 22, 6);
                ctx.fill();
                ctx.strokeStyle = 'rgba(139, 115, 85, 0.4)';
                ctx.lineWidth = 1;
                ctx.roundRect(x - 35, y - 8, 70, 22, 6);
                ctx.stroke();
                
                ctx.fillStyle = '#ffd700';
                ctx.font = '12px "MedievalSharp", cursive';
                ctx.textAlign = 'center';
                ctx.fillText('⚔ Нажми для беседы', x, y + 8);
            }
        }
    }
    
    drawVignette(ctx, canvas) {
        const grad = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2,
            canvas.height * 0.4,
            canvas.width / 2, canvas.height / 2,
            canvas.height * 0.85
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        grad.addColorStop(1, 'rgba(0,0,0,0.5)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    drawWeather(ctx, canvas, weather, time) {
        if (weather.type === 'rain') {
            const intensity = weather.intensity;
            for (let i = 0; i < 80 * intensity; i++) {
                const x = (Math.sin(i * 137.5 + time * 0.5) * 0.5 + 0.5) * canvas.width;
                const y = (Math.cos(i * 97.3 + time * 1.2) * 0.5 + 0.5) * canvas.height;
                const length = 15 + Math.sin(time + i) * 5;
                
                ctx.strokeStyle = `rgba(150, 180, 220, ${0.1 + intensity * 0.15})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - 5, y + length);
                ctx.stroke();
            }
        }
    }
    
    drawCompass(ctx, canvas, player) {
        const cx = canvas.width - 60;
        const cy = 80;
        
        ctx.fillStyle = 'rgba(20, 12, 8, 0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.stroke();
        
        const angle = player.direction || 0;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        
        // Стрелка
        ctx.fillStyle = '#cc3333';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-5, 5);
        ctx.lineTo(0, -2);
        ctx.lineTo(5, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#d4b896';
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(-4, -5);
        ctx.lineTo(0, 2);
        ctx.lineTo(4, -5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Направления
        ctx.fillStyle = 'rgba(180, 160, 140, 0.5)';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('N', cx, cy - 28);
        ctx.fillText('S', cx, cy + 33);
        ctx.fillText('E', cx + 30, cy + 3);
        ctx.fillText('W', cx - 30, cy + 3);
    }
}

// Polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (r > w / 2) r = w / 2;
        if (r > h / 2) r = h / 2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}