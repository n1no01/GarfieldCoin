document.addEventListener("DOMContentLoaded", () => {
  const principalId = localStorage.getItem("principalId");

  // ✅ Redirect if user isn't logged in
  if (!principalId) {
    alert("You must sign in first!");
    window.location.href = "index.html";
    return;
  }

  const username = localStorage.getItem("username");
  const wallet = localStorage.getItem("wallet");

  if (!username || !wallet) {
    // Show the popup
    document.getElementById("account-popup").style.display = "flex";
  }
});

// 🎮 Play button logic
document.getElementById('play-btn').addEventListener('click', () => {
  window.location.href = "garfieldGame.html";
});

// 🚪 Logout button logic
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("principalId"); 
  window.location.href = "index.html";
});

// Handle form submission
document.getElementById("account-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const wallet = document.getElementById("wallet").value.trim();

  if (username && wallet) {
    localStorage.setItem("username", username);
    localStorage.setItem("wallet", wallet);

    alert("Account created successfully!");
    document.getElementById("account-popup").style.display = "none";
  } else {
    alert("Please fill in all fields.");
  }
});
