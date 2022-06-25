// class 타입으로 만들기

const generateRandomNum = limit => Math.floor(Math.random() * limit);

class Info {
  score;
  highScore;

  $score;
  $highScore;
  
  constructor() {
    this.score = 0;
    this.highScore = 0;

    this.initInfo();
    this.loadHighScore();
    this.setScore(0);
  }

  setScore(score) {
    this.score = score;
    this.highScore = Math.max(this.highScore, score);
    localStorage.setItem("memory-game-highScore", JSON.stringify(this.highScore));

    this.$score.innerText = score;
    this.$highScore.innerText = this.highScore;
  }

  initInfo() {
    this.$score = document.querySelector(".info-wrapper-score");
    this.$highScore = document.querySelector(".info-wrapper-highScore");
  }

  loadHighScore() {
    const highScore = localStorage.getItem("memory-game-highScore") ?? 0;

    console.log(`loadHighScore(): ${highScore}`);

    this.highScore = highScore;
  }
}

class Box {
  id;
  duration;
  $el;
  
  isFreeze = false;

  constructor(id, onClick, duration) {
    this.id = id;
    this.duration = duration;

    const $el = document.createElement("div");
    $el.classList.add("board-box");
    
    $el.style.setProperty("--duration",
      `${Math.floor(this.duration / 1000)}s`
    );

    $el.addEventListener("click", () => {
      if (this.isFreeze) {
        console.log("클릭 불가", this.isFreeze);
        return;
      }
      
      console.log("클릭 상태", this.isFreeze);
      const isCorrect = onClick(id);
      this.blink(isCorrect);
    })

    this.$el = $el;
  }

  blink(isCorrect) {
    const { $el } = this;
    const trigger = $el.dataset.trigger === "true";
    $el.dataset.trigger = String(!trigger);

    this.clearStyleClass();

    if (isCorrect) {
      $el.classList.add("good");
    } else {
      $el.classList.add("bad");
    }
  }

  setFreeze(isFreeze) {
    this.isFreeze = isFreeze;
  }

  clearStyleClass() {
    const { $el } = this;
    $el.classList.remove("good");
    $el.classList.remove("bad");
  }
}

class Actions {
  $el;

  constructor(onClick) {
    const $el = document.querySelector(".actions-start");
    $el.addEventListener("click", () => {
      onClick();
    });

    this.$el = $el;
  }
}

class MemoryGame {
  board;
  boxes;
  duration;
  actions;
  info;
  numOfBox;

  question;
  answer;

  score;
  highScore;

  constructor(numOfBox, duration = 1000) {
    this.initBoard();
    this.initBoxes(numOfBox, duration);
    this.initActions();
    this.initInfo();

    console.log(this);
  }

  initBoard() {
    this.board = document.querySelector(".board");
  }

  initBoxes(numOfBox, duration) {
    this.duration = duration;

    const boxes = Array.from(
      { length: numOfBox },
      (_, i) => new Box(i, this.onClickBox.bind(this), duration)
    );

    boxes.forEach(box => {
      this.board.appendChild(box.$el);
    });

    this.boxes = boxes;
    this.numOfBox = numOfBox;
  }

  initActions() {
    this.actions = new Actions(this.onClickStart.bind(this));
  }

  initInfo() {
    this.info = new Info();
  }

  onClickStart() {
    this.generateQuestion(1);
  }

  onClickBox(id) {
    const { question, answer } = this;
    const idx = answer.length;

    if (question[idx] !== id) {
      this.gameOver();
      return false;
    }
    
    answer.push(id);

    if (question.length === answer.length) {
      const score = this.info.score + 1;
      this.info.setScore(score);
      this.boxes.forEach(b => b.setFreeze(true));

      setTimeout(() => {
        this.generateQuestion(score + 1);
      }, 2000);
    }
    
    return true;
  }

  gameOver() {
    console.log("Game Over");
    this.info.setScore(0);
    
    this.boxes.forEach(b => b.setFreeze(true));

    this.board.classList.add("shake");
    setTimeout(() => {
      this.board.classList.remove("shake");
    }, 500);
  }

  generateQuestion(stage) {
    console.log("generateQuestion(stage) - stage: ", stage);

    const { numOfBox } = this;

    const cache = [];
    
    this.answer = [];
    this.question = Array.from(
      { length: stage },
      () => {
        let num = generateRandomNum(numOfBox);

        if (cache.length < 2) {
          cache.push(num);
        } else {
          while (cache.every(c => c === num)) {
            num = generateRandomNum(numOfBox);
          }

          cache.shift();
          cache.push(num);
        }

        return num;
      }
    );

    console.log("this.question: ", this);

    this.showQuestion();
  }

  showQuestion() {
    const { duration, boxes } = this;

    this.question.forEach((id, idx) => {
      setTimeout(() => {
        this.boxes[id].blink(true);
      }, duration * idx);
    });

    setTimeout(() => {
      boxes.forEach(b => b.setFreeze(false));
    }, (this.question.length - 1) * duration);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new MemoryGame(5, 1000);
})