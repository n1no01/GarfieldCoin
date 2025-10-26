import {garfieldCoin_backend, createActor, canisterId  } from "../../declarations/garfieldCoin_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

let actor;

document.getElementById("garfield-laying").addEventListener("click", async () => {
  await handleLogin("https://id.ai/");
});

 async function handleLogin(identityProvider) {
    const authClient = await AuthClient.create();
    authClient.login({
      identityProvider,
      onSuccess: async () => {
        const identity = await authClient.getIdentity();
        const principalId = identity.getPrincipal().toText();
        localStorage.setItem("principalId", principalId);
        const agent = new HttpAgent({ identity });
        actor = createActor(canisterId, { agent });
        window.location.href = "landing.html";
      },
      onError: (err) => alert("Login failed. See console for details."),
    });
}