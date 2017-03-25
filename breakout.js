/**
 * Created by ampersand8 on 25.03.17.
 */
var canvas = document.getElementById('breakoutCanvas');
var ctx = canvas.getContext('2d');
console.log(canvas);
var game = {speed: 20};
var ball = {x: canvas.width / 2, y: canvas.height - 30, radius:10, color: "#0095DD", dx: 2, dy: -2};
var block = { columns: 10, rows: 6,  space: 8 };
block.width = (canvas.width - (block.columns * block.space + block.space)) / (block.columns);
block.height = (canvas.height - (block.rows * block.space + block.space)) / (block.rows * 2);
var racket = {width: canvas.width / 10, height: 5, x: canvas.width / 2, y: canvas.height - 15, speed: 7};
racket.validate = function(move) {
    if (((racket.x - racket.width/2) + move < 0) || ((racket.x + racket.width/2) + move) > canvas.width) {
        return false;
    } else {
        return true;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.keyCode == 39) {
        racket.rightPressed = true;
    } else if (e.keyCode == 37) {
        racket.leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        racket.rightPressed = false;
    } else if (e.keyCode == 37) {
        racket.leftPressed = false;
    }
}

function drawBlocks() {
    for (var i = 0; i < block.columns; i++) {
        for (var j = 0; j < block.rows; j++) {
            ctx.fillRect(i * block.width + i * block.space + block.space, j * block.height + j * block.space, block.width, block.height);
        }
    }
}

function drawRacket() {
    if (racket.rightPressed && racket.validate(racket.speed)) {
        racket.x += racket.speed;
    } else if (racket.leftPressed && racket.validate(-racket.speed)) {
        racket.x -= racket.speed;
    }
    ctx.fillRect(racket.x - (racket.width /2), racket.y, racket.width, racket.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.x >= canvas.width - ball.radius || ball.x <= ball.radius) {
        ball.dx = ball.dx * -1;
    }
    if (ball.y >= canvas.height - ball.radius) {
        alert("GAME OVER");
    } else if (ball.y <= ball.radius) {
        ball.dy = ball.dy * -1;
    } else if  (ball.y < (racket.y + 1) && ball.y + ball.dy > (racket.y - 1)) {
        console.log("Ball:"+ball.x);
        console.log("Racket:"+racket.x);
        console.log(racket);
        if (ball.x > racket.x - (racket.width / 2) && ball.x < racket.x + (racket.width / 2)) {
            ball.dy = ball.dy *-1;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    drawRacket();
    drawBall();

}
setInterval(draw, game.speed);