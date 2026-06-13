// Game Manager
let currentGame = null;
let gameRunning = false;

// Navigation
function showHome() {
    hideAllSections();
    document.getElementById('home-section').classList.add('active');
}

function scrollToGames() {
    hideAllSections();
    document.getElementById('games-section').classList.add('active');
    document.getElementById('games-section').scrollIntoView({ behavior: 'smooth' });
}

function hideAllSections() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
}

function loadGame(gameName) {
    hideAllSections();
    document.getElementById('game-section').style.display = 'block';
    
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    gameRunning = true;
    currentGame = gameName;
    
    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    switch(gameName) {
        case 'flappy':
            new FlappyGame(canvas);
            break;
        case 'puzzle':
            new PuzzleGame(canvas);
            break;
        case 'quiz':
            new QuizGame(canvas);
            break;
        case 'clicker':
            new ClickerGame(canvas);
            break;
        case 'memory':
            new MemoryGame(canvas);
            break;
        case 'snake':
            new SnakeGame(canvas);
            break;
        case 'platformer':
            new PlatformerGame(canvas);
            break;
        case 'breakout':
            new BreakoutGame(canvas);
            break;
    }
}

function backToGames() {
    gameRunning = false;
    document.getElementById('game-section').style.display = 'none';
    hideAllSections();
    document.getElementById('games-section').classList.add('active');
}

// ==================== GAME 1: FLAPPY ====================
class FlappyGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.bird = { x: 100, y: 150, width: 30, height: 30, velocity: 0 };
        this.gravity = 0.5;
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        
        this.canvas.addEventListener('click', () => this.jump());
        this.canvas.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.jump();
        });
        
        this.createPipe();
        this.gameLoop();
        this.updateInfo('Flappy Fly - Klik for at flyve!');
    }
    
    jump() {
        this.bird.velocity = -12;
    }
    
    createPipe() {
        const gap = 120;
        const minHeight = 50;
        const maxHeight = this.canvas.height - gap - 50;
        const pipeHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: pipeHeight,
            width: 60,
            passed: false
        });
    }
    
    gameLoop = () => {
        if (!gameRunning) return;
        
        // Update bird
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        
        // Create new pipes
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 200) {
            this.createPipe();
        }
        
        // Update pipes
        this.pipes.forEach(pipe => {
            pipe.x -= 6;
            
            if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
                this.score++;
                pipe.passed = true;
            }
        });
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0);
        
        // Collision detection
        this.pipes.forEach(pipe => {
            const gap = 120;
            const bottomPipeY = pipe.topHeight + gap;
            
            if (this.bird.x + this.bird.width > pipe.x &&
                this.bird.x < pipe.x + pipe.width) {
                if (this.bird.y < pipe.topHeight || this.bird.y + this.bird.height > bottomPipeY) {
                    this.gameOver = true;
                }
            }
        });
        
        if (this.bird.y > this.canvas.height || this.bird.y < 0) {
            this.gameOver = true;
        }
        
        // Draw
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pipes
        this.ctx.fillStyle = '#228B22';
        this.pipes.forEach(pipe => {
            this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
            this.ctx.fillRect(pipe.x, pipe.topHeight + 120, pipe.width, this.canvas.height);
        });
        
        // Draw bird
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        
        // Draw score
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('Score: ' + this.score, 20, 40);
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 30);
            return;
        }
        
        requestAnimationFrame(this.gameLoop);
    }
    
    updateInfo(text) {
        document.getElementById('game-info').innerHTML = `<p>${text}</p>`;
    }
}

