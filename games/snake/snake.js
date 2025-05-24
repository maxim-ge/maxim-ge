// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio Context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Game state
let gameState = 'menu'; // menu, playing, paused, gameOver
let score = 0;
let level = 1;
let gameSpeed = 150;
let lastTime = 0;

// Snake properties
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };

// Grid size
const gridSize = 20;
const tileCount = { x: canvas.width / gridSize, y: canvas.height / gridSize };

// Food system
let foods = [];
const foodTypes = {
    red: { color: '#ff4444', points: 10, effect: 'grow' },
    blue: { color: '#4444ff', points: 5, effect: 'speed' },
    gold: { color: '#ffaa00', points: 20, effect: 'multiplier' },
    green: { color: '#44ff44', points: 15, effect: 'phase' },
    purple: { color: '#aa44ff', points: 25, effect: 'slow' }
};

// Active abilities
let abilities = {
    speedBoost: 0,
    scoreMultiplier: 0,
    phaseMode: 0,
    slowTime: 0
};

// Particles system
let particles = [];

// Obstacles
let obstacles = [];

// Audio functions
function createOscillator(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playEatSound(foodType) {
    const frequencies = {
        red: 440,
        blue: 550,
        gold: 660,
        green: 330,
        purple: 770
    };
    createOscillator(frequencies[foodType], 0.2, 'square');
}

function playMoveSound() {
    createOscillator(200, 0.05, 'triangle');
}

function playGameOverSound() {
    createOscillator(200, 0.5, 'sawtooth');
    setTimeout(() => createOscillator(150, 0.5, 'sawtooth'), 200);
}

// Particle system
function createParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x * gridSize + gridSize / 2,
            y: y * gridSize + gridSize / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color,
            life: 1.0,
            decay: 0.02
        });
    }
}

function updateParticles() {
    particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life -= particle.decay;
        return particle.life > 0;
    });
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        ctx.restore();
    });
}

// Food management
function spawnFood() {
    const types = Object.keys(foodTypes);
    const weights = [0.4, 0.2, 0.15, 0.15, 0.1]; // Probability weights

    let random = Math.random();
    let selectedType = types[0];

    for (let i = 0; i < weights.length; i++) {
        if (random < weights[i]) {
            selectedType = types[i];
            break;
        }
        random -= weights[i];
    }

    let position;
    do {
        position = {
            x: Math.floor(Math.random() * tileCount.x),
            y: Math.floor(Math.random() * tileCount.y)
        };
    } while (snake.some(segment => segment.x === position.x && segment.y === position.y) ||
        obstacles.some(obstacle => obstacle.x === position.x && obstacle.y === position.y));

    foods.push({
        ...position,
        type: selectedType,
        ...foodTypes[selectedType],
        pulse: 0
    });
}

function updateFood() {
    foods.forEach(food => {
        food.pulse += 0.1;
    });
}

function drawFood() {
    foods.forEach(food => {
        const pulse = Math.sin(food.pulse) * 0.3 + 1;
        const size = gridSize * 0.8 * pulse;
        const offset = (gridSize - size) / 2;

        ctx.save();
        ctx.fillStyle = food.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = food.color;
        ctx.fillRect(
            food.x * gridSize + offset,
            food.y * gridSize + offset,
            size,
            size
        );
        ctx.restore();
    });
}

// Obstacle management
function generateObstacles() {
    obstacles = [];
    const obstacleCount = Math.floor(level / 3);

    for (let i = 0; i < obstacleCount; i++) {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * tileCount.x),
                y: Math.floor(Math.random() * tileCount.y)
            };
        } while (
            (position.x >= 8 && position.x <= 12 && position.y >= 8 && position.y <= 12) ||
            obstacles.some(obstacle => obstacle.x === position.x && obstacle.y === position.y)
        );

        obstacles.push(position);
    }
}

function drawObstacles() {
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0000';

    obstacles.forEach(obstacle => {
        ctx.fillRect(
            obstacle.x * gridSize + 2,
            obstacle.y * gridSize + 2,
            gridSize - 4,
            gridSize - 4
        );
    });

    ctx.shadowBlur = 0;
}

