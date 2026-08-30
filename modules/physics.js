export class Physics {
    constructor() {
        this.gravity = 0;
        this.friction = 0.9;
    }
    
    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (obj1.radius + obj2.radius);
    }
    
    resolveCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist === 0) return;
        
        const overlap = (obj1.radius + obj2.radius - dist) / 2;
        const normX = dx / dist;
        const normY = dy / dist;
        
        obj1.x += normX * overlap;
        obj1.y += normY * overlap;
        obj2.x -= normX * overlap;
        obj2.y -= normY * overlap;
    }
    
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }
}
