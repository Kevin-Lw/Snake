var foodNum = 10;
var colNum = $("gamezone").offsetWidth / 20;
var rowNum = $("gamezone").offsetHeight / 20;
var grid = multiArray(rowNum, colNum);
var carrier = multiArray(rowNum, colNum);
var snakeGrid = [];
var foodGrid = [];
var obstacleGrid = [];
var score = 0;
var directionCode = 39;
var gamePause = false;
var snakeTimer;
var speedTimer;
var gameMode;
var time = 3;
var speed = 200;
var obstacleNum = 10;

function $(id) {
  return document.getElementById(id);
}

function randomColor() {
  return "rgb(" + Math.floor(Math.random() * 254) + "," + Math.floor(Math.random() * 254) + "," + Math.floor(Math.random() * 254) + ")";
}

function multiArray(m, n) { //创建m*n的二维数组，即矩阵
  var arr = new Array(m);
  for (var i = 0; i < m; i++) {
    arr[i] = new Array(n);
  }
  return arr;
}

function initMap() {
  var table = document.createElement("table");
  var tbody = document.createElement("tbody");
  for (var i=0; i< rowNum; i++) {
    var row = document.createElement("tr");
    for (var j=0; j < colNum; j++) {
      var col = document.createElement("td");
      row.appendChild(col);
      grid[i][j] = col;
      carrier[i][j] = false;
    }
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  $("gamezone").appendChild(table);
}

// 定义类——小蛇
function Snake(width, height, direction) {
  this.width = width || 20;
  this.height = height || 20;
  this.direction = direction || "right";

  Snake.prototype.init = function(Num) {
    for (var i=Num-1; i>=0; i--) {
      snakeGrid.push([0, i]);
      grid[0][i].style.background = randomColor();
      carrier[0][i] = "snake";
    }
  }

  Snake.prototype.move = function() {
    
    dirControl(directionCode);
    document.onkeydown = function(e) {
        dirControl(e.keyCode);
    };
  }
}

function snakeMove() {
  dirControl(directionCode);
  document.onkeydown = function(e) {
      dirControl(e.keyCode);
  };
}

function dirControl (keyCode) {
  var headX = snakeGrid[0][1];
  var headY = snakeGrid[0][0];

  if(keyCode >=37 && keyCode <= 40 && directionCode != keyCode + 2 && directionCode != keyCode -2) {
    directionCode = keyCode;
    switch(directionCode) {
      case 37: //左
        headX -= 1;
        break;
      case 38: //上
        headY -= 1;
        break;
      case 39: //右
        headX += 1;
        break;
      case 40: //下
        headY += 1;
        break;
    }
    statusDetection(headY, headX);
  }
  else if (keyCode == 32) {
    gamePause = !gamePause;
    if (gamePause) {
      $("pause").style.display = "block";
      clearInterval(snakeTimer);
      snakeTimer = null;
      $("audio1").pause();
    }
    else {
      $("pause").style.display = "none";
      clearInterval(snakeTimer);
      snakeTimer = setInterval(function() {snakeMove();}, speed);
      $("audio1").play();
    }
  }
}

function statusDetection(y, x) {
  if (x < 0 || x > colNum || y < 0 || y > rowNum) {
    gameOver("撞到墙啦!");
  }
  else if (rearEnd(y, x)) {
    gameOver("吃到自己啦！");
  }
  else if (hitObstacle(y, x)) { 
    gameOver("撞到障碍物啦！")
  }
  else if (eatFood(y, x)) {
    grid[y][x].className = "";
    initFood(1, carrier);
  }
  else {
    snakeGrid.unshift([y, x]);
    carrier[y][x] = "snake";
    for (var i=0; i<snakeGrid.length-1; i++) {
      grid[snakeGrid[i][0]][snakeGrid[i][1]].style.background = grid[snakeGrid[i+1][0]][snakeGrid[i+1][1]].style.background;
    }
    var tail = snakeGrid.pop();
    var tailX = tail[1];
    var tailY = tail[0];
    grid[tailY][tailX].style.background = "";
    carrier[tailY][tailX] = false;
  }
}

function rearEnd(y, x) {
  for (var i=0; i<snakeGrid.length; i++) {
    if(y == snakeGrid[i][0] && x == snakeGrid[i][1]) {
      return true;
    }
  }
  return false;
}

function hitObstacle(y, x) {
  for (var i=0; i<obstacleGrid.length; i++) {
    if(y == obstacleGrid[i][0] && x == obstacleGrid[i][1]) {
      return true;
    }
  }
  return false;
}

function randomDot(carrier, startX, startY, endX, endY) {
  startX = startX || 0;
  startY = startY || 0;
  endX = endX || colNum;
  endY = endY || rowNum;
  var x = Math.floor(Math.random() * (endX - startX)) + startX;
  var y = Math.floor(Math.random() * (endY - startY)) + startY;
  var dot = [y, x];
  if (carrier[y][x]) {
    return randomDot(carrier, startX, startY, endX, endY);
  } 
  return dot;
}

function initFood(Num, carrier) {
  for (var i=0; i < Num; i++) {
    var dot = randomDot(carrier);
    foodGrid.push(dot);
    carrier[dot[0]][dot[1]] = "food";
    grid[dot[0]][dot[1]].className = "food";
    grid[dot[0]][dot[1]].style.background = randomColor();
  }
}

function initObstacle(Num, carrier) {
  for (var i=0; i < Num; i++) {
    var dot = randomDot(carrier);
    obstacleGrid.push(dot);
    carrier[dot[0]][dot[1]] = "obstacle";
    grid[dot[0]][dot[1]].className = "obstacle";
  }
}

function eatFood(y, x) {
  for (var i=0; i<foodGrid.length; i++) {
    if(y == foodGrid[i][0] && x == foodGrid[i][1]) {
      var headY = foodGrid[i][0];
      var headX = foodGrid[i][1];
      snakeGrid.unshift([headY, headX]);
      carrier[headY][headX] = false;
      grid[snakeGrid[0][0]][snakeGrid[0][1]].style.background = grid[foodGrid[i][0]][foodGrid[i][1]].style.background;
      foodGrid.splice(i, 1);
      score += 100;
      $("score").innerText = score;
      return true;
    }
  }
}

function gameOver(str) {
  clearInterval(snakeTimer);
  snakeTimer = null;
  $("audio1").pause();
  $("audio2").play();
  $("endReason").innerText = str;
  $("finalScore").innerText = score;
  $("message").style.display = "block";
  directionCode = 39;
  grid = multiArray(rowNum, colNum);
  carrier = multiArray(rowNum, colNum);
  snakeGrid = [];
  foodGrid = [];
  obstacleGrid = [];
  score = 0;
}
 
function initGame() {
  initMap();
  var snake = new Snake();
  snake.init(5);
  initFood(10, carrier);
  $("score").innerText = score;
}

function classcialMode() {
  $("menu").style.display = "none";
  gameMode = "classcialMode";
  clearInterval(snakeTimer);
  snakeTimer = null;
  startGame(time);
}

function obstacleMode() {
   $("menu").style.display = "none";
  clearInterval(snakeTimer);
  snakeTimer = null;
  gameMode = "obstacleMode";
  initObstacle(obstacleNum, carrier);
  startGame(time);
}

function playAgain() {
  $("message").style.display = "none";
  clearInterval(snakeTimer);
  snakeTimer = null;

  if (gameMode == "classcialMode") {
    $("gamezone").innerHTML = "";
    clearAll();
    initGame();
    clearInterval(snakeTimer);
    snakeTimer = null;
    startGame(time);
  }
  else if(gameMode == "obstacleMode") {
    $("gamezone").innerHTML = "";
    clearAll();
    initGame();
    initObstacle(obstacleNum, carrier);
    clearInterval(snakeTimer);
    snakeTimer = null;
    startGame(time);
  }
}

function returnMenu() {
  $("message").style.display = "none";
  $("menu").style.display = "block";
  $("gamezone").innerHTML = "";
  clearAll();
  initGame();
} 

function clearAll() {
  directionCode = 39;
  grid = multiArray(rowNum, colNum);
  carrier = multiArray(rowNum, colNum);
  snakeGrid = [];
  foodGrid = [];
  obstacleGrid = [];
  score = 0;
  window.clearInterval(snakeTimer);
  snakeTimer = null;
}

function startGame(time) {
  $("countdown").style.display = "block";
  $("time").innerText = time;

  if (time == 0) {
    $("countdown").style.display = "none";
    snakeTimer = setInterval(function() {snakeMove();}, speed);
    $("audio1").play();

  }
  else {
    time--;
    setTimeout(function() {
      startGame(time);
    }, 1000);
  }
}

function difficulty(d) {
  var btns = document.querySelectorAll("#difficulty > button");
  for (var i=0; i<btns.length; i++) {
    btns[i].className = "";
  }
  switch(d) {
    case "easy":
      btns[0].className = "selected";
      speed = 200;
      obstacleNum = 10;
      break;
    case "medium":
      btns[1].className = "selected";
      speed = 100;
      obstacleNum = 15;
      break;
    case "hard":
      btns[2].className = "selected";
      speed = 50;
      obstacleNum = 20;
      break;
  }
}

window.onload = function() {
  initGame();
}