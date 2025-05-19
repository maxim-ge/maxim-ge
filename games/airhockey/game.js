// Standalone game implementation without ES modules
// This avoids CORS issues when running from file:// protocol

// Game configuration
const Config = {
    // Physics constants
    FRICTION: 0.01,  // Increased friction to slow down movement
    RESTITUTION: 0.7,  // Reduced restitution for less bouncy collisions

    // Puck properties
    PUCK_RADIUS: 35,
    PUCK_MASS: 1,
    PUCK_MAX_SPEED: 400,  // Reduced max speed

    // Mallet properties
    MALLET_RADIUS: 47.5,
    MALLET_MASS: 5,
    MALLET_MAX_SPEED: 600,  // Reduced max speed

    // Game settings
    POINTS_TO_WIN: 10,
    AI_DIFFICULTY: 5,
    SOUND_VOLUME: 0.5,

    // Speed control
    GAME_SPEED: 0.2  // Global speed multiplier (0.5 = half speed)
};

// Audio system
const AudioSystem = {
    audioContext: null,
    masterGain: null,
    sounds: {},

    init: function () {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = Config.SOUND_VOLUME;
            this.masterGain.connect(this.audioContext.destination);

            // Handle browser autoplay restrictions
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });

            console.log("Audio system initialized successfully");
            return true;
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            return false;
        }
    },

    setVolume: function (volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    },

    playWallHit: function (intensity = 1) {
        if (!this.audioContext) return;

        // Resume audio context if it's suspended (autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create oscillator
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 200 + intensity * 300;

        // Create gain node for envelope
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        // Connect nodes
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Set envelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3 * intensity, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        // Start and stop
        osc.start(now);
        osc.stop(now + 0.3);
    },

    playMalletHit: function (intensity = 1) {
        if (!this.audioContext) return;

        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create oscillator
        const osc = this.audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 150 + intensity * 250;

        // Create gain node for envelope
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        // Create filter
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        // Connect nodes
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Set envelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4 * intensity, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        // Start and stop
        osc.start(now);
        osc.stop(now + 0.2);
    },

    playGoal: function () {
        if (!this.audioContext) return;

        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create oscillators
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 440;

        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 880;

        // Create gain nodes
        const gain1 = this.audioContext.createGain();
        gain1.gain.value = 0;

        const gain2 = this.audioContext.createGain();
        gain2.gain.value = 0;

        // Connect nodes
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(this.masterGain);
        gain2.connect(this.masterGain);

        // Set envelopes
        const now = this.audioContext.currentTime;

        // First note
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        // Second note (higher pitch)
        gain2.gain.setValueAtTime(0, now + 0.1);
        gain2.gain.linearRampToValueAtTime(0.3, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        // Start and stop oscillators
        osc1.start(now);
        osc1.stop(now + 0.5);
        osc2.start(now);
        osc2.stop(now + 0.6);
    },

    playGameStart: function () {
        if (!this.audioContext) return;

        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create oscillator
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';

        // Create gain node
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        // Connect nodes
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Set envelope and frequency changes
        const now = this.audioContext.currentTime;

        // Rising pitch
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.2);
        osc.frequency.linearRampToValueAtTime(880, now + 0.4);

        // Envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.3);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

        // Start and stop
        osc.start(now);
        osc.stop(now + 0.5);
    },

    playGameEnd: function () {
        if (!this.audioContext) return;

        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create oscillators for a chord
        const frequencies = [261.63, 329.63, 392.00, 523.25]; // C major chord

        const now = this.audioContext.currentTime;

        // Create and connect oscillators
        for (let i = 0; i < frequencies.length; i++) {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = frequencies[i];

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0;

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Set envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.6);
            gainNode.gain.linearRampToValueAtTime(0, now + 1.0);

            // Start and stop
            osc.start(now);
            osc.stop(now + 1.0);
        }
    },

    playUIClick: function () {
        if (!this.audioContext) return;

        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create oscillator
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 600;

        // Create gain node
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;

        // Connect nodes
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Set envelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        // Start and stop
        osc.start(now);
        osc.stop(now + 0.1);
    }
};

