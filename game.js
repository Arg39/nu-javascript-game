const welcomeScreen = document.getElementById("welcome-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startButton = document.getElementById("start-btn");
const replayButton = document.getElementById("replay-btn");
const inputField = document.getElementById("inputField");
const timerElement = document.getElementById("timer");
const englishCheckbox = document.getElementById("english-checkbox");
const indonesianCheckbox = document.getElementById("indonesian-checkbox");
const finalScoreElement = document.getElementById("final-score");

// Load sounds
const backgroundMusic = new Audio("sound/music_game.mp3");
const correctSound = new Audio("sound/score_soundeffect.mp3");
const errorSound = new Audio("sound/error.mp3");
const gameOverSound = new Audio("sound/game_over.mp3");

let score = 0;
let activeWord = "";
let wordElement;
let wordSpeed = 2;
let maxWordSpeed = 10;
let gameInterval;
let timerInterval;
let timeLeft = 30;
let language = "english";
let hasErrors = false;

startButton.addEventListener("click", startGame);
replayButton.addEventListener("click", resetGame);

englishCheckbox.addEventListener("change", () => {
  if (englishCheckbox.checked) {
    indonesianCheckbox.checked = false;
    language = "english";
  }
});

indonesianCheckbox.addEventListener("change", () => {
  if (indonesianCheckbox.checked) {
    englishCheckbox.checked = false;
    language = "indonesian";
  }
});

async function fetchWord() {
  const apiUrl = "https://random-word-api.herokuapp.com/word?number=1";
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    let word = data[0];

    if (language === "indonesian") {
      word = await translateWord(word, "en", "id");
    }

    return word;
  } catch (error) {
    console.error("Error fetching word:", error);
    return "error";
  }
}

async function translateWord(word, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    word
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0][0][0];
  } catch (error) {
    console.error("Error translating word:", error);
    return word;
  }
}

function startGame() {
  welcomeScreen.style.display = "none";
  gameScreen.style.display = "block";
  score = 0;
  wordSpeed = 2;
  timeLeft = 30;
  inputField.value = "";
  timerElement.textContent = `Time: ${timeLeft}`;
  startTimer();
  newWord();

  // Play background music
  backgroundMusic.loop = true;
  backgroundMusic.play();

  inputField.focus();
  setFocusOnInput();
}

function setFocusOnInput() {
  window.addEventListener("blur", () => {
    setTimeout(() => {
      inputField.focus();
    }, 0);
  });

  window.addEventListener("click", () => {
    inputField.focus();
  });

  inputField.addEventListener("blur", () => {
    setTimeout(() => {
      inputField.focus();
    }, 0);
  });
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Time: ${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function truncateWord(word, maxLength) {
  if (word.length > maxLength) {
    return word.slice(0, maxLength) + "...";
  }
  return word;
}

async function newWord() {
  let fetchedWord = await fetchWord();
  const maxWordLength = 20;
  activeWord = truncateWord(fetchedWord, maxWordLength);

  wordElement = document.createElement("div");
  wordElement.className = "word";
  wordElement.style.top = "0px";
  wordElement.style.left = `${Math.random() * 80 + 10}%`;
  gameScreen.appendChild(wordElement);
  displayWord(activeWord);
  inputField.value = "";
  hasErrors = false;

  gameInterval = setInterval(() => {
    let wordTop = parseInt(wordElement.style.top);
    if (wordTop >= window.innerHeight - 100) {
      endGame();
    } else {
      wordElement.style.top = wordTop + wordSpeed + "px";
    }
  }, 30);
}

function displayWord(word) {
  wordElement.innerHTML = "";
  for (let i = 0; i < word.length; i++) {
    const span = document.createElement("span");
    span.textContent = word[i];
    wordElement.appendChild(span);
  }
}

function checkInput() {
  const input = inputField.value;
  const letters = wordElement.children;
  hasErrors = false;

  for (let i = 0; i < letters.length; i++) {
    if (input[i]) {
      if (input[i] === activeWord[i]) {
        letters[i].classList.add("correct");
        letters[i].classList.remove("incorrect");
      } else {
        letters[i].classList.add("incorrect");
        letters[i].classList.remove("correct");
        hasErrors = true;

        // Play error sound and shake the word element
        errorSound.play();
        wordElement.classList.add("shake");
        setTimeout(() => wordElement.classList.remove("shake"), 500);
      }
    } else {
      letters[i].classList.remove("correct", "incorrect");
    }
  }

  if (input === activeWord) {
    clearInterval(gameInterval);
    gameScreen.removeChild(wordElement);

    correctSound.play();

    if (hasErrors) {
      score += 3;
    } else {
      score += 5;
    }

    if (wordSpeed < maxWordSpeed) {
      wordSpeed += 0.5;
    }

    newWord();
  }
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameInterval = null;
  timerInterval = null;

  // Stop background music
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  gameOverSound.play();

  gameScreen.style.display = "none";
  gameOverScreen.style.display = "block";
  finalScoreElement.textContent = score;
}

function resetGame() {
  gameOverScreen.style.display = "none";
  welcomeScreen.style.display = "block";

  inputField.value = "";
  wordSpeed = 2;

  if (wordElement && wordElement.parentNode) {
    gameScreen.removeChild(wordElement);
  }
  wordElement = null;

  clearInterval(gameInterval);
  clearInterval(timerInterval);

  gameInterval = null;
  timerInterval = null;
}

inputField.addEventListener("input", checkInput);

window.addEventListener("load", () => {
  inputField.focus();
  setFocusOnInput();
});
