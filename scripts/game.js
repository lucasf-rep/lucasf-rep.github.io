class ScriptGame {
    constructor() {
        this.letterSets = {
            1: [ // Levels 1-5: Basic letters
                { char: 'ا', name: 'Alif' },
                { char: 'ب', name: 'Baa' },
                { char: 'ت', name: 'taa' },
                { char: 'ث', name: 'thaa' },
                { char: 'ج', name: 'Jeem' }
            ],
            6: [ // Levels 6-10: Add more consonants
                { char: 'ح', name: 'Haa' },
                { char: 'خ', name: 'Khaa' },
                { char: 'د', name: 'Dal' },
                { char: 'ذ', name: 'thal' },
                { char: 'ر', name: 'Raa' }
            ],
            11: [ // Levels 11-15: Add more letters
                { char: 'ز', name: 'Zay' },
                { char: 'س', name: 'Seen' },
                { char: 'ش', name: 'Sheen' },
                { char: 'ص', name: 'Saad' },
                { char: 'ض', name: 'Daad' }
            ],
            16: [ // Levels 16-20: Complete the set
                { char: 'ط', name: 'Taa' },
                { char: 'ظ', name: 'Thaa' },
                { char: 'ع', name: 'Ayn' },
                { char: 'غ', name: 'Ghayn' },
                { char: 'ف', name: 'Faa' }
            ],
            21: [ // Levels 21-25: Important letters for contractions
                { char: 'ل', name: 'Lam' },
                { char: 'م', name: 'Meem' }
            ],
            26: [ // Levels 26+: Special contractions
                { char: 'لم', name: 'Lam-Meem' },
                { char: 'لا', name: 'Lam-Alif' }
            ]
        };
        
        this.currentIndex = 0;
        this.activeLetters = [];
        this.updateLetterSet();
    }

    updateLetterSet() {
        const playerLevel = window.playerProfile.profile.skills.arabic.level;
        this.activeLetters = [];
        
        // Add all letter sets up to the player's level
        Object.entries(this.letterSets).forEach(([levelReq, letters]) => {
            if (playerLevel >= parseInt(levelReq)) {
                this.activeLetters.push(...letters);
            }
        });

        // Shuffle the active letters
        this.activeLetters = this.shuffle([...this.activeLetters]);
    }

    start() {
        const mainContent = document.querySelector('.main-content');
        const playerLevel = window.playerProfile.profile.skills.arabic.level;
        const currentXP = window.playerProfile.profile.skills.arabic.xp;
        const requiredXP = window.playerProfile.getXPRequiredForLevel(playerLevel);
        const nextUnlockLevel = this.getNextUnlockLevel(playerLevel);
        
        mainContent.innerHTML = `
            <div class="game-header">
                <h1>Learn Arabic Script</h1>
                <button class="back-button">← Back to Scripts</button>
            </div>
            <div class="game-progress-header">
                <div class="progress-info">
                    <span class="current-level">Level ${playerLevel}</span>
                    <span class="xp-counter">${currentXP} / ${requiredXP} XP</span>
                </div>
                <div class="xp-progress-bar">
                    <div class="xp-progress" style="width: ${(currentXP / requiredXP) * 100}%"></div>
                </div>
            </div>
            <div class="game-container">
                <div class="letter-display"></div>
                <div class="options-container"></div>
            </div>
            <div class="unlock-progress">
                <div class="letters-known">
                    Characters Known: ${this.activeLetters.length}
                    ${playerLevel >= 26 ? ' (including contractions)' : ''}
                </div>
                ${nextUnlockLevel ? `
                    <div class="next-unlock">
                        ${playerLevel >= 21 ? 'Special contractions' : 'New letters'} unlock at level ${nextUnlockLevel}
                        (${nextUnlockLevel - playerLevel} levels to go)
                    </div>
                ` : ''}
            </div>
        `;

        // Setup back button
        mainContent.querySelector('.back-button').addEventListener('click', () => {
            location.reload();
        });

        this.container = mainContent.querySelector('.game-container');
        this.showQuestion();
    }

    getNextUnlockLevel(currentLevel) {
        const unlockLevels = Object.keys(this.letterSets)
            .map(Number)
            .filter(level => level > currentLevel);
        return unlockLevels.length > 0 ? Math.min(...unlockLevels) : null;
    }

    showQuestion() {
        const currentLetter = this.activeLetters[this.currentIndex];
        
        // Update letter display
        const letterDisplay = this.container.querySelector('.letter-display');
        letterDisplay.innerHTML = `
            <div class="current-letter${currentLetter.char.length > 1 ? ' contraction' : ''}">${currentLetter.char}</div>
            <div class="question">
                ${currentLetter.char.length > 1 ? 'What is this contraction called?' : 'What is this letter called?'}
            </div>
        `;

        // Create options
        const options = this.createOptions(currentLetter);
        const optionsContainer = this.container.querySelector('.options-container');
        optionsContainer.innerHTML = options.map(option => `
            <button class="game-option" data-correct="${option.correct}">
                ${option.text}
            </button>
        `).join('');

        // Add click handlers
        optionsContainer.querySelectorAll('.game-option').forEach(button => {
            button.addEventListener('click', () => this.handleAnswer(button));
        });
    }

    createOptions(correctLetter) {
        const otherLetters = this.activeLetters.filter(l => l !== correctLetter);
        const shuffled = this.shuffle([...otherLetters]);
        const wrongOptions = shuffled.slice(0, 3);
        
        return this.shuffle([
            { text: correctLetter.name, correct: true },
            ...wrongOptions.map(letter => ({ text: letter.name, correct: false }))
        ]);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    handleAnswer(button) {
        const isCorrect = button.dataset.correct === 'true';
        const buttons = this.container.querySelectorAll('.game-option');
        
        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);
        
        // Show result
        button.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // If wrong, show correct answer
        if (!isCorrect) {
            buttons.forEach(btn => {
                if (btn.dataset.correct === 'true') {
                    btn.classList.add('correct');
                }
            });
        }

        // Award XP based on correctness
        if (window.playerProfile) {
            const xpAmount = isCorrect ? 30 : 10;
            const currentLevel = window.playerProfile.profile.skills.arabic.level;
            
            window.playerProfile.addXP(xpAmount, 'arabic');
            
            // Update XP display and level
            const newLevel = window.playerProfile.profile.skills.arabic.level;
            const currentXP = window.playerProfile.profile.skills.arabic.xp;
            const requiredXP = window.playerProfile.getXPRequiredForLevel(newLevel);
            
            const levelDisplay = document.querySelector('.current-level');
            const xpCounter = document.querySelector('.xp-counter');
            const xpProgress = document.querySelector('.xp-progress');
            
            if (levelDisplay) {
                levelDisplay.textContent = `Level ${newLevel}`;
            }
            
            if (xpCounter && xpProgress) {
                xpCounter.textContent = `${currentXP} / ${requiredXP} XP`;
                xpProgress.style.width = `${(currentXP / requiredXP) * 100}%`;
            }
            
            // Check if new letters were unlocked
            if (newLevel > currentLevel) {
                const oldLetterCount = this.activeLetters.length;
                this.updateLetterSet();
                
                if (this.activeLetters.length > oldLetterCount) {
                    this.showNewLettersMessage();
                }
            }
        }

        // Move to next question after delay
        setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % this.activeLetters.length;
            this.showQuestion();
        }, 1500);
    }

    showNewLettersMessage() {
        const message = document.createElement('div');
        message.className = 'new-letters-notification';
        message.innerHTML = 'New letters unlocked! 🎉';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Add click handler to the script button
document.addEventListener('DOMContentLoaded', () => {
    const scriptButton = document.querySelector('.script-button[data-script="arabic"]');
    if (scriptButton) {
        scriptButton.addEventListener('click', () => {
            new ScriptGame().start();
        });
    }
}); 