/**
 * Touch.js - A reusable touch controller library for multi-player touch controls
 */
class TouchController {
    constructor(options = {}) {
        // Default options
        this.options = {
            playerSelector: 'body',
            ...options
        };

        // State tracking
        this.activePointers = {};
        this.playerTouches = {};
        this.playerFires = {};
        this.keysPressed = {}; // Track keyboard state

        // Callbacks storage
        this.callbacks = {
            'arrow-down': [],
            'arrow-up': [],
            'fire-down': [],
            'fire-up': []
        };

        // Bound event handlers to allow removal
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
        this.boundDragStart = this.handleDragStart.bind(this);
        this.handleSelectStart = this.handleSelectStart.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
    }

    /**
     * Initialize the touch controller
     */
    init() {
        // Find all interactive elements
        this.controlGroups = document.querySelectorAll(this.options.playerSelector);

        // Initialize playerTouches for player1 (since we're using body as the control area)
        this.playerTouches['player1'] = 0;

        // Attach event listeners
        this.attachEventListeners();

        return this;
    }

    /**
     * Clean up event listeners when done
     */
    destroy() {
        this.detachEventListeners();
        this.activePointers = {};
        this.playerTouches = {};
        this.callbacks = {
            'arrow-down': [],
            'arrow-up': [],
            'fire-down': [],
            'fire-up': []
        };
    }

    /**
     * Attach event listeners for mouse and touch
     */
    attachEventListeners() {
        // Mouse events
        document.addEventListener('mousedown', this.boundMouseDown);
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);

        // Touch events
        document.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        document.addEventListener('touchend', this.boundTouchEnd);
        document.addEventListener('touchcancel', this.boundTouchEnd);

        // Keyboard events
        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('keyup', this.boundKeyUp);

        // Prevent dragging and selection
        document.addEventListener('dragstart', this.boundDragStart);
        document.addEventListener('selectstart', this.handleSelectStart);

