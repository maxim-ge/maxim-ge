// Game constants
const CANVAS_RATIO = 1366 / 1024; // iPad Pro 12.9 aspect ratio
const BLOCK_SIZE = 32;
const TANK_SIZE = 28;
const BULLET_SIZE = 8;
const TANK_SPEED = 2;
const BULLET_SPEED = 4;
const POWERUP_TYPES = ['shield', 'extraLife', 'rapidFire', 'bombAll'];
const POWERUP_DURATION = 10000; // 10 seconds

const RATE_MULTIPLIER = 0.933;
const RATE_CHANGE_INTERVAL = 10 * 1000; // 10 seconds
const BASE_ENEMY_SPAWN_RATE = 6000;

const MAPS = [
    // Three different map layouts
    [
        "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
        "S                            S",
        "S  BB  BB  WWWW  BB  BB  BB  S",
        "S  BB  BB  WWWW  BB  BB  BB  S",
        "S  BB  BB  BB    BB  BB  BB  S",
        "S  BB  BB        BB  BB  BB  S",
        "S  BB      SSSS      BB  BB  S",
        "S        BBBBBBBB          S S",
        "SWWWWWBB          BBWWWWW    S",
        "S    WWBB          BBWW      S",
        "S      BB  SSSS    BB        S",
        "S  BB  BB          BB  BB  BB S",
        "S  BB  BB          BB  BB  BB S",
        "S  BB  BBBB        BBBB  BB  S",
        "S  BB  BBBB        BBBB  BB  S",
        "S  BB  BB          BB  BB  BB S",
        "S  BB  BB    BB    BB  BB  BB S",
        "S        BB  BB  BB          S",
        "S        BB  BB  BB          S",
        "S    BBBBBB      BBBBBB      S",
        "S    BBBBBB      BBBBBB      S",
        "S            BB              S",
        "S            BB              S",
        "S      SSSS  BB  SSSS        S",
        "S                            S",
        "S  BB  BBBBBBBBBBBBBB  BB  S S",
        "S  BB                  BB    S",
        "S    BB  BBBBBBBBBB  BB      S",
        "S        BB      BB          S",
        "S  BB              BB  BB  BB S",
        "S  BB    BBBB      BB  BB  BB S",
        "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
    ],
    [
        "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S                            S",
        "S                            S",
        "S  BBBBSSBBBBBBBBBBSSBBBB    S",
        "S  BBBB                      S",
        "S        BBBBBBBBBBBB        S",
        "S        BB        BB        S",
        "SWWWWWW  BB        BB  WWWWWWS",
        "SWWWWWW  BB        BB  WWWWWWS",
        "S        BB        BB        S",
        "S        BBBBBBBBBBBB        S",
        "S                      BBBB  S",
        "S    BBBBSSBBBBBBBBBBSSBBBB  S",
        "S                            S",
        "S                            S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S                            S",
        "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
    ],
    [
        "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
        "S                            S",
        "S  BBBB      BB      BBBB    S",
        "S  BBBB      BB      BBBB    S",
        "S  BBBB      BB      BBBB    S",
        "S  BBBB      BB      BBBB    S",
        "S        SSSSSSSSSS          S",
        "S            BB              S",
        "S            BB              S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB  WWWWWW  BB        S",
        "SBBBB      WWWWWW      BBBB  S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S      BB          BB        S",
        "S            BB              S",
        "S            BB              S",
        "S        SSSSSSSSSS          S",
        "S  BBBB      BB      BBBB    S",
        "S  BBBB      BB      BBBB    S",
        "S  BBBB      BB      BBBB    S",
        "S  BBBB      BB      BBBB    S",
        "S        WWWWWWWWWW          S",
        "S                            S",
        "S      BBBBBBBBBBBBBB        S",
        "S                            S",
        "S        BBBBBBBBBB          S",
        "S                            S",
        "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
    ]
];

// Game state
const game = {
    mode: null, // 'single', 'coop', 'combat'
    running: false,
    paused: false,
    currentMap: null,
    blocks: [],
    tanks: [],
    bullets: [],
    powerups: [],
    enemySpawnPoints: [], // Add this to store calculated spawn points
    commonLives: 3, // Common lives pool for cooperative modes
    players: [
        {
            id: 1,
            score: 0,
            direction: 'up',
            firing: false,
            moving: null,
            x: 0,
            y: 0,
            shield: false,
            rapidFire: false,
            fireRate: 500, // milliseconds between shots
            lastFired: 0,
            color: '#f1c40f' // Yellow
        },
        {
            id: 2,
            score: 0,
            direction: 'up',
            firing: false,
            moving: null,
            x: 0,
            y: 0,
            shield: false,
            rapidFire: false,
            fireRate: 500,
            lastFired: 0,
            color: '#2ecc71' // Green
        },
        {
            id: 3,
            score: 0,
            direction: 'up',
            firing: false,
            moving: null,
            x: 0,
            y: 0,
            shield: false,
            rapidFire: false,
            fireRate: 500,
            lastFired: 0,
            color: '#3498db' // Blue
        }
    ],
    enemies: [],
    maxEnemies: 50,
    enemySpawnRate: 6000,
    lastEnemySpawn: 0
};

// DOM Elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const singlePlayerBtn = document.getElementById('single-player');
const cooperativeBtn = document.getElementById('cooperative');
const combatBtn = document.getElementById('combat');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const winnerDisplay = document.getElementById('winner');
const restartBtn = document.getElementById('restart');
const mainMenuBtn = document.getElementById('main-menu');
const pauseBtn = document.getElementById('pause-button');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');
const player3ScoreDisplay = document.getElementById('player3-score');
const livesDisplay = document.getElementById('lives');

// Control states
const controls = {
    players: [
        {
            id: 1,
            up: false,
            right: false,
            down: false,
            left: false,
            fire: false
        },
        {
            id: 2,
            up: false,
            right: false,
            down: false,
            left: false,
            fire: false
        },
        {
            id: 3,
            up: false,
            right: false,
            down: false,
            left: false,
            fire: false
        }
    ]
};

