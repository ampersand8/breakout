/**
 * Created by simon on 25.03.17.
 */

var fps = 0;
var lastRun;
var canvas = document.getElementById('breakoutCanvas');
resizeCanvas();
var ctx = canvas.getContext('2d');
var game = {speed: 2, paused: false, level: 0, lives: 3};
var levels = [{speed: 2},{speed: 3},{speed:  4},{speed: 5},{speed: 6}, {speed: 7}, {speed: 8}];
var ball = {x: canvas.width / 2, y: canvas.height - 30, radius:10, color: "#0095DD", dx: 2, dy: -2};
var block = { columns: 6, rows: 5,  space: 8 };
block.width = (canvas.width - (block.columns * block.space + block.space)) / (block.columns);
block.height = (canvas.height - (block.rows * block.space + block.space)) / (block.rows * 2);
var blocks = [];
var racket = {width: canvas.width / 10, height: 5, x: canvas.width / 2, y: canvas.height - 5, speed: 7};
racket.validate = function(move) {
    return !(((racket.x - racket.width / 2) + move < 0) || ((racket.x + racket.width / 2) + move) > canvas.width);
};
var breakingNotification;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);

// sets coords and direction to initial values
function initialBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = game.speed;
    ball.dy = -game.speed;
}

function Block(x, y, destroyed = false, fallable = false, w = block.width, h = block.height) {
    this.id = Math.random().toString(16).slice(2);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.destroyed = destroyed;
    this.fallable = fallable;
    this.color = (function() {
        if (this.fallable) {
            return '#f33';
        } else {
            return '#0095dd';
        }
    })();
    this.destroy = function() {
        if (this.fallable) {
            this.color = '#222';
        }
        this.destroyed = true;
        var index = blocks.map(x => x.id).indexOf(this.id);
        if (index > -1) {
            blocks.splice(index,1);
        }
    };
    this.draw = function() {
        ctx.beginPath();
        if (this.destroyed && !this.fallable) {

        } else {
            if (hitDetection(this, ball)) {
                this.destroy();
            }
            if (this.destroyed && this.fallable) {
                this.y = this.y + 2;
            }
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.x, this.y + this.h / 2);
            ctx.lineTo(this.x + this.w, this.y + this.h / 2);
            ctx.lineWidth = this.h;
        }
        if (hitDetectionBlockRacket(this,racket)) {
            game.lives = game.lives - 1;
            game.paused = true;
            showBreakingNotification('FAIL<br>'+game.lives+' Lives left<br>Press Space to continue','FAIL');
            initialBall();
            initialRacket();
            updateInfo();
        }
        ctx.stroke();
    }
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
        if (!game.paused) {
            showHelp();
        }
        if (game.lives < 1) {
            initializeGame(0);
        }
        if (breakingNotification) {
            hideBreakingNotification();
        }
    } else if (e.keyCode === 38) {
        racket.speed = racket.speed + 1;
        updateInfo();
    } else if (e.keyCode === 40) {
        racket.speed = racket.speed - 1;
        updateInfo();
    } else if (e.keyCode === 72) {
        game.paused = !game.paused;
        showHelp();
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
    if ((move-racket.width)+3 > 0 && move < canvas.width+3) {
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
        for (var j = 0; j < block.rows; j++) {
            fallable = false;
            if (Math.random() >= 0.7) {
                fallable = true;
            }
            blocks.push(new Block( i * block.width + i * block.space + block.space,j * block.height + j * block.space,false,fallable));
        }
    }
}

function countBlocks() {
    return blocks.length;
}

function drawBlocks() {
    blocks.map(function(b) {
        b.draw();
    });
}