// Snake movement and logic
function moveSnake() {
    direction = { ...nextDirection };

    if (direction.x === 0 && direction.y === 0) return;

    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Phase mode allows passing through walls
    if (!abilities.phaseMode) {
        if (head.x < 0 || head.x >= tileCount.x || head.y < 0 || head.y >= tileCount.y) {
            gameOver();
            return;
        }
    } else {
        head.x = (head.x + tileCount.x) % tileCount.x;
        head.y = (head.y + tileCount.y) % tileCount.y;
    }

    // Check collision with self (unless in phase mode)
    if (!abilities.phaseMode && snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    // Check collision with obstacles (unless in phase mode)
    if (!abilities.phaseMode && obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check food collision
    const foodIndex = foods.findIndex(food => food.x === head.x && food.y === head.y);
    if (foodIndex !== -1) {
        const food = foods[foodIndex];
        eatFood(food);
        foods.splice(foodIndex, 1);
        spawnFood();
    } else {
        snake.pop();
    }
}

function eatFood(food) {
    playEatSound(food.type);
    createParticles(food.x, food.y, food.color);

    let points = food.points;
    if (abilities.scoreMultiplier > 0) {
        points *= 2;
    }

    score += points;

    switch (food.effect) {
        case 'grow':
            snake.push({ ...snake[snake.length - 1] });
            break;
        case 'speed':
            abilities.speedBoost = 5000; // 5 seconds
            break;
        case 'multiplier':
            abilities.scoreMultiplier = 10000; // 10 seconds
            break;
        case 'phase':
            abilities.phaseMode = 3000; // 3 seconds
            break;
        case 'slow':
            abilities.slowTime = 5000; // 5 seconds
            break;
    }

    // Level progression
    if (score >= level * 100) {
        level++;
        generateObstacles();
        gameSpeed = Math.max(80, gameSpeed - 5);
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const alpha = index === 0 ? 1 : 1 - (index * 0.1);
        const hue = abilities.phaseMode > 0 ?
            (Date.now() * 0.01 + index * 30) % 360 :
            180;

        ctx.save();
        ctx.globalAlpha = Math.max(alpha, 0.3);
        ctx.fillStyle = abilities.phaseMode > 0 ?
            `hsl(${hue}, 100%, 50%)` :
            '#00ffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;

        ctx.fillRect(
            segment.x * gridSize + 2,
            segment.y * gridSize + 2,
            gridSize - 4,
            gridSize - 4
        );
        ctx.restore();
    });
}

// Game loop
function gameLoop(currentTime) {
    if (currentTime - lastTime < (abilities.slowTime > 0 ? gameSpeed * 2 :
        abilities.speedBoost > 0 ? gameSpeed * 0.7 : gameSpeed)) {
        requestAnimationFrame(gameLoop);
        return;
    }

    lastTime = currentTime;

    if (gameState === 'playing') {
        update();
        draw();
    }

    requestAnimationFrame(gameLoop);
}

function update() {
    moveSnake();
    updateFood();
    updateParticles();
    updateAbilities();
    updateUI();

    // Ensure there's always food
    if (foods.length === 0) {
        spawnFood();
    }
}

function updateAbilities() {
    const deltaTime = 16; // Approximate frame time

    Object.keys(abilities).forEach(ability => {
        if (abilities[ability] > 0) {
            abilities[ability] -= deltaTime;
            abilities[ability] = Math.max(0, abilities[ability]);
        }
    });
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('length').textContent = snake.length;

    // Update ability timers
    updateAbilityDisplay('speedBoost', abilities.speedBoost);
    updateAbilityDisplay('scoreMultiplier', abilities.scoreMultiplier);
    updateAbilityDisplay('phaseMode', abilities.phaseMode);
    updateAbilityDisplay('slowTime', abilities.slowTime);
}

function updateAbilityDisplay(abilityId, timeLeft) {
    const element = document.getElementById(abilityId);
    const seconds = Math.ceil(timeLeft / 1000);
    element.querySelector('span:last-child').textContent = seconds + 's';

    if (timeLeft > 0) {
        element.classList.add('active');
    } else {
        element.classList.remove('active');
    }
}

function draw() {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < tileCount.x; x++) {
        ctx.beginPath();
        ctx.moveTo(x * gridSize, 0);
        ctx.lineTo(x * gridSize, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < tileCount.y; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * gridSize);
        ctx.lineTo(canvas.width, y * gridSize);
        ctx.stroke();
    }

    drawObstacles();
    drawFood();
    drawSnake();
    drawParticles();
}

// Touch Controller Setup
let touchController;