// Touch events for mobile controls using TouchController
function setupTouchControls() {
    // Create and initialize the touch controller
    const touchController = new TouchController({
        playerSelector: '.control-group'
    }).init();

    // Register callback for arrow button pressed
    touchController.on('arrow-down', function (playerId, direction) {
        let playerIndex;
        if (playerId === 'player1') {
            playerIndex = 0;
        } else if (playerId === 'player2') {
            playerIndex = 1;
        } else if (playerId === 'player3') {
            playerIndex = 2;
        }
        controls.players[playerIndex][direction] = true;
    });

    // Register callback for arrow button released
    touchController.on('arrow-up', function (playerId, direction) {
        let playerIndex;
        if (playerId === 'player1') {
            playerIndex = 0;
        } else if (playerId === 'player2') {
            playerIndex = 1;
        } else if (playerId === 'player3') {
            playerIndex = 2;
        }
        controls.players[playerIndex][direction] = false;
    });

    // Register callback for fire button pressed
    touchController.on('fire-down', function (playerId) {
        let playerIndex;
        if (playerId === 'player1') {
            playerIndex = 0;
        } else if (playerId === 'player2') {
            playerIndex = 1;
        } else if (playerId === 'player3') {
            playerIndex = 2;
        }
        controls.players[playerIndex].fire = true;
    });

    // Register callback for fire button released
    touchController.on('fire-up', function (playerId) {
        let playerIndex;
        if (playerId === 'player1') {
            playerIndex = 0;
        } else if (playerId === 'player2') {
            playerIndex = 1;
        } else if (playerId === 'player3') {
            playerIndex = 2;
        }
        controls.players[playerIndex].fire = false;
    });
}

// Initialize canvas and game setup
function init() {
    // Initial canvas resize
    resizeCanvas();

    // Add resize event listener with debounce to prevent excessive recalculations
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 100);
    });

    // Handle orientation change specifically for mobile devices
    window.addEventListener('orientationchange', function () {
        setTimeout(resizeCanvas, 200); // Slight delay to ensure new dimensions are available
    });

    setupTouchControls();

    // Menu buttons with both click and touchend events
    const addMenuButtonListeners = (buttonId, action) => {
        const button = document.getElementById(buttonId);
        const handleAction = (e) => {
            e.preventDefault(); // Prevent default behavior
            action();
            // Remove focus to prevent double-tap issues on iOS
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        };

        button.addEventListener('click', handleAction);
        button.addEventListener('touchend', handleAction);
    };

    addMenuButtonListeners('single-player', () => {
        startGame('single');
        gameContainer.focus();
    });

    addMenuButtonListeners('cooperative', () => {
        startGame('coop');
        gameContainer.focus();
    });

    addMenuButtonListeners('three-cooperative', () => {
        startGame('three-coop');
        gameContainer.focus();
    });

    addMenuButtonListeners('combat', () => {
        startGame('combat');
        gameContainer.focus();
    });

    // Restart and main menu buttons
    addMenuButtonListeners('restart', () => {
        gameOverScreen.style.display = 'none';
        startGame(game.mode);
    });

    addMenuButtonListeners('main-menu', () => {
        gameOverScreen.style.display = 'none';
        menu.style.display = 'flex';
    });

    // Pause button
    pauseBtn.addEventListener('click', togglePause);
    pauseBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        togglePause();
    });

    // Ensure the game container has focus for keyboard controls
    const gameContainer = document.getElementById('game-container');
    gameContainer.tabIndex = 0;
    gameContainer.focus();
    gameContainer.addEventListener('click', function () {
        this.focus();
    });

    // Add device debug info for troubleshooting
    const deviceInfo = document.createElement('div');
    deviceInfo.id = 'device-info';
    deviceInfo.style.position = 'absolute';
    deviceInfo.style.bottom = '10px';
    deviceInfo.style.left = '10px';
    deviceInfo.style.color = 'white';
    deviceInfo.style.fontSize = '10px';
    deviceInfo.style.zIndex = '30';
    deviceInfo.textContent = `Screen: ${window.innerWidth}x${window.innerHeight}, ${window.devicePixelRatio}x`;
    document.body.appendChild(deviceInfo);

    // Update device info on resize
    window.addEventListener('resize', function () {
        deviceInfo.textContent = `Screen: ${window.innerWidth}x${window.innerHeight}, ${window.devicePixelRatio}x`;
    });
}

// Mouse controls are now handled by the TouchController

// Maintain aspect ratio on resize and ensure game field fits the screen
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    let newWidth, newHeight;

    newWidth = containerWidth;
    newHeight = containerHeight;


    if (containerWidth / containerHeight > CANVAS_RATIO) {
        // Container is wider than needed
        newHeight = containerHeight;
        newWidth = containerHeight * CANVAS_RATIO;
    } else {
        // Container is taller than needed
        newWidth = containerWidth;
        newHeight = containerWidth / CANVAS_RATIO;
    }

    // Ensure dimensions are integers to prevent rendering issues
    newWidth = Math.floor(newWidth);
    newHeight = Math.floor(newHeight);

    // Update canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Update canvas style dimensions to ensure it's displayed correctly
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    // Center the canvas
    canvas.style.left = `${Math.floor((containerWidth - newWidth) / 2)}px`;
    canvas.style.top = `${Math.floor((containerHeight - newHeight) / 2)}px`;

    // If game is running, recreate the map to ensure it fits the new canvas size
    if (game.running && game.currentMap !== null) {
        // Clear blocks and recreate map
        game.blocks = [];
        createMap(MAPS[game.currentMap]);

        // Reposition tanks and other elements if needed
        repositionGameElements();
    }
}

// Toggle pause state
function togglePause() {
    if (game.running) {
        game.paused = !game.paused;
        pauseBtn.textContent = game.paused ? '▶' : '||';

        if (!game.paused) {
            requestAnimationFrame(gameLoop);
        }
    }
}

