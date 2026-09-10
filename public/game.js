const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fric = 0.1
const accel = 1
const maxSpeed = 5
const jumpHeight = 10
const grav = 0.1

let players = {};
let myId = null;

class col {
    static checkAABB(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0;
    this.jump = 0;
    this.hitbox = {
      offsetX: 20,
      offsetY: 40,
      width: 24,
      height: 24
    };
  }
  getHitbox() {
    return {
      x: this.x + this.hitbox.offsetX,
      y: this.y + this.hitbox.offsetY,
      width: this.hitbox.width,
      height: this.hitbox.height
    };
  }
  update() {
    let moved = false;
    if (keys.ArrowUp || keys2.W || keys.Space) {
        this.jump -= jumpHeight; moved = true;
    }
    if (keys.ArrowDown || keys2.S)  { 
        //empty
    }
    if (keys.ArrowLeft || keys2.A)  {
        this.speed = Math.min(this.speed + accel, maxSpeed);
        moved = true;
    }
    if (keys.ArrowRight || keys2.D) {
        this.speed = Math.max(this.speed - accel, -maxSpeed);
        moved = true;
    }
    this.jump += grav;
    if (this.speed > 0) {
        this.speed = Math.max(this.speed - fric, 0);
    }
    else if (this.speed < 0) {
        this.speed = Math.min(this.speed + fric, 0);
    }
    this.y += this.jump;
    this.x -= this.speed; 
    if (moved) {             
        socket.emit('playerMovement', { x: this.x, y: this.y });         
    }    
  }
}

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
        players[myId].update();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let id in players) {
        ctx.fillStyle = players[id].color;
        ctx.fillRect(players[id].x, players[id].y, 20, 20);
    }

    requestAnimationFrame(update);
}
requestAnimationFrame(update);