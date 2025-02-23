class SkillTree {
    constructor() {
        this.scripts = {
            arabic: {
                name: 'Arabic Script',
                languages: {
                    arabic: {
                        name: 'Arabic',
                        skills: {
                            alphabet: {
                                name: 'Alphabet',
                                levels: 5,
                                requirements: [], // No prerequisites
                                exercises: [
                                    // Letter recognition games
                                ]
                            },
                            basics: {
                                name: 'Basic Phrases',
                                levels: 5,
                                requirements: ['alphabet'],
                                exercises: [
                                    // Basic word exercises
                                ]
                            },
                            food: {
                                name: 'Food & Cooking',
                                levels: 5,
                                requirements: ['basics'],
                                exercises: [
                                    // Food-related vocabulary
                                ]
                            },
                            travel: {
                                name: 'Travel',
                                levels: 5,
                                requirements: ['basics'],
                                exercises: [
                                    // Travel-related phrases
                                ]
                            }
                        }
                    },
                    persian: {
                        name: 'Persian',
                        skills: {
                            alphabet: {
                                name: 'Persian Alphabet',
                                levels: 5,
                                requirements: [],
                                exercises: []
                            },
                            // ... more Persian skills
                        }
                    }
                }
            },
            cyrillic: {
                name: 'Cyrillic Script',
                languages: {
                    russian: {
                        name: 'Russian',
                        skills: {
                            // Similar structure for Russian
                        }
                    },
                    ukrainian: {
                        name: 'Ukrainian',
                        skills: {
                            // Similar structure for Ukrainian
                        }
                    }
                }
            }
        };
    }

    getAvailableSkills(script, language, userProgress) {
        const skillTree = this.scripts[script].languages[language].skills;
        const available = {};

        for (const [skillId, skill] of Object.entries(skillTree)) {
            const isAvailable = skill.requirements.every(req => 
                userProgress[req] && userProgress[req].level >= skillTree[req].levels
            );
            
            if (isAvailable) {
                available[skillId] = {
                    ...skill,
                    currentLevel: (userProgress[skillId]?.level || 0),
                    isComplete: (userProgress[skillId]?.level || 0) >= skill.levels
                };
            }
        }

        return available;
    }

    saveProgress(script, language, skillId, progress) {
        const key = `progress_${script}_${language}`;
        const existingProgress = JSON.parse(localStorage.getItem(key) || '{}');
        
        existingProgress[skillId] = progress;
        localStorage.setItem(key, JSON.stringify(existingProgress));
    }
}

class SkillTreeUI {
    constructor() {
        this.scriptsGrid = document.querySelector('.scripts-grid');
        this.skillTree = document.querySelector('.skill-tree');
        this.backButton = document.querySelector('.back-button');
        this.progressContainer = document.getElementById('progress-container');
        this.whatsNewSection = document.querySelector('.whats-new-section');
        
        // Define skill trees data structure
        this.skillTrees = {
            arabic: {
                name: 'Arabic Script',
                skills: [
                    [
                        { id: 'basic1', name: 'Basic 1', icon: 'ا', description: 'Learn basic letters' },
                        { id: 'basic2', name: 'Basic 2', icon: 'ب', description: 'Continue with basics' },
                        { id: 'basic3', name: 'Basic 3', icon: 'ت', description: 'More letters' }
                    ],
                    [
                        { id: 'intermediate1', name: 'Intermediate 1', icon: 'ث', description: 'Advanced letters' },
                        { id: 'intermediate2', name: 'Intermediate 2', icon: 'ج', description: 'Complex forms' }
                    ]
                ]
            },
            cyrillic: {
                name: 'Cyrillic Script',
                skills: [
                    [
                        { id: 'cyrillic1', name: 'Basic 1', icon: 'А', description: 'Learn basic letters' },
                        { id: 'cyrillic2', name: 'Basic 2', icon: 'Б', description: 'Continue with basics' },
                        { id: 'cyrillic3', name: 'Basic 3', icon: 'В', description: 'More letters' }
                    ]
                ]
            }
        };

        this.setupEventListeners();
        this.updateProfileSidebar();
    }

