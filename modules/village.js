import { CONFIG } from './config.js';

export class VillageGenerator {
    constructor() {
        this.tiles = [];
        this.buildings = [];
        this.trees = [];
        this.paths = [];
        this.decorations = [];
        this.wells = [];
        this.crops = [];
        this.fences = [];
        this.tileSize = CONFIG.tileSize || 32;
        this.generate();
    }
    
    generate() {
        const w = CONFIG.worldWidth;
        const h = CONFIG.worldHeight;
        
        // Генерация тайлов (вид сверху)
        this.tiles = [];
        for (let y = 0; y < h / this.tileSize; y++) {
            for (let x = 0; x < w / this.tileSize; x++) {
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                
                // Базовый тайл - трава
                let type = 'grass';
                let variant = Math.floor(Math.random() * 3);
                
                // Дорожки
                const centerX = 550;
                const centerY = 480;
                const dist = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2);
                
                if (dist < 150) {
                    type = 'path';
                    variant = Math.floor(Math.random() * 2);
                } else if (dist < 200 && Math.random() < 0.3) {
                    type = 'path';
                    variant = Math.floor(Math.random() * 2);
                }
                
                // Вода (озеро)
                if (px > 900 && px < 1050 && py > 700 && py < 850) {
                    type = 'water';
                    variant = Math.floor(Math.random() * 2);
                }
                
                this.tiles.push({ x: px, y: py, type, variant });
            }
        }
        
        // Здания (вид сверху)
        const buildings = [
            { x: 450, y: 400, w: 60, h: 50, color: '#6d4a3a', type: 'house' },
            { x: 650, y: 400, w: 55, h: 45, color: '#5a3a2a', type: 'house' },
            { x: 380, y: 520, w: 50, h: 45, color: '#7a5a4a', type: 'house' },
            { x: 720, y: 520, w: 60, h: 50, color: '#5a3a2a', type: 'house' },
            { x: 500, y: 340, w: 50, h: 40, color: '#6d4a3a', type: 'house' },
            { x: 600, y: 340, w: 55, h: 40, color: '#5a3a2a', type: 'house' },
            { x: 400, y: 600, w: 55, h: 45, color: '#7a5a4a', type: 'house' },
            { x: 700, y: 600, w: 50, h: 45, color: '#6d4a3a', type: 'house' },
            { x: 480, y: 650, w: 65, h: 50, color: '#4a2a1a', type: 'tavern' },
            { x: 350, y: 580, w: 45, h: 40, color: '#4a3a2a', type: 'forge' },
            { x: 550, y: 480, w: 30, h: 30, color: '#5a6a7a', type: 'well' }
        ];
        
        this.buildings = buildings;
        
        // Деревья (вид сверху)
        for (let i = 0; i < 50; i++) {
            let x, y, valid;
            let attempts = 0;
            do {
                x = 40 + Math.random() * (w - 80);
                y = 40 + Math.random() * (h - 80);
                valid = true;
                
                for (const building of this.buildings) {
                    if (x > building.x - 30 && x < building.x + building.w + 30 &&
                        y > building.y - 30 && y < building.y + building.h + 30) {
                        valid = false;
                        break;
                    }
                }
                
                // Не в воде
                if (x > 900 && x < 1050 && y > 700 && y < 850) {
                    valid = false;
                }
                
                attempts++;
            } while (!valid && attempts < 50);
            
            if (valid) {
                this.trees.push({
                    x, y,
                    radius: 8 + Math.random() * 12,
                    type: Math.random() > 0.5 ? 'pine' : 'oak'
                });
            }
        }
        
        // Дорожки (вид сверху)
        const paths = [
            [550, 480, 550, 550],
            [550, 480, 550, 400],
            [550, 480, 650, 480],
            [550, 480, 450, 480],
            [550, 550, 480, 650],
            [550, 400, 450, 400],
            [550, 400, 650, 400],
            [650, 480, 720, 520],
            [450, 480, 380, 520]
        ];
        this.paths = paths;
        
        // Поля
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 200 + Math.random() * 150;
            const cx = 550 + Math.cos(angle) * dist;
            const cy = 480 + Math.sin(angle) * dist;
            