// Start the game with selected mode
function startGame(mode) {
    game.mode = mode;

    switch (mode) {
        case 'single':
            game.commonLives = 3;
            game.enemySpawnRate = BASE_ENEMY_SPAWN_RATE;
            break;
        case 'coop':
            game.commonLives = 6;
            game.enemySpawnRate = BASE_ENEMY_SPAWN_RATE / 1.3;
            break;
        case 'three-coop':
            game.commonLives = 9;
            game.enemySpawnRate = BASE_ENEMY_SPAWN_RATE / 1.5;
            break;
        case 'combat':
            game.commonLives = 6;
            game.enemySpawnRate = BASE_ENEMY_SPAWN_RATE / 1.5;
            break;
    }

    game.running = true;
    game.paused = false;

    // Reset game state
    game.blocks = [];
    game.tanks = [];
    game.bullets = [];
    game.powerups = [];
    game.enemies = [];

    // Reset player states
    for (let i = 0; i < game.players.length; i++) {
        game.players[i].score = 0;
        game.players[i].shield = false;
        game.players[i].rapidFire = false;
    }

    // Select and create random map
    const mapIndex = Math.floor(Math.random() * MAPS.length);
    game.currentMap = mapIndex;
    createMap(MAPS[mapIndex]);

    // Calculate enemy spawn points after map creation
    calculateEnemySpawnPoints();

    // Spawn initial enemies
    game.lastEnemySpawn = performance.now();
    for (let i = 0; i < 3; i++) {
        spawnEnemy();
    }

    // Set up player(s) based on game mode
    if (mode === 'single' || mode === 'coop' || mode === 'three-coop') {
        // Calculate positions based on canvas dimensions
        const player1 = game.players[0];
        player1.x = canvas.width / 4;
        player1.y = canvas.height - TANK_SIZE * 2;
        player1.direction = 'up';
        game.tanks.push({
            player: 1,
            x: player1.x,
            y: player1.y,
            direction: player1.direction,
            width: TANK_SIZE,
            height: TANK_SIZE
        });

        if (mode === 'coop' || mode === 'three-coop') {
            const player2 = game.players[1];
            player2.x = canvas.width * 3 / 4;
            player2.y = canvas.height - TANK_SIZE * 2;
            player2.direction = 'up';
            game.tanks.push({
                player: 2,
                x: player2.x,
                y: player2.y,
                direction: player2.direction,
                width: TANK_SIZE,
                height: TANK_SIZE
            });
            document.getElementById('player2').style.display = 'block';
            player2ScoreDisplay.style.display = 'block';

            if (mode === 'three-coop') {
                const player3 = game.players[2];
                player3.x = canvas.width * 3 / 4;
                player3.y = 0 + TANK_SIZE * 2;
                player3.direction = 'down';
                game.tanks.push({
                    player: 3,
                    x: player3.x,
                    y: player3.y,
                    direction: player3.direction,
                    width: TANK_SIZE,
                    height: TANK_SIZE
                });
                document.getElementById('player3').style.display = 'block';
                player3ScoreDisplay.style.display = 'block';
            } else {
                document.getElementById('player3').style.display = 'none';
                player3ScoreDisplay.style.display = 'none';
            }
        } else {
            document.getElementById('player2').style.display = 'none';
            player2ScoreDisplay.style.display = 'none';
            document.getElementById('player3').style.display = 'none';
            player3ScoreDisplay.style.display = 'none';
        }
    } else if (mode === 'combat') {
        const player1 = game.players[0];
        player1.x = canvas.width / 4;
        player1.y = canvas.height - TANK_SIZE * 2;
        player1.direction = 'up';
        game.tanks.push({
            player: 1,
            x: player1.x,
            y: player1.y,
            direction: player1.direction,
            width: TANK_SIZE,
            height: TANK_SIZE
        });

        const player2 = game.players[1];
        player2.x = canvas.width * 3 / 4;
        player2.y = TANK_SIZE * 2;
        player2.direction = 'down';
        game.tanks.push({
            player: 2,
            x: player2.x,
            y: player2.y,
            direction: player2.direction,
            width: TANK_SIZE,
            height: TANK_SIZE
        });

        document.getElementById('player2').style.display = 'block';
        player2ScoreDisplay.style.display = 'block';
    }

    // After creating the map and setting up tanks, check for initial collisions
    // and adjust positions if needed
    for (const tank of game.tanks) {
        moveToClosestAvailablePositionWithoutCollision(tank);
    }

    // Hide menu and start game loop
    menu.style.display = 'none';
    pauseBtn.style.display = 'block';
    pauseBtn.textContent = '||';
    updateScoreDisplay();

    requestAnimationFrame(gameLoop);
}

// Check for collision gradually increasing the distance from the initial position
// Return
function moveToClosestAvailablePositionWithoutCollision(tank) {
    const initialPosition = { x: tank.x, y: tank.y };
    let closestPosition = null;
    let closestDistance = Infinity;

    for (let distance = TANK_SIZE; distance <= canvas.width; distance += TANK_SIZE) {
        for (let angle = 0; angle < 360; angle += 45) {
            const x = initialPosition.x + distance * Math.cos(angle * Math.PI / 180);
            const y = initialPosition.y + distance * Math.sin(angle * Math.PI / 180);
            const newTank = { ...tank, x, y };
            if (!checkCollision(newTank, tank)) {
                const dist = Math.hypot(x - initialPosition.x, y - initialPosition.y);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestPosition = newTank;
                }
            }
        }
    }

    if (!closestPosition) {
        console.warn('No available position found for tank:', tank.player);
    } else {
        tank.x = closestPosition.x;
        tank.y = closestPosition.y;
    }
}

// Create map from layout
function createMap(mapLayout) {
    const mapWidth = mapLayout[0].length;
    const mapHeight = mapLayout.length;

    // Calculate block dimensions based on canvas size
    // Use Math.floor to ensure integer values for better rendering
    const blockWidth = Math.floor(canvas.width / mapWidth);
    const blockHeight = Math.floor(canvas.height / mapHeight);

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const blockType = mapLayout[y][x];
            const blockX = x * blockWidth;
            const blockY = y * blockHeight;

            if (blockType !== ' ') {
                game.blocks.push({
                    x: blockX,
                    y: blockY,
                    width: blockWidth,
                    height: blockHeight,
                    type: blockType
                });
            }
        }
    }
}

