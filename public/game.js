const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fric = 0.5
const accel = 1
let speed = 0
const maxSpeed = 5
const jumpHeight = 10
const grav = 0.5

let players = {};
let myId = null;

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false};
const keys2 = { W: false, A: false, S: false, D: false};
window.addEventListener('keydown', (e) => {
    if (e.key in keys) keys[e.key] = true;
    if (e.code === 'Space') keys.Space = true;
    const keyUpper = e.key.toUpperCase();
    if (keyUpper in keys2) keys2[keyUpper] = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key in keys) keys[e.key] = false;
    if (e.code === 'Space') keys.Space = false;
    const keyUpper = e.key.toUpperCase();
    if (keyUpper in keys2) keys2[keyUpper] = false;
});


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
        let side = false;
        if (keys.ArrowUp || keys2.W || keys.Space) {
            players[myId].y -= jumpHeight; moved = true;
        }
        if (keys.ArrowDown || keys2.S)  { 
            players[myId].y += jumpHeight; moved = true;
        }
        if (keys.ArrowLeft || keys2.A)  {
            speed = Math.min(speed + accel - fric, maxSpeed);
            players[myId].x -= speed; moved = true; side = true
        }
        if (keys.ArrowRight || keys2.D) {
            speed = Math.min(speed - accel + fric, -1 * maxSpeed);
            players[myId].x -= speed; moved = true; side = true
        }

        if (moved) {
            socket.emit('playerMovement', { x: players[myId].x, y: players[myId].y });
        }
        if(!side){
            if (speed > 0) {
                speed = Math.max(speed - fric, 0);
            }
            else if (speed < 0) {
                speed = Math.min(speed + fric, 0);
            }
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