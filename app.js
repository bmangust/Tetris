const $ = (name) => document.querySelector(name);
const $$ = (name) => document.querySelectorAll(name);
const log = (message) => console.log(message);

const draw = () => {
  current.forEach((index) => {
    squares[currentPosition + index].classList.add("tetramino");
    squares[currentPosition + index].classList.add(`color${random}`);
  });
};

const undraw = () => {
  current.forEach((index) => {
    squares[currentPosition + index].classList.remove("tetramino");
    squares[currentPosition + index].classList.remove(`color${random}`);
  });
};

const move = (direction) => {
  if (state !== states['game']) return;
  undraw();
  switch (direction) {
    case "left":
      const atMostLeft = current.some(
        (index) => (currentPosition + index) % w === 0
      );
      if (!atMostLeft) {
        currentPosition -= 1;
      }
      if (
        current.some((index) =>
          squares[currentPosition + index].classList.contains("taken")
        )
      ) {
        currentPosition += 1;
      }
      break;
    case "right":
      const atMostRight = current.some(
        (index) => (currentPosition + index) % w === 9
      );
      if (!atMostRight) {
        currentPosition += 1;
      }
      if (
        current.some((index) =>
          squares[currentPosition + index].classList.contains("taken")
        )
      ) {
        currentPosition -= 1;
      }
      break;
    default:
      currentPosition += w;
      if (
        current.some(
          (index) =>
            index > 200 ||
            squares[currentPosition + index].classList.contains("taken")
        )
      ) {
        currentPosition -= w;
      }
  }
  draw();
  // log(currentPosition);
};

const createCells = (n = 10, className = "") => {
  let arr = new Array(n).fill`.`;
  const map = arr.map((it) => {
    const el = document.createElement("div");
    if (className !== "") el.className = className;
    return el;
  });
  return map;
};

const fillGrid = (n = 10, className = "") => {
  let grid = $`.grid`;
  let arr = createCells(n, className);
  arr.forEach((el) => grid.prepend(el));
};

const fillNext = () => {
  let arr = new Array(16).fill`.`;
  const map = arr.map(() => document.createElement("div"));
  map.forEach((el) => nextGrid.prepend(el));
  next = $$`.next div`;
};

/**
 * checks and freezes current tetramino
 * if it touches taken
 */
const freeze = () => {
  const freezeFigure = () => {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove(`color${random}`);
      squares[currentPosition + index].classList.add("taken");
      squares[currentPosition + index].classList.add('colorInactive');
    }
    );
  };
  if (checkFreeze()) {
    freezeFigure();
    addScore();
    drawNext();
    draw();
    checkGameOver();
    return true;
  }
  return false;
};

const checkFreeze = () => {
  if (current.some((index) =>
      squares[currentPosition + index + w].classList.contains("taken"))) {
        return true;
      }
  return false;
}

// hard drop
const drop = () => {
  undraw();
  while (!checkFreeze()) {
    currentPosition += w;
  }
  draw();
  freeze();
};

// displays next tetramino
const drawNext = () => {
  random = nextRandom;
  nextRandom = Math.floor(Math.random() * previews.length);
  next.forEach((item) => item.className = '');
  previews[nextRandom].forEach((index) => {
    next[index].classList.add("tetramino");
    next[index].classList.add(`color${nextRandom}`);
  })
  rotation = Math.floor(Math.random() * 4);
  current = tetraminoes[random][rotation];
  currentPosition = 4;
};

// checks if current figure is split in pieces after rotation
const isSplit = (basePoint) => {
  let isSplit = false;
  current.forEach((index) => {
    if (basePoint < 2) {
      //we're on the left side
      if (Math.floor((index + currentPosition) % w) > 5) {
        isSplit = true;
      }
    } else if (basePoint > 7) {
      // we're on the right side
      if (Math.floor((index + currentPosition) % w) < 5) {
        isSplit = true;
      }
    }
  });
  return isSplit;
};

const rotate = () => {
  log(`rotate begin. random: ${random}`);
  if (state !== states['game']) return;
  if (freeze()) return;
  undraw();
  const basePoint = Math.floor((current[0] + currentPosition) % w);
  const prevRotation = rotation;
  rotation = ++rotation % 4;
  current = tetraminoes[random][rotation];
  if (checkFreeze()) {
    rotation = prevRotation;
    current = tetraminoes[random][rotation];
  }
  while (isSplit(basePoint)) {
    if (basePoint > 5) {
      currentPosition--;
    } else {
      currentPosition++;
    }
  }
  draw();
};

const update = () => {
  if (state === states['game']) {
    move("down");
    setTimeout(freeze, freezeDelay);
  }
};

