class PlayerProfile {
    constructor() {
        this.loadProfile();
        this.initializeUI();
    }

    loadProfile() {
        const savedProfile = localStorage.getItem('playerProfile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            this.username = profile.username;
            this.totalXp = profile.totalXp || 0;
            this.stats = profile.stats || {
                correctAnswers: 0,
                totalAnswers: 0,
                timeSpent: 0
            };
        } else {
            this.promptNewProfile();
        }
    }

    promptNewProfile() {
        const username = prompt('Welcome! Please enter your username:');
        this.username = username || 'Learner';
        this.totalXp = 0;
        this.stats = {
            correctAnswers: 0,
            totalAnswers: 0,
            timeSpent: 0
        };
        this.saveProfile();
    }

    saveProfile() {
        localStorage.setItem('playerProfile', JSON.stringify({
            username: this.username,
            totalXp: this.totalXp,
            stats: this.stats
        }));
    }

    addXP(amount) {
        this.totalXp += amount;
        this.saveProfile();
        this.updateUI();
        this.checkAchievements();
    }

    updateStats(correct, timeSpent) {
        this.stats.correctAnswers += correct ? 1 : 0;
        this.stats.totalAnswers += 1;
        this.stats.timeSpent += timeSpent;
        this.saveProfile();
        this.updateUI();
    }

    initializeUI() {
        const profileHeader = document.querySelector('.profile-header');
        profileHeader.innerHTML = `
            <div class="profile-avatar">${this.username.charAt(0).toUpperCase()}</div>
            <h3>${this.username}</h3>
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-value">${this.totalXp}</span>
                    <span class="stat-label">Total XP</span>
                </div>
            </div>
            <div class="profile-accuracy">
                Accuracy: ${this.getAccuracy()}%
            </div>
        `;
    }

    updateUI() {
        const statsContainer = document.querySelector('.profile-stats');
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${this.totalXp}</span>
                <span class="stat-label">Total XP</span>
            </div>
        `;

        document.querySelector('.profile-accuracy').textContent = 
            `Accuracy: ${this.getAccuracy()}%`;
    }

    getAccuracy() {
        if (this.stats.totalAnswers === 0) return 0;
        return Math.round((this.stats.correctAnswers / this.stats.totalAnswers) * 100);
    }

    checkAchievements() {
        const possibleAchievements = [
            { id: 'xp_1000', name: '1000 XP', condition: () => this.totalXp >= 1000 },
            { id: 'accuracy_90', name: '90% Accuracy', condition: () => this.getAccuracy() >= 90 }
        ];

        for (const achievement of possibleAchievements) {
            if (!this.achievements.includes(achievement.id) && achievement.condition()) {
                this.achievements.push(achievement.id);
                this.showAchievementNotification(achievement.name);
            }
        }
    }

    showAchievementNotification(achievementName) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <h4>Achievement Unlocked!</h4>
                <p>${achievementName}</p>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
} 