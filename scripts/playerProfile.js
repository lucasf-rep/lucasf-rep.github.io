class PlayerProfile {
    constructor() {
        this.loadProfile();
        this.updateUI();
    }

    loadProfile() {
        const savedProfile = localStorage.getItem('playerProfile');
        this.profile = savedProfile ? JSON.parse(savedProfile) : {
            name: 'Learner',
            totalXP: 0,
            skills: {
                arabic: {
                    level: 1,
                    xp: 0
                },
                cyrillic: {
                    level: 1,
                    xp: 0
                }
            }
        };
    }

    getXPRequiredForLevel(level) {
        // Base XP requirement starts at 100
        const baseXP = 100;
        
        if (level <= 25) {
            // Levels 1-25: Moderate increase (7% per level)
            return Math.round(baseXP * Math.pow(1.07, level - 1));
        } else if (level <= 50) {
            // Levels 26-50: Slightly faster increase (8% per level)
            return Math.round(baseXP * Math.pow(1.07, 24) * Math.pow(1.08, level - 25));
        } else if (level <= 75) {
            // Levels 51-75: Medium increase (10% per level)
            return Math.round(baseXP * Math.pow(1.07, 24) * Math.pow(1.08, 25) * Math.pow(1.10, level - 50));
        } else {
            // Levels 76+: Steep increase (15% per level)
            return Math.round(baseXP * Math.pow(1.07, 24) * Math.pow(1.08, 25) * Math.pow(1.10, 25) * Math.pow(1.15, level - 75));
        }
        
        // This creates a progression like:
        // Level 1: 100 XP
        // Level 5: 131 XP
        // Level 10: 184 XP
        // Level 25: 425 XP
        // Level 50: 1,275 XP
        // Level 75: 5,400 XP
        // Level 80: 9,400 XP
        // Level 90: 29,000 XP
    }

    updateUI() {
        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            avatar.textContent = this.profile.name.charAt(0).toUpperCase();
        }

        const nameElement = document.querySelector('.profile-header h3');
        if (nameElement) {
            nameElement.textContent = this.profile.name;
        }

        const xpElement = document.querySelector('.stat-value');
        if (xpElement) {
            xpElement.textContent = this.profile.totalXP;
        }

        Object.entries(this.profile.skills).forEach(([skillName, skillData]) => {
            const progressBar = document.querySelector(`.skill-progress-bar[data-skill="${skillName}"]`);
            const levelElement = progressBar?.parentElement?.previousElementSibling?.querySelector('.skill-level');
            
            if (progressBar && levelElement) {
                const requiredXP = this.getXPRequiredForLevel(skillData.level);
                const xpProgress = (skillData.xp / requiredXP) * 100;
                progressBar.style.width = `${xpProgress}%`;
                levelElement.textContent = `Level ${skillData.level}`;
            }
        });
    }

    addXP(amount, skillName = null) {
        this.profile.totalXP += amount;
        
        if (skillName && this.profile.skills[skillName]) {
            const skill = this.profile.skills[skillName];
            skill.xp += amount;
            
            // Check for level up
            const requiredXP = this.getXPRequiredForLevel(skill.level);
            while (skill.xp >= requiredXP) {
                skill.xp -= requiredXP;
                skill.level++;
                this.showLevelUpMessage(skillName, skill.level);
            }
        }
        
        this.saveProfile();
        this.updateUI();
    }

    showLevelUpMessage(skillName, newLevel) {
        const message = document.createElement('div');
        message.className = 'level-up-notification';
        message.innerHTML = `Level Up! ${skillName} is now level ${newLevel}`;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    saveProfile() {
        localStorage.setItem('playerProfile', JSON.stringify(this.profile));
    }
}

// Initialize player profile when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.playerProfile = new PlayerProfile();
});