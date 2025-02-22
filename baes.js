const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 600;

let player, asteroids, orbs, ufos, stars, score, gameOver, shieldCooldown;

function resetGame() {
    player = { x: canvas.width / 2 - 20, y: canvas.height - 60, width: 40, height: 40, speed: 5, shield: false, lives: 3 };
    asteroids = [];
    orbs = [];
    ufos = [];
    stars = [];
    score = 0;
    gameOver = false;
    shieldCooldown = false;
    createStars();
}

resetGame();

const keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function playSound(frequency, duration = 300, type = "sine") {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
    }, duration);
}

function activateShield() {
    if (!shieldCooldown) {
        player.shield = true;
        playSound(800, 300, "sawtooth");
        setTimeout(() => {
            player.shield = false;
            shieldCooldown = true;
            setTimeout(() => shieldCooldown = false, 10000);
        }, 3000);
    }
}

function createAsteroid() {
    asteroids.push({ x: Math.random() * (canvas.width - 30), y: -30, width: 30, height: 30, speed: 3 + Math.random() * 2 });
}

function createOrb() {
    orbs.push({ x: Math.random() * (canvas.width - 20), y: -20, width: 20, height: 20, speed: 2 });
}

function createUFO() {
    ufos.push({ x: Math.random() * (canvas.width - 40), y: -40, width: 40, height: 30, speed: 2 });
}

function createStars() {
    for (let i = 0; i < 50; i++) {
        stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2, speed: Math.random() * 2 + 1 });
    }
}

function update() {
    if (gameOver) return;

    let moveSpeed = keys["Shift"] ? player.speed * 2 : player.speed;
    if (keys["ArrowLeft"] && player.x > 0) player.x -= moveSpeed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += moveSpeed;
    if (keys["ArrowUp"] && player.y > 0) player.y -= moveSpeed;
    if (keys["ArrowDown"] && player.y < canvas.height - player.height) player.y += moveSpeed;
    if (keys[" "] && !shieldCooldown) activateShield();

    for (let asteroid of asteroids) {
        asteroid.y += asteroid.speed;
        if (asteroid.y > canvas.height) asteroid.y = -30;
        if (!player.shield && collision(player, asteroid)) {
            player.lives--;
            playSound(150, 200, "square");
            if (player.lives <= 0) gameOver = true;
        }
    }

    for (let i = orbs.length - 1; i >= 0; i--) {
        orbs[i].y += orbs[i].speed;
        if (orbs[i].y > canvas.height) orbs.splice(i, 1);
        if (collision(player, orbs[i])) {
            score += 10;
            playSound(1000, 100, "triangle");
            orbs.splice(i, 1);
        }
    }

    for (let ufo of ufos) {
        ufo.y += ufo.speed;
        if (ufo.y > canvas.height) ufo.y = -40;
    }

    for (let star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    for (let star of stars) ctx.fillRect(star.x, star.y, star.size, star.size);

    ctx.fillStyle = player.shield ? "blue" : "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = "red";
    for (let asteroid of asteroids) ctx.fillRect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);

    ctx.fillStyle = "yellow";
    for (let orb of orbs) ctx.fillRect(orb.x, orb.y, orb.width, orb.height);

    ctx.fillStyle = "purple";
    for (let ufo of ufos) ctx.fillRect(ufo.x, ufo.y, ufo.width, ufo.height);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score} | Lives: ${player.lives}`, 20, 30);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2);
    }
}

function collision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

setInterval(createAsteroid, 1000);
setInterval(createOrb, 3000);
setInterval(createUFO, 5000);
setInterval(update, 20);
setInterval(draw, 20);
