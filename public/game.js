const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fric = 0.1
const accel = 1
const maxSpeed = 5
const jumpHeight = 10
const grav = 0.1

let players = {};
let localPlayer = null;
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
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    let oldx = this.x;
    let oldy = this.y;
    this.speed = 0;
    this.jump = 0;
    this.color = color;
    this.grounded = false;
    this.hitbox = {
      offsetX: 0,
      offsetY: 0,
      width: 20,
      height: 20
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
    if ((keys.ArrowUp || keys2.W || keys.Space)&& this.grounded) {
        this.jump -= jumpHeight;
        moved = true;
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
    moved = true;
    const floorY = canvas.height - 20; 
    if (this.y >= floorY) {
        this.y = floorY;
        this.jump = 0;
        this.grounded = true;
    }
    //if (oldx !== this.x || oldy !== this.y) {
    //    moved = true;
    //    oldx = this.x;
    //    oldy = this.y;
    //}
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

socket.on('connect', () => {
    myId = socket.id; 
});

socket.on('currentPlayers', (serverPlayers) => { 
    players = serverPlayers;
    if (players[myId] && !localPlayer) { 
        const sData = players[myId];
        localPlayer = new Player(sData.x, sData.y, sData.color);
    }
});
socket.on('newPlayer', (data) => { 
    players[data.id] = data.player; 
});
socket.on('playerMoved', (data) => {
    if (players[data.id]) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
    }
});
socket.on('playerDisconnected', (id) => { 
    delete players[id]; 
});

function update() {
    if (localPlayer) {
        localPlayer.update();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let id in players) {
        if (id === myId && localPlayer) {
            ctx.fillStyle = players[id].color;
            ctx.fillRect(players[id].x, players[id].y, 20, 20);
        }
        else {
            ctx.fillStyle = players[id].color || '#ffffff';
            ctx.fillRect(players[id].x, players[id].y, 20, 20);
        }
    }

    requestAnimationFrame(update);
}
requestAnimationFrame(update);