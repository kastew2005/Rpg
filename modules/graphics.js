import { CONFIG } from './config.js';

export class Graphics {
    constructor(ctx) {
        this.ctx = ctx;
        this.shadowCache = {};
    }
    
    drawBackground(ctx, camera) {
        const gradient = ctx.createRadialGradient(
            camera.x + window.innerWidth / 2, 
            camera.y + window.innerHeight / 2, 
            100,
            camera.x + window.innerWidth / 2, 
            camera.y + window.innerHeight / 2, 
            800
        );
        gradient.addColorStop(0, '#4a8f3f');
        gradient.addColorStop(0.5, '#3d7a33');
        gradient.addColorStop(1, '#1e3d18');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            camera.x - 100, 
            camera.y - 100, 
            window.innerWidth + 200, 
            window.innerHeight + 200
        );
    }
    
    drawShadows(ctx, player, npcs, camera) {
        const shadows = [
            { x: player.x, y: player.y + 25, r: 22 },
            ...npcs.map(n => ({ x: n.x, y: n.y + 25, r: 18 }))
        ];
        
        for (const shadow of shadows) {
            const sx = shadow.x - camera.x;
            const sy = shadow.y - camera.y;
            
            const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, shadow.r);
            gradient.addColorStop(0, 'rgba(0,0,0,0.35)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(sx, sy, shadow.r, shadow.r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawPlayer(ctx, player, camera) {
        const x = player.x - camera.x;
        const y = player.y - camera.y;
        
        // Свечение вокруг игрока
        const glow = ctx.createRadialGradient(x, y, 5, x, y, 50);
        glow.addColorStop(0, 'rgba(255,215,0,0.1)');
        glow.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Тело
        const gradient = ctx.createRadialGradient(x - 8, y - 10, 5, x, y, 25);
        gradient.addColorStop(0, '#ffd93d');
        gradient.addColorStop(0.7, '#f5a623');
        gradient.addColorStop(1, '#c47a1a');
        
        ctx.shadowColor = 'rgba(255,215,0,0.3)';
        ctx.shadowBlur = 20;
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y - 2, 22, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Глаза
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 8, y - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 8, y - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#2d1f14';
        ctx.beginPath();
        ctx.arc(x - 6, y - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 10, y - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Рот (улыбка)
        ctx.strokeStyle = '#2d1f14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + 4, 8, 0.1, Math.PI - 0.1);
        ctx.stroke();
        
        // Анимация атаки
        if (player.isAttacking) {
            ctx.strokeStyle = 'rgba(255,215,0,0.8)';
            ctx.lineWidth = 3;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + player.attackTimer * 0.5;
                const r = 30 + Math.sin(player.attackTimer * 0.5) * 5;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15);
                ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
                ctx.stroke();
            }
        }
    }
    
    drawNPC(ctx, npc, camera) {
        const x = npc.x - camera.x;
        const y = npc.y - camera.y + npc.floatOffset;
        
        // Подсветка при наведении
        if (npc.isHighlighted) {
            ctx.shadowColor = 'rgba(255,215,0,0.5)';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = 'rgba(255,215,0,0.4)';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
        }
        
        // Имя NPC
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, x + 1, y - 30 + 1);
        ctx.fillStyle = '#fff8e7';
        ctx.fillText(npc.name, x, y - 30);
        
        // Тело NPC
        const gradient = ctx.createRadialGradient(x - 5, y - 8, 5, x, y, 20);
        gradient.addColorStop(0, '#8bc34a');
        gradient.addColorStop(0.6, '#689f38');
        gradient.addColorStop(1, '#33691e');
        
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Эмодзи или символ
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(npc.sprite || '👤', x, y + 2);
        
        // Индикатор близости
        if (npc.isNear) {
            ctx.fillStyle = 'rgba(255,215,0,0.15)';
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawInteractionHints(ctx, selectedNPC, camera, canvas) {
        if (selectedNPC) {
            const x = selectedNPC.x - camera.x;
            const y = selectedNPC.y - camera.y - 50;
            
            if (x > -50 && x < canvas.width + 50 && y > -50 && y < canvas.height + 50) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.roundRect(x - 30, y - 10, 60, 22, 8);
                ctx.fill();
                
                ctx.fillStyle = '#ffd700';
                ctx.font = '12px "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('👆 Нажми ⚔️', x, y + 6);
            }
        }
    }
    
    drawVignette(ctx, canvas) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 
            canvas.height * 0.3,
            canvas.width / 2, canvas.height / 2, 
            canvas.height * 0.8
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    drawTimeEffects(ctx, canvas, time) {
        // Мерцание звезд (эффект времени суток)
        const hour = (Math.sin(time * 0.02) + 1) * 12;
        const isNight = hour < 6 || hour > 18;
        
        if (isNight) {
            ctx.fillStyle = 'rgba(0,0,30,0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Звезды
            for (let i = 0; i < 50; i++) {
                const seed = i * 137.5;
                const sx = (Math.sin(seed) * 0.5 + 0.5) * canvas.width;
                const sy = (Math.cos(seed * 0.7) * 0.5 + 0.5) * canvas.height * 0.6;
                const size = 0.5 + Math.sin(time + seed) * 0.5;
                const alpha = 0.3 + Math.sin(time * 0.5 + seed) * 0.3;
                
                ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(sx, sy, size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Polyfill для roundRect если не поддерживается
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
