import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor, canisterId } from "../../declarations/garfieldCoin_backend";
import lasagne from '../assets/imagesGame/lasagne.png';
import pizza from '../assets/imagesGame/pizza.png';
import hotdog from '../assets/imagesGame/hotdog.png';
import fries from '../assets/imagesGame/fries.png';
import burger from '../assets/imagesGame/burger.png';
import cake from '../assets/imagesGame/cake.png';
import bomb from '../assets/imagesGame/bomb.png';

// === Preload Images and Sound Effects ===
const allImages = [lasagne, pizza, hotdog, fries, burger, cake, bomb];
allImages.forEach(src => {
  const img = new Image();
  img.src = src;
});

const explosion = new Audio('../soundsGame/explosion.mp3');
const collect = new Audio('../soundsGame/collect.mp3');
explosion.volume = 0.1;
collect.volume = 0.1;

// === Auth ===
const principalId = localStorage.getItem("principalId");
const username = localStorage.getItem("username");

let actor;

if (!principalId || !username) {
  alert("You must sign in first!");
  window.location.href = "index.html";
}

async function initActor() {
  const authClient = await AuthClient.create();
  const isAuthenticated = await authClient.isAuthenticated();
  if (!isAuthenticated) {
    alert("Session expired. Please log in again.");
    window.location.href = "index.html";
    return;
  }
  const identity = await authClient.getIdentity();
  if (identity.getPrincipal().isAnonymous()) {
    alert("Invalid session. Please log in again.");
    window.location.href = "index.html";
    return;
  }

  const agent = new HttpAgent({ identity });
  if (process.env.DFX_NETWORK !== "ic") {
    await agent.fetchRootKey();
  }

  actor = createActor(canisterId, { agent });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("principalId")) {
    alert("You must sign in first!");
    window.location.href = "index.html";
  }
});

// Disable right-click & dev-tools
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", e => {
  if (e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
      (e.ctrlKey && e.key === "U")) {
    e.preventDefault();
  }
});

// === Game Elements ===
const gameContainer = document.getElementById("game-container");
const garfield = document.getElementById("garfield");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const gameOverElement = document.getElementById("game-over");

let score = 0;
let timeLeft = 60;
let gameActive = true;

// Detect mobile
const isMobile = window.innerWidth <= 600;

// === Balance Adjustments ===
const TARGET_BOMB_RATIO = isMobile ? 0.2 : 0.15;
const bombPenalty = isMobile ? 5 : 3;
const foodSpawnInterval = isMobile ? 150 : 100; // instead of 400/300
const foodMoveInterval = isMobile ? 30 : 40;
const garfieldSpeed = isMobile ? 50 : 70;
const foodFallSpeed = isMobile ? 24 : 18;

let garfieldPosition = gameContainer.offsetWidth / 2;

// Desktop movement
document.addEventListener("keydown", e => {
  if (!gameActive) return;
  if (e.key === "ArrowLeft") garfieldPosition -= garfieldSpeed;
  if (e.key === "ArrowRight") garfieldPosition += garfieldSpeed;
  if (garfieldPosition < 0) garfieldPosition = 0;
  if (garfieldPosition > gameContainer.offsetWidth - garfield.offsetWidth) {
    garfieldPosition = gameContainer.offsetWidth - garfield.offsetWidth;
  }
  garfield.style.left = `${garfieldPosition}px`;
});

// Mobile movement
let touchStartX = 0;
let garfieldStartX = 0;
gameContainer.addEventListener("touchstart", e => {
  if (!gameActive) return;
  touchStartX = e.touches[0].clientX;
  garfieldStartX = garfieldPosition;
});
gameContainer.addEventListener("touchmove", e => {
  if (!gameActive) return;
  const deltaX = e.touches[0].clientX - touchStartX;
  garfieldPosition = garfieldStartX + deltaX;
  if (garfieldPosition < 0) garfieldPosition = 0;
  if (garfieldPosition > gameContainer.offsetWidth - garfield.offsetWidth) {
    garfieldPosition = gameContainer.offsetWidth - garfield.offsetWidth;
  }
  garfield.style.left = `${garfieldPosition}px`;
});

