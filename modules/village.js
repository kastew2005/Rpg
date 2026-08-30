import { CONFIG } from './config.js';

export class VillageGenerator {
    constructor() {
        this.buildings = [];
        this.trees = [];
        this.paths = [];
        this.decorations = [];
        this.fences = [];
        this.wells = [];
        this.crops = [];
        this.generate();
    }
    
    generate() {
        this.buildings = [];
        this.trees = [];
        this.paths = [];
        this.decorations = [];
        this.fences = [];
        this.wells = [];
        this.crops = [];
        
        // Центральная площадь с фонтаном/колодцем
        this.wells.push({
            x: 550, y: 480,
            radius: 20,
            hasRoof: true
        });
        
        // Дома (более детализированные)
        const houses = [
            { x: 450, y: 400, w: 60, h: 45, style: 'stone', floors: 1 },
            { x: 650, y: 400, w: 55, h: 50, style: 'wood', floors: 1 },
            { x: 380, y: 520, w: 50, h: 40, style: 'stone', floors: 1 },
            { x: 720, y: 520, w: 65, h: 45, style: 'wood', floors: 2 },
            { x: 500, y: 340, w: 55, h: 40, style: 'stone', floors: 1 },
            { x: 600, y: 340, w: 50, h: 45, style: 'wood', floors: 1 },
            { x: 400, y: 600, w: 60, h: 50, style: 'stone', floors: 1 },
            { x: 700, y: 600, w: 55, h: 40, style: 'wood', floors: 1 },
            { x: 520, y: 600, w: 50, h: 45, style: 'stone', floors: 1 }
        ];
        
        for (const house of houses) {
            const color = house.style === 'stone' 
                ? `hsl(40, 20%, ${55 + Math.random() * 15}%)`
                : `hsl(30, 30%, ${45 + Math.random() * 15}%)`;
            
            this.buildings.push({
                x: house.x, y: house.y,
                width: house.w, height: house.h,
                color: color,
                style: house.style,
                floors: house.floors,
                hasChimney: Math.random() > 0.4,
                hasWindows: true,
                hasDoor: true,
                roofColor: house.style === 'stone' ? '#6d2a2a' : '#5a3a2a'
            });
        }
        
        // Таверна
        this.buildings.push({
            x: 480, y: 650,
            width: 70, height: 55,
            color: '#7a5a3a',
            style: 'wood',
            floors: 2,
            hasChimney: true,
            hasWindows: true,
            hasDoor: true,
            roofColor: '#4a2a1a',
            isTavern: true
        });
        
        // Кузница
        this.buildings.push({
            x: 350, y: 580,
            width: 45, height: 35,
            color: '#5a4a3a',
            style: 'stone',
            floors: 1,
            hasChimney: true,
            hasWindows: false,
            hasDoor: true,
            roofColor: '#3a2a1a',
            isForge: true
        });
        
        // Деревья (больше и разнообразнее)
        for (let i = 0; i < 55; i++) {
            let x, y, valid;
            let attempts = 0;
            do {
                x = 40 + Math.random() * 1320;
                y = 40 + Math.random() * 1320;
                valid = true;
                
                for (const building of this.buildings) {
                    if (x > building.x - 35 && x < building.x + building.width + 35 &&
                        y > building.y - 35 && y < building.y + building.height + 35) {
                        valid = false;
                        break;
                    }
                }
                for (const well of this.wells) {
                    if (Math.sqrt((x - well.x) ** 2 + (y - well.y) ** 2) < 40) {
                        valid = false;
                        break;
                    }
                }
                attempts++;
            } while (!valid && attempts < 50);
            
            if (valid) {
                const type = Math.random();
                let treeType;
                if (type < 0.3) treeType = 'pine';
                else if (type < 0.6) treeType = 'oak';
                else if (type < 0.8) treeType = 'maple';
                else treeType = 'willow';
                
                this.trees.push({
                    x, y,
                    radius: 12 + Math.random() * 18,
                    type: treeType,
                    size: 0.7 + Math.random() * 0.6
                });
            }
        }
        
        // Дорожки (мощеные)
        const paths = [
            [550, 480, 550, 550],
            [550, 480, 550, 400],
            [550, 480, 650, 480],
            [550, 480, 450, 480],
            [550, 550, 480, 650],
            [550, 400, 450, 400],
            [550, 400, 650, 400],
            [650, 480, 700, 520],
            [450, 480, 380, 520],
            [550, 550, 600, 600],
            [550, 550, 500, 600]
        ];
        
        for (const [x1, y1, x2, y2] of paths) {
            this.paths.push({ x1, y1, x2, y2 });
        }
        
        // Заборы
        for (let i = 0; i < 8; i++) {
            const angle = i / 8 * Math.PI * 2;
            const dist = 200 + Math.random() * 80;
            const cx = 550 + Math.cos(angle) * dist;
            const cy = 480 + Math.sin(angle) * dist;
            
            const count = 5 + Math.floor(Math.random() * 5);
            const dir = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            
            for (let j = 0; j < count; j++) {
                const fx = cx + Math.cos(dir) * j * 12 + (Math.random() - 0.5) * 4;
                const fy = cy + Math.sin(dir) * j * 12 + (Math.random() - 0.5) * 4;
                this.fences.push({
                    x: fx, y: fy,
                    height: 12 + Math.random() * 6,
                    angle: dir + (Math.random() - 0.5) * 0.3
                });
            }
        }
        
        // Поля с урожаем
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 250 + Math.random() * 150;
            const cx = 550 + Math.cos(angle) * dist;
            const cy = 480 + Math.sin(angle) * dist;
            
            for (let j = 0; j < 8; j++) {
                this.crops.push({
                    x: cx + (Math.random() - 0.5) * 60,
                    y: cy + (Math.random() - 0.5) * 40,
                    type: Math.random() > 0.5 ? 'wheat' : 'corn',
                    size: 0.5 + Math.random() * 0.5
                });
            }
        }
        
