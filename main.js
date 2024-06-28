const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const STATE = {
    x_pos: 0,
    y_pos: 0,
    move_left: false,
    move_right: false,
    shoot: false,
    lasers: [],
    enemies: [],
    enemyLasers: [],
    spaceship_width: 50,
    enemy_width: 50,
    number_of_enemies: 16,
    cooldown: 0,
    enemy_cooldown: 0,
    gameOver: false,
    gamePaused: true,
    lives: 3,
    //stores the requestAnimationFrame id
    animationFrameID: null,
    //fps counter
    times: [],
    fps: null,
    score: 500,
    scoreInterval: null,
    timer: 0,
    timerInterval: null,
};

//FPS counter
function refreshLoop() {
    window.requestAnimationFrame(() => {
        document.getElementById("fps").innerHTML = "FPS: " + STATE.fps;
        const now = performance.now();
        while (STATE.times.length > 0 && STATE.times[0] <= now - 1000) {
            STATE.times.shift();
        }
        STATE.times.push(now);
        STATE.fps = STATE.times.length;
        refreshLoop();
    });
}
refreshLoop();

// Init Game
const $container = document.querySelector(".main");
createPlayer($container);
createEnemies($container);
// General Functions
function setPosition($element, x, y) {
    $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setSize($element, width) {
    $element.style.width = `${width}px`;
    $element.style.height = "auto";
}

function bound(x) {
    //prevents the spaceship from going oob
    if (x >= GAME_WIDTH - STATE.spaceship_width) {
        STATE.x_pos = GAME_WIDTH - STATE.spaceship_width;
        return STATE.x_pos;
    }
    if (x <= 0) {
        STATE.x_pos = 0;
        return STATE.x_pos;
    } else {
        return x;
    }
}

function deleteLaser(lasers, laser, $laser) {
    const index = lasers.indexOf(laser);
    lasers.splice(index, 1);
    $container.removeChild($laser);
}

function collideRect(rect1, rect2) {
    return !(
        rect2.left > rect1.right ||
        rect2.right < rect1.left ||
        rect2.top > rect1.bottom ||
        rect2.bottom < rect1.top
    );
}
// Player
function createPlayer($container) {
    STATE.x_pos = GAME_WIDTH / 2;
    STATE.y_pos = GAME_HEIGHT - 50;
    const $player = document.createElement("img");
    $player.src = "img/spaceship.png";
    $player.className = "player";
    $container.appendChild($player);
    setPosition($player, STATE.x_pos, STATE.y_pos);
    setSize($player, STATE.spaceship_width);
}

function updatePlayer() {
    if (STATE.move_left) {
        STATE.x_pos -= 2;
    }
    if (STATE.move_right) {
        STATE.x_pos += 2;
    }
    if (STATE.shoot && STATE.cooldown == 0) {
        STATE.score -= 5;
        createLaser(
            $container,
            STATE.x_pos - STATE.spaceship_width / 2,
            STATE.y_pos
        );
        STATE.cooldown = 30;
    }
    const $player = document.querySelector(".player");
    setPosition($player, bound(STATE.x_pos), STATE.y_pos - 15);
    if (STATE.cooldown > 0) {
        STATE.cooldown -= 0.5;
    }
}

// Player Laser
function createLaser($container, x, y) {
    const $laser = document.createElement("img");
    $laser.src = "img/laser.png";
    $laser.className = "laser";
    $container.appendChild($laser);
    const laser = { x, y, $laser };
    STATE.lasers.push(laser);
    setPosition($laser, x, y);
}
function updateLaser($container) {
    const lasers = STATE.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= 2;
        if (laser.y < 0) {
            deleteLaser(lasers, laser, laser.$laser);
        }
        setPosition(laser.$laser, laser.x, laser.y);
        const laser_rectangle = laser.$laser.getBoundingClientRect();
        const enemies = STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
            //collision detection
            if (collideRect(enemy_rectangle, laser_rectangle)) {
                deleteLaser(lasers, laser, laser.$laser);
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                $container.removeChild(enemy.$enemy);
                STATE.score += 10;
            }
        }
    }
}

// Enemies

function createEnemy($container, x, y) {
    const $enemy = document.createElement("img");
    $enemy.src = "img/ufo.png";
    $enemy.className = "enemy";
    $container.appendChild($enemy);
    const enemy_cooldown = Math.floor(Math.random() * 100);
    const enemy = { x, y, $enemy, enemy_cooldown };
    STATE.enemies.push(enemy);
    setSize($enemy, STATE.enemy_width);
    setPosition($enemy, x, y);
}

function updateEnemies($container) {
    //responsible for moving the enemy on our screen
    const dx = Math.cos(Date.now() / 1000) * 40;
    const dy = Math.sin(Date.now() / 1000) * 30;
    const enemies = STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        let a = enemy.x + dx;
        let b = enemy.y + dy;
        setPosition(enemy.$enemy, a, b);
        if (enemy.enemy_cooldown == 0) {
            createEnemyLaser($container, a, b);
            enemy.enemy_cooldown = Math.floor(Math.random() * 50) + 100;
        }
        enemy.enemy_cooldown -= 0.5;
    }
}