// Game state
const GameState = {
    isPlaying: false,
    isPaused: false,
    isSinglePlayer: true,
    player1Score: 0,
    player2Score: 0,
    currentRound: 1,
    lastScorer: null,

    reset: function () {
        this.isPlaying = true;
        this.isPaused = false;
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentRound = 1;
        this.lastScorer = null;
    },

    scoreGoal: function (player) {
        if (player === 'player1') {
            this.player1Score++;
        } else {
            this.player2Score++;
        }
        this.lastScorer = player;
        this.currentRound++;
        this.isPaused = true;
    },

    isGameOver: function () {
        return this.player1Score >= 10 || this.player2Score >= 10;
    }
};

// UI handling
const UI = {
    scoreDisplay: null,
    roundInfo: null,
    messageOverlay: null,
    settingsPanel: null,
    messageTimeout: null,

    init: function () {
        this.scoreDisplay = document.getElementById('score-display');
        this.roundInfo = document.getElementById('round-info');
        this.messageOverlay = document.getElementById('message-overlay');
        this.settingsPanel = document.getElementById('settings-panel');
    },

    update: function () {
        // Update score display
        this.scoreDisplay.textContent = `${GameState.player1Score} - ${GameState.player2Score}`;

        // Update round info
        this.roundInfo.textContent = `Round ${GameState.currentRound}`;

        // Add AI difficulty if in single player mode
        if (GameState.isSinglePlayer) {
            this.roundInfo.textContent += ` | AI: ${Config.AI_DIFFICULTY}`;
        }
    },

    showMessage: function (message, duration = 2000) {
        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        // Show message
        this.messageOverlay.textContent = message;
        this.messageOverlay.style.opacity = '1';
        this.messageOverlay.style.display = 'flex';

        // Hide message after duration
        this.messageTimeout = setTimeout(() => {
            this.messageOverlay.style.opacity = '0';

            // After fade out, set display to none
            setTimeout(() => {
                if (this.messageOverlay.style.opacity === '0') {
                    this.messageOverlay.style.display = 'none';
                }
            }, 300);
        }, duration);
    },

    hideSettingsPanel: function () {
        console.log("Hiding settings panel");
        if (this.settingsPanel) {
            this.settingsPanel.classList.add('hidden');
            this.settingsPanel.style.display = 'none';
            console.log("Settings panel hidden");
        }
    },

    showSettingsPanel: function () {
        console.log("Showing settings panel");
        if (this.settingsPanel) {
            this.settingsPanel.classList.remove('hidden');
            this.settingsPanel.style.display = 'block';
            console.log("Settings panel shown");
        }
    }
};

