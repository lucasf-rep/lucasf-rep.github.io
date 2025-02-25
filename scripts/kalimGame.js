class KalimGame {
    constructor() {
        this.words = [
            { word: 'خانه', meaning: 'house' },
            { word: 'کتاب', meaning: 'book' },
            { word: 'مدرسه', meaning: 'school' },
            { word: 'دانش', meaning: 'knowledge' },
            { word: 'دوست', meaning: 'friend' },
            { word: 'ماشین', meaning: 'car' },
            { word: 'خیابان', meaning: 'street' },
            { word: 'قهوه', meaning: 'coffee' },
            { word: 'برنج', meaning: 'rice' },
            { word: 'میوه', meaning: 'fruit' },
            { word: 'گوشت', meaning: 'meat' },
            { word: 'ماهی', meaning: 'fish' },
            { word: 'خورشید', meaning: 'sun' },
            { word: 'دریا', meaning: 'sea' },
            { word: 'جنگل', meaning: 'forest' },
            { word: 'باران', meaning: 'rain' },
            { word: 'مادر', meaning: 'mother' },
            { word: 'پدر', meaning: 'father' },
            { word: 'برادر', meaning: 'brother' },
            { word: 'خواهر', meaning: 'sister' },
            { word: 'دوستان', meaning: 'friends' },
            { word: 'نوزاد', meaning: 'baby' },
            { word: 'داشتن', meaning: 'to have' },
            { word: 'رفتن', meaning: 'to go' },
            { word: 'دیدن', meaning: 'to see' },
            { word: 'گفتن', meaning: 'to say' },
            { word: 'خواندن', meaning: 'to read' },
            { word: 'نوشتن', meaning: 'to write' },
            { word: 'آمدن', meaning: 'to come' },
            { word: 'خوردن', meaning: 'to eat' },
            { word: 'دویدن', meaning: 'to run' },
            { word: 'زیبا', meaning: 'beautiful' },
            { word: 'کوتاه', meaning: 'short' },
            { word: 'بلند', meaning: 'tall/long' },
            { word: 'بزرگ', meaning: 'big' },
            { word: 'کوچک', meaning: 'small' },
            { word: 'قدیمی', meaning: 'old' },
            { word: 'امروز', meaning: 'today' },
            { word: 'دیروز', meaning: 'yesterday' },
            { word: 'فردا', meaning: 'tomorrow' },
            { word: 'ساعت', meaning: 'hour/clock' },
            { word: 'دقیقه', meaning: 'minute' },
            { word: 'هفته', meaning: 'week' },
            { word: 'دیوار', meaning: 'wall' },
            { word: 'صندلی', meaning: 'chair' },
            { word: 'پنجره', meaning: 'window' },
            { word: 'کلید', meaning: 'key' },
            { word: 'خوشحال', meaning: 'happy' },
            { word: 'ناراحت', meaning: 'sad' },
            { word: 'عشق', meaning: 'love' },
            { word: 'امید', meaning: 'hope' },
            { word: 'دوستی', meaning: 'friendship' },
            { word: 'خستگی', meaning: 'tiredness' },
            { word: 'متشکرم', meaning: 'thank you' },
            { word: 'ببخشید', meaning: 'excuse me/sorry' }
        ];
        this.currentWordObj = null;
        this.currentRow = 0;
        this.currentCell = 0;
        this.wordLength = 0;
        this.gameOver = false;
        
        // Ensure player profile is initialized before the game
        if (!window.playerProfile) {
            window.playerProfile = new PlayerProfile();
        }
        
        this.initializeGame();
        this.setupKeyboard();
        this.setupSolutionDisplay();
    }

    initializeGame() {
        this.currentWordObj = this.words[Math.floor(Math.random() * this.words.length)];
        this.wordLength = [...this.currentWordObj.word].length;
        console.log('Target word:', this.currentWordObj.word, 'Length:', this.wordLength);
        
        this.setupGameBoard();
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setupSolutionDisplay() {
        let solutionDisplay = document.querySelector('.solution-display');
        if (!solutionDisplay) {
            solutionDisplay = document.createElement('div');
            solutionDisplay.className = 'solution-display';
            
            // Insert before the game board instead of after
            const gameBoard = document.querySelector('.game-board');
            gameBoard.parentElement.insertBefore(solutionDisplay, gameBoard);
        }
    }

    showSolution() {
        const solutionDisplay = document.querySelector('.solution-display');
        solutionDisplay.innerHTML = `
            <div class="solution-word">${this.currentWordObj.word}</div>
            <div class="solution-meaning">${this.currentWordObj.meaning}</div>
        `;
        solutionDisplay.style.display = 'block';
        
        // Scroll solution into view
        solutionDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setupGameBoard() {
        const gameBoard = document.querySelector('.game-board');
        gameBoard.innerHTML = '';
        gameBoard.style.direction = 'rtl'; // Set RTL direction
        
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'word-row';
            
            for (let j = 0; j < this.wordLength; j++) {
                const cell = document.createElement('div');
                cell.className = 'letter-cell';
                row.appendChild(cell);
            }
            
            gameBoard.appendChild(row);
        }
    }

    setupKeyboard() {
        const keyboard = document.querySelector('.kalim-keyboard');
        keyboard.style.direction = 'rtl'; // Set RTL direction
        
        const farsiKeys = [
            ['چ', 'ج', 'ح', 'خ', 'ه', 'ع', 'غ', 'ف', 'ق', 'ث', 'ص', 'ض'],
            ['گ', 'ک', 'م', 'ن', 'ت', 'ا', 'ل', 'ب', 'ی', 'س', 'ش'],
            ['و', 'پ', 'د', 'ذ', 'ر', 'ز', 'ط', 'ظ']
        ];

        keyboard.innerHTML = '';

        farsiKeys.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(key => {
                const button = document.createElement('button');
                button.className = 'key';
                button.textContent = key;
                button.addEventListener('click', () => this.handleInput(key));
                rowDiv.appendChild(button);
            });
            
            keyboard.appendChild(rowDiv);
        });

        // Add Enter and Backspace in RTL order
        const actionRow = document.createElement('div');
        actionRow.className = 'keyboard-row';
        
        const backspaceKey = document.createElement('button');
        backspaceKey.className = 'key action-key';
        backspaceKey.textContent = '←';
        backspaceKey.addEventListener('click', () => this.handleBackspace());
        
        const enterKey = document.createElement('button');
        enterKey.className = 'key action-key';
        enterKey.textContent = 'Enter';
        enterKey.addEventListener('click', () => this.checkWord());
        
        actionRow.appendChild(backspaceKey);
        actionRow.appendChild(enterKey);
        keyboard.appendChild(actionRow);
    }

    handleInput(letter) {
        if (this.gameOver) return;
        if (this.currentCell >= this.wordLength) return;

        const rows = document.querySelectorAll('.word-row');
        const currentRowCells = Array.from(rows[this.currentRow].querySelectorAll('.letter-cell'));
        
        // Fill cells from right to left
        currentRowCells[this.currentCell].textContent = letter;
        this.currentCell++;
    }

    handleBackspace() {
        if (this.gameOver) return;
        if (this.currentCell <= 0) return;

        this.currentCell--;
        const rows = document.querySelectorAll('.word-row');
        const currentRowCells = Array.from(rows[this.currentRow].querySelectorAll('.letter-cell'));
        currentRowCells[this.currentCell].textContent = '';
    }

    handleKeyPress(e) {
        if (this.gameOver) return;

        if (e.key === 'Enter') {
            this.checkWord();
        } else if (e.key === 'Backspace') {
            this.handleBackspace();
        }
    }

    checkWord() {
        if (this.gameOver) return;
        if (this.currentCell !== this.wordLength) {
            alert('Complete the word first!');
            return;
        }

        const rows = document.querySelectorAll('.word-row');
        const currentRowCells = Array.from(rows[this.currentRow].querySelectorAll('.letter-cell'));
        const guess = currentRowCells.map(cell => cell.textContent).join('');
        
        const wordArray = [...this.currentWordObj.word];
        const results = new Array(this.wordLength).fill('incorrect');

        // First pass: check for correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guess[i] === wordArray[i]) {
                results[i] = 'correct';
                wordArray[i] = null;
            }
        }

        // Second pass: check for wrong positions
        for (let i = 0; i < this.wordLength; i++) {
            if (results[i] !== 'correct') {
                const index = wordArray.indexOf(guess[i]);
                if (index !== -1) {
                    results[i] = 'wrong-position';
                    wordArray[index] = null;
                }
            }
        }

        // Apply results with animation
        results.forEach((result, i) => {
            setTimeout(() => {
                currentRowCells[i].classList.add(result);
            }, i * 100);
        });

        // Check if won
        if (guess === this.currentWordObj.word) {
            this.gameOver = true;
            setTimeout(() => {
                this.showSolution();
                // Update XP and ensure UI updates
                if (window.playerProfile) {
                    window.playerProfile.addXP(50, 'farsi-words');
                    window.playerProfile.updateUI(); // Force UI update
                }
            }, 600);
            return;
        }

        // Move to next row or end game
        this.currentRow++;
        this.currentCell = 0;

        if (this.currentRow >= 6) {
            this.gameOver = true;
            setTimeout(() => {
                this.showSolution();
                // Update XP and ensure UI updates
                if (window.playerProfile) {
                    window.playerProfile.addXP(10, 'farsi-words');
                    window.playerProfile.updateUI(); // Force UI update
                }
            }, 600);
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Ensure player profile is loaded first
    if (!window.playerProfile) {
        window.playerProfile = new PlayerProfile();
    }
    new KalimGame();
}); 