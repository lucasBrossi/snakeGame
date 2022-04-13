//This part must to import all we need to execute
import {
  bodyEnum,
  bodyInlineEnum,
  colorEnum,
  directionsEnum,
  tailsEnum,
} from "./enum.js";
import { firstTenPlayers, removeScores, setScore } from "./helper.js";

//This was made by Lucas Bueno Rossi; Lucas Angulo Amador; Luis Victor; Arthur Dylan
let grid = document.querySelector(".grid");
let popup = document.querySelector(".popup");
let playAgain = document.querySelector(".playAgain");
let playGame = document.querySelector(".playGame");
let scoreDisplay = document.querySelector(".scoreDisplay");
let body = document.querySelector("body");
let generalScore = document.querySelector(".generalScore");
let cleanScores = document.querySelector(".cleanScores");

//This select the audios and set them
const moveAudio = new Audio("./audios/move.mp3");
const eatAudio = new Audio("./audios/eat.aac");
const hitAudio = new Audio("./audios/hit.aac");

//this must to set volume of move to 90%
moveAudio.volume = 0.09;

//Global variables
var lastMove = directionsEnum.right;
var directionBeforeLastMove = "";
var lastTail = tailsEnum.right;
var wasRedirect = false;
var canMove = false;
var lastNumber;
var playerName;
var squares;
var greateScore;

let width = 20;
let appleIndex = 0;
let currentSnake = [2, 1, 0];
let direction = 1;
let score = 0;
let speed = 0.97;
let intervalTime = 0;
let interval = 0;

//This is responsible to iniciate the game
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", control);
  createBoard();
  startGame();
  cleanScores.addEventListener("click", removeScores);
  playAgain.addEventListener("click", replay);
  playGame.addEventListener("click", () => {
    canMove = true;
    playGame.classList.add("displayNone");
  });
});

const createBoard = () => {
  popup.style.display = "none";
  const area = Array(400).fill(null);
  area.forEach(() => {
    let div = document.createElement("div");
    grid.appendChild(div);
  });
};

//This must to control by keyArrow all the snake moves
const control = ({ key }) => {
  //This part must just to move when arrow key down
  if (!canMove) {
    return;
  }
  switch (key) {
    case directionsEnum.up:
      if (lastMove !== directionsEnum.down && lastMove !== directionsEnum.up) {
        direction = -width;
        directionBeforeLastMove = lastMove;
        lastMove = key;
        nextMove();
      }
      break;
    case directionsEnum.down:
      if (lastMove !== directionsEnum.up && lastMove !== directionsEnum.down) {
        direction = +width;
        directionBeforeLastMove = lastMove;
        lastMove = key;
        nextMove();
      }
      break;
    case directionsEnum.left:
      if (
        lastMove !== directionsEnum.right &&
        lastMove !== directionsEnum.left
      ) {
        direction = -1;
        directionBeforeLastMove = lastMove;
        lastMove = key;
        nextMove();
      }
      break;
    case directionsEnum.right:
      if (
        lastMove !== directionsEnum.left &&
        lastMove !== directionsEnum.right
      ) {
        direction = 1;
        directionBeforeLastMove = lastMove;
        lastMove = key;
        nextMove();
      }
      break;
    default:
      wasRedirect = false;
      break;
  }
};

//This must to start the game
const startGame = () => {
  hitAudio.pause();
  hitAudio.load();

  reloadScores();
  squares = document.querySelectorAll(".grid div");
  newColor();
  lastMove = directionsEnum.right;
  directionBeforeLastMove = "";
  lastTail = tailsEnum.right;
  wasRedirect = false;
  intervalTime = 300;
  direction = 1;
  scoreDisplay.innerHTML = score;
  currentSnake = [2, 1, 0];
  currentSnake.forEach((index) => squares[index].classList.add("snake"));
  squares[2].classList.add(`head-${lastMove}`);
  squares[1].classList.add(bodyInlineEnum.horizontal);
  squares[0].classList.add(tailsEnum.right);

  // this need to be after of snake creation
  randomApple(squares);
  interval = setInterval(moveOutcome, intervalTime);
};

// this must to change the background color
const newColor = () => {
  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * 10);
  } while (lastNumber === randomNumber);
  lastNumber = randomNumber;
  body.style.backgroundColor = colorEnum[randomNumber];
};

const nextMove = () => {
  moveOutcome();

  //This ads the current turn of snake when it become to another direction
  squares[currentSnake[1]].classList.add(
    `body-${lastMove}-CommingFrom${directionBeforeLastMove}`
  );

  clearInterval(interval);
  interval = setInterval(moveOutcome, intervalTime);
};

const moveOutcome = () => {
  //If canMove is false, the moves can not work
  if (!canMove) {
    return;
  }

  let squares = document.querySelectorAll(".grid div");
  if (checkForHits(squares)) {
    hitAudio.play();
    canMove = false;
    popup.style.display = "flex";
    clearInterval(interval);
    playerName = prompt("Nome do Jogador:");
    if (!!playerName) {
      setScore(playerName, score);
    }
  } else {
    moveSnake(squares);
  }
};