            for (let j = 0; j < 12; j++) {
                this.crops.push({
                    x: cx + (Math.random() - 0.5) * 80,
                    y: cy + (Math.random() - 0.5) * 60,
                    type: Math.random() > 0.5 ? 'wheat' : 'corn'
                });
            }
        }
        
        // Заборы
        for (let i = 0; i < 6; i++) {
            const angle = i / 6 * Math.PI * 2;
            const dist = 200 + Math.random() * 60;
            const cx = 550 + Math.cos(angle) * dist;
            const cy = 480 + Math.sin(angle) * dist;
            
            for (let j = 0; j < 6; j++) {
                const fx = cx + Math.cos(angle + Math.PI / 2) * j * 15;
                const fy = cy + Math.sin(angle + Math.PI / 2) * j * 15;
                this.fences.push({ x: fx, y: fy });
            }
        }
        
        // Декорации
        for (let i = 0; i < 50; i++) {
            const x = 20 + Math.random() * (w - 40);
            const y = 20 + Math.random() * (h - 40);
            let valid = true;
            
            for (const building of this.buildings) {
                if (x > building.x - 10 && x < building.x + building.w + 10 &&
                    y > building.y - 10 && y < building.y + building.h + 10) {
                    valid = false;
                    break;
                }
            }
            
            if (valid && !(x > 900 && x < 1050 && y > 700 && y < 850)) {
                this.decorations.push({
                    x, y,
                    type: Math.random() > 0.6 ? 'flower' : 'stone',
                    color: `hsl(${Math.random() * 60 + 280}, 70%, ${60 + Math.random() * 30}%)`
                });
            }
        }
    }
    
    render(ctx, camera, time) {
        const tileSize = this.tileSize;
        
        // Тайлы
        for (const tile of this.tiles) {
            const x = tile.x - camera.x * 1;
            const y = tile.y - camera.y * 1;
            
            if (x > -tileSize - 10 && x < window.innerWidth + 10 &&
                y > -tileSize - 10 && y < window.innerHeight + 10) {
                
                let color;
                switch (tile.type) {
                    case 'grass':
                        const shades = ['#4a8a3a', '#4a7a3a', '#5a8a4a'];
                        color = shades[tile.variant % shades.length];
                        break;
                    case 'path':
                        const pathShades = ['#9a8a7a', '#8a7a6a'];
                        color = pathShades[tile.variant % pathShades.length];
                        break;
                    case 'water':
                        const waterShades = ['#3a6a8a', '#4a7a9a'];
                        color = waterShades[tile.variant % waterShades.length];
                        break;
                    default:
                        color = '#4a8a3a';
                }
                
                ctx.fillStyle = color;
                ctx.fillRect(x, y, tileSize, tileSize);
                
                // Детали травы
                if (tile.type === 'grass' && tile.variant === 0) {
                    ctx.fillStyle = 'rgba(60, 140, 50, 0.3)';
                    for (let i = 0; i < 3; i++) {
                        const gx = x + 5 + Math.random() * 22;
                        const gy = y + 5 + Math.random() * 22;
                        ctx.beginPath();
                        ctx.arc(gx, gy, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
        
        // Дорожки (поверх тайлов)
        for (const path of this.paths) {
            const [x1, y1, x2, y2] = path;
            const px1 = x1 - camera.x * 1;
            const py1 = y1 - camera.y * 1;
            const px2 = x2 - camera.x * 1;
            const py2 = y2 - camera.y * 1;
            
            ctx.strokeStyle = 'rgba(160, 140, 120, 0.5)';
            ctx.lineWidth = 12;
            ctx.lineCap = 'round';
            ctx.shadowColor = 'rgba(0,0,0,0.05)';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.moveTo(px1, py1);
            ctx.lineTo(px2, py2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Заборы
        for (const fence of this.fences) {
            const x = fence.x - camera.x * 1;
            const y = fence.y - camera.y * 1;
            
            ctx.fillStyle = '#6b5a4a';
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 4;
            ctx.fillRect(x - 1.5, y - 6, 3, 12);
            ctx.fillRect(x - 6, y - 3, 12, 2);
            ctx.fillRect(x - 6, y + 1, 12, 2);
            ctx.shadowBlur = 0;
        }
        
        // Поля
        for (const crop of this.crops) {
            const x = crop.x - camera.x * 1;
            const y = crop.y - camera.y * 1;
            const sway = Math.sin(time * 0.5 + crop.x * 0.01) * 2;
            
            ctx.strokeStyle = crop.type === 'wheat' ? '#c4a030' : '#4a8a3a';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 3; i++) {
                const sx = x + i * 4 - 4 + Math.sin(time + i + crop.x) * 1.5;
                ctx.beginPath();
                ctx.moveTo(sx, y + 4);
                ctx.quadraticCurveTo(sx + sway * 0.5, y - 4, sx + sway, y - 10);
                ctx.stroke();
            }
        }
        
        // Деревья (вид сверху)
        for (const tree of this.trees) {
            const x = tree.x - camera.x * 1;
            const y = tree.y - camera.y * 1;
            const r = tree.radius;
            
            // Круглая крона (вид сверху)
            const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 2, x, y, r);
            if (tree.type === 'pine') {
                grad.addColorStop(0, '#2e7d32');
                grad.addColorStop(0.7, '#1b5e20');
                grad.addColorStop(1, '#0d3d0d');
            } else {
                grad.addColorStop(0, '#4caf50');
                grad.addColorStop(0.6, '#388e3c');
                grad.addColorStop(1, '#2e7d32');
            }
            
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 8;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Тень
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.beginPath();
            ctx.ellipse(x + 3, y + 4, r * 0.7, r * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Здания (вид сверху)
        for (const building of this.buildings) {
            const x = building.x - camera.x * 1;
            const y = building.y - camera.y * 1;
            const w = building.w;
            const h = building.h;
            
            // Тень здания
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(x + w / 2, y + h + 4, w * 0.4, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Стены
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 8;
            ctx.fillStyle = building.color;
            ctx.fillRect(x, y, w, h);
            ctx.shadowBlur = 0;
            
            // Контур
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
            
            // Крыша (вид сверху - просто темнее)
            if (building.type === 'house') {
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                ctx.fillRect(x + 4, y - 2, w - 8, 6);
            }
            
            // Детали для разных типов
            if (building.type === 'tavern') {
                ctx.fillStyle = '#ffd700';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🍺', x + w / 2, y + h / 2 + 5);
            } else if (building.type === 'forge') {
                ctx.fillStyle = '#ff6b35';
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🔨', x + w / 2, y + h / 2 + 5);
            } else if (building.type === 'well') {
                ctx.fillStyle = '#4a7a9a';
                ctx.beginPath();
                ctx.arc(x + w / 2, y + h / 2, w / 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#5a6a7a';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            // Окна (вид сверху - маленькие квадратики)
            if (building.type === 'house' || building.type === 'tavern') {
                ctx.fillStyle = 'rgba(255,215,0,0.15)';
                for (let wx = x + 6; wx < x + w - 6; wx += 12) {
                    for (let wy = y + 6; wy < y + h - 6; wy += 12) {
                        if (wx + 4 < x + w - 4 && wy + 4 < y + h - 4) {
                            ctx.fillRect(wx, wy, 4, 4);
                        }
                    }
                }
            }
        }
        
        // Декорации
        for (const dec of this.decorations) {
            const x = dec.x - camera.x * 1;
            const y = dec.y - camera.y * 1;
            
            if (dec.type === 'flower') {
                ctx.fillStyle = dec.color;
                ctx.shadowColor = dec.color;
                ctx.shadowBlur = 5;
                for (let i = 0; i < 4; i++) {
                    const angle = i / 4 * Math.PI * 2 + 0.3;
                    ctx.beginPath();
                    ctx.arc(x + Math.cos(angle) * 3, y + Math.sin(angle) * 3, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#8a8a8a';
                ctx.shadowColor = 'rgba(0,0,0,0.05)';
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.ellipse(x, y, 4, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
}