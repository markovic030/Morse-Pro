let gamepadLoopId = null;
let lastGamepadState = { left: false, right: false };

function startGamepadLoop() {
    if (gamepadLoopId) cancelAnimationFrame(gamepadLoopId);
    
    function loop() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        if (!gamepads) return;
        
        let leftPressed = false;
        let rightPressed = false;
        
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i];
            if (!gp) continue;
            
            // Map common shoulder buttons to paddles
            if (gp.buttons[4]?.pressed || gp.buttons[6]?.pressed || gp.buttons[14]?.pressed) leftPressed = true;
            if (gp.buttons[5]?.pressed || gp.buttons[7]?.pressed || gp.buttons[15]?.pressed) rightPressed = true;
        }
        
        if (leftPressed !== lastGamepadState.left) {
            handlePaddle('left', leftPressed);
            lastGamepadState.left = leftPressed;
        }
        if (rightPressed !== lastGamepadState.right) {
            handlePaddle('right', rightPressed);
            lastGamepadState.right = rightPressed;
        }
        
        gamepadLoopId = requestAnimationFrame(loop);
    }
    
    loop();
}
