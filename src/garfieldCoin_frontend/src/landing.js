import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor, canisterId } from "../../declarations/garfieldCoin_backend";

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

    const agent = new HttpAgent({ 
        identity,
        host: process.env.DFX_NETWORK === "ic" 
            ? "https://ic0.app" 
            : "http://127.0.0.1:4943"
    });
    
    if (process.env.DFX_NETWORK !== "ic") {
        await agent.fetchRootKey();
    }

    actor = createActor(canisterId, { agent });
}

document.getElementById("play-btn").addEventListener("click", () => {
    window.location.href = "garfieldGame.html";
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

async function fetchAndDisplayLeaderboard() {
    // Initialize actor first if not already initialized
    if (!actor) {
        await initActor();
    }
    
    try {
        const leaderboardData = await actor.getLeaderboard();
        
        const tableBody = document.querySelector('table tbody');
        
        tableBody.innerHTML = '';
        
        // Populate the table with real data
        leaderboardData.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.username}</td>
                <td>${entry.score}</td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
    }
}

// Call when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayLeaderboard();
});