const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const shieldEl = document.getElementById('shield-status');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Ajustar tamaño del Canvas a la pantalla
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Variables de Estado
let score = 0;
let isGameOver = false;
let obstacles = [];
let frameCount = 0;

// Configuración del Jugador
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 70,
    width: 40,
    height: 40,
    speed: 6,
    dx: 0,
    hasShield: false
};

// Controles por Teclado
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Controles Táctiles para Celular
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

// Generación de Obstáculos
function spawnObstacle() {
    const size = Math.random() * 20 + 20;
    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: Math.random() * 3 + 2
    });
}

// Actualización de Lógica
function update() {
    if (isGameOver) return;

    // Movimiento
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
    player.x += player.dx;

    // Colisión con los bordes de la pantalla
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Generar obstáculos
    frameCount++;
    if (frameCount % 45 === 0) spawnObstacle();

    // Movimiento y Colisiones de Obstáculos
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obs.speed;

        // Detección de Colisión
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

        // Incrementar Puntos
        if (obs.y > canvas.height) {
            score += 1;
            scoreEl.textContent = score;
            obstacles.splice(i, 1);
            i--;
        }
    }
}

// Renderizado Gráfico
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar Jugador
    ctx.fillStyle = player.hasShield ? '#38bdf8' : '#a855f7';
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.width, player.height, 8);
    ctx.fill();

    // Dibujar Escudo
    if (player.hasShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(player.x - 4, player.y - 4, player.width + 8, player.height + 8);
    }

    // Dibujar Obstáculos
    ctx.fillStyle = '#ef4444';
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

// Bucle Principal
function gameLoop() {
    update();
    draw();
    if (!isGameOver) requestAnimationFrame(gameLoop);
}

// Finalizar Juego
function endGame() {
    isGameOver = true;
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Reiniciar Juego
restartBtn.addEventListener('click', () => {
    score = 0;
    obstacles = [];
    isGameOver = false;
    player.hasShield = false;
    player.x = canvas.width / 2 - 20;
    scoreEl.textContent = score;
    shieldEl.textContent = "Inactivo";
    shieldEl.style.color = "#ffffff";
    gameOverScreen.classList.add('hidden');
    gameLoop();
});

// Iniciar Juego
gameLoop();