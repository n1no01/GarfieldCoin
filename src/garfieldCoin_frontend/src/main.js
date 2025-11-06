import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor, canisterId } from "../../declarations/garfieldCoin_backend";

let authClient, actor, principalText;
const canonicalOrigin = "https://jnyc6-7yaaa-aaaak-qunkq-cai.icp0.io";

document.getElementById("garfield-laying").addEventListener("click", async () => {
    authClient = await AuthClient.create();
    authClient.login({
        identityProvider: "https://id.ai/", 
        derivationOrigin: canonicalOrigin,
            //: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`,

        // identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`, //"https://id.ai/",
        onSuccess: async () => {
            const identity = await authClient.getIdentity();
            principalText = identity.getPrincipal().toText();
            localStorage.setItem("principalId", principalText);

            const agent = new HttpAgent({ identity });
            if (process.env.DFX_NETWORK !== 'ic') {
              await agent.fetchRootKey();
            }
            actor = createActor(canisterId, { agent });
            // alert(principalText);

            // ✅ Check if user is already registered
            const existingUser = await actor.userExists(principalText);

            if (!existingUser) {
                // Show a form popup to collect username + wallet
                const formContainer = document.createElement("div");
                formContainer.innerHTML = `
                  <div id="account-popup" style="display:flex;">
                    <form id="account-form" style="background:#fff;padding:20px;border-radius:12px;">
                      <h2>Register to play</h2>
                      <input type="text" id="username" placeholder="Enter your username" required style="display:block;margin:10px 0;padding:8px;width:100%;">
                      <input type="text" id="wallet" placeholder="Enter your $GFC wallet address" required style="display:block;margin:10px 0;padding:8px;width:100%;">
                      <button type="submit">Submit</button>
                    </form>
                  </div>
                `;
                document.body.appendChild(formContainer);

                // Form submission
                document.getElementById("account-form").addEventListener("submit", async (e) => {
                    e.preventDefault();

                    const username = document.getElementById("username").value.trim();
                    const wallet = document.getElementById("wallet").value.trim();

                    const isAvailable = await checkUsername(username);

                    if(username.length < 3 || username.length > 20) {
                        alert("Username must be between 3 and 20 characters.");
                        return;
                    }

                     if (!username || !wallet) {
                        alert("Please fill in all fields.");
                        return;
                    }
  
                    if (isAvailable) {
                        try {
                        const walletAddress = document.getElementById("wallet").value;
                        await actor.registerUser(username, wallet);
                        alert("Account created successfully!");

                        // Store locally
                        localStorage.setItem("username", username);
                        localStorage.setItem("wallet", wallet);

                        // Remove the popup
                        formContainer.remove();

                        // Redirect to landing page
                        window.location.href = "landing.html";
                        } catch (err) {
                            console.error(err);
                            alert("Failed to create account. Try again.");
                        }
                    }
                });
            } else {
                // User already exists → store locally
                localStorage.setItem("username", existingUser.username);
                localStorage.setItem("wallet", existingUser.wallet);

                // Redirect directly to landing page
                window.location.href = "/landing.html";
            }
        },
        onError: (err) => {
            console.error(err);
            alert("Login failed.");
        }
    });

    async function checkUsername(username) {
    try {
    const exists = await actor.usernameExists(username);
    
    if (exists) {
      alert("Username already taken. Please choose another.");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to check username:", error);
    return false;
  }
}
});