// Images
const foodImages = [lasagne, pizza, hotdog, fries, burger, cake];
const bombImage = bomb;

// === Balanced Spawn ===
let totalSpawned = 0;
let totalBombs = 0;

function createItem() {
  totalSpawned++;
  const expectedBombs = Math.floor(totalSpawned * TARGET_BOMB_RATIO);
  let isBomb;
  if (totalBombs < expectedBombs) isBomb = true, totalBombs++;
  else if (totalBombs > expectedBombs) isBomb = false;
  else isBomb = Math.random() < TARGET_BOMB_RATIO ? (totalBombs++, true) : false;
  spawnItem(isBomb);
}

// === Spawn Item with original image load logic
function spawnItem(isBomb) {
  const item = document.createElement("div");
  item.classList.add("food");
  item.dataset.type = isBomb ? "bomb" : "food";
  const imgSrc = isBomb ? bombImage : foodImages[Math.floor(Math.random() * foodImages.length)];

  const img = new Image();
  img.src = imgSrc;

  img.onload = () => {
    item.style.backgroundImage = `url('${imgSrc}')`;
    gameContainer.appendChild(item);

    // Always spawn above screen
    item.style.top = "-120px";
    item.style.left = `${Math.random() * (gameContainer.offsetWidth - item.offsetWidth)}px`;

    const moveInterval = setInterval(() => {
      if (!moveItem(item)) clearInterval(moveInterval);
    }, foodMoveInterval);
  };

  img.onerror = () => {
    item.style.backgroundImage = `url('${imgSrc}')`;
    gameContainer.appendChild(item);
    item.style.top = "-120px";
    item.style.left = `${Math.random() * (gameContainer.offsetWidth - item.offsetWidth)}px`;
    const moveInterval = setInterval(() => {
      if (!moveItem(item)) clearInterval(moveInterval);
    }, foodMoveInterval);
  };
}

function moveItem(item) {
  if (!gameActive) return item.remove(), false;
  let itemTop = parseInt(item.style.top);
  itemTop += foodFallSpeed;
  item.style.top = `${itemTop}px`;

  const itemRect = item.getBoundingClientRect();
  const garfieldRect = garfield.getBoundingClientRect();

  if (itemRect.bottom >= garfieldRect.top &&
      itemRect.left < garfieldRect.right &&
      itemRect.right > garfieldRect.left) {
    if (item.dataset.type === "bomb") {
      score -= bombPenalty;
      explosion.currentTime = 0;
      explosion.play();
      if (score < 0) score = 0;
    } 
    else {
      score++;
      collect.currentTime = 0;
      collect.play();
    }
    scoreElement.textContent = `Score: ${score}`;
    item.remove();
    return false;
  }

  if (itemTop > gameContainer.offsetHeight) {
    item.remove();
    return false;
  }

  return true;
}

// Spawn loop
const itemInterval = setInterval(() => {
  if (gameActive) createItem();
}, foodSpawnInterval);

// Timer
const timerInterval = setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
    timerElement.textContent = `Time: ${timeLeft}`;
  } else {
    gameActive = false;
    clearInterval(timerInterval);
    clearInterval(itemInterval);

    gameOverElement.style.display = "block";
    gameOverElement.innerHTML = `Game Over! Final Score: ${score}<br><br>Submitting...`;

    submitScore(score).then(() => {
      let r = 3;
      gameOverElement.innerHTML = `Game Over! Final Score: ${score}<br>Redirecting in <span id="redirect-timer">${r}</span>...`;

      const rInterval = setInterval(() => {
        r--;
        document.getElementById("redirect-timer").textContent = r;
        if (r <= 0) {
          clearInterval(rInterval);
          window.location.href = "landing.html";
        }
      }, 1000);
    }).catch(() => {
      setTimeout(() => window.location.href = "landing.html", 3000);
    });
  }
}, 1000);

// Submit score
async function submitScore(score) {
  if (!actor) await initActor();
  try { await actor.submitScore(score); }
  catch(err) { console.error("Score submit failed:", err); throw err; }
}
