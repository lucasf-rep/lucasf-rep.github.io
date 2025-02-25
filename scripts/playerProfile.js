class PlayerProfile {
    constructor() {
        this.loadProfile();
        this.updateUI();
    }

    loadProfile() {
        const savedProfile = localStorage.getItem('playerProfile');
        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
            // Ensure farsi-words skill exists in loaded profile
            if (!this.profile.skills['farsi-words']) {
                this.profile.skills['farsi-words'] = {
                    level: 1,
                    xp: 0
                };
            }
        } else {
            this.profile = {
                name: 'Learner',
                totalXP: 0,
                skills: {
                    arabic: {
                        level: 1,
                        xp: 0
                    },
                    'farsi-words': {
                        level: 1,
                        xp: 0
                    }
                }
            };
        }
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

        // Update total XP
        const totalXPElements = document.querySelectorAll('.stat-value');
        totalXPElements.forEach(el => {
            el.textContent = this.profile.totalXP;
        });

        // Update each skill's progress
        const skillBars = document.querySelectorAll('.skill-progress-bar');
        skillBars.forEach(bar => {
            const skillName = bar.dataset.skill;
            if (this.profile.skills[skillName]) {
                const skill = this.profile.skills[skillName];
                const requiredXP = this.getXPRequiredForLevel(skill.level);
                const progress = (skill.xp / requiredXP) * 100;
                bar.style.width = `${progress}%`;
                
                // Update level display
                const skillItem = bar.closest('.skill-item');
                if (skillItem) {
                    const levelElement = skillItem.querySelector('.skill-level');
                    if (levelElement) {
                        levelElement.textContent = `Level ${skill.level}`;
                    }
                }
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