// Main game loop
function gameLoop(timestamp) {
    if (!game.running || game.paused) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game state
    updatePlayers(timestamp);
    updateEnemies();
    updateBullets();
    updatePowerups(timestamp);

    // Spawn new enemies in single player and cooperative modes
    if ((game.mode === 'single' || game.mode === 'coop' || game.mode === 'three-coop') &&

        timestamp - game.lastEnemySpawn > game.enemySpawnRate &&
        game.enemies.length < game.maxEnemies) {
        spawnEnemy();
        game.lastEnemySpawn = timestamp;
    }

    if (!game.lastRateChange || timestamp - game.lastRateChange > RATE_CHANGE_INTERVAL) {
        console.log(`New enemy spawn rate: ${game.enemySpawnRate}`);
        game.enemySpawnRate = game.enemySpawnRate * RATE_MULTIPLIER;
        game.lastRateChange = timestamp;
    }


    // Draw everything
    drawMap();
    drawTanks();
    drawBullets();
    drawPowerups();

    // Check for game over conditions
    checkGameOver();

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Update player tanks based on controls
function updatePlayers(timestamp) {
    // Update each player in the array
    for (let i = 0; i < game.players.length; i++) {
        const playerNum = i + 1;

        // Check if this player's tank is in the game
        if (game.tanks.find(tank => tank.player === playerNum)) {
            updatePlayerDirection(playerNum);
            movePlayerTank(playerNum);

            const player = game.players[i];
            const playerControls = controls.players[i];

            if (playerControls.fire &&
                timestamp - player.lastFired > (player.rapidFire ? player.fireRate / 2 : player.fireRate)) {
                fireBullet(playerNum);
                player.lastFired = timestamp;
            }
        }
    }
}

// Update player direction based on controls
function updatePlayerDirection(playerNum) {
    const playerIndex = playerNum - 1;
    const player = game.players[playerIndex];
    const playerControls = controls.players[playerIndex];

    if (playerControls.up) {
        player.direction = 'up';
        player.moving = 'up';
    } else if (playerControls.right) {
        player.direction = 'right';
        player.moving = 'right';
    } else if (playerControls.down) {
        player.direction = 'down';
        player.moving = 'down';
    } else if (playerControls.left) {
        player.direction = 'left';
        player.moving = 'left';
    } else {
        player.moving = null;
    }
}

// Move player tank based on direction
function movePlayerTank(playerNum) {
    const playerIndex = playerNum - 1;
    const player = game.players[playerIndex];
    if (!player.moving) return;


    const tank = game.tanks.find(t => t.player === playerNum);
    if (!tank) return;

    let newX = tank.x;
    let newY = tank.y;

    switch (player.moving) {
        case 'up':
            newY -= TANK_SPEED;
            break;
        case 'right':
            newX += TANK_SPEED;
            break;
        case 'down':
            newY += TANK_SPEED;
            break;
        case 'left':
            newX -= TANK_SPEED;
            break;
    }

    // Check for collision with walls and other tanks
    if (!checkCollision({
        x: newX,
        y: newY,
        width: TANK_SIZE,
        height: TANK_SIZE
    }, tank)) { // Added tank as second parameter to exclude self from collision check
        tank.x = newX;
        tank.y = newY;

        // Update player position reference
        player.x = newX;
        player.y = newY;

        tank.direction = player.direction;
    } else {
    }
    // Check for powerup collection
    checkPowerupCollection(tank);
}

// Update enemy tanks
function updateEnemies() {
    // Skip in combat mode
    if (game.mode === 'combat') return;

    game.enemies.forEach((enemy, index) => {
        // Randomly change direction or fire
        if (Math.random() < 0.01) {
            // Change direction
            const directions = ['up', 'right', 'down', 'left'];
            enemy.direction = directions[Math.floor(Math.random() * directions.length)];
        }

        if (Math.random() < 0.02) {
            // Fire bullet
            const bullet = {
                x: enemy.x + TANK_SIZE / 2 - BULLET_SIZE / 2,
                y: enemy.y + TANK_SIZE / 2 - BULLET_SIZE / 2,
                width: BULLET_SIZE,
                height: BULLET_SIZE,
                direction: enemy.direction,
                source: 'enemy',
                enemyIndex: index
            };

            game.bullets.push(bullet);
        }

        // Move enemy tank
        let newX = enemy.x;
        let newY = enemy.y;

        switch (enemy.direction) {
            case 'up':
                newY -= TANK_SPEED / 2; // Enemies move slower than players
                break;
            case 'right':
                newX += TANK_SPEED / 2;
                break;
            case 'down':
                newY += TANK_SPEED / 2;
                break;
            case 'left':
                newX -= TANK_SPEED / 2;
                break;
        }

        // Check for collision with walls and other tanks
        if (!checkCollision({
            x: newX,
            y: newY,
            width: TANK_SIZE,
            height: TANK_SIZE
        }, enemy)) {
            enemy.x = newX;
            enemy.y = newY;
        } else {
            // If collision, change direction
            const directions = ['up', 'right', 'down', 'left'];
            enemy.direction = directions[Math.floor(Math.random() * directions.length)];
        }
    });
}

// Update bullets positions and check for collisions
function updateBullets() {
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];

        // Move bullet
        switch (bullet.direction) {
            case 'up':
                bullet.y -= BULLET_SPEED;
                break;
            case 'right':
                bullet.x += BULLET_SPEED;
                break;
            case 'down':
                bullet.y += BULLET_SPEED;
                break;
            case 'left':
                bullet.x -= BULLET_SPEED;
                break;
        }

        // Check if bullet is out of bounds
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            game.bullets.splice(i, 1);
            continue;
        }

        // Check for collision with blocks
        let hitBlock = false;
        for (let j = game.blocks.length - 1; j >= 0; j--) {
            const block = game.blocks[j];

            if (checkRectCollision(bullet, block)) {
                // Hit a block
                hitBlock = true;

                // If brick wall, destroy it
                if (block.type === 'B') {
                    game.blocks.splice(j, 1);
                    // Add score for destroying a block
                    if (bullet.source === 'player1') {
                        game.players[0].score += 10;
                    } else if (bullet.source === 'player2') {
                        game.players[1].score += 10;
                    } else if (bullet.source === 'player3') {
                        game.players[2].score += 10;
                    }
                    updateScoreDisplay();
                }

                // Remove bullet
                game.bullets.splice(i, 1);
                break;
            }
        }

        if (hitBlock) continue;

        // Check for collision with tanks
        // First, check player tanks if bullet from enemy
        if (bullet.source === 'enemy') {
            for (let j = game.tanks.length - 1; j >= 0; j--) {
                const tank = game.tanks[j];

                if (checkRectCollision(bullet, tank)) {
                    // Hit a player tank
                    game.bullets.splice(i, 1);

                    // If player has shield, no damage
                    const playerIndex = tank.player - 1;
                    const player = game.players[playerIndex];
                    if (player.shield) continue;

                    // Reduce lives from common pool in all modes
                    game.commonLives--;
                    updateScoreDisplay();

                    // If out of lives, remove tank
                    if (game.commonLives <= 0) {
                        game.tanks.splice(j, 1);
                    } else {
                        // Respawn tank
                        respawnPlayerTank(tank.player);
                    }

                    break;
                }
            }
        }
        // Check enemy tanks if bullet from player
        else if (bullet.source === 'player1' || bullet.source === 'player2' || bullet.source === 'player3') {
            for (let j = game.enemies.length - 1; j >= 0; j--) {
                const enemy = game.enemies[j];

                if (checkRectCollision(bullet, enemy)) {
                    // Hit an enemy tank
                    game.bullets.splice(i, 1);
                    game.enemies.splice(j, 1);

                    // Add score for destroying an enemy
                    if (bullet.source === 'player1') {
                        game.players[0].score += 100;
                    } else if (bullet.source === 'player2') {
                        game.players[1].score += 100;
                    } else if (bullet.source === 'player3') {
                        game.players[2].score += 100;
                    }

                    updateScoreDisplay();

                    // Random chance to drop powerup
                    if (Math.random() < 0.3) {
                        spawnPowerup(enemy.x, enemy.y);
                    }

                    break;
                }
            }
        }
        // In combat mode, check if player1 bullet hits player2 or vice versa
        else if (game.mode === 'combat') {
            if (bullet.source === 'player1') {
                const player2Tank = game.tanks.find(tank => tank.player === 2);
                if (player2Tank && checkRectCollision(bullet, player2Tank)) {
                    game.bullets.splice(i, 1);

                    // If player has shield, no damage
                    if (!game.players[1].shield) {
                        game.commonLives--;
                        updateScoreDisplay();

                        // If out of lives, remove tank
                        if (game.commonLives <= 0) {
                            game.tanks = game.tanks.filter(tank => tank.player !== 2);
                        } else {
                            // Respawn tank
                            respawnPlayerTank(2);
                        }

                        // Add score
                        game.players[0].score += 50;
                        updateScoreDisplay();
                    }
                }
            } else if (bullet.source === 'player2') {
                const player1Tank = game.tanks.find(tank => tank.player === 1);
                if (player1Tank && checkRectCollision(bullet, player1Tank)) {
                    game.bullets.splice(i, 1);

                    // If player has shield, no damage
                    if (!game.players[0].shield) {
                        game.commonLives--;
                        updateScoreDisplay();

                        // If out of lives, remove tank
                        if (game.commonLives <= 0) {
                            game.tanks = game.tanks.filter(tank => tank.player !== 1);
                        } else {
                            // Respawn tank
                            respawnPlayerTank(1);
                        }

                        // Add score
                        game.players[1].score += 50;
                        updateScoreDisplay();
                    }
                }
            }
        }
    }
}