        // Prevent context menu on long press
        document.addEventListener('contextmenu', this.handleContextMenu);
    }

    /**
     * Remove event listeners
     */
    detachEventListeners() {
        // Mouse events
        document.removeEventListener('mousedown', this.boundMouseDown);
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);

        // Touch events
        document.removeEventListener('touchstart', this.boundTouchStart);
        document.removeEventListener('touchmove', this.boundTouchMove);
        document.removeEventListener('touchend', this.boundTouchEnd);
        document.removeEventListener('touchcancel', this.boundTouchEnd);

        // Keyboard events
        document.removeEventListener('keydown', this.boundKeyDown);
        document.removeEventListener('keyup', this.boundKeyUp);

        // Prevent dragging and selection
        document.removeEventListener('dragstart', this.boundDragStart);
        document.removeEventListener('selectstart', this.handleSelectStart);

        // Remove context menu prevention
        document.removeEventListener('contextmenu', this.handleContextMenu);
    }

    /**
     * Register a callback for button state changes
     * @param {string} event - Event name ('arrow-down', 'arrow-up', 'fire-down', 'fire-up')
     * @param {function} callback - Callback function(playerId, direction, element)
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
        return this;
    }

    /**
     * Trigger registered callbacks
     * @param {string} event - Event name
     * @param {string} playerId - Player ID
     * @param {string} direction - Direction ('up', 'down', 'left', 'right', 'fire')
     */
    trigger(event, playerId, direction) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                callback(playerId, direction);
            });
        }
    }

    // =========== CORE POINTER INTERACTION LOGIC ===========

    pointerStart(pointerId, x, y) {
        const playerId = this.playerIdFromPointer(x, y);

        if (!playerId) {
            return
        }

        const activePointer = {
            pointerId: pointerId,
            playerId: playerId,
            x: x,
            y: y,
            direction: null
        };

        this.activePointers[pointerId] = activePointer;
        this.playerTouches[playerId]++;

        if (this.playerTouches[playerId] > 1 && !this.playerFires[playerId]) {
            activePointer.direction = 'fire';
            this.playerFires[playerId] = true;
            this.trigger('fire-down', playerId, activePointer.direction);
        }

    }

    pointerMove(pointerId, x, y) {
        const activePointer = this.activePointers[pointerId];
        if (!activePointer) {
            return;
        }

        const playerId = this.playerIdFromPointer(x, y);

        // PlayerId changed
        if (activePointer.direction && playerId !== activePointer.playerId) {
            this.removePointer(activePointer);
            return;
        }

        if (activePointer.direction === 'fire') {
            return;
        }

        if (Math.abs(activePointer.x - x) > 20 || Math.abs(activePointer.y - y) > 20) {
            const direction = this.getDirection(activePointer.x, activePointer.y, x, y);
            if (activePointer.direction && activePointer.direction != direction) {
                this.trigger('arrow-up', activePointer.playerId, activePointer.direction);
            }

            activePointer.direction = direction;
            activePointer.x = x;
            activePointer.y = y;
            this.trigger('arrow-down', activePointer.playerId, direction);
        }
        return;
    }

    pointerEnd(pointerId) {
        const activePointer = this.activePointers[pointerId];
        if (!activePointer) {
            return;
        }
        this.removePointer(activePointer);
    }

    removePointer(activePointer) {
        this.playerTouches[activePointer.playerId]--;
        delete this.activePointers[activePointer.pointerId];
        if (activePointer.direction === 'fire') {
            this.trigger('fire-up', activePointer.playerId, activePointer.direction);
            this.playerFires[activePointer.playerId] = false;
        } else if (activePointer.direction) {
            this.trigger('arrow-up', activePointer.playerId, activePointer.direction);
        }
    }

    // =========== ELEMENT DETECTION FUNCTIONS ===========

    getDirection(centerX, centerY, x, y) {
        const dx = x - centerX;
        const dy = y - centerY;

        // Determine which direction based on the largest component
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal movement dominates
            return dx > 0 ? 'right' : 'left';
        } else {
            // Vertical movement dominates
            return dy > 0 ? 'down' : 'up';
        }
    }

    playerIdFromPointer(x, y) {
        const playerInfo = this.playerFromPointer(x, y);
        return playerInfo ? playerInfo.playerId : null;
    }
    playerFromPointer(x, y) {
        // Since we're using the entire screen as the control area, always return player1
        return {
            player: 1,
            playerId: 'player1'
        };
    }

    // =========== EVENT HANDLERS ===========

    handleMouseDown(e) {
        this.pointerStart('mouse', e.clientX, e.clientY);
    }

    handleMouseMove(e) {
        this.pointerMove('mouse', e.clientX, e.clientY);
    }

    handleMouseUp() {
        this.pointerEnd('mouse');
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touches = e.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            this.pointerStart(touch.identifier, touch.clientX, touch.clientY);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touches = e.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            this.pointerMove(touch.identifier, touch.clientX, touch.clientY);
        }
    }

    handleTouchEnd(e) {
        const touches = e.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            this.pointerEnd(touch.identifier);
        }
    }

    handleDragStart(e) {
        e.preventDefault();
    }

    handleSelectStart(e) {
        e.preventDefault();
        return false;
    }

    handleContextMenu(e) {
        // Prevent context menu on long press/right-click anywhere on the screen
        e.preventDefault();
        return false;
    }

    // =========== KEYBOARD HANDLERS ===========

    /**
     * Handle keyboard key down events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        // Prevent default actions for arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }

        // Skip if already pressed to avoid repeat triggers
        if (this.keysPressed[e.key]) return;

        this.keysPressed[e.key] = true;

        // Use player1 as the default player ID
        const player1Id = 'player1';

        // Map keys to actions
        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.trigger('arrow-down', player1Id, 'up');
                break;
            case 'arrowdown':
            case 's':
                this.trigger('arrow-down', player1Id, 'down');
                break;
            case 'arrowleft':
            case 'a':
                this.trigger('arrow-down', player1Id, 'left');
                break;
            case 'arrowright':
            case 'd':
                this.trigger('arrow-down', player1Id, 'right');
                break;
            case ' ':
                this.trigger('fire-down', player1Id, 'fire');
                break;
        }
    }

    /**
     * Handle keyboard key up events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
        // Skip if not previously pressed
        if (!this.keysPressed[e.key]) return;

        this.keysPressed[e.key] = false;

        // Use player1 as the default player ID
        const player1Id = 'player1';

        // Map keys to actions
        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.trigger('arrow-up', player1Id, 'up');
                break;
            case 'arrowdown':
            case 's':
                this.trigger('arrow-up', player1Id, 'down');
                break;
            case 'arrowleft':
            case 'a':
                this.trigger('arrow-up', player1Id, 'left');
                break;
            case 'arrowright':
            case 'd':
                this.trigger('arrow-up', player1Id, 'right');
                break;
            case ' ':
                this.trigger('fire-up', player1Id, 'fire');
                break;
        }
    }

}

// Export the TouchController class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchController;
} else {
    window.TouchController = TouchController;
}