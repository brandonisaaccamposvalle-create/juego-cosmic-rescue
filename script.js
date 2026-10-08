const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const playerNameInput = document.getElementById('player-name-input');
const currentPlayerNameEl = document.getElementById('current-player-name');
const leaderboardList = document.getElementById('leaderboard-list');

const scoreEl = document.getElementById('score');
const shieldEl = document.getElementById('shield-status');
const finalScoreEl = document.getElementById('final-score');

// Variables
let score = 0;
let isGameOver = true;
let obstacles = [];
let stars = [];
let frameCount = 0;
let playerName = "Piloto";
let difficultySpeed = 3;
let spawnRate = 40;

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 70,
    width: 40,
    height: 40,
    speed: 6,
    dx: 0,
    hasShield: false
};

// Controles Teclado
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Controles Táctiles
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnAction = document.getElementById('btn-action');

btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = -player.speed; });
btnLeft.addEventListener('touchend', () => player.dx = 0);
btnLeft.addEventListener('mousedown', () => player.dx = -player.speed);
btnLeft.addEventListener('mouseup', () => player.dx = 0);

btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = player.speed; });
btnRight.addEventListener('touchend', () => player.dx = 0);
btnRight.addEventListener('mousedown', () => player.dx = player.speed);
btnRight.addEventListener('mouseup', () => player.dx = 0);

btnAction.addEventListener('click', activateShield);

function activateShield() {
    if (!player.hasShield && score >= 10) {
        score -= 10;
        player.hasShield = true;
        shieldEl.textContent = "Activo";
        shieldEl.style.color = "#22c55e";
        scoreEl.textContent = score;
    }
}

// Iniciar Juego con el Botón JUGAR AHORA
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    renderLeaderboard();
});

function startGame() {
    playerName = playerNameInput.value.trim() || "Piloto";
    currentPlayerNameEl.textContent = playerName;

    const diff = document.querySelector('input[name="difficulty"]:checked').value;
    if (diff === 'easy') { difficultySpeed = 2.5; spawnRate = 45; }
    else if (diff === 'normal') { difficultySpeed = 4; spawnRate = 30; }
    else if (diff === 'hard') { difficultySpeed = 5.5; spawnRate = 20; }

    score = 0;
    obstacles = [];
    stars = [];
    isGameOver = false;
    player.hasShield = false;
    player.x = canvas.width / 2 - 20;

    scoreEl.textContent = score;
    shieldEl.textContent = "Inactivo";
    shieldEl.style.color = "#ffffff";

    startScreen.classList.add('hidden');
    gameLoop();
}

function spawnObstacle() {
    const size = Math.random() * 20 + 20;
    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: (Math.random() * 2 + difficultySpeed),
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1
    });
}

function spawnStar() {
    stars.push({
        x: Math.random() * (canvas.width - 25),
        y: -25,
        size: 22,
        speed: difficultySpeed * 0.8
    });
}

function update() {
    if (isGameOver) return;

    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
    player.x += player.dx;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    frameCount++;
    if (frameCount % spawnRate === 0) spawnObstacle();
    if (frameCount % 110 === 0) spawnStar();

    // Estrellas
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.y += star.speed;

        if (
            player.x < star.x + star.size &&
            player.x + player.width > star.x &&
            player.y < star.y + star.size &&
            player.y + player.height > star.y
        ) {
            score += 5;
            scoreEl.textContent = score;
            stars.splice(i, 1);
            i--;
            continue;
        }

        if (star.y > canvas.height) { stars.splice(i, 1); i--; }
    }

    // Asteroides (Obstáculos)
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obs.speed;
        obs.angle += obs.rotSpeed;

        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            if (player.hasShield) {
                player.hasShield = false;
                shieldEl.textContent = "Inactivo";
                shieldEl.style.color = "#ffffff";
                obstacles.splice(i, 1);
                i--;
                continue;
            } else {
                endGame();
            }
        }

        if (obs.y > canvas.height) {
            score += 1;
            scoreEl.textContent = score;
            obstacles.splice(i, 1);
            i--;
        }
    }
}

// Dibujar la Nave Espacial
function drawPlayer() {
    const px = player.x + player.width / 2;
    const py = player.y;

    // Escudo protector
    if (player.hasShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py + 20, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Fuego del propulsor
    if (!isGameOver) {
        ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(px - 6, py + 38);
        ctx.lineTo(px + 6, py + 38);
        ctx.lineTo(px, py + 48 + Math.random() * 6);
        ctx.closePath();
        ctx.fill();
    }

    // Cuerpo de la Nave
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 20, py + 38);
    ctx.lineTo(px - 20, py + 38);
    ctx.closePath();
    ctx.fill();

    // Cabina
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py + 18, 6, 0, Math.PI * 2);
    ctx.fill();
}

// Dibujar Estrellas
function drawStar(star) {
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(star.x + star.size/2, star.y + star.size/2, star.size/2, 0, Math.PI * 2);
    ctx.fill();
}

// Dibujar Asteroides
function drawObstacle(obs) {
    ctx.save();
    ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
    ctx.rotate(obs.angle);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
        drawPlayer();
        stars.forEach(drawStar);
        obstacles.forEach(drawObstacle);
    }
}

function gameLoop() {
    update();
    draw();
    if (!isGameOver) requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameOver = true;
    finalScoreEl.textContent = score;
    saveScore(playerName, score);
    gameOverScreen.classList.remove('hidden');
}

// Sistema de Mejores Puntajes
function saveScore(name, points) {
    let scores = JSON.parse(localStorage.getItem('cosmicScores')) || [];
    scores.push({ name, points });
    scores.sort((a, b) => b.points - a.points);
    scores = scores.slice(0, 5);
    localStorage.setItem('cosmicScores', JSON.stringify(scores));
}

function renderLeaderboard() {
    let scores = JSON.parse(localStorage.getItem('cosmicScores')) || [];
    leaderboardList.innerHTML = scores.length === 0 
        ? "<li>Aún no hay puntuaciones registradas</li>"
        : scores.map(s => `<li><strong>${s.name}</strong>: ${s.points} pts</li>`).join('');
}

renderLeaderboard();