// Update powerups and check for expiration
function updatePowerups(timestamp) {
    // Check for powerup expiration for all players
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];

        if (player.shield && timestamp - player.shieldStart > POWERUP_DURATION) {
            player.shield = false;
        }

        if (player.rapidFire && timestamp - player.rapidFireStart > POWERUP_DURATION) {
            player.rapidFire = false;
        }
    }

    // Remove expired powerups
    for (let i = game.powerups.length - 1; i >= 0; i--) {
        const powerup = game.powerups[i];
        if (timestamp - powerup.spawnTime > 10000) { // Powerups last 10 seconds on the map
            game.powerups.splice(i, 1);
        }
    }
}

// Fire a bullet from player tank
function fireBullet(playerNum) {
    const tank = game.tanks.find(t => t.player === playerNum);
    if (!tank) return;

    const playerIndex = playerNum - 1;
    const player = game.players[playerIndex];

    let bulletX = tank.x + TANK_SIZE / 2 - BULLET_SIZE / 2;
    let bulletY = tank.y + TANK_SIZE / 2 - BULLET_SIZE / 2;

    // Adjust bullet starting position based on direction
    switch (player.direction) {
        case 'up':
            bulletY = tank.y - BULLET_SIZE;
            break;
        case 'right':
            bulletX = tank.x + TANK_SIZE;
            break;
        case 'down':
            bulletY = tank.y + TANK_SIZE;
            break;
        case 'left':
            bulletX = tank.x - BULLET_SIZE;
            break;
    }

    const bullet = {
        x: bulletX,
        y: bulletY,
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        direction: player.direction,
        source: `player${playerNum}`
    };

    game.bullets.push(bullet);
}

// Spawn an enemy tank at a random location
function spawnEnemy() {
    if (game.enemySpawnPoints.length === 0) return;

    // Select a random spawn point
    const spawnPointIndex = Math.floor(Math.random() * game.enemySpawnPoints.length);
    const spawnPoint = game.enemySpawnPoints[spawnPointIndex];

    // Create enemy tank
    const enemyTank = {
        x: spawnPoint.x,
        y: spawnPoint.y,
        width: TANK_SIZE,
        height: TANK_SIZE,
        direction: 'down',
        color: '#e74c3c' // Red
    };

    // Check for collision and find alternative position if needed
    moveToClosestAvailablePositionWithoutCollision(enemyTank);
    game.enemies.push(enemyTank);
}

// Spawn a powerup at the given location
function spawnPowerup(x, y) {
    const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];

    game.powerups.push({
        x: x,
        y: y,
        width: TANK_SIZE / 2,
        height: TANK_SIZE / 2,
        type: powerupType,
        spawnTime: performance.now()
    });
}

