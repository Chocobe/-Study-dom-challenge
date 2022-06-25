// useBlock()
const BLOCK_STATUS = {
  GOOD: "good",
  BAD: "bad",
};

const useBlock = ({
  idx,
  duration,
  predicator,
  onGood,
  onBad,
}) => {
  const blockNum = idx;
  const $block = document.createElement("div");
  $block.classList.add("board-box");
  $block.style.setProperty("--duration", `${(duration / 1000).toFixed?.(2)}s`)

  const clearStatus = () => {
    $block.classList.remove("good");
    $block.classList.remove("bad");
  }

  const trigger = () => {
    const trigger = $block.dataset.trigger === "true";
    $block.dataset.trigger = String(!trigger);
  }

  const onClick = () => {
    trigger();
    clearStatus();

    if (predicator(blockNum)) {
      $block.classList.add("good");
      setTimeout(onGood, duration);
    } else {
      $block.classList.add("bad");
      setTimeout(onBad, duration);
    }
  }

  const initClickEvent = () => {
    $block.addEventListener("click", onClick);
  }

  const removeClickEvent = () => {
    $block.removeEventListener("click", onClick);
  }

  const preview = () => {
    trigger();
    clearStatus();
    $block.classList.add("good");
  };

  return {
    $block,
    initClickEvent,
    removeClickEvent,
    preview,
  };
}

// useStart()

// useMemoryGame()
const useMemoryGame = (numOfBlock = 5) => {
  const DURATION = 1000;
  let isGameOver = false;
  
  const $start = document.querySelector(".actions-start");
  const $score = document.querySelector(".info-item-score");
  const $highScore = document.querySelector(".info-item-highScore");
  const $board = document.querySelector(".board");
  const $blocks = Array.from(
    { length: numOfBlock },
    (_, idx) => useBlock({
      idx,
      duration: DURATION,
      predicator: blockNum => onClickBlock(blockNum),
      onGood: () => onGood(),
      onBad: () => onBad(),
    })
  );

  let question = [];
  let answer = [];
  let score = 0;
  let highScore = 0;

  $start.addEventListener("click", () => {
    if (isGameOver) {
      console.log('$start 버튼 동작함..');
      generateStage(1);
    }
  });

  $blocks.forEach(block => $board.appendChild(block.$block));

  const onClickBlock = blockNum => {
    answer.push(blockNum);

    console.log(`answer: `, answer);
    
    return question[answer.length - 1] === blockNum;
  };

  const onGood = () => {
    if (question.length === answer.length) {
      setScore(score + 1);

      setTimeout(() => {
        generateStage(score + 1);
      }, 1000);
    }
  };

  const setScore = value => {
    score = value;
    highScore = Math.max(value, highScore);

    $score.innerText = score;
    $highScore.innerText = highScore;
  }

  const onBad = () => {
    quitGame();
  }

  const quitGame = () => {
    setScore(0);
    isGameOver = true;
    $blocks.forEach(({ removeClickEvent }) => removeClickEvent());
  }

  const generateStage = level => {
    isGameOver = false;
    $blocks.forEach(({ removeClickEvent }) => removeClickEvent());

    question = Array.from(
      { length: level },
      () => Math.floor(Math.random() * numOfBlock)
    );

    answer = [];

    question.forEach((num, i) => {
      setTimeout(() => {
        $blocks[num].preview();
      }, i * DURATION);
    });

    setTimeout(() => {
      $blocks.forEach(({ initClickEvent }) => initClickEvent());
    }, question.length * DURATION);

    console.log("초기화 완료");
    console.log(question);
    console.log(answer);
    console.log(score);
    console.log('');
  }

  generateStage(1);

  return {
    $board,
    $blocks,
  };
};

useMemoryGame(5);