function initializeTouchController() {
    touchController = new TouchController();

    touchController.init();

    // Handle movement controls
    touchController.on('arrow-down', (playerId, direction) => {
        if (gameState !== 'playing') return;

        switch (direction) {
            case 'up':
                if (nextDirection.y !== 1) nextDirection = { x: 0, y: -1 };
                break;
            case 'down':
                if (nextDirection.y !== -1) nextDirection = { x: 0, y: 1 };
                break;
            case 'left':
                if (nextDirection.x !== 1) nextDirection = { x: -1, y: 0 };
                break;
            case 'right':
                if (nextDirection.x !== -1) nextDirection = { x: 1, y: 0 };
                break;
        }
    });

    // Handle pause/fire controls (space key)
    touchController.on('fire-down', () => {
        if (gameState === 'playing') {
            pauseGame();
        }
    });
}

// Initialize touch controller when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeTouchController();
        setupButtonTouchSupport();
    });
} else {
    initializeTouchController();
    setupButtonTouchSupport();
}

// Setup touch support for buttons on iOS
function setupButtonTouchSupport() {
    const buttons = document.querySelectorAll('.button, button');
    buttons.forEach(button => {
        // Add touch event listeners for iOS compatibility
        button.addEventListener('touchstart', function (e) {
            e.stopPropagation(); // Prevent TouchController from handling this
            this.classList.add('active');
        }, { passive: true });

        button.addEventListener('touchend', function (e) {
            e.stopPropagation(); // Prevent TouchController from handling this
            this.classList.remove('active');
            // Trigger click after a short delay to ensure proper handling
            setTimeout(() => {
                if (this.onclick) {
                    this.onclick();
                }
            }, 50);
        }, { passive: true });

        button.addEventListener('touchcancel', function () {
            this.classList.remove('active');
        }, { passive: true });
    });
}

// Game state management
function startGame() {
    // Resume audio context if needed (required for iOS)
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(console.error);
    }

    // Reset game state
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    gameSpeed = 150;
    foods = [];
    particles = [];
    abilities = {
        speedBoost: 0,
        scoreMultiplier: 0,
        phaseMode: 0,
        slowTime: 0
    };

    generateObstacles();
    spawnFood();
    spawnFood();

    gameState = 'playing';
    showScreen('game');
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        showScreen('pauseScreen');
    }
}

function resumeGame() {
    gameState = 'playing';
    showScreen('game');
}

function restartGame() {
    startGame();
}

function gameOver() {
    gameState = 'gameOver';
    playGameOverSound();
    document.getElementById('gameWrapper').classList.add('shake');
    setTimeout(() => {
        document.getElementById('gameWrapper').classList.remove('shake');
    }, 500);

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalLength').textContent = snake.length;

    showScreen('gameOverScreen');
}

function goToMenu() {
    gameState = 'menu';
    showScreen('startScreen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });

    if (screenId === 'game') {
        // Hide all screens to show the game
        return;
    }

    document.getElementById(screenId).classList.remove('hidden');
}

function showLeaderboard() {
    updateLeaderboardDisplay();
    showScreen('leaderboardScreen');
}

function saveScore() {
    const name = document.getElementById('playerName').value.trim() || 'Anonymous';
    const scores = getLeaderboard();

    scores.push({
        name: name,
        score: score,
        level: level,
        length: snake.length,
        date: new Date().toLocaleDateString()
    });

    scores.sort((a, b) => b.score - a.score);
    scores.splice(10); // Keep only top 10

    localStorage.setItem('snakeLeaderboard', JSON.stringify(scores));

    document.getElementById('playerName').value = '';
    showLeaderboard();
}

function getLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
    } catch {
        return [];
    }
}

function updateLeaderboardDisplay() {
    const scores = getLeaderboard();
    const leaderboardList = document.getElementById('leaderboardList');

    if (scores.length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-entry">No scores yet!</div>';
        return;
    }

    leaderboardList.innerHTML = '<h3>Top Players</h3>' +
        scores.map((entry, index) => `
            <div class="leaderboard-entry">
                <span>#${index + 1} ${entry.name}</span>
                <span>${entry.score}</span>
            </div>
        `).join('');
}

// Initialize game
function init() {
    // Set canvas size based on screen
    const maxWidth = Math.min(window.innerWidth - 40, 800);
    const maxHeight = Math.min(window.innerHeight - 40, 600);

    canvas.width = Math.floor(maxWidth / gridSize) * gridSize;
    canvas.height = Math.floor(maxHeight / gridSize) * gridSize;

    // Update tile count
    tileCount.x = canvas.width / gridSize;
    tileCount.y = canvas.height / gridSize;

    gameState = 'menu';
    showScreen('startScreen');

    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init);

// Handle window resize
window.addEventListener('resize', () => {
    if (gameState === 'menu') {
        init();
    }
});