// ==================== GAME 2: PUZZLE ====================
class PuzzleGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.puzzles = [
            { question: '2 + 2 = ?', answer: 4 },
            { question: '10 - 3 = ?', answer: 7 },
            { question: '5 × 3 = ?', answer: 15 }
        ];
        this.currentPuzzle = 0;
        this.score = 0;
        
        this.drawPuzzle();
        document.getElementById('game-info').innerHTML = `
            <p>Puzzle Master - Løs ligningerne!</p>
            <input type="number" id="answer" placeholder="Dit svar">
            <button onclick="window.currentPuzzleGame.checkAnswer()">Indsend</button>
            <p>Score: ${this.score}</p>
        `;
        
        window.currentPuzzleGame = this;
    }
    
    drawPuzzle() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentPuzzle < this.puzzles.length) {
            const puzzle = this.puzzles[this.currentPuzzle];
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(puzzle.question, this.canvas.width / 2, this.canvas.height / 2);
        } else {
            this.ctx.font = 'bold 48px Arial';
            this.ctx.fillStyle = '#228B22';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tillykke!', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.font = '32px Arial';
            this.ctx.fillText('Du løste alle puslespil!', this.canvas.width / 2, this.canvas.height / 2 + 30);
            this.ctx.fillText('Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 80);
        }
    }
    
    checkAnswer() {
        const input = document.getElementById('answer');
        const answer = parseInt(input.value);
        
        if (answer === this.puzzles[this.currentPuzzle].answer) {
            this.score++;
            this.currentPuzzle++;
            input.value = '';
            this.drawPuzzle();
            document.getElementById('game-info').innerHTML = `
                <p>Puzzle Master</p>
                <input type="number" id="answer" placeholder="Dit svar">
                <button onclick="window.currentPuzzleGame.checkAnswer()">Indsend</button>
                <p style="color: green;">✓ Korrekt!</p>
                <p>Score: ${this.score}</p>
            `;
        } else {
            document.getElementById('game-info').innerHTML = `
                <p>Puzzle Master</p>
                <input type="number" id="answer" placeholder="Dit svar">
                <button onclick="window.currentPuzzleGame.checkAnswer()">Indsend</button>
                <p style="color: red;">✗ Forkert. Prøv igen!</p>
                <p>Score: ${this.score}</p>
            `;
        }
    }
}