function hitDetectionBlockRacket(b, r) {
    leftRacket = r.x - (r.width/2);
    rightRacket = r.x + (r.width/2);
    topRacket = r.y;
    bottomRacket = r.y + r.height;

    leftBlock = b.x;
    rightBlock = b.x + b.w;
    topBlock = b.y;
    bottomBlock = b.y + (b.h);

    maxLeft = Math.max(leftRacket,leftBlock);
    minRight = Math.min(rightRacket,rightBlock);
    minBot = Math.min(bottomRacket,bottomBlock);
    maxTop = Math.max(topRacket,topBlock);
    return (minBot >= maxTop) && (minRight > maxLeft)
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
    ctx.arc(ball.x, ball.y, ball.radius/2, 0, Math.PI * 2);
    ctx.strokeStyle = ball.color;
    ctx.lineWidth = ball.radius;
    ctx.stroke();
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
        game.lives = game.lives - 1;
        game.paused = true;
        if (game.lives < 1) {
            showBreakingNotification('GAME OVER<br>Press Space to start new game','FAIL');
        } else {
            showBreakingNotification('FAIL<br>'+game.lives+' Lives left<br>Press Space to continue','FAIL');
            initialBall();
            initialRacket();
            updateInfo();
        }
    }
}

// text: Text to show in the notification
// type: Type of the notification: FAIL, INFO, SUCCESS
function showBreakingNotification(text,type) {
    switch (type) {
        case 'FAIL':
            document.getElementById('breakingNotificationText').className = 'fail';
            break;
        case 'SUCCESS':
            document.getElementById('breakingNotificationText').className = 'success';
            break;
        default:
            document.getElementById('breakingNotificationText').className = 'info';
            break;
    }
    game.paused = true;
    breakingNotification = true;
    document.getElementById('breakingNotificationBG').className = 'show';
    document.getElementById('breakingNotificationText').innerHTML = text;
}

function hideBreakingNotification() {
    breakingNotification = false;
    document.getElementById('breakingNotificationBG').className = '';
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
        return true;
    } else if (helpDetection(ac,az,ca,cz) || helpDetection(bd,bz,db,dz)) {
        ball.dx = -ball.dx;
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

function resizeCanvas() {
    var fullWidth = window.innerWidth && document.documentElement.clientWidth ?
        Math.min(window.innerWidth, document.documentElement.clientWidth) :
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.getElementsByTagName('body')[0].clientWidth;
    var fullHeight = window.innerHeight && document.documentElement.clientHeight ?
        Math.min(window.innerHeight, document.documentElement.clientHeight) :
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.getElementsByTagName('body')[0].clientHeight;
    var gameWidth = Math.round(fullWidth * 0.8);
    var gameHeight = Math.round(fullHeight * 0.8);
    canvas.width = gameWidth;
    canvas.height = gameHeight;
    document.getElementById('game').style.width = gameWidth+'px';
    document.getElementById('game').style.height = gameHeight+'px';
}

function showFPS() {
    ctx.fillStyle = "Black";
    ctx.font      = "normal 14pt Arial";
    ctx.fillText(fps + " fps", 5, canvas.height - 10);
}

function updateInfo() {
    document.getElementById('lives').innerHTML = game.lives;
    document.getElementById('level').innerHTML = game.level;
    document.getElementById('racketspeed').innerHTML = racket.speed;
}

/* only shows the help if the game has been paused */
function showHelp() {
    if (game.paused) {
        document.getElementById('helpInfo').style.display = 'inline';
        document.getElementById('helpText').style.display = 'block';
    } else {
        document.getElementById('helpInfo').style.display = 'none';
        document.getElementById('helpText').style.display = 'none';
    }
}

function initializeGame(level) {
    game.paused = true;
    if (level === 0) {
        showHelp();
    }
    if (game.lives === 0 && level === 0) {
        game.lives = 3;
    }
    game.level = level;
    game.speed = levels[game.level].speed;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createBlocks();
    initialBall();
    initialRacket();
    updateInfo();
    ball.dx = game.speed;
    ball.dy = -game.speed;
}

function draw() {
    if (countBlocks() === 0) {
        game.paused = true;
        initializeGame(game.level+1);
        showBreakingNotification('CONGRATS<br>You reached level '+game.level,'SUCCESS');
    }
    if (!game.paused) {
        var delta = (new Date().getTime() - lastRun)/1000;
        lastRun = new Date().getTime();
        fps = (1/delta).toFixed();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBlocks();
        drawRacket();
        drawBall();
        showFPS();
    }
    requestAnimationFrame(draw);
}
/*
updateInfo();
createBlocks();*/
initializeGame(0);
requestAnimationFrame(draw);