    setupEventListeners() {
        document.querySelectorAll('.script-card').forEach(card => {
            card.addEventListener('click', () => this.showSkillTree(card.dataset.script));
        });

        this.backButton.addEventListener('click', () => this.showScriptGrid());
    }

    showScriptGrid() {
        this.scriptsGrid.style.display = 'grid';
        this.skillTree.style.display = 'none';
        this.backButton.style.display = 'none';
        if (this.whatsNewSection) {
            this.whatsNewSection.style.display = 'block';
        }
    }

    showSkillTree(scriptId) {
        this.scriptsGrid.style.display = 'none';
        this.skillTree.style.display = 'flex';
        this.backButton.style.display = 'block';
        if (this.whatsNewSection) {
            this.whatsNewSection.style.display = 'none';
        }
        this.currentScript = scriptId;
        this.renderSkillTree(scriptId);
    }

    renderSkillTree(scriptId) {
        const script = this.skillTrees[scriptId];
        const skillTreeHTML = script.skills.map((row, rowIndex) => `
            <div class="skill-row">
                ${row.map(skill => {
                    const progress = this.getSkillProgress(scriptId, skill.id);
                    const isAvailable = rowIndex === 0 || this.isPreviousRowCompleted(scriptId, rowIndex);
                    return this.renderSkillNode(skill, isAvailable, progress.level > 0);
                }).join('')}
            </div>
        `).join('');

        this.skillTree.innerHTML = skillTreeHTML;
        this.addSkillClickHandlers();
    }

    renderSkillNode(skill, isAvailable, isCompleted) {
        const status = isCompleted ? 'completed' : (isAvailable ? 'available' : 'locked');
        const level = this.getSkillLevel(this.currentScript, skill.id);
        
        return `
            <div class="skill-node ${status}" data-skill-id="${skill.id}">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                ${level > 0 ? `<div class="skill-progress">Level ${level}</div>` : ''}
            </div>
        `;
    }

    isPreviousRowCompleted(scriptId, rowIndex) {
        const previousRow = this.skillTrees[scriptId].skills[rowIndex - 1];
        return previousRow.some(skill => {
            const progress = this.getSkillProgress(scriptId, skill.id);
            return progress.level > 0;
        });
    }

    getSkillProgress(scriptId, skillId) {
        const progress = localStorage.getItem(`progress_${scriptId}_${skillId}`);
        return progress ? JSON.parse(progress) : { level: 0 };
    }

    getSkillLevel(scriptId, skillId) {
        const progress = this.getSkillProgress(scriptId, skillId);
        return progress.level || 0;
    }

    updateProfileSidebar() {
        const scripts = Object.keys(this.skillTrees);
        const progressHTML = scripts.map(scriptId => {
            const scriptProgress = this.getScriptProgress(scriptId);
            return `
                <div class="progress-item">
                    <div class="script-info">
                        <span class="script-icon">${scriptId === 'arabic' ? 'ا' : 'Я'}</span>
                        <span>${this.skillTrees[scriptId].name}</span>
                    </div>
                    <div class="progress-level">Level ${scriptProgress.level}</div>
                </div>
                ${this.getSkillProgressHTML(scriptId)}
            `;
        }).join('');

        this.progressContainer.innerHTML = `
            <div class="progress-list">
                ${progressHTML}
            </div>
        `;
    }

    getSkillProgressHTML(scriptId) {
        return this.skillTrees[scriptId].skills.flat().map(skill => {
            const progress = this.getSkillProgress(scriptId, skill.id);
            return `
                <div class="progress-item sub-skill">
                    <div class="skill-info">
                        <span class="skill-icon">${skill.icon}</span>
                        <span>${skill.name}</span>
                    </div>
                    <div class="progress-level">Level ${progress.level}</div>
                </div>
            `;
        }).join('');
    }

    getScriptProgress(scriptId) {
        const skills = this.skillTrees[scriptId].skills.flat();
        let totalLevel = 0;
        skills.forEach(skill => {
            const progress = this.getSkillProgress(scriptId, skill.id);
            totalLevel += progress.level;
        });
        return { level: Math.floor(totalLevel / skills.length) };
    }