// ==================== GAME 3: QUIZ ====================
class QuizGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.questions = [
            {
                q: 'Hvad er Danmarks hovedstad?',
                options: ['Aarhus', 'København', 'Odense'],
                correct: 1
            },
            {
                q: 'Hvad er 7 + 5?',
                options: ['11', '12', '13'],
                correct: 1
            },
            {
                q: 'Hvilket år blev Danmark medlem af EU?',
                options: ['1973', '1995', '2004'],
                correct: 0
            }
        ];
        
        this.currentQuestion = 0;
        this.score = 0;
        this.showQuestion();
    }
    
    showQuestion() {
        const q = this.questions[this.currentQuestion];
        
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(q.q, this.canvas.width / 2, 80);
        
        let html = '<p>Quiz Challenge</p>';
        q.options.forEach((opt, i) => {
            html += `<button onclick="window.currentQuizGame.selectAnswer(${i})" style="display:block; margin: 10px auto; padding: 10px 20px;">${opt}</button>`;
        });
        html += `<p>Spørgsmål ${this.currentQuestion + 1}/${this.questions.length}</p>`;
        document.getElementById('game-info').innerHTML = html;
        
        window.currentQuizGame = this;
    }
    
    selectAnswer(index) {
        if (index === this.questions[this.currentQuestion].correct) {
            this.score++;
        }
        
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    }
    
    showResults() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#228B22';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Quiz Færdig!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#000';
        this.ctx.font = '36px Arial';
        this.ctx.fillText(`Score: ${this.score}/${this.questions.length}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        document.getElementById('game-info').innerHTML = `<p>Quiz Challenge - Du fik ${this.score}/${this.questions.length} rigtige!</p>`;
    }
}

// ==================== GAME 4: CLICKER ====================
class ClickerGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.clicks = 0;
        this.clickPower = 1;
        this.autoClickerCost = 50;
        this.autoClickers = 0;
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x > 150 && x < 350 && y > 150 && y < 300) {
                this.clicks += this.clickPower;
            }
        });
        
        this.gameLoop();
    }
    
    buyAutoClicker() {
        if (this.clicks >= this.autoClickerCost) {
            this.clicks -= this.autoClickerCost;
            this.autoClickers++;
            this.autoClickerCost = Math.floor(this.autoClickerCost * 1.15);
        }
    }
    
    gameLoop = () => {
        if (!gameRunning) return;
        
        // Auto clicker
        this.clicks += this.autoClickers * 0.016;
        
        // Draw
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw button
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(150, 150, 200, 150);
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('KLIK MIG!', 250, 230);
        
        // Draw stats
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Clicks: ' + Math.floor(this.clicks), 20, 40);
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Auto-Clickers: ' + this.autoClickers, 20, 70);
        this.ctx.fillText('Click Power: ' + this.clickPower, 20, 100);
        
        // Update game info
        document.getElementById('game-info').innerHTML = `
            <p>Click Tycoon - Idle Spil</p>
            <button onclick="window.currentClickerGame.buyAutoClicker()" style="padding: 10px 20px;">Køb Auto-Clicker - ${Math.floor(window.currentClickerGame.autoClickerCost)} clicks</button>
            <p>Du har: ${Math.floor(this.clicks)} clicks</p>
        `;
        
        window.currentClickerGame = this;
        requestAnimationFrame(this.gameLoop);
    }
}

// ==================== GAME 5: MEMORY ====================
class MemoryGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cards = [];
        this.flipped = [];
        this.matched = 0;
        this.moves = 0;
        
        const symbols = ['🌟', '🎮', '🎨', '🎵', '🔥', '⚡', '🎯', '🏆'];
        const deck = [...symbols, ...symbols];
        
        for (let i = 0; i < deck.length; i++) {
            this.cards.push({ symbol: deck[i], flipped: false, matched: false });
        }
        
        // Shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.draw();
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cols = 4;
        const cardWidth = this.canvas.width / cols;
        const cardHeight = 100;
        
        const col = Math.floor(x / cardWidth);
        const row = Math.floor(y / cardHeight);
        const index = row * cols + col;
        
        if (index < this.cards.length && !this.cards[index].matched && !this.flipped.includes(index)) {
            this.flipped.push(index);
            
            if (this.flipped.length === 2) {
                this.moves++;
                
                if (this.cards[this.flipped[0]].symbol === this.cards[this.flipped[1]].symbol) {
                    this.cards[this.flipped[0]].matched = true;
                    this.cards[this.flipped[1]].matched = true;
                    this.matched += 2;
                    this.flipped = [];
                } else {
                    setTimeout(() => this.flipped = [], 1000);
                }
            }
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cols = 4;
        const cardWidth = this.canvas.width / cols;
        const cardHeight = 100;
        
        this.cards.forEach((card, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = col * cardWidth;
            const y = row * cardHeight;
            
            this.ctx.fillStyle = card.matched ? '#90EE90' : '#667eea';
            this.ctx.fillRect(x + 5, y + 5, cardWidth - 10, cardHeight - 10);
            
            if (this.flipped.includes(i) || card.matched) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '40px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(card.symbol, x + cardWidth / 2, y + cardHeight / 2);
            }
        });
        
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Moves: ' + this.moves, 20, this.canvas.height - 10);
        
        if (this.matched === this.cards.length) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Du vandt!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Antal træk: ' + this.moves, this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
        
        document.getElementById('game-info').innerHTML = `<p>Memory Match - Find de matchende par! Antal træk: ${this.moves}</p>`;
    }
}

// ==================== GAME 6: SNAKE ====================
class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)), y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)) };
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameOver = false;
        
        document.addEventListener('keydown', (e) => this.handleInput(e));
        this.gameLoop();
    }
    
    handleInput(e) {
        switch(e.key) {
            case 'ArrowUp': if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 }; break;
            case 'ArrowDown': if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 }; break;
            case 'ArrowLeft': if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 }; break;
            case 'ArrowRight': if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 }; break;
        }
    }
    
    gameLoop = () => {
        if (!gameRunning) return;
        
        this.direction = this.nextDirection;
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
        
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize || head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver = true;
        }
        
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
            }
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.food = { x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)), y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)) };
        } else {
            this.snake.pop();
        }
        
        // Draw
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00FF00';
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('Score: ' + this.score, 10, 30);
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 30);
            document.getElementById('game-info').innerHTML = `<p>Snake Attack - Game Over! Din score: ${this.score}</p>`;
            return;
        }
        
        setTimeout(this.gameLoop, 100);
    }
}

// ==================== GAME 7: PLATFORMER ====================
class PlatformerGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = { x: 50, y: 400, width: 30, height: 30, velocityY: 0, velocityX: 0 };
        this.platforms = [
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 150, y: 450, width: 200, height: 30 },
            { x: 450, y: 350, width: 200, height: 30 },
            { x: 200, y: 250, width: 200, height: 30 }
        ];
        this.coins = [
            { x: 250, y: 400, width: 20, height: 20, collected: false },
            { x: 550, y: 300, width: 20, height: 20, collected: false },
            { x: 300, y: 200, width: 20, height: 20, collected: false }
        ];
        this.score = 0;
        this.gravity = 0.6;
        this.isJumping = false;
        
        document.addEventListener('keydown', (e) => this.handleInput(e));
        this.gameLoop();
    }
    
    handleInput(e) {
        if (e.key === 'ArrowLeft') this.player.velocityX = -5;
        if (e.key === 'ArrowRight') this.player.velocityX = 5;
        if (e.key === ' ') {
            if (!this.isJumping) {
                this.player.velocityY = -15;
                this.isJumping = true;
            }
        }
    }
    
    gameLoop = () => {
        if (!gameRunning) return;
        
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        this.player.x += this.player.velocityX;
        this.player.velocityX *= 0.9;
        
        this.isJumping = true;
        this.platforms.forEach(platform => {
            if (this.player.velocityY > 0 &&
                this.player.y + this.player.height <= platform.y + 10 &&
                this.player.y + this.player.height >= platform.y - 10 &&
                this.player.x + this.player.width > platform.x &&
                this.player.x < platform.x + platform.width) {
                this.player.velocityY = 0;
                this.player.y = platform.y - this.player.height;
                this.isJumping = false;
            }
        });
        
        this.coins.forEach(coin => {
            if (!coin.collected &&
                this.player.x < coin.x + coin.width &&
                this.player.x + this.player.width > coin.x &&
                this.player.y < coin.y + coin.height &&
                this.player.y + this.player.height > coin.y) {
                coin.collected = true;
                this.score++;
            }
        });
        
        // Draw
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#8B4513';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        this.ctx.fillStyle = '#FFD700';
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
            }
        });
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('Coins: ' + this.score, 20, 30);
        
        document.getElementById('game-info').innerHTML = `<p>Jump Hero - Saml mønterne! Score: ${this.score}</p>`;
        
        requestAnimationFrame(this.gameLoop);
    }
}

// ==================== GAME 8: BREAKOUT ====================
class BreakoutGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.paddle = { x: 350, y: 550, width: 100, height: 20 };
        this.ball = { x: 400, y: 520, radius: 8, velocityX: 5, velocityY: -5 };
        this.bricks = [];
        this.score = 0;
        this.gameOver = false;
        
        const cols = 8;
        const rows = 3;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.bricks.push({
                    x: c * 100,
                    y: r * 30,
                    width: 95,
                    height: 25,
                    destroyed: false
                });
            }
        }
        
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.paddle.x = e.clientX - rect.left - this.paddle.width / 2;
        });
        
        this.gameLoop();
    }
    
    gameLoop = () => {
        if (!gameRunning) return;
        
        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;
        
        if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.velocityX *= -1;
        }
        
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.velocityY *= -1;
        }
        
        if (this.ball.y > this.canvas.height) {
            this.gameOver = true;
        }
        
        if (this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width &&
            this.ball.y + this.ball.radius > this.paddle.y && this.ball.y < this.paddle.y + this.paddle.height) {
            this.ball.velocityY *= -1;
        }
        
        this.bricks.forEach(brick => {
            if (!brick.destroyed &&
                this.ball.x > brick.x && this.ball.x < brick.x + brick.width &&
                this.ball.y > brick.y && this.ball.y < brick.y + brick.height) {
                brick.destroyed = true;
                this.ball.velocityY *= -1;
                this.score++;
            }
        });
        
        // Draw
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00FF00';
        this.bricks.forEach(brick => {
            if (!brick.destroyed) {
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        });
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('Score: ' + this.score, 20, 30);
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 30);
            document.getElementById('game-info').innerHTML = `<p>Breakout Blast - Game Over! Score: ${this.score}</p>`;
            return;
        }
        
        document.getElementById('game-info').innerHTML = `<p>Breakout Blast - Score: ${this.score}</p>`;
        
        requestAnimationFrame(this.gameLoop);
    }
}

// Initial setup
showHome();