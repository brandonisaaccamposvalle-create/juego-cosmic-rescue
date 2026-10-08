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
let bullets = [];
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
    height: 45,
    speed: 6,
    dx: 0,
    hasShield: false
};

// Controles Teclado
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'f' || e.key === 'F') shoot();
});
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Controles Táctiles y Botones
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnAction = document.getElementById('btn-action');
const btnShoot = document.getElementById('btn-shoot');

btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = -player.speed; });
btnLeft.addEventListener('touchend', () => player.dx = 0);
btnLeft.addEventListener('mousedown', () => player.dx = -player.speed);
btnLeft.addEventListener('mouseup', () => player.dx = 0);

btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = player.speed; });
btnRight.addEventListener('touchend', () => player.dx = 0);
btnRight.addEventListener('mousedown', () => player.dx = player.speed);
btnRight.addEventListener('mouseup', () => player.dx = 0);

btnAction.addEventListener('click', activateShield);
btnShoot.addEventListener('click', shoot);

function shoot() {
    if (isGameOver) return;
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 12,
        speed: 10
    });
}

function activateShield() {
    if (!player.hasShield && score >= 10) {
        score -= 10;
        player.hasShield = true;
        shieldEl.textContent = "Activo";
        shieldEl.style.color = "#22c55e";
        scoreEl.textContent = score;
    }
}

// Iniciar Juego
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
    bullets = [];
    isGameOver = false;
    player.hasShield = false;
    player.x = canvas.width / 2 - 20;

    scoreEl.textContent = score;
    shieldEl.textContent = "Inactivo";
    shieldEl.style.color = "#ffffff";

    startScreen.classList.add('hidden');
    gameLoop();
}

// Crear Meteorito con forma irregular de roca
function spawnObstacle() {
    const radius = Math.random() * 15 + 15;
    const points = [];
    const numPoints = 8;
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const dist = radius * (0.7 + Math.random() * 0.5);
        points.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    }

    obstacles.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: -radius,
        radius: radius,
        points: points,
        speed: (Math.random() * 2 + difficultySpeed),
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05
    });
}

function spawnStar() {
    stars.push({
        x: Math.random() * (canvas.width - 25),
        y: -25,
        size: 20,
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

    // Mover y actualizar disparos
    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        b.y -= b.speed;

        if (b.y < -10) {
            bullets.splice(i, 1);
            i--;
            continue;
        }

        // Colisión de disparo con meteorito
        for (let j = 0; j < obstacles.length; j++) {
            let obs = obstacles[j];
            let dist = Math.hypot(b.x - obs.x, b.y - obs.y);
            if (dist < obs.radius) {
                score += 2;
                scoreEl.textContent = score;
                obstacles.splice(j, 1);
                bullets.splice(i, 1);
                i--;
                break;
            }
        }
    }

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

    // Meteoritos
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obs.speed;
        obs.angle += obs.rotSpeed;

        // Colisión meteorito con jugador
        let dist = Math.hypot((player.x + player.width / 2) - obs.x, (player.y + player.height / 2) - obs.y);
        if (dist < obs.radius + player.width / 3) {
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

        if (obs.y - obs.radius > canvas.height) {
            score += 1;
            scoreEl.textContent = score;
            obstacles.splice(i, 1);
            i--;
        }
    }
}

// Dibujar la Nave Espacial detallada
function drawPlayer() {
    const px = player.x + player.width / 2;
    const py = player.y;

    // Escudo protector
    if (player.hasShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py + 22, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Fuego del propulsor
    if (!isGameOver) {
        ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(px - 6, py + 38);
        ctx.lineTo(px + 6, py + 38);
        ctx.lineTo(px, py + 48 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();
    }

    // Alas de la nave
    ctx.fillStyle = '#6d28d9';
    ctx.beginPath();
    ctx.moveTo(px, py + 10);
    ctx.lineTo(px + 22, py + 42);
    ctx.lineTo(px - 22, py + 42);
    ctx.closePath();
    ctx.fill();

    // Cuerpo principal
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 12, py + 38);
    ctx.lineTo(px - 12, py + 38);
    ctx.closePath();
    ctx.fill();

    // Cabina de vidrio brillante
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(px, py + 18, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Dibujar Estrellas
function drawStar(star) {
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(star.x + star.size/2, star.y + star.size/2, star.size/2, 0, Math.PI * 2);
    ctx.fill();
}

// Dibujar Meteoritos Rocosos Irregulares
function drawObstacle(obs) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    ctx.rotate(obs.angle);

    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(obs.points[0].x, obs.points[0].y);
    for (let i = 1; i < obs.points.length; i++) {
        ctx.lineTo(obs.points[i].x, obs.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cráteres en la superficie
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(-obs.radius * 0.3, -obs.radius * 0.2, obs.radius * 0.2, 0, Math.PI * 2);
    ctx.arc(obs.radius * 0.2, obs.radius * 0.3, obs.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Dibujar Láseres
function drawBullet(b) {
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    ctx.shadowBlur = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
        bullets.forEach(drawBullet);
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

// Guardar y cargar puntajes
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