        // Декорации
        for (let i = 0; i < 80; i++) {
            const x = 20 + Math.random() * 1360;
            const y = 20 + Math.random() * 1360;
            let valid = true;
            
            for (const building of this.buildings) {
                if (x > building.x - 15 && x < building.x + building.width + 15 &&
                    y > building.y - 15 && y < building.y + building.height + 15) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                const type = Math.random();
                if (type < 0.3) {
                    this.decorations.push({
                        x, y,
                        type: 'flower',
                        size: 3 + Math.random() * 4,
                        color: `hsl(${Math.random() * 60 + 280}, 70%, ${60 + Math.random() * 30}%)`
                    });
                } else if (type < 0.5) {
                    this.decorations.push({
                        x, y,
                        type: 'stone',
                        size: 4 + Math.random() * 8
                    });
                } else if (type < 0.7) {
                    this.decorations.push({
                        x, y,
                        type: 'bush',
                        size: 8 + Math.random() * 8
                    });
                } else {
                    this.decorations.push({
                        x, y,
                        type: 'mushroom',
                        size: 3 + Math.random() * 4
                    });
                }
            }
        }
    }
    
    render(ctx, camera, time) {
        // Дорожки
        for (const path of this.paths) {
            const x1 = path.x1 - camera.x;
            const y1 = path.y1 - camera.y;
            const x2 = path.x2 - camera.x;
            const y2 = path.y2 - camera.y;
            
            ctx.shadowColor = 'rgba(0,0,0,0.08)';
            ctx.shadowBlur = 8;
            
            // Основная дорожка
            ctx.strokeStyle = '#9a8a7a';
            ctx.lineWidth = 20;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Светлая полоса (камни)
            ctx.strokeStyle = 'rgba(180, 160, 140, 0.3)';
            ctx.lineWidth = 12;
            ctx.setLineDash([8, 12]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.shadowBlur = 0;
        }
        
        // Заборы
        for (const fence of this.fences) {
            const x = fence.x - camera.x;
            const y = fence.y - camera.y;
            
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#6b5a4a';
            
            // Столб
            ctx.fillRect(x - 2, y - fence.height, 4, fence.height);
            
            // Перекладина
            ctx.fillRect(x - 6, y - fence.height * 0.7, 12, 2);
            ctx.fillRect(x - 6, y - fence.height * 0.4, 12, 2);
            
            // Верхушка (заостренная)
            ctx.fillStyle = '#5a4a3a';
            ctx.beginPath();
            ctx.moveTo(x - 3, y - fence.height);
            ctx.lineTo(x, y - fence.height - 4);
            ctx.lineTo(x + 3, y - fence.height);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
        
        // Поля
        for (const crop of this.crops) {
            const x = crop.x - camera.x;
            const y = crop.y - camera.y;
            
            const sway = Math.sin(time * 0.5 + crop.x * 0.01) * 2;
            
            ctx.strokeStyle = crop.type === 'wheat' ? '#d4a84a' : '#4a8a3a';
            ctx.lineWidth = 1.5;
            
            for (let i = 0; i < 3; i++) {
                const sx = x + i * 4 - 4 + Math.sin(time + i + crop.x) * 1.5;
                ctx.beginPath();
                ctx.moveTo(sx, y + 4);
                ctx.quadraticCurveTo(sx + sway * 0.5, y - 6, sx + sway, y - 12);
                ctx.stroke();
            }
            
            if (crop.type === 'wheat') {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(x + sway * 0.7, y - 14, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Здания
        for (const building of this.buildings) {
            this.drawBuilding(ctx, building, camera, time);
        }
        
        // Колодцы
        for (const well of this.wells) {
            const x = well.x - camera.x;
            const y = well.y - camera.y;
            
            ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 10;
            
            // Основание
            ctx.fillStyle = '#7a6a5a';
            ctx.beginPath();
            ctx.arc(x, y + 4, well.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#6a5a4a';
            ctx.beginPath();
            ctx.arc(x, y, well.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Вода
            ctx.fillStyle = 'rgba(60, 100, 140, 0.4)';
            ctx.beginPath();
            ctx.arc(x, y + 2, well.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Крыша колодца
            if (well.hasRoof) {
                ctx.fillStyle = '#5a3a2a';
                ctx.beginPath();
                ctx.moveTo(x - well.radius * 1.2, y - 2);
                ctx.lineTo(x, y - well.radius * 1.2);
                ctx.lineTo(x + well.radius * 1.2, y - 2);
                ctx.closePath();
                ctx.fill();
                
                // Столбы
                ctx.fillStyle = '#6b5a4a';
                ctx.fillRect(x - 12, y - 2, 3, 15);
                ctx.fillRect(x + 9, y - 2, 3, 15);
            }
            
            ctx.shadowBlur = 0;
        }
        
        // Деревья
        for (const tree of this.trees) {
            this.drawTree(ctx, tree, camera, time);
        }
        
        // Декорации
        for (const dec of this.decorations) {
            const x = dec.x - camera.x;
            const y = dec.y - camera.y;
            
            if (dec.type === 'flower') {
                const sway = Math.sin(time + dec.x) * 1.5;
                ctx.shadowColor = dec.color;
                ctx.shadowBlur = 8;
                
                for (let i = 0; i < 5; i++) {
                    const angle = i / 5 * Math.PI * 2 + 0.3 + sway * 0.1;
                    const r = dec.size * (0.5 + Math.sin(time * 0.5 + i + dec.x) * 0.1);
                    ctx.fillStyle = dec.color;
                    ctx.beginPath();
                    ctx.arc(x + Math.cos(angle) * r, y + Math.sin(angle) * r, dec.size * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(x, y, dec.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (dec.type === 'stone') {
                ctx.fillStyle = '#8a8a8a';
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.ellipse(x, y, dec.size, dec.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(200,200,200,0.1)';
                ctx.beginPath();
                ctx.ellipse(x - dec.size * 0.2, y - dec.size * 0.2, dec.size * 0.3, dec.size * 0.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (dec.type === 'bush') {
                const grad = ctx.createRadialGradient(x - 3, y - 4, 2, x, y, dec.size);
                grad.addColorStop(0, '#4a8a3a');
                grad.addColorStop(0.6, '#3a7a2a');
                grad.addColorStop(1, '#2a5a1a');
                ctx.fillStyle = grad;
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(x, y, dec.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (dec.type === 'mushroom') {
                // Шляпка
                ctx.fillStyle = '#cc3333';
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.ellipse(x, y - 2, dec.size * 0.8, dec.size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Точки на шляпке
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                for (let i = 0; i < 4; i++) {
                    const angle = i / 4 * Math.PI * 2 + 0.5;
                    ctx.beginPath();
                    ctx.arc(x + Math.cos(angle) * dec.size * 0.3, y - 2 + Math.sin(angle) * dec.size * 0.2, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Ножка
                ctx.fillStyle = '#d4c8b8';
                ctx.shadowBlur = 0;
                ctx.fillRect(x - 2, y + 1, 4, dec.size * 0.6);
                ctx.shadowBlur = 0;
            }
        }
    }
    
    drawBuilding(ctx, building, camera, time) {
        const x = building.x - camera.x;
        const y = building.y - camera.y;
        const w = building.width;
        const h = building.height;
        
        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h + 10, w * 0.5, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 12;
        
        // Стены
        ctx.fillStyle = building.color;
        ctx.fillRect(x, y, w, h);
        
        // Текстура стен (для каменных)
        if (building.style === 'stone') {
            ctx.strokeStyle = 'rgba(0,0,0,0.05)';
            ctx.lineWidth = 0.5;
            for (let row = 0; row < h / 10; row++) {
                for (let col = 0; col < w / 15 + 1; col++) {
                    const sx = x + col * 15 + (row % 2) * 7.5;
                    const sy = y + row * 10;
                    if (sx < x + w - 5 && sy < y + h - 5) {
                        ctx.strokeRect(sx, sy, 13, 8);
                    }
                }
            }
        }
        
        // Деревянные балки (для деревянных)
        if (building.style === 'wood') {
            ctx.strokeStyle = 'rgba(40, 20, 10, 0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 12) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i, y + h);
                ctx.stroke();
            }
        }
        
        // Окна
        if (building.hasWindows) {
            const windowColor = 'rgba(255, 215, 0, 0.15)';
            const windowGlow = Math.sin(time * 0.5 + building.x) * 0.05 + 0.1;
            
            for (let wx = x + 10; wx < x + w - 10; wx += 18) {
                for (let wy = y + 10; wy < y + h - 10; wy += 16) {
                    if (wx + 8 < x + w - 5 && wy + 8 < y + h - 5) {
                        // Рама
                        ctx.fillStyle = '#5a3a2a';
                        ctx.fillRect(wx - 1, wy - 1, 10, 10);
                        
                        // Стекло
                        ctx.fillStyle = windowColor;
                        ctx.shadowColor = 'rgba(255,215,0,0.1)';
                        ctx.shadowBlur = 8;
                        ctx.fillRect(wx, wy, 8, 8);
                        
                        // Крестовина
                        ctx.strokeStyle = 'rgba(40, 20, 10, 0.5)';
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(wx + 4, wy);
                        ctx.lineTo(wx + 4, wy + 8);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(wx, wy + 4);
                        ctx.lineTo(wx + 8, wy + 4);
                        ctx.stroke();
                        
                        // Свечение
                        ctx.fillStyle = `rgba(255,215,0,${windowGlow * 0.3})`;
                        ctx.shadowBlur = 15;
                        ctx.beginPath();
                        ctx.arc(wx + 4, wy + 4, 6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            ctx.shadowBlur = 0;
        }
        
        // Дверь
        if (building.hasDoor) {
            const doorX = x + w / 2 - 8;
            const doorY = y + h - 20;
            
            ctx.fillStyle = '#3a2a1a';
            ctx.shadowBlur = 5;
            ctx.fillRect(doorX, doorY, 16, 20);
            
            // Ручка
            ctx.fillStyle = '#ffd700';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(doorX + 12, doorY + 10, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Дверная арка
            ctx.strokeStyle = '#2a1a0a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(doorX + 8, doorY, 8, Math.PI, 0);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
        
        // Крыша
        const roofH = building.floors === 2 ? h * 0.5 : h * 0.4;
        ctx.fillStyle = building.roofColor || '#6d2a2a';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x + w / 2, y - roofH);
        ctx.lineTo(x + w + 8, y);
        ctx.closePath();
        ctx.fill();
        
        // Черепица
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;
        for (let row = 0; row < 4; row++) {
            const ry = y - row * (roofH / 4);
            const progress = row / 4;
            const width = w * (1 - progress * 0.3);
            const rx = x + (w - width) / 2;
            
            for (let col = 0; col < width / 8; col++) {
                const cx = rx + col * 8 + (row % 2) * 4;
                if (cx < rx + width - 4) {
                    ctx.strokeRect(cx, ry, 6, 3);
                }
            }
        }
        
        // Дымоход
        if (building.hasChimney) {
            const cx = x + w * 0.65;
            const cy = y - roofH * 0.6;
            
            ctx.fillStyle = '#6b4a3a';
            ctx.shadowBlur = 5;
            ctx.fillRect(cx - 5, cy - 10, 12, 16);
            
            // Дым
            const smokeTime = time * 0.3;
            ctx.fillStyle = 'rgba(200, 200, 200, 0.08)';
            ctx.shadowBlur = 20;
            for (let i = 0; i < 4; i++) {
                const sx = cx + 1 + Math.sin(smokeTime + i * 2) * 8;
                const sy = cy - 12 - i * 10 - Math.sin(smokeTime * 0.7 + i * 1.5) * 4;
                const sr = 6 + i * 3 + Math.sin(smokeTime + i) * 2;
                ctx.beginPath();
                ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
        }
        
        // Таверна - вывеска
        if (building.isTavern) {
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(x + w / 2 - 15, y - roofH - 5, 30, 20);
            ctx.fillStyle = '#ffd700';
            ctx.font = '12px "MedievalSharp", cursive';
            ctx.textAlign = 'center';
            ctx.fillText('🍺', x + w / 2, y - roofH + 7);
        }
        
        // Кузница - наковальня снаружи
        if (building.isForge) {
            ctx.fillStyle = '#4a4a4a';
            ctx.shadowBlur = 5;
            ctx.fillRect(x + w + 5, y + h - 10, 15, 10);
            ctx.fillStyle = '#6a6a6a';
            ctx.fillRect(x + w + 7, y + h - 12, 11, 3);
            ctx.shadowBlur = 0;
        }
    }
    
    drawTree(ctx, tree, camera, time) {
        const x = tree.x - camera.x;
        const y = tree.y - camera.y;
        const r = tree.radius * tree.size;
        const sway = Math.sin(time * 0.3 + tree.x * 0.01) * 0.04 * r;
        
        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.6, r * 0.7, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ствол
        ctx.fillStyle = '#5a3a2a';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 8;
        const trunkW = 4 + r * 0.15;
        ctx.fillRect(x - trunkW / 2, y + 2, trunkW, r * 0.5);
        
        // Крона
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 12;
        
        const grad = ctx.createRadialGradient(
            x + sway * 0.5 - r * 0.2, y - r * 0.3,
            r * 0.1,
            x + sway * 0.5, y - r * 0.2,
            r
        );
        
        if (tree.type === 'pine') {
            grad.addColorStop(0, '#2e7d32');
            grad.addColorStop(0.5, '#1b5e20');
            grad.addColorStop(1, '#0d3d0d');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(x + sway, y - r * 1.1);
            ctx.lineTo(x - r * 0.8 + sway, y - r * 0.1);
            ctx.lineTo(x - r * 0.4 + sway, y - r * 0.1);
            ctx.lineTo(x - r * 1.1 + sway, y + r * 0.3);
            ctx.lineTo(x + r * 0.1 + sway, y + r * 0.3);
            ctx.lineTo(x + r * 0.1 + sway, y + r * 0.6);
            ctx.lineTo(x + r * 0.7 + sway, y + r * 0.6);
            ctx.lineTo(x + r * 0.7 + sway, y + r * 0.3);
            ctx.lineTo(x + r * 1.1 + sway, y + r * 0.3);
            ctx.lineTo(x + r * 0.4 + sway, y - r * 0.1);
            ctx.lineTo(x + r * 0.8 + sway, y - r * 0.1);
            ctx.closePath();
            ctx.fill();
        } else if (tree.type === 'maple') {
            grad.addColorStop(0, '#e8a030');
            grad.addColorStop(0.5, '#c87820');
            grad.addColorStop(1, '#8a5a10');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x + sway * 0.5, y - r * 0.2, r, 0, Math.PI * 2);
            ctx.fill();
            
            // Звездообразная форма
            for (let i = 0; i < 5; i++) {
                const angle = i / 5 * Math.PI * 2 + time * 0.1;
                ctx.fillStyle = `rgba(200, 120, 30, ${0.2 + Math.sin(time + i) * 0.1})`;
                ctx.beginPath();
                ctx.arc(
                    x + sway * 0.5 + Math.cos(angle) * r * 0.7,
                    y - r * 0.2 + Math.sin(angle) * r * 0.7,
                    r * 0.4, 0, Math.PI * 2
                );
                ctx.fill();
            }
        } else if (tree.type === 'willow') {
            grad.addColorStop(0, '#4a8a4a');
            grad.addColorStop(0.5, '#3a7a3a');
            grad.addColorStop(1, '#2a5a2a');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x + sway * 0.5, y - r * 0.3, r * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Плакучие ветви
            ctx.strokeStyle = 'rgba(40, 80, 40, 0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 10; i++) {
                const angle = -Math.PI / 2 + i / 9 * Math.PI + 0.3;
                const len = r * (0.5 + Math.random() * 0.5);
                ctx.beginPath();
                ctx.moveTo(x + sway * 0.5 + Math.cos(angle) * r * 0.6, y - r * 0.3 + Math.sin(angle) * r * 0.6);
                ctx.quadraticCurveTo(
                    x + sway * 0.5 + Math.cos(angle + 0.3) * len * 1.2,
                    y - r * 0.3 + Math.sin(angle + 0.3) * len * 0.5 + len * 0.3,
                    x + sway * 0.5 + Math.cos(angle + 0.5) * len,
                    y - r * 0.3 + Math.sin(angle + 0.5) * len * 0.3 + len * 0.6
                );
                ctx.stroke();
            }
        } else {
            // Oak - дуб (по умолчанию)
            grad.addColorStop(0, '#4caf50');
            grad.addColorStop(0.5, '#388e3c');
            grad.addColorStop(1, '#2e7d32');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x + sway * 0.5, y - r * 0.2, r, 0, Math.PI * 2);
            ctx.fill();
            
            // Детали кроны
            for (let i = 0; i < 6; i++) {
                const angle = i / 6 * Math.PI * 2 + 0.3;
                ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.sin(time * 0.2 + i) * 0.02})`;
                ctx.beginPath();
                ctx.arc(
                    x + sway * 0.5 + Math.cos(angle) * r * 0.5,
                    y - r * 0.2 + Math.sin(angle) * r * 0.5,
                    r * 0.3, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        ctx.shadowBlur = 0;
    }
}