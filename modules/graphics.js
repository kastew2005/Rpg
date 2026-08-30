import { CONFIG } from './config.js';

export class Graphics {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    drawBackground(ctx, camera, time) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Небо (вид сверху - просто градиент)
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(0.3, '#B5D8E8');
        grad.addColorStop(0.7, '#6B8E6B');
        grad.addColorStop(1, '#4a7a3a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        
        // Солнце
        const sunX = w * 0.85;
        const sunY = 60;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 100);
        sunGrad.addColorStop(0, 'rgba(255, 230, 150, 0.8)');
        sunGrad.addColorStop(0.3, 'rgba(255, 200, 50, 0.4)');
        sunGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 100, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFE88A';
        ctx.shadowColor = '#FFE88A';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    drawShadows(ctx, player, npcs, camera) {
        const all = [{ x: player.x, y: player.y + 20, r: 18, alpha: 0.2 }];
        for (const npc of npcs) {
            if (npc.isDead) continue;
            all.push({ x: npc.x, y: npc.y + 18, r: 15, alpha: 0.15 });
        }
        
        for (const s of all) {
            const sx = s.x - camera.x * 1;
            const sy = s.y - camera.y * 1;
            
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
        const x = player.x - camera.x * 1;
        const y = player.y - camera.y * 1;
        const r = player.radius;
        
        // Свечение
        const glow = ctx.createRadialGradient(x, y, 5, x, y, 40);
        glow.addColorStop(0, 'rgba(255,215,0,0.1)');
        glow.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Тело (вид сверху - круг)
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        
        const grad = ctx.createRadialGradient(x - 4, y - 4, 3, x, y, r);
        grad.addColorStop(0, '#ffd93d');
        grad.addColorStop(0.5, '#f5a623');
        grad.addColorStop(1, '#c47a1a');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Доспех (кольцо)
        ctx.strokeStyle = '#7a8a8a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Направление (маленькая стрелка)
        if (player.isMoving) {
            const angle = player.direction || 0;
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * r * 1.3, y + Math.sin(angle) * r * 1.3);
            ctx.lineTo(x + Math.cos(angle + 2.3) * r * 0.8, y + Math.sin(angle + 2.3) * r * 0.8);
            ctx.lineTo(x + Math.cos(angle - 2.3) * r * 0.8, y + Math.sin(angle - 2.3) * r * 0.8);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Глаза (вид сверху)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 5, y - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5, y - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#2d1f14';
        ctx.beginPath();
        ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 6, y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Анимация атаки (кольцо)
        if (player.isAttacking) {
            const progress = 1 - player.attackTimer / 20;
            ctx.strokeStyle = `rgba(255,215,0,${0.8 * (1 - progress)})`;
            ctx.lineWidth = 4;
            ctx.shadowColor = 'rgba(255,215,0,0.4)';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(x, y, r * 1.8 * (0.5 + progress * 0.5), 0, Math.PI * 2 * progress);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
    
    drawNPC(ctx, npc, camera, time) {
        if (npc.isDead) {
            // Мертвый NPC - серый с крестиком
            const x = npc.x - camera.x * 1;
            const y = npc.y - camera.y * 1;
            
            ctx.fillStyle = 'rgba(80, 80, 80, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, npc.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 8, y - 8);
            ctx.lineTo(x + 8, y + 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 8, y - 8);
            ctx.lineTo(x - 8, y + 8);
            ctx.stroke();
            return;
        }
        
        const x = npc.x - camera.x * 1;
        const y = npc.y - camera.y * 1 + npc.floatOffset;
        const r = npc.radius;
        
        // Подсветка
        if (npc.isHighlighted) {
            ctx.shadowColor = 'rgba(255,215,0,0.3)';
            ctx.shadowBlur = 25;
            ctx.strokeStyle = 'rgba(255,215,0,0.2)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(x, y, r + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
        }
        
        // Имя
        ctx.textAlign = 'center';
        ctx.font = '11px "MedievalSharp", cursive';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(npc.name, x + 1, y - r - 8 + 1);
        ctx.fillStyle = '#d4b896';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText(npc.name, x, y - r - 8);
        ctx.shadowBlur = 0;
        
        // Тело (вид сверху)
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 8;
        
        const grad = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, r);
        const colors = ['#8bc34a', '#689f38', '#558b2f'];
        const col = colors[Math.floor(Math.random() * colors.length)];
        grad.addColorStop(0, col);
        grad.addColorStop(1, '#33691e');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Портрет (эмодзи поверх)
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(npc.portrait || '👤', x, y + 1);
        
        // Индикатор здоровья
        if (npc.health < npc.maxHealth) {
            const healthPercent = npc.health / npc.maxHealth;
            const barW = r * 1.6;
            const barH = 4;
            const barX = x - barW / 2;
            const barY = y - r - 14;
            
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = healthPercent > 0.5 ? '#4caf50' : '#ff4444';
            ctx.fillRect(barX + 1, barY + 1, (barW - 2) * healthPercent, barH - 2);
        }
        
        // Индикатор близости
        if (npc.isNear) {
            ctx.fillStyle = 'rgba(255,215,0,0.05)';
            ctx.beginPath();
            ctx.arc(x, y, r + 20, 0, Math.PI * 2);
            ctx.fill();
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
        grad.addColorStop(0.5, 'rgba(0,0,0,0.05)');
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}