    addSkillClickHandlers() {
        document.querySelectorAll('.skill-node').forEach(node => {
            node.addEventListener('click', () => {
                if (node.classList.contains('locked')) {
                    alert('Complete the required skills first!');
                    return;
                }
                this.startGame(node.dataset.skillId);
            });
        });
    }

    startGame(skillId) {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-container';
        
        gameContainer.innerHTML = `
            <button class="game-exit-button">×</button>
            <div class="game-header">Practice</div>
            <div class="game-content">
                <div class="game-progress"></div>
                <div class="letter-display"></div>
                <div class="options-container"></div>
            </div>
        `;
        
        document.body.appendChild(gameContainer);
        
        new ScriptLearningGame(gameContainer, this.currentScript, skillId);
        
        gameContainer.querySelector('.game-exit-button').addEventListener('click', () => {
            gameContainer.remove();
            this.updateProfileSidebar();
        });
    }
}

class ScriptLearningGame {
    constructor(options) {
        this.container = options.container;
        this.script = options.script;
        this.onComplete = options.onComplete;
        this.onExit = options.onExit;
        
        // Initialize level and XP
        const savedProgress = localStorage.getItem(`progress_${this.script}_${this.script}_script`);
        const progress = savedProgress ? JSON.parse(savedProgress) : { level: 0, xp: 0 };
        this.currentLevel = progress.level;
        this.xp = progress.xp || 0;
        
        // Check for Persian unlock
        if (this.script === 'arabic') {
            const hasUnlockedPersian = this.checkPersianUnlock();
            if (hasUnlockedPersian) {
                this.letters = [...this.getArabicLetters(), ...this.getPersianLetters()];
            } else {
                this.letters = this.getArabicLetters();
            }
        } else {
            this.letters = this.getLetterSet();
        }
        this.currentIndex = 0;

        // Create progress display
        this.createProgressDisplay();
        
        // Start the game
        this.showNextLetter();
        this.setupEventListeners();
    }

    createProgressDisplay() {
        const progressSection = document.createElement('div');
        progressSection.className = 'game-progress-section';
        progressSection.innerHTML = `
            <div class="level-display">Level ${this.currentLevel}</div>
            <div class="xp-bar-container">
                <div class="xp-bar" style="width: ${(this.xp % 100)}%"></div>
            </div>
            <div class="xp-text">${this.xp % 100}/100 XP</div>
            <div class="letters-info">
                Learning letters ${1 + Math.floor(this.currentLevel / 5) * 5} - ${Math.min(5 + Math.floor(this.currentLevel / 5) * 5, this.letters.length)}
                of ${this.letters.length}
            </div>
        `;
        
        // Insert at the top of the game container
        this.container.insertBefore(progressSection, this.container.firstChild);
    }

    updateProgressDisplay() {
        const progress = this.getCurrentLevelProgress();
        const progressSection = this.container.querySelector('.game-progress-section');
        
        progressSection.innerHTML = `
            <div class="level-display">Level ${this.currentLevel}</div>
            <div class="xp-bar-container">
                <div class="xp-bar" style="width: ${progress.percentage}%"></div>
            </div>
            <div class="xp-text">${progress.current}/${progress.needed} XP</div>
            <div class="letters-info">
                Learning letters ${1 + Math.floor(this.currentLevel / 5) * 5} - ${Math.min(5 + Math.floor(this.currentLevel / 5) * 5, this.letters.length)}
                of ${this.letters.length}
            </div>
        `;
    }

    getLetterSet() {
        if (this.script === 'arabic') {
            const letters = this.getArabicLetters();
            if (this.checkPersianUnlock()) {
                return [...letters, ...this.getPersianLetters()];
            }
            return letters;
        }
        
        // Other scripts remain the same
        const letters = {
            cyrillic: [
                { char: 'А', name: 'A' },
                { char: 'Б', name: 'Be' },
                { char: 'В', name: 'Ve' },
                // ... existing Cyrillic letters ...
            ]
        };
        return letters[this.script] || [];
    }