// this is responsible to move the snake
const moveSnake = (squares) => {
  let tail = currentSnake.pop();

  //This remove the classes of tail related of snake
  squares[tail].classList.remove(
    "snake",
    tailsEnum.down,
    tailsEnum.left,
    tailsEnum.right,
    tailsEnum.up
  );
  currentSnake.unshift(currentSnake[0] + direction);

  //This must to check what happens when the apple is eaten
  eatApple(squares, tail);

  //This must to remove all classes related of head snake to join to body
  squares[currentSnake[1]].classList.remove(
    `head-${directionsEnum.down}`,
    `head-${directionsEnum.up}`,
    `head-${directionsEnum.right}`,
    `head-${directionsEnum.left}`
  );

  // this must to chose the turn body of snake
  if (
    !wasRedirect &&
    (lastMove === directionsEnum.down || lastMove === directionsEnum.up)
  ) {
    squares[currentSnake[1]].classList.add(bodyInlineEnum.vertical);
  } else if (
    !wasRedirect &&
    (lastMove === directionsEnum.right || lastMove === directionsEnum.left)
  ) {
    squares[currentSnake[1]].classList.add(bodyInlineEnum.horizontal);
  }

  //This must to add classes to the new head of current snake
  squares[currentSnake[0]].classList.add("snake", `head-${lastMove}`);

  tail = currentSnake[currentSnake.length - 1];

  //This must to decide the next tail
  if (
    squares[tail].classList.contains(bodyEnum.down_left) ||
    squares[tail].classList.contains(bodyEnum.down_right)
  ) {
    lastTail = tailsEnum.down;
    squares[tail].classList.add(tailsEnum.down);
    removeBodyTurns(squares, tail);
    removeBodyInlines(squares, tail);
  } else if (
    squares[tail].classList.contains(bodyEnum.up_right) ||
    squares[tail].classList.contains(bodyEnum.up_left)
  ) {
    lastTail = tailsEnum.up;
    squares[tail].classList.add(tailsEnum.up);
    removeBodyInlines(squares, tail);
    removeBodyTurns(squares, tail);
  } else if (
    squares[tail].classList.contains(bodyEnum.right_down) ||
    squares[tail].classList.contains(bodyEnum.right_up)
  ) {
    lastTail = tailsEnum.right;
    squares[tail].classList.add(tailsEnum.right);
    removeBodyInlines(squares, tail);
    removeBodyTurns(squares, tail);
  } else if (
    squares[tail].classList.contains(bodyEnum.left_down) ||
    squares[tail].classList.contains(bodyEnum.left_up)
  ) {
    lastTail = tailsEnum.left;
    squares[tail].classList.add(tailsEnum.left);
    removeBodyInlines(squares, tail);
    removeBodyTurns(squares, tail);
  } else {
    squares[tail].classList.add(lastTail);
    removeBodyInlines(squares, tail);
  }

  //This play the sound of move
  moveAudio.fastSeek(0.1);
  moveAudio.playbackRate = 2;
  moveAudio.play();
};

//This removes all body classes related to turns
const removeBodyTurns = (squares, index) => {
  squares[index].classList.remove(
    bodyEnum.up_right,
    bodyEnum.up_left,
    bodyEnum.down_left,
    bodyEnum.down_right,
    bodyEnum.left_down,
    bodyEnum.right_up,
    bodyEnum.right_down,
    bodyEnum.left_up
  );
};

//This removes all body classes related to inlines, vertical and horizontal
const removeBodyInlines = (squares, index) => {
  squares[index].classList.remove(
    bodyInlineEnum.horizontal,
    bodyInlineEnum.vertical
  );
};

//This must to check for hits before snake moves
const checkForHits = (squares) => {
  if (
    (currentSnake[0] + width >= width * width && direction === width) ||
    (currentSnake[0] % width === width - 1 && direction === 1) ||
    (currentSnake[0] % width === 0 && direction === -1) ||
    (currentSnake[0] - width <= 0 && direction === -width) ||
    squares[currentSnake[0] + direction].classList.contains("snake")
  ) {
    return true;
  }

  return false;
};

//This must to check if apple is going to be eaten
const eatApple = (squares, tail) => {
  if (squares[currentSnake[0]].classList.contains("apple")) {
    eatAudio.pause();
    eatAudio.load();
    squares[currentSnake[0]].classList.remove("apple");
    squares[tail].classList.add("snake");
    currentSnake.push(tail);
    randomApple(squares);
    score++;
    scoreDisplay.textContent = score;
    clearInterval(interval);
    intervalTime = intervalTime * speed;
    interval = setInterval(moveOutcome, intervalTime);

    // every time the apple is eaten, the background must to be changed by other
    newColor();
    eatAudio.play();
  }
};

//This select a random grid that it is not a snake and create an apple
const randomApple = (squares) => {
  do {
    appleIndex = Math.floor(Math.random() * squares.length);
  } while (squares[appleIndex].classList.contains("snake"));
  squares[appleIndex].classList.add("apple");
};

// this must to reload and rerender all the scores from localStorage to generalScore
const reloadScores = () => {
  greateScore = firstTenPlayers();
  generalScore.innerHTML = "";

  greateScore.forEach((score) => {
    var div = document.createElement("div");
    div.innerHTML = `${score.playerName}: ${score.score}`;
    div.classList.add("scores");
    generalScore.appendChild(div);
  });
};

//This must to replay game
const replay = () => {
  grid.innerHTML = "";
  createBoard();
  canMove = true;
  clearInterval(interval);
  score = 0;
  startGame();
  popup.style.display = "none";
};
