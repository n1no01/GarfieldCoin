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

document.addEventListener("DOMContentLoaded", () => {
  const principalId = localStorage.getItem("principalId");
  if (!principalId) {
    alert("You must sign in first!");
    window.location.href = "index.html";
    return;
  }});

document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

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

    // Determine if the device is mobile
    const isMobile = window.innerWidth <= 600;

    // Set game difficulty based on device type
    const foodFallSpeed = isMobile ? 15 : 12; // Faster on mobile
    const foodSpawnInterval = isMobile ? 500 : 700; // More frequent on mobile
    const foodMoveInterval = isMobile ? 30 : 50; // Faster movement updates on mobile

    // Keyboard control (for desktop)
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

    // Mobile touch controls
    let touchStartX = 0;
    let garfieldStartX = 0;

    gameContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      garfieldStartX = garfieldPosition;
    });

    gameContainer.addEventListener('touchmove', (e) => {
      const touchCurrentX = e.touches[0].clientX;
      const touchDeltaX = touchCurrentX - touchStartX;

      garfieldPosition = garfieldStartX + touchDeltaX;

      const containerWidth = gameContainer.offsetWidth;
      const garfieldWidth = garfield.offsetWidth;

      if (garfieldPosition < 0) garfieldPosition = 0;
      if (garfieldPosition > gameContainer.offsetWidth - garfield.offsetWidth) {
        garfieldPosition = gameContainer.offsetWidth - 20;
      }

      garfield.style.left = `${garfieldPosition}px`;
    });

 const foodImages = [
  lasagne,
  pizza,
  hotdog,
  fries,
  burger,
  cake
];

    const bombImage = bomb;

    function createItem() {
      const item = document.createElement('div');
      item.classList.add('food');
      item.style.left = `${Math.random() * (gameContainer.offsetWidth - 40)}px`;
      item.style.top = '0px';

      if (Math.random() < 0.2) { // 20% chance to spawn a bomb
        item.style.backgroundImage = `url('${bombImage}')`;
        item.dataset.type = 'bomb';
      } else {
        const randomFoodImage = foodImages[Math.floor(Math.random() * foodImages.length)];
        item.style.backgroundImage = `url('${randomFoodImage}')`;
        item.dataset.type = 'food';
      }

      gameContainer.appendChild(item);
      return item;
    }

    function moveItem(item) {
      if (!gameActive) {
        item.remove();
        return false;
      }

      let itemTop = parseInt(item.style.top);
      itemTop += foodFallSpeed; // Adjusted speed based on device
      item.style.top = `${itemTop}px`;

      const itemRect = item.getBoundingClientRect();
      const garfieldRect = garfield.getBoundingClientRect();
      if (
        itemRect.bottom >= garfieldRect.top &&
        itemRect.left < garfieldRect.right &&
        itemRect.right > garfieldRect.left
      ) {
        if (item.dataset.type === 'bomb') {
          score -= 5;
          if (score < 0) score = 0; // Prevent negative score
        } else {
          score++;
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

    const itemInterval = setInterval(() => {
      if (!gameActive) return;
      const item = createItem();
      const itemMovement = setInterval(() => {
        if (!moveItem(item)) {
          clearInterval(itemMovement);
        }
      }, foodMoveInterval); // Adjusted interval based on device
    }, foodSpawnInterval); // Adjusted spawn interval based on device

    const timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;
      } else {
        clearInterval(timerInterval);
        clearInterval(itemInterval);
        gameActive = false;
        gameOverElement.style.display = 'block';
        gameOverElement.textContent = `Game Over! Final Score: ${score}`;
        submitScore(score);
        
      }
    }, 1000);

    async function submitScore(score) {
    if (!actor) await initActor();

    try {
        await actor.submitScore(score);
        console.log(`Score of ${score} submitted for ${username}`);
    } catch (err) {
        console.error("Failed to submit score:", err);
    }
}