    getArabicLetters() {
        return [
            // Level 0-4: First 5 letters
            { char: 'ا', name: 'Alif' },
            { char: 'ب', name: 'Baa' },
            { char: 'ت', name: 'Taa' },
            { char: 'ث', name: 'Thaa' },
            { char: 'ج', name: 'Jeem' },
            // Level 5-9: Next 5 letters
            { char: 'ح', name: 'Haa' },
            { char: 'خ', name: 'Khaa' },
            { char: 'د', name: 'Dal' },
            { char: 'ذ', name: 'Thal' },
            { char: 'ر', name: 'Raa' },
            // Level 10-14: Next 5 letters
            { char: 'ز', name: 'Zay' },
            { char: 'س', name: 'Seen' },
            { char: 'ش', name: 'Sheen' },
            { char: 'ص', name: 'Sad' },
            { char: 'ض', name: 'Dad' },
            // Level 15-19: Next 5 letters
            { char: 'ط', name: 'Taa' },
            { char: 'ظ', name: 'Thaa' },
            { char: 'ع', name: 'Ayn' },
            { char: 'غ', name: 'Ghayn' },
            { char: 'ف', name: 'Faa' },
            // Level 20-24: Next 5 letters
            { char: 'ق', name: 'Qaf' },
            { char: 'ك', name: 'Kaf' },
            { char: 'ل', name: 'Lam' },
            { char: 'م', name: 'Meem' },
            { char: 'ن', name: 'Noon' },
            // Level 25-29: Next 3 letters
            { char: 'ه', name: 'Haa' },
            { char: 'و', name: 'Waw' },
            { char: 'ي', name: 'Yaa' },
            // Level 30-34: Persian letters
            { char: 'پ', name: 'Pe' },
            { char: 'چ', name: 'Che' },
            { char: 'ژ', name: 'Zhe' },
            { char: 'گ', name: 'Gaf' },
            // Level 35-39: First 5 numbers
            { char: '٠', name: 'Zero (Sifr)' },
            { char: '١', name: 'One (Wahid)' },
            { char: '٢', name: 'Two (Ithnan)' },
            { char: '٣', name: 'Three (Thalatha)' },
            { char: '٤', name: 'Four (Arba\'a)' },
            // Level 40-44: Last 5 numbers
            { char: '٥', name: 'Five (Khamsa)' },
            { char: '٦', name: 'Six (Sitta)' },
            { char: '٧', name: 'Seven (Sab\'a)' },
            { char: '٨', name: 'Eight (Thamaniya)' },
            { char: '٩', name: 'Nine (Tis\'a)' },
            // Level 45-49: Letter combinations
            { 
                char: 'لا', 
                name: 'Lam-Alif', 
                description: 'Common combination of Lam (ل) and Alif (ا)',
                forms: {
                    isolated: 'لا',
                    initial: 'لا',
                    medial: 'لا',
                    final: 'لا'
                }
            },
            { 
                char: 'لم', 
                name: 'Lam-Meem',
                description: 'Common combination of Lam (ل) and Meem (م)',
                forms: {
                    isolated: 'لم',
                    initial: 'لم',
                    medial: 'لم',
                    final: 'لم'
                }
            }
        ];
    }

    getPersianLetters() {
        return [
            { char: 'پ', name: 'Pe' },
            { char: 'چ', name: 'Che' },
            { char: 'ژ', name: 'Zhe' },
            { char: 'گ', name: 'Gaf' }
        ];
    }

    checkPersianUnlock() {
        const progress = localStorage.getItem(`progress_arabic_arabic_script`);
        if (!progress) return false;
        
        const { level } = JSON.parse(progress);
        return level >= 50;
    }

    getAvailableLetters() {
        const allLetters = this.getLetterSet();
        const availableCount = Math.min(5 + Math.floor(this.currentLevel / 5) * 5, allLetters.length);
        return allLetters.slice(0, availableCount);
    }

    showNextLetter() {
        if (this.currentIndex >= this.letters.length) {
            this.currentIndex = 0; // Reset to start if we've gone through all letters
        }

        const letter = this.letters[this.currentIndex];
        const letterDisplay = this.container.querySelector('.letter-display');
        const optionsContainer = this.container.querySelector('.options-container');

        letterDisplay.innerHTML = `
            <div class="current-letter">${letter.char}</div>
            <div class="progress-info">Letter ${this.currentIndex + 1} of ${this.letters.length}</div>
        `;

        const options = this.createOptions(letter);
        optionsContainer.innerHTML = options.map(option => `
            <button class="option-button" data-correct="${option.correct}">
                ${option.text}
            </button>
        `).join('');
    }

