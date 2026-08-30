export class UI {
    constructor() {
        this.healthElement = document.getElementById('health-fill');
        this.goldElement = document.getElementById('gold-display');
        this.dialogueBox = document.getElementById('dialogue-box');
        this.dialogueText = document.getElementById('dialogue-text');
        this.interactionPanel = document.getElementById('interaction-panel');
    }
    
    updateHealth(health, maxHealth) {
        const percentage = (health / maxHealth) * 100;
        this.healthElement.style.width = `${Math.max(0, percentage)}%`;
        
        if (percentage < 30) {
            this.healthElement.style.background = 'linear-gradient(90deg, #ff1744, #ff6b6b)';
        } else if (percentage < 60) {
            this.healthElement.style.background = 'linear-gradient(90deg, #ffa726, #ffca28)';
        } else {
            this.healthElement.style.background = 'linear-gradient(90deg, #4caf50, #66bb6a)';
        }
    }
    
    updateGold(gold) {
        this.goldElement.textContent = `💰 ${gold}`;
    }
    
    showDialogue(text) {
        this.dialogueBox.style.display = 'block';
        this.dialogueText.textContent = text;
    }
    
    hideDialogue() {
        this.dialogueBox.style.display = 'none';
    }
    
    showInteractionPanel(show) {
        this.interactionPanel.style.display = show ? 'flex' : 'none';
    }
}