function createEnemies($container) {
    for (let i = 0; i <= STATE.number_of_enemies / 2; i++) {
        createEnemy($container, i * 80, 100);
    }
    for (let i = 0; i <= STATE.number_of_enemies / 2; i++) {
        createEnemy($container, i * 80, 180);
    }
}

function createEnemyLaser($container, x, y) {
    const $enemyLaser = document.createElement("img");
    $enemyLaser.src = "img/enemyLaser.png";
    $enemyLaser.className = "enemyLaser";
    $container.appendChild($enemyLaser);
    const enemyLaser = { x, y, $enemyLaser };
    STATE.enemyLasers.push(enemyLaser);
    setPosition($enemyLaser, x, y);
}

function updateEnemyLaser() {
    const enemyLasers = STATE.enemyLasers;
    for (let i = 0; i < enemyLasers.length; i++) {
        const enemyLaser = enemyLasers[i];
        enemyLaser.y += 2;
        if (enemyLaser.y > GAME_HEIGHT - 30) {
            deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
        }
        const enemyLaser_rectangle =
            enemyLaser.$enemyLaser.getBoundingClientRect();
        const spaceship_rectangle = document
            .querySelector(".player")
            .getBoundingClientRect();

        //collision detection
        if (collideRect(spaceship_rectangle, enemyLaser_rectangle)) {
            deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
            STATE.lives -= 1;
        }
        setPosition(
            enemyLaser.$enemyLaser,
            enemyLaser.x + STATE.enemy_width / 2,
            enemyLaser.y + 15
        );
    }
}

// Key Presses
function KeyPress(event) {
    if (event.key === "ArrowRight") {
        STATE.move_right = true;
    } else if (event.key === "ArrowLeft") {
        STATE.move_left = true;
    } else if (event.key === " ") {
        STATE.shoot = true;
    } else if (event.key === "Escape") {
        if (event.repeat) return;
        STATE.gamePaused = true;

        //stops counting the score
        clearInterval(STATE.scoreInterval);
        STATE.scoreInterval = null;
        //stops the timer
        clearInterval(STATE.timerInterval);
        STATE.timerInterval = null;
    } else if (event.key === "Enter") {
        //prevent auto-repeat
        if (event.repeat) return;
        STATE.gamePaused = false;
        cancelAnimationFrame(STATE.animationFrameID);
        update();
        if (STATE.gameOver || STATE.enemies.length == 0) {
            window.location.reload();
        }
        //starts counting the score
        if (STATE.scoreInterval === null) {
            STATE.scoreInterval = setInterval(function () {
                STATE.score -= 1;
            }, 1000);
        }
        //starts the timer
        if (STATE.timerInterval === null) {
            STATE.timerInterval = setInterval(function () {
                STATE.timer += 1;
            }, 1000);
        }
        document.querySelector(".pause").style.display = "none";
    } else if (event.key === "r") {
        //prevent auto-repeat
        if (event.repeat) return;
        window.location.reload();
    }
}

function KeyRelease(event) {
    if (event.key === "ArrowRight") {
        STATE.move_right = false;
    } else if (event.key === "ArrowLeft") {
        STATE.move_left = false;
    } else if (event.key === " ") {
        STATE.shoot = false;
    }
}

//helper function to display the timer
function pad(value) {
    return value > 9 ? value : "0" + value;
}
if (STATE.gamePaused) {
    document.querySelector(".pause").style.display = "block";
}
// Main Update Function
function update() {
    if (!STATE.gamePaused) {
        console.log(STATE);
        updatePlayer();
        updateLaser($container);
        updateEnemies($container);
        updateEnemyLaser();
        //to display the lives, score and timer
        document.getElementById("lives").innerHTML = "Lives: " + STATE.lives;
        document.getElementById("score").innerHTML = "Score: " + STATE.score;
        document.getElementById("timer").innerHTML =
            "Time: " +
            Math.floor(pad(STATE.timer / 60)) +
            ":" +
            pad(STATE.timer % 60);
        STATE.animationFrameID = window.requestAnimationFrame(update);
        if (STATE.lives === 0 || STATE.score === 0) {
            STATE.gameOver = true;
        }
        if (STATE.gameOver) {
            clearInterval(STATE.scoreInterval);
            clearInterval(STATE.timerInterval);
            document.querySelector(".lose").style.display = "block";
            cancelAnimationFrame(STATE.animationFrameID);
        }
        if (STATE.enemies.length == 0) {
            clearInterval(STATE.scoreInterval);
            clearInterval(STATE.timerInterval);
            document.querySelector(".win").style.display = "block";
            document.querySelector(".winscore").innerHTML =
                "Score: " + STATE.score;
            document.querySelector(".wintime").innerHTML =
                "Time: " +
                Math.floor(pad(STATE.timer / 60)) +
                ":" +
                pad(STATE.timer % 60);
            cancelAnimationFrame(STATE.animationFrameID);
        }
    }
    if (STATE.gamePaused) {
        document.querySelector(".pause").style.display = "block";
    }
}

window.addEventListener("keydown", KeyPress);
window.addEventListener("keyup", KeyRelease);