// Check for powerup collection
function checkPowerupCollection(tank) {
    for (let i = game.powerups.length - 1; i >= 0; i--) {
        const powerup = game.powerups[i];

        if (checkRectCollision(tank, powerup)) {
            // Collected powerup
            const playerIndex = tank.player - 1;
            const player = game.players[playerIndex];

            switch (powerup.type) {
                case 'shield':
                    player.shield = true;
                    player.shieldStart = performance.now();
                    break;
                case 'extraLife':
                    // Add to common lives pool in all modes
                    game.commonLives++;
                    updateScoreDisplay();
                    break;
                case 'rapidFire':
                    player.rapidFire = true;
                    player.rapidFireStart = performance.now();
                    break;
                case 'bombAll':
                    // Destroy all enemies on screen
                    if (game.mode !== 'combat') {
                        // Add score for each enemy destroyed
                        const scorePerEnemy = 50;
                        const totalScore = game.enemies.length * scorePerEnemy;

                        // Add score to the player who collected the powerup
                        player.score += totalScore;

                        game.enemies = [];
                        updateScoreDisplay();
                    }
                    break;
            }

            // Remove the powerup
            game.powerups.splice(i, 1);
        }
    }
}

// Respawn a player tank
function respawnPlayerTank(playerNum) {
    const index = game.tanks.findIndex(tank => tank.player === playerNum);
    if (index !== -1) {
        const tank = game.tanks[index];
        const playerIndex = playerNum - 1;
        const player = game.players[playerIndex];

        if (playerNum === 1) {
            tank.x = canvas.width / 4;
            tank.y = canvas.height - TANK_SIZE * 2;
            tank.direction = 'up';
            moveToClosestAvailablePositionWithoutCollision(tank);
        } else if (playerNum === 2) {
            if (game.mode === 'coop' || game.mode === 'three-coop') {
                tank.x = canvas.width * 3 / 4;
                tank.y = canvas.height - TANK_SIZE * 2;
                tank.direction = 'up';
            } else { // Combat mode
                tank.x = canvas.width * 3 / 4;
                tank.y = TANK_SIZE * 2;
                tank.direction = 'down';
            }
            moveToClosestAvailablePositionWithoutCollision(tank);
        } else if (playerNum === 3 && game.mode === 'three-coop') {
            tank.x = canvas.width * 3 / 4;
            player3.y = 0 + TANK_SIZE * 2;
            tank.direction = 'down';
            moveToClosestAvailablePositionWithoutCollision(tank);
        }

        // Update player position reference
        player.x = tank.x;
        player.y = tank.y;
        player.direction = tank.direction;
    }
}

// Check for collisions
function checkCollision(object, ignoreObject = null) {
    // Check collision with canvas boundaries
    // Add a small buffer (1 pixel) to prevent objects from being exactly at the edge
    if (object.x < 1 || object.x + object.width > canvas.width - 1 ||
        object.y < 1 || object.y + object.height > canvas.height - 1) {

        return true;
    }

    // Check collision with blocks
    for (const block of game.blocks) {
        // Skip forest blocks as they don't block movement
        if (block.type === 'F') continue;

        if (checkRectCollision(object, block)) {
            return true;
        }
    }

    // Check collision with other tanks
    for (const tank of game.tanks) {
        if (tank === ignoreObject) continue;

        if (checkRectCollision(object, tank)) {
            return true;
        }
    }

    // Check collision with enemy tanks
    for (const enemy of game.enemies) {
        if (enemy === ignoreObject) continue;

        if (checkRectCollision(object, enemy)) {
            return true;
        }
    }

    return false;
}

// Helper function to check rectangle collision
function checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

// Check for game over conditions
function checkGameOver() {
    // Check common lives pool for all modes
    if (game.commonLives <= 0) {
        if (game.mode === 'combat') {
            // In combat mode, determine winner based on remaining tanks
            if (!game.tanks.find(tank => tank.player === 1)) {
                endGame("Player 2 Wins!");
            } else if (!game.tanks.find(tank => tank.player === 2)) {
                endGame("Player 1 Wins!");
            } else {
                endGame("Game Over");
            }
        } else {
            // In single or coop mode
            endGame("Game Over");
        }
    }
}

// End the game and show game over screen
function endGame(message) {
    game.running = false;

    // Update game over screen
    if (game.mode === 'single') {
        finalScoreDisplay.textContent = `Final Score: ${game.players[0].score}`;
        winnerDisplay.textContent = '';
    } else if (game.mode === 'coop') {
        finalScoreDisplay.textContent = `Player 1: ${game.players[0].score} - Player 2: ${game.players[1].score}`;
        winnerDisplay.textContent = '';
    } else if (game.mode === 'three-coop') {
        finalScoreDisplay.textContent = `P1: ${game.players[0].score} - P2: ${game.players[1].score} - P3: ${game.players[2].score}`;
        winnerDisplay.textContent = '';
    } else { // Combat mode
        finalScoreDisplay.textContent = `Player 1: ${game.players[0].score} - Player 2: ${game.players[1].score}`;
        winnerDisplay.textContent = message;
    }

    gameOverScreen.style.display = 'flex';
}

// Update score display
function updateScoreDisplay() {
    player1ScoreDisplay.textContent = `P1: ${game.players[0].score}`;
    player2ScoreDisplay.textContent = `P2: ${game.players[1].score}`;
    player3ScoreDisplay.textContent = `P3: ${game.players[2].score}`;

    // Display common lives pool for all modes
    livesDisplay.textContent = `Lives: ${game.commonLives}`;
}

