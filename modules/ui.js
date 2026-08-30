export class UI {
    constructor() {
        this.healthElement = document.getElementById('health-fill');
        this.healthText = document.getElementById('health-text');
        this.goldElement = document.getElementById('gold-display');
        this.levelElement = document.getElementById('level-display');
        this.dialogueBox = document.getElementById('dialogue-box');
        this.dialogueText = document.getElementById('dialogue-text');
        this.dialogueName = document.getElementById('dialogue-name');
        this.dialoguePortrait = document.getElementById('dialogue-portrait');
        this.interactionPanel = document.getElementById('interaction-panel');
    }
    
    updateHealth(health, maxHealth) {
        const percentage = (health / maxHealth) * 100;
        this.healthElement.style.width = `${Math.max(0, percentage)}%`;
        this.healthText.textContent = `${Math.floor(health)}/${maxHealth}`;
        
        if (percentage < 25) {
            this.healthElement.style.background = 'linear-gradient(90deg, #4a0000, #8b0000, #cc0000)';
        } else if (percentage < 50) {
            this.healthElement.style.background = 'linear-gradient(90deg, #8b4500, #cc6600, #ff8800)';
        } else {
            this.healthElement.style.background = 'linear-gradient(90deg, #004a00, #008b00, #00cc00)';
        }
    }
    
    updateGold(gold) {
        this.goldElement.textContent = `🪙 ${gold}`;
    }
    
    updateLevel(level, exp, expToNext) {
        this.levelElement.textContent = `🎯 Ур. ${level}`;
    }
    
    showDialogue(text, name, portrait) {
        this.dialogueBox.style.display = 'flex';
        this.dialogueText.textContent = text;
        this.dialogueName.textContent = name || 'Незнакомец';
        this.dialoguePortrait.textContent = portrait || '👤';
    }
    
    hideDialogue() {
        this.dialogueBox.style.display = 'none';
    }
    
    showInteractionPanel(show) {
        this.interactionPanel.style.display = show ? 'flex' : 'none';
    }
}