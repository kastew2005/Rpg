import { CONFIG } from './config.js';

export class VillageGenerator {
    constructor() {
        this.buildings = [];
        this.trees = [];
        this.paths = [];
        this.decorations = [];
        this.generate();
    }
    
    generate() {
        this.buildings = [];
        this.trees = [];
        this.paths = [];
        this.decorations = [];
        
        // Центральная площадь
        this.buildings.push({
            x: 550, y: 480,
            width: 80, height: 60,
            color: '#8b3a3a',
            type: 'house',
            hasChimney: true
        });
        
        // Дома
        const housePositions = [
            [400, 400], [700, 400], [350, 530],
            [650, 530], [500, 320], [400, 600],
            [700, 600], [300, 480]
        ];
        
        for (const [x, y] of housePositions) {
            this.buildings.push({
                x, y,
                width: 50 + Math.random() * 30,
                height: 40 + Math.random() * 20,
                color: `hsl(${30 + Math.random() * 20}, 50%, ${40 + Math.random() * 20}%)`,
                type: 'house',
                hasChimney: Math.random() > 0.5
            });
        }
        
        // Деревья
        for (let i = 0; i < 40; i++) {
            let x, y, valid;
            let attempts = 0;
            do {
                x = 50 + Math.random() * 1100;
                y = 50 + Math.random() * 1100;
                valid = true;
                
                // Проверка, что дерево не на здании
                for (const building of this.buildings) {
                    if (x > building.x - 30 && x < building.x + building.width + 30 &&
                        y > building.y - 30 && y < building.y + building.height + 30) {
                        valid = false;
                        break;
                    }
                }
                attempts++;
            } while (!valid && attempts < 50);
            
            if (valid) {
                this.trees.push({
                    x, y,
                    radius: 12 + Math.random() * 15,
                    type: Math.random() > 0.5 ? 'pine' : 'oak'
                });
            }
        }
        
        // Дорожки
        const pathPoints = [
            [550, 480], [550, 550], [550, 650],
            [550, 480], [650, 480], [750, 480],
            [550, 480], [450, 480], [350, 480],
            [550, 480], [550, 400], [550, 320]
        ];
        
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const [x1, y1] = pathPoints[i];
            const [x2, y2] = pathPoints[i + 1];
            this.paths.push({ x1, y1, x2, y2 });
        }
        
        // Декорации (цветы, камни)
        for (let i = 0; i < 60; i++) {
            const x = 20 + Math.random() * 1160;
            const y = 20 + Math.random() * 1160;
            let valid = true;
            
            for (const building of this.buildings) {
                if (x > building.x - 15 && x < building.x + building.width + 15 &&
                    y > building.y - 15 && y < building.y + building.height + 15) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                this.decorations.push({
                    x, y,
                    type: Math.random() > 0.7 ? 'stone' : 'flower',
                    size: 3 + Math.random() * 5,
                    color: `hsl(${Math.random() * 60 + 280}, 80%, ${60 + Math.random() * 30}%)`
                });
            }
        }
    }
    
    render(ctx, camera) {
        // Дорожки
        ctx.strokeStyle = '#b8a58a';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        
        for (const path of this.paths) {
            ctx.beginPath();
            ctx.moveTo(path.x1 - camera.x, path.y1 - camera.y);
            ctx.lineTo(path.x2 - camera.x, path.y2 - camera.y);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        
        // Деревья
        for (const tree of this.trees) {
            const x = tree.x - camera.x;
            const y = tree.y - camera.y;
            
            // Тень дерева
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(x, y + tree.radius * 0.8, tree.radius * 0.8, tree.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ствол
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(x - 3, y + 2, 6, tree.radius * 0.6);
            
            // Крона
            const gradient = ctx.createRadialGradient(x - 5, y - 8, 5, x, y, tree.radius);
            if (tree.type === 'pine') {
                gradient.addColorStop(0, '#2e7d32');
                gradient.addColorStop(1, '#1b5e20');
            } else {
                gradient.addColorStop(0, '#4caf50');
                gradient.addColorStop(0.7, '#388e3c');
                gradient.addColorStop(1, '#2e7d32');
            }
            
            ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 15;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y - 2, tree.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Детали кроны
            for (let i = 0; i < 5; i++) {
                const angle = i / 5 * Math.PI * 2 + 0.3;
                const dx = Math.cos(angle) * tree.radius * 0.6;
                const dy = Math.sin(angle) * tree.radius * 0.6;
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.beginPath();
                ctx.arc(x + dx, y - 2 + dy, tree.radius * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Здания
        for (const building of this.buildings) {
            const x = building.x - camera.x;
            const y = building.y - camera.y;
            
            // Тень здания
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(x + building.width / 2, y + building.height + 8, building.width * 0.6, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Стены
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 15;
            ctx.fillStyle = building.color;
            ctx.fillRect(x, y, building.width, building.height);
            ctx.shadowBlur = 0;
            
            // Крыша
            ctx.fillStyle = '#6d2a2a';
            ctx.beginPath();
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + building.width / 2, y - building.height * 0.5);
            ctx.lineTo(x + building.width + 8, y);
            ctx.closePath();
            ctx.fill();
            
            // Детали крыши
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const lx = x + 10 + i * 15;
                ctx.beginPath();
                ctx.moveTo(lx, y - 2);
                ctx.lineTo(lx + 5, y - building.height * 0.25);
                ctx.stroke();
            }
            
            // Окна
            ctx.fillStyle = 'rgba(255,215,0,0.3)';
            ctx.shadowColor = 'rgba(255,215,0,0.2)';
            ctx.shadowBlur = 10;
            for (let wx = x + 10; wx < x + building.width - 10; wx += 20) {
                for (let wy = y + 10; wy < y + building.height - 10; wy += 18) {
                    if (wx + 8 < x + building.width - 5 && wy + 8 < y + building.height - 5) {
                        ctx.fillRect(wx, wy, 8, 8);
                        ctx.fillStyle = 'rgba(255,215,0,0.15)';
                        ctx.fillRect(wx + 1, wy + 1, 6, 6);
                        ctx.fillStyle = 'rgba(255,215,0,0.3)';
                    }
                }
            }
            ctx.shadowBlur = 0;
            
            // Дымоход
            if (building.hasChimney) {
                ctx.fillStyle = '#5d4037';
                ctx.fillRect(x + building.width * 0.6, y - building.height * 0.4, 10, 15);
                // Дым
                ctx.fillStyle = 'rgba(200,200,200,0.1)';
                const time = Date.now() / 1000;
                for (let i = 0; i < 3; i++) {
                    const dx = Math.sin(time + i) * 5;
                    const dy = -8 - i * 6 - Math.sin(time * 0.5 + i * 2) * 3;
                    ctx.beginPath();
                    ctx.arc(x + building.width * 0.65 + dx, y - building.height * 0.4 + dy, 6 - i * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Декорации
        for (const dec of this.decorations) {
            const x = dec.x - camera.x;
            const y = dec.y - camera.y;
            
            if (dec.type === 'flower') {
                ctx.fillStyle = dec.color;
                ctx.shadowColor = dec.color;
                ctx.shadowBlur = 5;
                for (let i = 0; i < 4; i++) {
                    const angle = i / 4 * Math.PI * 2 + 0.3;
                    ctx.beginPath();
                    ctx.arc(x + Math.cos(angle) * dec.size, y + Math.sin(angle) * dec.size, dec.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(x, y, dec.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#8d8d8d';
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.ellipse(x, y, dec.size, dec.size * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
}
