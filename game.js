const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const syncStatus = document.getElementById('sync-status');

// Handle Resize
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Game State
let score = 0;
let gameActive = false;
let player = { x: 100, y: 300, size: 20, vy: 0 };
let gravity = 0.4;
let orbs = [];
let obstacles = [];

// 🎉 GAMERTHRED SDK INTEGRATION (Plug & Play)
GametSDK.init({
    gameKey: 'cosmic-dash',
    onInit: () => {
        syncStatus.textContent = "PROTOCOL: READY";
        syncStatus.style.borderColor = "#00f2ff";
    }
});

// Start Game
document.getElementById('start-btn').addEventListener('click', () => {
    gameActive = true;
    score = 0;
    scoreEl.textContent = "0";
    player.y = canvas.height / 2;
    player.vy = 0;
    orbs = [];
    obstacles = [];
    startScreen.classList.add('hidden');
    
    // 🚀 SDK CALL: SIGNAL START
    GametSDK.matchStart();
    animate();
});

// Controls
window.addEventListener('keydown', (e) => { if(e.code === 'Space') player.vy = -8; });
window.addEventListener('touchstart', () => { player.vy = -8; });

function spawnOrb() {
    orbs.push({
        x: canvas.width + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        size: 10
    });
}

function animate() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player Physics
    player.vy += gravity;
    player.y += player.vy;
    
    // Draw Player (Neon Triangle)
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(player.x + 20, player.y);
    ctx.lineTo(player.x - 10, player.y - 15);
    ctx.lineTo(player.x - 10, player.y + 15);
    ctx.fill();

    // Spawn & Move Orbs
    if (Math.random() < 0.03) spawnOrb();
    orbs.forEach((orb, index) => {
        orb.x -= 5;
        ctx.fillStyle = "#00f2ff";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00f2ff";
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision
        const dist = Math.hypot(player.x - orb.x, player.y - orb.y);
        if (dist < player.size + orb.size) {
            orbs.splice(index, 1);
            score += 10;
            scoreEl.textContent = score;

            // 🚀 SDK CALL: LIVE SCORE SYNC
            GametSDK.reportScoreUpdate(score);
        }
    });

    // Boundaries
    if (player.y < 0 || player.y > canvas.height) {
        endGame();
    }

    requestAnimationFrame(animate);
}

function endGame() {
    gameActive = false;
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');

    // 🚀 SDK CALL: FINAL SIGNAL
    GametSDK.matchEnd({ score: score });
}
