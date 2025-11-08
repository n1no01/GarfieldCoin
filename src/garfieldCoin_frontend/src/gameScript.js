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

// === Preload All Images for Instant Rendering ===
const allImages = [lasagne, pizza, hotdog, fries, burger, cake, bomb];
allImages.forEach(src => {
  const img = new Image();
  img.src = src;
});

// === Auth & Principal Check ===
const principalId = localStorage.getItem("principalId");
const username = localStorage.getItem("username");
const wallet = localStorage.getItem("wallet");

let actor;

if (!principalId || !username) {
  alert("You must sign in first!");
  window.location.href = "index.html";
}

async function initActor() {
  const authClient = await AuthClient.create();
  const identity = await authClient.getIdentity();

  const agent = new HttpAgent({ identity });
  if (process.env.DFX_NETWORK !== "ic") {
    await agent.fetchRootKey();
  }

  actor = createActor(canisterId, { agent });
}

// === DOM Loaded ===
document.addEventListener("DOMContentLoaded", () => {
  const principalId = localStorage.getItem("principalId");
  if (!principalId) {
    alert("You must sign in first!");
    window.location.href = "index.html";
    return;
  }
});

// === Disable Right-Click & Dev Tools ===
document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener('keydown', e => {
  if (e.key === "F12" || 
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
      (e.ctrlKey && e.key === "U")) {
    e.preventDefault();
  }
});

// === Game Elements ===
const gameContainer = document.getElementById('game-container');
const garfield = document.getElementById('garfield');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const gameOverElement = document.getElementById('game-over');

let score = 0;
let garfieldPosition = gameContainer.offsetWidth / 2;
const garfieldSpeed = 50;
let timeLeft = 60;
let gameActive = true;

// Detect mobile device
const isMobile = window.innerWidth <= 600;

// Adjust game difficulty dynamically
const foodFallSpeed = isMobile ? 24 : 18;
const foodSpawnInterval = isMobile ? 550 : 400;
const foodMoveInterval = isMobile ? 30 : 40;

// === Desktop Controls ===
document.addEventListener('keydown', (e) => {
  if (!gameActive) return;
  if (e.key === 'ArrowLeft') {
    garfieldPosition -= garfieldSpeed;
    if (garfieldPosition < 0) garfieldPosition = 0;
  } else if (e.key === 'ArrowRight') {
    garfieldPosition += garfieldSpeed;
    if (garfieldPosition > gameContainer.offsetWidth - garfield.offsetWidth) {
      garfieldPosition = gameContainer.offsetWidth - 30;
    }
  }
  garfield.style.left = `${garfieldPosition}px`;
});

// === Mobile Touch Controls ===
let touchStartX = 0;
let garfieldStartX = 0;

gameContainer.addEventListener('touchstart', (e) => {
  if (!gameActive) return;
  touchStartX = e.touches[0].clientX;
  garfieldStartX = garfieldPosition;
});

gameContainer.addEventListener('touchmove', (e) => {
  if (!gameActive) return;
  const touchCurrentX = e.touches[0].clientX;
  const touchDeltaX = touchCurrentX - touchStartX;

  garfieldPosition = garfieldStartX + touchDeltaX;
  const containerWidth = gameContainer.offsetWidth;
  const garfieldWidth = garfield.offsetWidth;

  if (garfieldPosition < 0) garfieldPosition = 0;
  if (garfieldPosition > containerWidth - garfieldWidth) {
    garfieldPosition = containerWidth - 20;
  }

  garfield.style.left = `${garfieldPosition}px`;
});

// === Food & Bomb Images ===
const foodImages = [lasagne, pizza, hotdog, fries, burger, cake];
const bombImage = bomb;

// === Create Food/Bomb Item (FIXED: Spawns from top reliably) ===
function createItem() {
  const item = document.createElement('div');
  item.classList.add('food');
  item.style.position = 'absolute';
  item.style.left = `${Math.random() * (gameContainer.offsetWidth - 40)}px`;

  const isBomb = Math.random() < 0.2;
  const imgSrc = isBomb ? bombImage : foodImages[Math.floor(Math.random() * foodImages.length)];

  const img = new Image();
  img.src = imgSrc;

  img.onload = () => {
    item.style.backgroundImage = `url('${imgSrc}')`;
    item.dataset.type = isBomb ? 'bomb' : 'food';
    gameContainer.appendChild(item);

    const itemHeight = item.offsetHeight || 60;
    item.style.top = `${-itemHeight}px`;

    // Start falling
    const moveInterval = setInterval(() => {
      if (!moveItem(item)) {
        clearInterval(moveInterval);
      }
    }, foodMoveInterval);
  };

  img.onerror = () => {
    // Fallback if image fails to load
    item.style.backgroundImage = `url('${imgSrc}')`;
    item.dataset.type = isBomb ? 'bomb' : 'food';
    gameContainer.appendChild(item);
    item.style.top = `-60px`;

    const moveInterval = setInterval(() => {
      if (!moveItem(item)) {
        clearInterval(moveInterval);
      }
    }, foodMoveInterval);
  };
}

// === Move Item & Check Collision ===
function moveItem(item) {
  if (!gameActive) {
    item.remove();
    return false;
  }

  let itemTop = parseInt(item.style.top);
  itemTop += foodFallSpeed;
  item.style.top = `${itemTop}px`;

  const itemRect = item.getBoundingClientRect();
  const garfieldRect = garfield.getBoundingClientRect();

  // Collision detection
  if (
    itemRect.bottom >= garfieldRect.top &&
    itemRect.left < garfieldRect.right &&
    itemRect.right > garfieldRect.left
  ) {
    if (item.dataset.type === 'bomb') {
      score -= 5;
      if (score < 0) score = 0;
    } else {
      score++;
    }
    scoreElement.textContent = `Score: ${score}`;
    item.remove();
    return false;
  }

  // Out of bounds
  if (itemTop > gameContainer.offsetHeight) {
    item.remove();
    return false;
  }
  return true;
}

// === Spawn Items ===
const itemInterval = setInterval(() => {
  if (gameActive) {
    createItem();
  }
}, foodSpawnInterval);

// === Game Timer & Game Over ===
const timerInterval = setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
    timerElement.textContent = `Time: ${timeLeft}`;
  } else {
    clearInterval(timerInterval);
    clearInterval(itemInterval);
    gameActive = false;
    gameOverElement.style.display = 'block';
    gameOverElement.innerHTML = `Game Over! Final Score: ${score}<br><br>Submitting your score...`;

    submitScore(score).then(() => {
      let redirectCountdown = 3;
      gameOverElement.innerHTML = `
        Game Over! Final Score: ${score}<br>
        Redirecting to landing page in <span id="redirect-timer">${redirectCountdown}</span> seconds...
      `;

      const redirectInterval = setInterval(() => {
        redirectCountdown--;
        const timerSpan = document.getElementById("redirect-timer");
        if (timerSpan) timerSpan.textContent = redirectCountdown;
        if (redirectCountdown <= 0) {
          clearInterval(redirectInterval);
          window.location.href = "landing.html";
        }
      }, 1000);
    }).catch(() => {
      // Even if submit fails, redirect
      setTimeout(() => window.location.href = "landing.html", 3000);
    });
  }
}, 1000);

// === Submit Score to Backend ===
async function submitScore(score) {
  if (!actor) await initActor();

  try {
    await actor.submitScore(score);
    console.log(`Score of ${score} submitted for ${username}`);
  } catch (err) {
    console.error("Failed to submit score:", err);
    throw err;
  }
}