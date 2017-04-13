/**
 * Created by ampersand8 on 25.03.17.
 */
var fps = 0;
var lastRun;
var canvas = document.getElementById('breakoutCanvas');
var ctx = canvas.getContext('2d');
var game = {speed: 1, paused: false, level: 0};
var levels = [{speed: 1.2},{speed:1.4},{speed: 1.7},{speed: 2},{speed: 2.4}, {speed: 2.8}, {speed: 3}];
var ball = {x: canvas.width / 2, y: canvas.height - 30, radius:10, color: "#0095DD", dx: 2, dy: -2};
var block = { columns: 10, rows: 6,  space: 8 };
block.width = (canvas.width - (block.columns * block.space + block.space)) / (block.columns);
block.height = (canvas.height - (block.rows * block.space + block.space)) / (block.rows * 2);
game.blocks = block.columns * block.rows;
var blocks = [];
var racket = {width: canvas.width / 10, height: 5, x: canvas.width / 2, y: canvas.height - 5, speed: 7};
racket.validate = function(move) {
    return !(((racket.x - racket.width / 2) + move < 0) || ((racket.x + racket.width / 2) + move) > canvas.width);
};

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);


// sets coords and direction to initial values
function initialBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 2;
    ball.dy = -2;
}

// sets coords to initial values
function initialRacket() {
    racket.x = canvas.width / 2;
    racket.y = canvas.height - 5;
}

function keyDownHandler(e) {
    if (e.keyCode === 39) {
        racket.rightPressed = true;
    } else if (e.keyCode === 37) {
        racket.leftPressed = true;
    } else if (e.keyCode === 32) {
        game.paused = !game.paused;
    }
}

function keyUpHandler(e) {
    if (e.keyCode === 39) {
        racket.rightPressed = false;
    } else if (e.keyCode === 37) {
        racket.leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    var move = e.clientX - canvas.offsetLeft;
    if (move > 0 && move < canvas.width) {
        racket.x = move - racket.width / 2;
    }
}

function touchMoveHandler(e) {
    e.preventDefault();
    var touch = e.touches[0].pageX || e.changedTouches[0].pageX;
    var move = touch - canvas.offsetLeft;
        if (move > 0 && move < canvas.width) {
            racket.x = move - racket.width / 2;
        }
}

function createBlocks() {
    for (var i = 0; i < block.columns; i++) {
        blocks[i] = [];
        for (var j = 0; j < block.rows; j++) {
            blocks[i][j] = {x: i * block.width + i * block.space + block.space, y: j * block.height + j * block.space, w: block.width, h: block.height, destroyed: false };
        }
    }
}

function drawBlocks() {
    blocks.map(function(blockColumn) {
        blockColumn.map(drawBlock);
    });
}

function drawBlock(b) {
    if(!b.destroyed) {
        b.destroyed = hitDetection(b, ball);
        ctx.fillRect(b.x, b.y, b.w, b.h);
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

    var rab = {x: racket.width / 2, y: 0};
    var rba = {x: -racket.width / 2, y:0};
    var raz = {x: ball.x - (racket.x - racket.width/2), y: ball.y - racket.y};
    var rbz = {x: ball.x - (racket.x + racket.width/2), y: ball.y - racket.y};

    if (ball.x >= canvas.width - ball.radius || ball.x <= ball.radius) {
        ball.dx = ball.dx * -1;
    }

    if (ball.y <= ball.radius) {
        ball.dy = ball.dy * -1;
    } else if (helpDetection(rab,raz,rba,rbz)) {
            ball.dy = ball.dy *-1;

    } else if (ball.y >= canvas.height - ball.radius) {
        alert("GAME OVER");
        game.paused = true;
    }

}

function hitDetection(block, ball) {
    // Set edge above (AB)
    var ab = {x: block.w, y: 0};
    var ba = {x: -block.w, y: 0};

    // Set edge below (CD)
    var cd = ab;
    var dc = ba;

    // Set edge left
    var ac = {x: 0, y: block.h};
    var ca = {x: 0, y: -block.h};

    // Above edge right
    var bd = ac;
    var db = ca;

    // Set edge to ball
    var az = {x: ball.x - block.x, y: ball.y - block.y};
    var bz = {x: ball.x - (block.x + block.w), y: ball.y - block.y};
    var cz = {x: ball.x - block.x, y: ball.y - (block.y + block.h)};
    var dz = {x: ball.x - (block.x + block.w), y: ball.y - (block.y + block.h)};

    if (helpDetection(cd,cz,dc,dz) || helpDetection(ab,az,ba,bz)) {
        ball.dy = -ball.dy;
        game.blocks -= 1;
        return true;
    } else if (helpDetection(ac,az,ca,cz) || helpDetection(bd,bz,db,dz)) {
        ball.dx = -ball.dx;
        game.blocks -= 1;
        return true;
    }
    return false;
}

function helpDetection(ab,az,ba,bz) {
    var normalLength = Math.sqrt(Math.pow(ab.x,2)+Math.pow(ab.y,2));
    var distance = Math.abs((az.x*ab.y-az.y*ab.x)/normalLength);

    if (distance < ball.radius) {
        // Calculate angle
        var skalarproduct1 = ab.x * az.x + ab.y * az.y;
        if (skalarproduct1 >= 0) {
            var skalarproduct2 = ba.x * bz.x + ba.y * bz.y;
            if (skalarproduct2 >= 0) {
                return true;
            }
        }
    }
    return false;
}

function showFPS() {
    ctx.fillStyle = "Black";
    ctx.font      = "normal 16pt Arial";
    ctx.fillText(fps + " fps", 10, canvas.height - 20);
}

function draw() {
    if (game.blocks === 0) {
        game.paused = true;
        game.level += 1;
        game.speed = levels[game.level].speed;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        createBlocks();
        initialBall();
        initialRacket();
        ball.dx = ball.dx * game.speed;
        ball.dy = ball.dy * game.speed;
        racket.speed = racket.speed * (1 + game.speed/3);
        game.blocks = block.columns * block.rows;
        alert("Congrats, on to level " + game.level + 1);
        //clearInterval(run);
        //run = setInterval(draw, game.speed);
    }

    if (!game.paused) {
        var delta = (new Date().getTime() - lastRun)/1000;
        lastRun = new Date().getTime();
        fps = (1/delta).toFixed(1);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBlocks();
        drawRacket();
        drawBall();
        showFPS();
    }
    requestAnimationFrame(draw);
}
console.log(canvas.offsetLeft);
createBlocks();
//var run = setInterval(draw, game.speed);
requestAnimationFrame(draw);