    createOptions(correctLetter) {
        // Get all letter names except the correct one from currently available letters
        const otherLetters = this.letters
            .filter(l => l.name !== correctLetter.name)
            .map(l => l.name);
        
        // Randomly select 3 wrong answers
        const wrongOptions = this.shuffleArray(otherLetters)
            .slice(0, 3)
            .map(name => ({ text: name, correct: false }));
        
        // Add correct answer and shuffle
        const options = [
            { text: correctLetter.name, correct: true },
            ...wrongOptions
        ];
        
        return this.shuffleArray(options);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    setupEventListeners() {
        this.container.addEventListener('click', (e) => {
            if (!e.target.classList.contains('option-button') || e.target.disabled) return;
            
            const isCorrect = e.target.dataset.correct === 'true';
            const buttons = this.container.querySelectorAll('.option-button');
            
            // Disable all buttons temporarily
            buttons.forEach(button => button.disabled = true);
            
            // Show correct/incorrect feedback
            e.target.classList.add(isCorrect ? 'correct' : 'incorrect');
            if (!isCorrect) {
                buttons.forEach(button => {
                    if (button.dataset.correct === 'true') {
                        button.classList.add('correct');
                    }
                });
            }

            // Update progress
            if (isCorrect) {
                this.correctAnswers++;
                const xpGain = 10;
                this.currentXP += xpGain;
                
                if (this.currentXP >= this.xpNeeded) {
                    this.currentLevel++;
                    this.currentXP = 0;
                    this.xpNeeded = this.calculateXPNeeded(this.currentLevel);
                    this.showLevelUpMessage();
                }
            }
            
            // Update display
            this.updateProgressDisplay();

            // Proceed to next question after delay
            setTimeout(() => {
                this.currentIndex++;
                this.showNextLetter();
                // Re-enable buttons for next question
                buttons.forEach(button => {
                    button.disabled = false;
                    button.classList.remove('correct', 'incorrect');
                });
            }, 1500);
        });
    }

    showXPGain(amount, targetElement) {
        const xpText = document.createElement('div');
        xpText.className = 'xp-gain';
        xpText.textContent = `+${amount} XP`;
        
        const rect = targetElement.getBoundingClientRect();
        xpText.style.left = `${rect.left + rect.width/2}px`;
        xpText.style.top = `${rect.top}px`;
        
        document.body.appendChild(xpText);
        setTimeout(() => xpText.remove(), 1000);
    }

    showLevelUpMessage() {
        const message = document.createElement('div');
        message.className = 'level-up-message';
        
        let newContent;
        if (this.currentLevel >= 45) {
            newContent = 'letter combinations';
        } else if (this.currentLevel >= 35) {
            newContent = 'numbers';
        } else {
            newContent = 'letters';
        }
        
        message.innerHTML = `
            <h2>Level Up!</h2>
            <p>You reached Level ${this.currentLevel}</p>
            ${this.currentLevel % 5 === 0 ? 
                `<p>New ${newContent} unlocked!</p>` : 
                ''}
        `;
        this.container.appendChild(message);
        
        setTimeout(() => message.remove(), 3000);
    }

    getXPForNextLevel() {
        // Base XP needed is 100, increases by 25% each level
        return Math.floor(100 * Math.pow(1.25, this.currentLevel));
    }

    getCurrentLevelProgress() {
        const xpForCurrentLevel = Math.floor(100 * Math.pow(1.25, this.currentLevel - 1)) || 0;
        const xpForNextLevel = this.getXPForNextLevel();
        const currentLevelXP = this.xp - xpForCurrentLevel;
        const neededXP = xpForNextLevel - xpForCurrentLevel;
        
        return {
            current: currentLevelXP,
            needed: neededXP,
            percentage: (currentLevelXP / neededXP) * 100
        };
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SkillTreeUI();
});

// Initialize player profile
const playerProfile = new PlayerProfile();