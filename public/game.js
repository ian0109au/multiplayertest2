const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};
let myId = null;

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, W: false, A: false, S: false, D: false };
window.addEventListener('keydown', (e) => { if (e.key in keys) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (e.key in keys) keys[e.key] = false; });

socket.on('connect', () => { myId = socket.id; });
socket.on('currentPlayers', (serverPlayers) => { players = serverPlayers; });
socket.on('newPlayer', (data) => { players[data.id] = data.player; });
socket.on('playerMoved', (data) => {
    if (players[data.id]) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
    }
});
socket.on('playerDisconnected', (id) => { delete players[id]; });

function update() {
    if (myId && players[myId]) {
        let moved = false;
        if (keys.ArrowUp || keys.W)    { players[myId].y -= 1; moved = true; }
        if (keys.ArrowDown || keys.S)  { players[myId].y += 1; moved = true; }
        if (keys.ArrowLeft || keys.A)  { players[myId].x -= 1; moved = true; }
        if (keys.ArrowRight || keys.D) { players[myId].x += 1; moved = true; }

        if (moved) {
            socket.emit('playerMovement', { x: players[myId].x, y: players[myId].y });
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let id in players) {
        ctx.fillStyle = players[id].color;
        ctx.fillRect(players[id].x, players[id].y, 20, 20); // Draw player as a square
    }

    requestAnimationFrame(update);
}
requestAnimationFrame(update);