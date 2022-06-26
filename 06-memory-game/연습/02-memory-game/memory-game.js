// useBoard()
/** @param { ReturnType<useBox>[] } boxes */
const useBoard = boxes => {
  const board = document.querySelector(".board");

  boxes.forEach(({ box }) => board.appendChild(box));

  return {
    board,
  };
}

// useBox()
const useBox = (idx, onClick) => {
  const box = document.createElement("div");
  box.classList.add("board-box");

  box.addEventListener("click", () => {
    if (freeze) return;

    onClick(idx);
    blink();
  });

  const blink = () => {
    clearStyleClass();
    box.classList.add(state);
    
    const trigger = box.dataset.trigger === "true";
    box.dataset.trigger = String(!trigger);

    return new Promise(res => {
      setTimeout(() => res(), 1000);
    });
  };

  const clearStyleClass = () => {
    box.classList.remove("good");
    box.classList.remove("bad");
  }

  let freeze = false;
  /** @param { boolean } isFreeze */
  const setFreeze = isFreeze => (freeze = isFreeze);
  
  let state;
  const setIsGood = isGood => {
    state = isGood ? "good" : "bad";
  };
  
  return {
    box,
    blink,
    freeze,
    setFreeze,
    setIsGood,
  };
}

// useStartButton()
const useStartButton = onClick => {
  const startButton = document.querySelector(".actions-start");
  startButton.addEventListener("click", () => {
    onClick();
  });

  return {
    startButton,
  };
}

// useScore()
const useScore = () => {
  const $score = document.querySelector(".score");
  const $highScore = document.querySelector(".highScore");
  
  let _score = 0;
  let _highScore = 0;

  const getScore = () => _score;

  const setScore = score => {
    _score = score;
    _highScore = Math.max(_highScore, score);

    $score.innerText = _score;
    $highScore.innerText = _highScore;
  };

  return {
    getScore,
    setScore,
  };
};

// useMemoryGame()
const useMemoryGame = numOfBox => {
  let question = [];
  let answer = [];

  const {
    getScore,
    setScore,
  } = useScore();
  
  const onClickBox = (idx) => {
    answer.push(idx);

    if (question[answer.length - 1] === idx) {
      applyScore();
      boxes[idx].setIsGood(true);
    } else {
      boxes[idx].setIsGood(false);
      gameOver();
    }
  };

  const applyScore = () => {
    if (question.length !== answer.length) return;

    setScore(getScore() + 1);

    setTimeout(() => {
      generateQuestion(getScore() + 1);
    }, 2000);
  }

  const gameOver = () => {
    initScore();
    setFreezeAllBox(true);
  }

  // boxes 만들기
  const boxes = Array.from(
    { length: numOfBox },
    (_, idx) => useBox(idx, onClickBox)
  );

  const setFreezeAllBox = isFreeze => {
    boxes.forEach(({ setFreeze }) => setFreeze(isFreeze));
  };

  const board = useBoard(boxes);

  const initScore = () => {
    setScore(0);
  }

  const generateQuestion = async level => {
    setFreezeAllBox(true);

    answer = [];
    question = Array.from(
      { length: level },
      () => Math.floor(Math.random() * numOfBox)
    );

    await question.reduce(async (promise, idx) => {
      await promise;
      boxes[idx].setIsGood(true);
      return boxes[idx].blink();
    }, Promise.resolve());

    console.log("question: ", question);
    setFreezeAllBox(false);
  };
  
  const onClickStart = () => {
    initScore();
    generateQuestion(1);
  }

  useStartButton(onClickStart);
};

window.addEventListener("DOMContentLoaded", () => {
  useMemoryGame(5);
});