// Draw functions
function drawMap() {
    for (const block of game.blocks) {
        switch (block.type) {
            case 'B': // Brick wall
                ctx.fillStyle = '#e67e22';
                ctx.fillRect(block.x, block.y, block.width, block.height);

                // Add brick pattern
                ctx.strokeStyle = '#d35400';
                ctx.lineWidth = 1;

                // Horizontal lines
                const brickHeight = block.height / 4;
                for (let i = 0; i <= 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(block.x, block.y + i * brickHeight);
                    ctx.lineTo(block.x + block.width, block.y + i * brickHeight);
                    ctx.stroke();
                }

                // Vertical lines - alternating pattern
                const brickWidth = block.width / 2;
                for (let i = 0; i < 4; i++) {
                    const offset = i % 2 === 0 ? 0 : brickWidth;
                    ctx.beginPath();
                    ctx.moveTo(block.x + offset, block.y + i * brickHeight);
                    ctx.lineTo(block.x + offset, block.y + (i + 1) * brickHeight);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(block.x + brickWidth + offset, block.y + i * brickHeight);
                    ctx.lineTo(block.x + brickWidth + offset, block.y + (i + 1) * brickHeight);
                    ctx.stroke();
                }
                break;

            case 'S': // Steel wall
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(block.x, block.y, block.width, block.height);

                // Add steel pattern
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 2;

                // Border
                ctx.strokeRect(block.x, block.y, block.width, block.height);

                // Inner border
                ctx.strokeRect(block.x + 5, block.y + 5, block.width - 10, block.height - 10);
                break;

            case 'W': // Water
                ctx.fillStyle = '#3498db';
                ctx.fillRect(block.x, block.y, block.width, block.height);

                // Add water pattern
                ctx.fillStyle = '#2980b9';

                // Create waves
                const waveHeight = block.height / 8;
                const numWaves = 3;
                const waveWidth = block.width / numWaves;

                for (let i = 0; i < numWaves; i++) {
                    ctx.beginPath();
                    ctx.moveTo(block.x + i * waveWidth, block.y + block.height / 2);
                    ctx.bezierCurveTo(
                        block.x + i * waveWidth + waveWidth / 3, block.y + block.height / 2 - waveHeight,
                        block.x + i * waveWidth + waveWidth * 2 / 3, block.y + block.height / 2 - waveHeight,
                        block.x + (i + 1) * waveWidth, block.y + block.height / 2
                    );
                    ctx.lineTo(block.x + (i + 1) * waveWidth, block.y + block.height);
                    ctx.lineTo(block.x + i * waveWidth, block.y + block.height);
                    ctx.closePath();
                    ctx.fill();
                }
                break;

            case 'F': // Forest
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(block.x, block.y, block.width, block.height);

                // Add forest pattern
                ctx.fillStyle = '#2ecc71';

                // Create tree shapes
                const treeSize = Math.min(block.width, block.height) / 3;

                // Draw 3x3 grid of tree tops
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        ctx.beginPath();
                        ctx.arc(
                            block.x + treeSize / 2 + i * treeSize,
                            block.y + treeSize / 2 + j * treeSize,
                            treeSize / 2,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }
                }
                break;
        }
    }
}

function drawTanks() {
    // Draw player tanks
    for (const tank of game.tanks) {
        const playerIndex = tank.player - 1;
        const player = game.players[playerIndex];

        // Base tank body
        ctx.fillStyle = player.color;
        ctx.fillRect(tank.x, tank.y, TANK_SIZE, TANK_SIZE);

        // Tank tracks
        ctx.fillStyle = '#34495e';
        ctx.fillRect(tank.x, tank.y, TANK_SIZE / 5, TANK_SIZE);
        ctx.fillRect(tank.x + TANK_SIZE * 4 / 5, tank.y, TANK_SIZE / 5, TANK_SIZE);

        // Tank turret based on direction
        ctx.fillStyle = player.color;
        const turretWidth = TANK_SIZE / 4;
        const turretLength = TANK_SIZE / 2;

        switch (tank.direction) {
            case 'up':
                ctx.fillRect(tank.x + (TANK_SIZE - turretWidth) / 2, tank.y - turretLength / 2, turretWidth, turretLength);
                break;
            case 'right':
                ctx.fillRect(tank.x + TANK_SIZE - turretLength / 2, tank.y + (TANK_SIZE - turretWidth) / 2, turretLength, turretWidth);
                break;
            case 'down':
                ctx.fillRect(tank.x + (TANK_SIZE - turretWidth) / 2, tank.y + TANK_SIZE - turretLength / 2, turretWidth, turretLength);
                break;
            case 'left':
                ctx.fillRect(tank.x - turretLength / 2, tank.y + (TANK_SIZE - turretWidth) / 2, turretLength, turretWidth);
                break;
        }

        // Draw shield if active
        if (player.shield) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(tank.x + TANK_SIZE / 2, tank.y + TANK_SIZE / 2, TANK_SIZE * 0.7, 0, Math.PI * 2);
            ctx.stroke();

            // Add glow effect
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(tank.x + TANK_SIZE / 2, tank.y + TANK_SIZE / 2, TANK_SIZE * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Draw enemy tanks
    for (const enemy of game.enemies) {
        // Base tank body
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, TANK_SIZE, TANK_SIZE);

        // Tank tracks
        ctx.fillStyle = '#34495e';
        ctx.fillRect(enemy.x, enemy.y, TANK_SIZE / 5, TANK_SIZE);
        ctx.fillRect(enemy.x + TANK_SIZE * 4 / 5, enemy.y, TANK_SIZE / 5, TANK_SIZE);

        // Tank turret based on direction
        ctx.fillStyle = enemy.color;
        const turretWidth = TANK_SIZE / 4;
        const turretLength = TANK_SIZE / 2;

        switch (enemy.direction) {
            case 'up':
                ctx.fillRect(enemy.x + (TANK_SIZE - turretWidth) / 2, enemy.y - turretLength / 2, turretWidth, turretLength);
                break;
            case 'right':
                ctx.fillRect(enemy.x + TANK_SIZE - turretLength / 2, enemy.y + (TANK_SIZE - turretWidth) / 2, turretLength, turretWidth);
                break;
            case 'down':
                ctx.fillRect(enemy.x + (TANK_SIZE - turretWidth) / 2, enemy.y + TANK_SIZE - turretLength / 2, turretWidth, turretLength);
                break;
            case 'left':
                ctx.fillRect(enemy.x - turretLength / 2, enemy.y + (TANK_SIZE - turretWidth) / 2, turretLength, turretWidth);
                break;
        }
    }
}

function drawBullets() {
    for (const bullet of game.bullets) {
        ctx.fillStyle = bullet.source.includes('player') ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE);

        // Add bullet trail effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        let trailX = bullet.x;
        let trailY = bullet.y;

        switch (bullet.direction) {
            case 'up':
                trailY = bullet.y + BULLET_SIZE;
                break;
            case 'right':
                trailX = bullet.x - BULLET_SIZE;
                break;
            case 'down':
                trailY = bullet.y - BULLET_SIZE;
                break;
            case 'left':
                trailX = bullet.x + BULLET_SIZE;
                break;
        }

        ctx.fillRect(trailX, trailY, BULLET_SIZE, BULLET_SIZE);
    }
}

