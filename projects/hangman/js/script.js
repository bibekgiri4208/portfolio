const letterContainer = document.getElementById("letter-container");
const optionsContainer = document.getElementById("options-container");
const userInputSection = document.getElementById("user-input-section");
const newGameContainer = document.getElementById("new-game-container");
const newGameButton = document.getElementById("new-game-button");
const canvas = document.getElementById("canvas");
const resultText = document.getElementById("result-text");
const leaderboardContainer = document.getElementById("leaderboard-container");
const leaderboard = document.getElementById("leaderboard").querySelector("tbody");

let options = {
  fruits: ["Redcherry", "Blueberry", "Mandarin", "Pineapple",
          "Pomegranate", "Watermelon","Avocado","Kiwi",
          "Grapes"],
  animals: ["Tiger", "Elephant", "Squirrel", "Panther", "Redpanda", "Zebra",
          "Leopard", "Polarbear", "Seahorse", "Donkey", "Vulture", "Rhinoceros",
           "Chameleon", "Porcupine","Jellyfish", "Racoon"],
  countries: ["Nepal", "Hungary", "Scotland", "Switzerland", "Zimbabwe", "Kazakastan", "Argentina", "Portugal",
            "Algeria", "Belgium", "Costarica", "Senegal", "Guyana", "Uruguay", "Venezuela", "Liberia",
            "Oman"]
};

let winCount = 0;
let count = 0;
let chosenWord = "";

let leaderboardData = [];
const displayOptions = () => {
  optionsContainer.innerHTML += `<h2>Select An Option</h2>`;
  let buttonCon = document.createElement("div");
  for (let value in options) {
    buttonCon.innerHTML += `<button class="options" onclick="generateWord('${value}')">${value}</button>`;
  }
  optionsContainer.appendChild(buttonCon);
};

const blocker = () => {
  let optionsButtons = document.querySelectorAll(".options");
  let letterButtons = document.querySelectorAll(".letters");
  
  optionsButtons.forEach((button) => {
    button.disabled = true;
  });
 
  letterButtons.forEach((button) => {
    button.disabled = true;
  });
  newGameContainer.classList.remove("hide");
};

const generateWord = (optionValue) => {
  let optionsButtons = document.querySelectorAll(".options");
  optionsButtons.forEach((button) => {
    if (button.innerText.toLowerCase() === optionValue) {
      button.classList.add("active");
    }
    button.disabled = true;
  });

  letterContainer.classList.remove("hide");
  userInputSection.innerText = "";

  let optionArray = options[optionValue]; 
  chosenWord = optionArray[Math.floor(Math.random() * optionArray.length)];
  chosenWord = chosenWord.toUpperCase();
  let displayItem = chosenWord.replace(/./g, '<span class="dashes">_</span>'); 
  userInputSection.innerHTML = displayItem;
};

const initializer = () => {
  winCount = 0;
  count = 0; 
  userInputSection.innerHTML = "";
  optionsContainer.innerHTML = "";
  letterContainer.classList.add("hide");
  newGameContainer.classList.add("hide");
  letterContainer.innerHTML = "";

  for (let i = 65; i < 91; i++) {
    let button = document.createElement("button");
    button.classList.add("letters");
    button.innerText = String.fromCharCode(i);
    button.addEventListener("click", () => {
      let charArray = chosenWord.split("");
      let dashes = document.getElementsByClassName("dashes");
      if (charArray.includes(button.innerText)) {
        charArray.forEach((char, index) => {
          if (char === button.innerText) {
            dashes[index].innerText = char;
            winCount += 1;
            if (winCount == charArray.length) {
              resultText.innerHTML = `<h2 class='win-msg'>You Win!!</h2><p>The word was <span><strong>${chosenWord}
              </strong></span></p><img src="win.gif" alt="Winning GIF" style="max-width: 100%; height: auto;" />`;
              blocker();
              updateLeaderboard(true);
            }
          }
        });
        button.style.backgroundColor = "#39d78d"; 
      } else {
        count += 1;
        drawMan(count);
        if (count == 6) {
          resultText.innerHTML = `<h2 class='lose-msg'>You Lose!!</h2><p>The word was <span><strong>${chosenWord}
          </strong></span></p><img src="lose.gif" alt="Losing GIF" style="max-width: 100%; height: auto;" />`;
          blocker();
          updateLeaderboard(false);
        }
        button.style.backgroundColor = "#fe5152"; 
      }
      button.disabled = true;
    });
    letterContainer.append(button);
  }
  displayOptions();
  let { initialDrawing } = canvasCreator();
  initialDrawing();
};

const canvasCreator = () => {
  let context = canvas.getContext("2d");
  context.beginPath();
  context.strokeStyle = "#000";
  context.lineWidth = 2;
  const drawLine = (fromX, fromY, toX, toY) => {
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  };
  const head = () => {
    context.beginPath();
    context.arc(70, 30, 10, 0, Math.PI * 2, true);
    context.stroke();
  };
  const body = () => {
    drawLine(70, 40, 70, 80);
  };
  const leftArm = () => {
    drawLine(70, 50, 50, 70);
  };
  const rightArm = () => {
    drawLine(70, 50, 90, 70);
  };
  const leftLeg = () => {
    drawLine(70, 80, 50, 110);
  };
  const rightLeg = () => {
    drawLine(70, 80, 90, 110);
  };
  const initialDrawing = () => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    drawLine(10, 130, 130, 130);
    drawLine(10, 10, 10, 131);
    drawLine(10, 10, 70, 10);
    drawLine(70, 10, 70, 20);
  };
  return { initialDrawing, head, body, leftArm, rightArm, leftLeg, rightLeg };
};

const drawMan = (count) => {
  let { head, body, leftArm, rightArm, leftLeg, rightLeg } = canvasCreator();
  switch (count) {
    case 1:
      head();
      break;
    case 2:
      body();
      break;
    case 3:
      leftArm();
      break;
    case 4:
      rightArm();
      break;
    case 5:
      leftLeg();
      break;
    case 6:
      rightLeg();
      break;
    default:
      break;
  }
};

newGameButton.addEventListener("click", initializer);
window.onload = initializer;


const updateLeaderboard = (won) => {
  const name = prompt("Enter your name for the leaderboard: ");
  if (name) {
    const result = won ? "Won" : "Lost";
    const leaderboardData = JSON.parse(localStorage.getItem("hm_leaderboard")) || [];
    leaderboardData.push({ name, result });
    localStorage.setItem("hm_leaderboard", JSON.stringify(leaderboardData));
    renderLeaderboard();
  }
};

const renderLeaderboard = () => {
  const leaderboardData = JSON.parse(localStorage.getItem("hm_leaderboard")) || [];
  leaderboard.innerHTML = leaderboardData
    .map((entry, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${entry.name}</td>
        <td>${entry.result}</td>
      </tr>
    `).join("");
};


// Audio 
const audioControlButton = document.getElementById("audio-control");
const backgroundAudio = document.getElementById("background-audio");
let isAudioPlaying = false;

audioControlButton.addEventListener("click", () => {
  if (isAudioPlaying) {
    backgroundAudio.pause();
    audioControlButton.innerHTML = '<i class="fa fa-volume-mute"></i>';
  } else {
    backgroundAudio.play();
    audioControlButton.innerHTML = '<i class="fa fa-volume-up"></i>';
  }
  isAudioPlaying = !isAudioPlaying;
});