// Simple game objects
class Puck {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = 0;
        this.vy = 0;
        this.startX = x;
        this.startY = y;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Mallet {
    constructor(x, y, radius, player) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.player = player;
        this.vx = 0;
        this.vy = 0;
        this.startX = x;
        this.startY = y;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        // Apply friction
        this.vx *= (1 - Config.FRICTION);
        this.vy *= (1 - Config.FRICTION);

        // Update position
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.fillStyle = this.player === 'player1' ? '#3498db' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Main game class
const Game = {
    canvas: null,
    ctx: null,
    puck: null,
    playerMallet: null,
    opponentMallet: null,
    lastTime: 0,
    accumulator: 0,
    timeStep: 1000 / 60, // 60 FPS
    animationFrameId: null,
    mouseX: 0,
    mouseY: 0,
    courtWidth: 0,
    courtHeight: 0,

    init: function () {
        // Get canvas and context
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas dimensions
        this.resizeCanvas();

        // Initialize UI
        UI.init();

        // Initialize audio system
        AudioSystem.init();

        // Create game objects
        this.createGameObjects();

        // Set up event listeners
        this.setupEventListeners();

        // Show settings panel
        UI.showSettingsPanel();

        // Show start message
        UI.showMessage('Click "Start Game" to play!', 3000);

        // Start pre-game loop
        this.preGameLoop();
    },

    createGameObjects: function () {
        // Create puck
        this.puck = new Puck(
            this.canvas.width / 2,
            this.canvas.height / 2,
            Config.PUCK_RADIUS
        );

        // Create player mallet
        this.playerMallet = new Mallet(
            this.canvas.width / 4,
            this.canvas.height / 2,
            Config.MALLET_RADIUS,
            'player1'
        );

        // Create opponent mallet
        this.opponentMallet = new Mallet(
            (this.canvas.width / 4) * 3,
            this.canvas.height / 2,
            Config.MALLET_RADIUS,
            'player2'
        );

        // Set court dimensions
        this.courtWidth = this.canvas.width * 0.95;
        this.courtHeight = this.canvas.height * 0.9;
    },

    setupEventListeners: function () {
        // Mouse/touch movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        // Touch movement
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Game settings
        const aiDifficulty = document.getElementById('ai-difficulty');
        if (aiDifficulty) {
            aiDifficulty.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('difficulty-value').textContent = value;
                Config.AI_DIFFICULTY = parseInt(value);
            });
        }

        const soundVolume = document.getElementById('sound-volume');
        if (soundVolume) {
            soundVolume.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('volume-value').textContent = value;
                Config.SOUND_VOLUME = value / 100;
                AudioSystem.setVolume(value / 100);
            });
        }

        const gameModeInputs = document.querySelectorAll('input[name="game-mode"]');
        if (gameModeInputs.length > 0) {
            gameModeInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    GameState.isSinglePlayer = (e.target.value === 'single');
                });
            });
        }
    },

    resizeCanvas: function () {
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        // Update court dimensions
        this.courtWidth = this.canvas.width * 0.95;
        this.courtHeight = this.canvas.height * 0.9;

        // Update game object positions
        if (this.puck) {
            this.puck.startX = this.canvas.width / 2;
            this.puck.startY = this.canvas.height / 2;
            this.puck.reset();

            this.playerMallet.startX = this.canvas.width / 4;
            this.playerMallet.startY = this.canvas.height / 2;
            this.playerMallet.reset();

            this.opponentMallet.startX = (this.canvas.width / 4) * 3;
            this.opponentMallet.startY = this.canvas.height / 2;
            this.opponentMallet.reset();
        }
    },

    startGame: function () {
        console.log("Starting game");

        // Play game start sound
        AudioSystem.playGameStart();

        // Hide settings panel
        UI.hideSettingsPanel();

        // Reset game state
        GameState.reset();
        this.puck.reset();
        this.playerMallet.reset();
        this.opponentMallet.reset();

        // Show start message
        UI.showMessage('Game Start!', 1500);

        // Cancel any existing animation frames
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Start game loop
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.gameLoop();

        console.log("Game started successfully!");
    },

    preGameLoop: function () {
        // Update player mallet position based on mouse
        if (GameState.isSinglePlayer || this.playerMallet.player === 'player1') {
            // Limit mallet to left half of court for player 1
            const halfWidth = this.canvas.width / 2;
            const courtLeft = (this.canvas.width - this.courtWidth) / 2;
            const courtTop = (this.canvas.height - this.courtHeight) / 2;

            // Constrain to left half of court
            let targetX = Math.min(this.mouseX, halfWidth);
            targetX = Math.max(targetX, courtLeft + this.playerMallet.radius);

            // Constrain to court height
            let targetY = Math.max(this.mouseY, courtTop + this.playerMallet.radius);
            targetY = Math.min(targetY, courtTop + this.courtHeight - this.playerMallet.radius);

            this.playerMallet.x = targetX;
            this.playerMallet.y = targetY;
        }

        // Render the game
        this.render();

        // Continue the loop if not playing
        if (!GameState.isPlaying) {
            this.animationFrameId = requestAnimationFrame(() => this.preGameLoop());
        }
    },

    gameLoop: function (currentTime) {
        if (!currentTime) currentTime = performance.now();

        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Accumulate time since last frame
        this.accumulator += deltaTime;

        // Update game state at fixed time steps
        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep / 1000); // Convert to seconds
            this.accumulator -= this.timeStep;
        }

        // Render the game
        this.render();

        // Request next frame
        this.animationFrameId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    },

    update: function (deltaTime) {
        // Apply game speed multiplier to deltaTime
        const scaledDeltaTime = deltaTime * Config.GAME_SPEED;

        if (GameState.isPlaying && !GameState.isPaused) {
            // Update player mallet position based on mouse
            if (GameState.isSinglePlayer || this.playerMallet.player === 'player1') {
                // Limit mallet to left half of court for player 1
                const halfWidth = this.canvas.width / 2;
                const courtLeft = (this.canvas.width - this.courtWidth) / 2;
                const courtTop = (this.canvas.height - this.courtHeight) / 2;

                // Constrain to left half of court
                let targetX = Math.min(this.mouseX, halfWidth);
                targetX = Math.max(targetX, courtLeft + this.playerMallet.radius);

                // Constrain to court height
                let targetY = Math.max(this.mouseY, courtTop + this.playerMallet.radius);
                targetY = Math.min(targetY, courtTop + this.courtHeight - this.playerMallet.radius);

                // Calculate velocity (with speed control)
                this.playerMallet.vx = (targetX - this.playerMallet.x) / scaledDeltaTime;
                this.playerMallet.vy = (targetY - this.playerMallet.y) / scaledDeltaTime;

                // Limit mallet speed
                const malletSpeed = Math.sqrt(this.playerMallet.vx * this.playerMallet.vx +
                    this.playerMallet.vy * this.playerMallet.vy);
                if (malletSpeed > Config.MALLET_MAX_SPEED) {
                    const scale = Config.MALLET_MAX_SPEED / malletSpeed;
                    this.playerMallet.vx *= scale;
                    this.playerMallet.vy *= scale;
                }

                // Update position
                this.playerMallet.x = targetX;
                this.playerMallet.y = targetY;
            }

            // Update AI opponent in single player mode
            if (GameState.isSinglePlayer) {
                this.updateAI(scaledDeltaTime);
            }

            // Update puck with speed control
            this.puck.vx *= (1 - Config.FRICTION);
            this.puck.vy *= (1 - Config.FRICTION);

            // Apply speed multiplier to puck movement
            this.puck.x += this.puck.vx * Config.GAME_SPEED;
            this.puck.y += this.puck.vy * Config.GAME_SPEED;

            // Check for collisions
            this.checkCollisions();

            // Check for goals
            this.checkGoals();
        }

        // Update UI
        UI.update();
    },

    updateAI: function (deltaTime) {
        // Simple AI: follow the puck with some delay based on difficulty
        const difficulty = Config.AI_DIFFICULTY;
        // Reduce reaction speed by applying game speed multiplier
        const reactionSpeed = (0.05 + (difficulty / 10) * 0.5) * Config.GAME_SPEED; // Slower reaction

        // Limit mallet to right half of court
        const halfWidth = this.canvas.width / 2;
        const courtRight = this.canvas.width - (this.canvas.width - this.courtWidth) / 2;
        const courtTop = (this.canvas.height - this.courtHeight) / 2;
        const courtBottom = courtTop + this.courtHeight;

        // Target position (with some prediction based on puck velocity)
        // Reduce prediction to make AI less perfect
        let targetX = this.puck.x + this.puck.vx * 0.3;
        let targetY = this.puck.y + this.puck.vy * 0.3;

        // Add more randomness to make AI less perfect
        const randomFactor = (11 - difficulty) / 10;
        targetX += (Math.random() * 2 - 1) * randomFactor * 80;
        targetY += (Math.random() * 2 - 1) * randomFactor * 80;

        // Constrain to right half of court
        targetX = Math.max(targetX, halfWidth);
        targetX = Math.min(targetX, courtRight - this.opponentMallet.radius);

        // Constrain to court height
        targetY = Math.max(targetY, courtTop + this.opponentMallet.radius);
        targetY = Math.min(targetY, courtBottom - this.opponentMallet.radius);

        // Move towards target with reaction speed
        const dx = targetX - this.opponentMallet.x;
        const dy = targetY - this.opponentMallet.y;

        // Apply movement with speed control
        this.opponentMallet.x += dx * reactionSpeed;
        this.opponentMallet.y += dy * reactionSpeed;

        // Calculate velocity
        this.opponentMallet.vx = dx * reactionSpeed / deltaTime;
        this.opponentMallet.vy = dy * reactionSpeed / deltaTime;

        // Limit AI mallet speed
        const malletSpeed = Math.sqrt(
            this.opponentMallet.vx * this.opponentMallet.vx +
            this.opponentMallet.vy * this.opponentMallet.vy
        );

        if (malletSpeed > Config.MALLET_MAX_SPEED * 0.8) { // AI is slightly slower than player
            const scale = (Config.MALLET_MAX_SPEED * 0.8) / malletSpeed;
            this.opponentMallet.vx *= scale;
            this.opponentMallet.vy *= scale;
        }
    },

    checkCollisions: function () {
        // Court boundaries
        const courtLeft = (this.canvas.width - this.courtWidth) / 2;
        const courtRight = courtLeft + this.courtWidth;
        const courtTop = (this.canvas.height - this.courtHeight) / 2;
        const courtBottom = courtTop + this.courtHeight;

        // Puck-wall collisions
        if (this.puck.x - this.puck.radius < courtLeft) {
            this.puck.x = courtLeft + this.puck.radius;
            this.puck.vx = -this.puck.vx * Config.RESTITUTION;
            // Add wall hit sound
            AudioSystem.playWallHit(Math.min(Math.abs(this.puck.vx) / 200, 1));
        } else if (this.puck.x + this.puck.radius > courtRight) {
            this.puck.x = courtRight - this.puck.radius;
            this.puck.vx = -this.puck.vx * Config.RESTITUTION;
            // Add wall hit sound
            AudioSystem.playWallHit(Math.min(Math.abs(this.puck.vx) / 200, 1));
        }

        if (this.puck.y - this.puck.radius < courtTop) {
            this.puck.y = courtTop + this.puck.radius;
            this.puck.vy = -this.puck.vy * Config.RESTITUTION;
            // Add wall hit sound
            AudioSystem.playWallHit(Math.min(Math.abs(this.puck.vx) / 200, 1));
        } else if (this.puck.y + this.puck.radius > courtBottom) {
            this.puck.y = courtBottom - this.puck.radius;
            this.puck.vy = -this.puck.vy * Config.RESTITUTION;
            // Add wall hit sound
            AudioSystem.playWallHit(Math.min(Math.abs(this.puck.vx) / 200, 1));
        }

        // Puck-mallet collisions
        this.checkMalletCollision(this.playerMallet);
        this.checkMalletCollision(this.opponentMallet);
    },

    checkMalletCollision: function (mallet) {
        // Calculate distance between puck and mallet centers
        const dx = this.puck.x - mallet.x;
        const dy = this.puck.y - mallet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if collision occurred
        const minDistance = this.puck.radius + mallet.radius;
        if (distance < minDistance) {
            // Calculate collision normal
            const nx = dx / distance;
            const ny = dy / distance;

            // Move puck outside of mallet
            const penetrationDepth = minDistance - distance;
            this.puck.x += nx * penetrationDepth;
            this.puck.y += ny * penetrationDepth;

            // Calculate relative velocity
            const rvx = this.puck.vx - mallet.vx;
            const rvy = this.puck.vy - mallet.vy;

            // Calculate relative velocity along normal
            const velAlongNormal = rvx * nx + rvy * ny;

            // Do not resolve if objects are moving away from each other
            if (velAlongNormal > 0) return;

            // Calculate impulse scalar with reduced force
            const restitution = Config.RESTITUTION;
            // Reduce the impulse magnitude for slower gameplay
            const impulseMagnitude = -(1 + restitution) * velAlongNormal * Config.GAME_SPEED;
            const totalMass = Config.PUCK_MASS + Config.MALLET_MASS;
            const impulse = impulseMagnitude / totalMass;

            // Apply impulse with additional damping
            this.puck.vx += impulse * Config.MALLET_MASS * nx * 0.8; // 20% reduction
            this.puck.vy += impulse * Config.MALLET_MASS * ny * 0.8; // 20% reduction

            // Play collision sound with intensity based on relative speed
            const relativeSpeed = Math.sqrt(rvx * rvx + rvy * rvy);
            if (relativeSpeed > 10) {
                const soundIntensity = Math.min(Math.abs(impulseMagnitude) / 20, 1);
                AudioSystem.playMalletHit(soundIntensity);
            }

            // Add a small amount of the mallet's velocity to the puck
            // This makes the game feel more responsive
            this.puck.vx += mallet.vx * 0.3 * Config.GAME_SPEED;
            this.puck.vy += mallet.vy * 0.3 * Config.GAME_SPEED;

            // Limit puck speed
            const puckSpeed = Math.sqrt(this.puck.vx * this.puck.vx + this.puck.vy * this.puck.vy);
            if (puckSpeed > Config.PUCK_MAX_SPEED) {
                const scale = Config.PUCK_MAX_SPEED / puckSpeed;
                this.puck.vx *= scale;
                this.puck.vy *= scale;
            }

            // Add a small random factor to make the game less predictable
            this.puck.vx += (Math.random() * 2 - 1) * 5 * Config.GAME_SPEED;
            this.puck.vy += (Math.random() * 2 - 1) * 5 * Config.GAME_SPEED;
        }
    },

    checkGoals: function () {
        // Goal dimensions
        const goalWidth = this.courtHeight * 0.2;
        const courtTop = (this.canvas.height - this.courtHeight) / 2;
        const goalY = courtTop + this.courtHeight / 2;
        const goalTop = goalY - goalWidth / 2;
        const goalBottom = goalY + goalWidth / 2;

        // Left goal (player 2 scores)
        const leftGoalX = (this.canvas.width - this.courtWidth) / 2;
        if (this.puck.x - this.puck.radius <= leftGoalX &&
            this.puck.y >= goalTop &&
            this.puck.y <= goalBottom) {
            this.handleGoal('player2');
        }

        // Right goal (player 1 scores)
        const rightGoalX = leftGoalX + this.courtWidth;
        if (this.puck.x + this.puck.radius >= rightGoalX &&
            this.puck.y >= goalTop &&
            this.puck.y <= goalBottom) {
            this.handleGoal('player1');
        }
    },

    handleGoal: function (scorer) {

        // Play goal sound
        AudioSystem.playGoal();

        // Score the goal
        GameState.scoreGoal(scorer);

        // Show goal message
        const scorerName = scorer === 'player1' ? 'Player 1' :
            (scorer === 'player2' && GameState.isSinglePlayer) ? 'AI' : 'Player 2';
        UI.showMessage(`Goal by ${scorerName}!`, 1500);

        // Check if game is over
        if (GameState.isGameOver()) {
            this.endGame();
        } else {
            // Reset entities for next round
            setTimeout(() => {
                this.puck.reset();
                this.playerMallet.reset();
                this.opponentMallet.reset();
                GameState.isPaused = false;
            }, 1500);
        }
    },

    endGame: function () {
        const winner = GameState.player1Score > GameState.player2Score ? 'Player 1' :
            (GameState.isSinglePlayer ? 'AI' : 'Player 2');
        UI.showMessage(`${winner} Wins!`, 3000);

        // Play game end sound
        AudioSystem.playGameEnd();

        // Show settings panel after delay
        setTimeout(() => {
            UI.showSettingsPanel();
            GameState.isPlaying = false;
        }, 3000);
    },

    render: function () {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw court
        this.drawCourt();

        // Draw game objects
        this.puck.draw(this.ctx);
        this.playerMallet.draw(this.ctx);
        this.opponentMallet.draw(this.ctx);
    },

    drawCourt: function () {
        const ctx = this.ctx;

        // Court dimensions
        const courtLeft = (this.canvas.width - this.courtWidth) / 2;
        const courtTop = (this.canvas.height - this.courtHeight) / 2;

        // Draw court background
        ctx.fillStyle = '#111';
        ctx.fillRect(courtLeft, courtTop, this.courtWidth, this.courtHeight);

        // Draw center line
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2, courtTop);
        ctx.lineTo(this.canvas.width / 2, courtTop + this.courtHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw center circle
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 50, 0, Math.PI * 2);
        ctx.stroke();

        // Draw goals
        const goalWidth = this.courtHeight * 0.2;
        const goalY = courtTop + this.courtHeight / 2;

        // Left goal
        ctx.fillStyle = '#333';
        ctx.fillRect(courtLeft - 10, goalY - goalWidth / 2, 10, goalWidth);

        // Right goal
        ctx.fillRect(courtLeft + this.courtWidth, goalY - goalWidth / 2, 10, goalWidth);
    }
};
