import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor, canisterId } from "../../declarations/garfieldCoin_backend";

let authClient, actor, principalText;

document.getElementById("garfield-laying").addEventListener("click", async () => {
    authClient = await AuthClient.create();
    authClient.login({
        identityProvider: process.env.DFX_NETWORK === "ic" 
            ? "https://id.ai/" 
            : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`,

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
            alert(principalText);

            // ✅ Check if user is already registered
            const existingUser = await actor.userExists(principalText);

            if (!existingUser) {
                // Show a form popup to collect username + wallet
                const formContainer = document.createElement("div");
                formContainer.innerHTML = `
                  <div id="account-popup" style="display:flex;">
                    <form id="account-form" style="background:#fff;padding:20px;border-radius:12px;">
                      <h2>Create your account</h2>
                      <input type="text" id="username" placeholder="Username" required style="display:block;margin:10px 0;padding:8px;width:100%;">
                      <input type="text" id="wallet" placeholder="Wallet Address" required style="display:block;margin:10px 0;padding:8px;width:100%;">
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

                    if (!username || !wallet) {
                        alert("Please fill in all fields.");
                        return;
                    }

                    try {
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
});
