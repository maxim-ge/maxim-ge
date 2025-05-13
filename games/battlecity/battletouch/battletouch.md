# Battletouch

Evolution of the battlecity: using [touch.js](../touch5ex/touch.js) library for touch controls

## Prompts

- Design the implementation plan for Battletouch. Do not generate a lot of code yet, focus on steps and descriptions

## Implementation plan

- https://github.com/maxim-ge/utils/commit/175baed1edb8eb02cd41dc2fa94f3e3139f5d9d7

### Overview

This plan outlines how to integrate the touch.js library into the existing Battle City game to improve touch controls and create a more responsive gaming experience.

### 1: Setup and Analysis

#### 1.1: Library Integration

- Import the TouchController class from touch.js into the project
- Identify touch control elements in the HTML structure that need to be targeted

#### 1.2: Control Group Configuration

- Refactor HTML structure to properly define player control groups
- Add appropriate IDs and classes to elements for TouchController to target

3. **Game State Analysis**
   - Review current control state management in the game
   - Map existing control actions to TouchController callbacks

### Phase 2: TouchController Implementation

1. **Initialize TouchController**
   - Create an instance of TouchController with appropriate options
   - Configure player selectors for control groups
   - Set up controller initialization on game start

2. **Map Control Events**
   - Replace direct touch event handlers with TouchController callbacks
   - Set up event handlers for both players:
     - `arrow-down`: Handle tank movement start in specific direction
     - `arrow-up`: Handle tank movement stop
     - `fire-down`: Handle firing start
     - `fire-up`: Handle firing stop

3. **Keyboard Support**
   - Utilize TouchController's built-in keyboard handling
   - Ensure keyboard controls still function for testing and accessibility

### Phase 3: Control Group Refinement

1. **Control Layout Optimization**
   - Update the control areas to be more responsive and user-friendly
   - Ensure proper sizing and positioning for different devices
   - Create clear visual indicators for control areas

2. **Multi-Touch Handling**
   - Implement proper handling for simultaneous movement and firing
   - Configure TouchController to correctly manage multi-touch scenarios
   - Test different touch patterns to ensure smooth gameplay

### Phase 4: Game Logic Integration

1. **Control State Management**
   - Update `controls` object to work with TouchController events
   - Ensure proper state transitions between control inputs

2. **Player Movement Logic**
   - Modify `updatePlayerDirection` and `movePlayerTank` functions to work with new control input
   - Ensure smooth transitions between directional inputs

3. **Firing Mechanism**
   - Update firing logic to work with the new touch control system
   - Implement proper timing for rapid fire based on control inputs

### Phase 5: Testing and Refinement

1. **Device Testing**
   - Test on various touch devices (tablets, phones)
   - Verify different screen sizes handle controls appropriately

2. **Control Responsiveness**
   - Fine-tune touch sensitivity and response times
   - Address any issues with control lag or missed inputs

3. **Game Experience**
   - Ensure the game feels intuitive with the new control system
   - Compare against original control scheme to verify improvements

### Phase 6: Polish and Documentation

1. **Visual Feedback**
   - Add visual indicators for active touch areas
   - Implement visual feedback when controls are activated

2. **Code Documentation**
   - Add comments explaining TouchController integration
   - Document the control flow from touch input to game action

3. **Performance Optimization**
   - Profile and optimize any performance issues with touch handling
   - Ensure smooth gameplay even with multiple simultaneous touches

### Implementation Details

#### Key Components to Modify

1. **HTML Structure**
   - Update control elements with proper classes for TouchController selectors
   - Group player controls into logical control areas

2. **Game Initialization**
   ```javascript
   // Initialize TouchController
   const touchController = new TouchController({
     playerSelector: '.control-group' // Target control group elements
   }).init();
   
   // Register event callbacks
   touchController
     .on('arrow-down', handleDirectionStart)
     .on('arrow-up', handleDirectionEnd)
     .on('fire-down', handleFireStart)
     .on('fire-up', handleFireEnd);
   ```

3. **Control Handlers**
   ```javascript
   // Example handler functions (to be implemented)
   function handleDirectionStart(playerId, direction) {
     // Update player controls based on direction
     if (playerId === 'player1') {
       controls.player1[direction] = true;
     } else if (playerId === 'player2') {
       controls.player2[direction] = true;
     }
   }
   
   function handleDirectionEnd(playerId, direction) {
     // Clear direction when control is released
     if (playerId === 'player1') {
       controls.player1[direction] = false;
     } else if (playerId === 'player2') {
       controls.player2[direction] = false;
     }
   }
   ```

This plan provides a structured approach to implementing the TouchController library while maintaining all existing game functionality.