function drawPowerups() {
    for (const powerup of game.powerups) {
        // Draw powerup box
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);

        // Draw powerup icon
        ctx.fillStyle = 'white';

        switch (powerup.type) {
            case 'shield':
                // Draw shield icon
                ctx.beginPath();
                ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2,
                    powerup.width / 3, 0, Math.PI * 2);
                ctx.stroke();
                break;

            case 'extraLife':
                // Draw heart icon
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(powerup.x + powerup.width / 2, powerup.y + powerup.height / 4);
                ctx.bezierCurveTo(
                    powerup.x + powerup.width / 4, powerup.y + powerup.height / 8,
                    powerup.x + powerup.width / 8, powerup.y + powerup.height / 2,
                    powerup.x + powerup.width / 2, powerup.y + powerup.height * 3 / 4
                );
                ctx.bezierCurveTo(
                    powerup.x + powerup.width * 7 / 8, powerup.y + powerup.height / 2,
                    powerup.x + powerup.width * 3 / 4, powerup.y + powerup.height / 8,
                    powerup.x + powerup.width / 2, powerup.y + powerup.height / 4
                );
                ctx.fill();
                break;

            case 'rapidFire':
                // Draw lightning bolt icon
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath();
                ctx.moveTo(powerup.x + powerup.width * 3 / 4, powerup.y + powerup.height / 4);
                ctx.lineTo(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
                ctx.lineTo(powerup.x + powerup.width * 3 / 5, powerup.y + powerup.height / 2);
                ctx.lineTo(powerup.x + powerup.width / 4, powerup.y + powerup.height * 3 / 4);
                ctx.lineTo(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
                ctx.lineTo(powerup.x + powerup.width * 2 / 5, powerup.y + powerup.height / 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 'bombAll':
                // Draw bomb icon
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height * 3 / 5,
                    powerup.width / 3, 0, Math.PI * 2);
                ctx.fill();

                // Fuse
                ctx.strokeStyle = '#95a5a6';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(powerup.x + powerup.width / 2, powerup.y + powerup.height * 2 / 5);
                ctx.lineTo(powerup.x + powerup.width / 2, powerup.y + powerup.height / 4);
                ctx.stroke();
                break;
        }
    }
}

// Initialize the game
init();

// Reposition game elements after canvas resize
function repositionGameElements() {
    // Reposition player tanks
    for (const tank of game.tanks) {
        const playerIndex = tank.player - 1;
        const player = game.players[playerIndex];

        // Reposition based on player number and game mode
        if (tank.player === 1) {
            tank.x = canvas.width / 4;
            tank.y = canvas.height - TANK_SIZE * 2;
            tank.direction = 'up';
        } else if (tank.player === 2) {
            if (game.mode === 'coop' || game.mode === 'three-coop') {
                tank.x = canvas.width * 3 / 4;
                tank.y = canvas.height - TANK_SIZE * 2;
                tank.direction = 'up';
            } else { // Combat mode
                tank.x = canvas.width * 3 / 4;
                tank.y = TANK_SIZE * 2;
                tank.direction = 'down';
            }
        } else if (tank.player === 3 && game.mode === 'three-coop') {
            tank.x = canvas.width * 3 / 4;
            tank.y = TANK_SIZE * 2;
            tank.direction = 'down';
        }

        // Update player position reference
        player.x = tank.x;
        player.y = tank.y;
        player.direction = tank.direction;

        // Ensure tank is not colliding with anything
        moveToClosestAvailablePositionWithoutCollision(tank);
    }

    // Recalculate enemy spawn points
    calculateEnemySpawnPoints();

    // Reposition enemies if needed
    for (const enemy of game.enemies) {
        moveToClosestAvailablePositionWithoutCollision(enemy);
    }

    // Adjust bullets to ensure they're within bounds
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            game.bullets.splice(i, 1);
        }
    }

    // Adjust powerups to ensure they're within bounds
    for (let i = game.powerups.length - 1; i >= 0; i--) {
        const powerup = game.powerups[i];
        if (powerup.x < 0 || powerup.x > canvas.width || powerup.y < 0 || powerup.y > canvas.height) {
            game.powerups.splice(i, 1);
        }
    }
}

// Create randomly distributed spawn points, ensuring that there is no collision
function calculateEnemySpawnPoints() {
    game.enemySpawnPoints = [];

    // Try to find random positions across the map
    const numAttempts = 15; // More attempts to ensure we get enough valid ones
    for (let i = 0; i < numAttempts; i++) {
        // Random position with margin from edges
        const margin = TANK_SIZE * 2;
        const x = margin + Math.random() * (canvas.width / 3 * 2 - margin * 2);
        const y = margin + Math.random() * (canvas.height / 3);

        const potentialPoint = {
            x: x,
            y: y,
            width: TANK_SIZE,
            height: TANK_SIZE
        };

        if (!checkCollision(potentialPoint)) {
            game.enemySpawnPoints.push({ x, y });
            // Stop once we have 5 valid points
            if (game.enemySpawnPoints.length >= 5) break;
        }
    }

    // If no valid points found, add default points and they'll be adjusted during spawning
    if (game.enemySpawnPoints.length === 0) {
        game.enemySpawnPoints = [
            { x: canvas.width / 4, y: TANK_SIZE },
            { x: canvas.width / 2, y: TANK_SIZE },
            { x: canvas.width * 3 / 4, y: TANK_SIZE }
        ];
        console.log("Default enemy spawn points used:", game.enemySpawnPoints);
    } else {
        console.log("Found game.enemySpawnPoints:", game.enemySpawnPoints);
    }
}