const addScore = () => {
  for (let i = 0; i < 200; i += w) {
    const row = new Array(10).fill(0).map((it, index) => i + index);

    if (row.every((index) => squares[index].classList.contains("taken"))) {
      score += 10;
      scoreDisplay.innerHTML = score;
      row.forEach((index) => squares[index].remove());
      fillGrid(10);
      squares = $$`.grid div`;
      speed = score < 100 ? 1 : Math.floor(score / 50);
      interval = 2000 / speed;
      clearInterval(timer);
      timer = setInterval(() => update(), interval);
    }
  }
};

const checkGameOver = () => {
  if (state !== states['game']) return;
  if (
    current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    )
  ) {
    clearInterval(timer);
    currentScore = $("#score").innerHTML;
    const message = document.createElement("div");
    message.classList.add("message");
    message.innerHTML = "The game is over. Your score is " + currentScore;
    scoreDisplay.append(message);
    state = states['over'];
  }
};

// prepare game field
const newGame = () => {
  grid.innerHTML = '';
  nextGrid.innerHTML = '';
  score = 0;
  speed = 1;
  interval = 2000 / speed;
  clearInterval(timer);
  timer = setInterval(() => update(), interval);
  scoreDisplay.innerHTML = score;
  fillGrid(10, "taken invisible");
  fillGrid(200);
  fillNext();
  squares = $$`.grid div`;
  drawNext();
  draw();
}
  

//  global game conststans and variables
const grid = $`.grid`;
let squares = $$`.grid div`;
const nextGrid = $`.next`;
let next = $$`.next div`;
const scoreDisplay = $`#score`;
const button = $`button`;
const w = 10; //field width
const pw = 4; //preview width
const states = {'game': 0, 'pause': 1, 'over': 2};
let state = states['over'];
let score = 0;
const freezeDelay = 500;

const L = [
  [1, w + 1, w * 2 + 1, w * 2 + 2],
  [0, 1, 2, w],
  [0, 1, w + 1, w * 2 + 1],
  [2, w, w + 1, w + 2],
];

const J = [
  [1, w + 1, w * 2, w * 2 + 1],
  [0, w, w + 1, w + 2],
  [1, 2, w + 1, w * 2 + 1],
  [0, 1, 2, w + 2],
];

const Z = [
  [1, w, w + 1, w * 2],
  [0, 1, w + 1, w + 2],
  [1, w, w + 1, w * 2],
  [0, 1, w + 1, w + 2],
];

const S = [
  [0, w, w + 1, w * 2 + 1],
  [1, 2, w, w + 1],
  [0, w, w + 1, w * 2 + 1],
  [1, 2, w, w + 1],
];

const T = [
  [1, w, w + 1, w + 2],
  [1, w + 1, w + 2, w * 2 + 1],
  [0, 1, 2, w + 1],
  [1, w, w + 1, w * 2 + 1],
];

const O = [
  [0, 1, w, w + 1],
  [0, 1, w, w + 1],
  [0, 1, w, w + 1],
  [0, 1, w, w + 1],
];

const I = [
  [1, w + 1, w * 2 + 1, w * 3 + 1],
  [0, 1, 2, 3],
  [1, w + 1, w * 2 + 1, w * 3 + 1],
  [0, 1, 2, 3],
];

const previews = [
  [1, pw + 1, pw * 2 + 1, pw * 2 + 2],
  [1, pw + 1, pw * 2, pw * 2 + 1],
  [1, pw, pw + 1, pw * 2],
  [0, pw, pw + 1, pw * 2 + 1],
  [1, pw, pw + 1, pw + 2],
  [0, 1, pw, pw + 1],
  [1, pw + 1, pw * 2 + 1, pw * 3 + 1],
];

let currentPosition = 4;
const tetraminoes = [L, J, Z, S, T, O, I];
let random = Math.floor(Math.random() * tetraminoes.length);
let nextRandom = Math.floor(Math.random() * previews.length);
let rotation = Math.floor(Math.random() * 4);
let current = tetraminoes[random][rotation];
let speed = 1;
let interval = 2000 / speed;
let timer = setInterval(() => update(), interval);

$("button").addEventListener("click", (event) => {
  if (state === states['over']) {
    newGame();
  }
  state = state === states['game'] ? states['pause'] : states['game'];
});

document.addEventListener("keydown", (event) => {
  log(`keycode: ${event.keyCode}, key: ${event.key}`);
  if (event.key === "Escape") {
    if (state === states['over']) {
      newGame();
      state = states['pause'];
    }
    state = state === states['pause'] ? states['game'] : states['pause'];
  } else if (state === states['game']) {
    if (event.key == "ArrowLeft") {
      move("left");
    } else if (event.key == "ArrowRight") {
      move("right");
    } else if (event.key === "ArrowDown") {
      move("down");
    } else if (event.key === "ArrowUp") {
      rotate();
    } else if (event.key === " ") {
      drop();
    }
  }
});
