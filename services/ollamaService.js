// // services/ollamaService.js
// import { Platform } from "react-native";

// // === CONFIGURATION ===
// const PC_IP = "172.23.1.23"; // IP de ton PC sur le réseau Wi-Fi

// const getBaseUrl = () => {
//   if (Platform.OS === "android" && __DEV__) return "http://10.0.2.2:11434"; // émulateur Android
//   if (Platform.OS === "ios" && __DEV__) return "http://localhost:11434";   // simulateur iOS
//   return `http://${PC_IP}:11434`; // appareil physique iOS/Android ou Web
// };

// const BASE_URL = getBaseUrl();

// // === MOCK RECIPES ===
// const MOCK_RECIPES = [
//   { title: "Mock Recipe 1", description: "Delicious mock recipe 1" },
//   { title: "Mock Recipe 2", description: "Delicious mock recipe 2" },
//   { title: "Mock Recipe 3", description: "Delicious mock recipe 3" },
// ];

// // === FETCH AVEC TIMEOUT ===
// async function fetchWithTimeout(url, options = {}, timeout = 15000) {
//   return Promise.race([
//     fetch(url, options),
//     new Promise((_, reject) =>
//       setTimeout(() => reject(new Error("Ollama ne répond pas (timeout)")), timeout)
//     ),
//   ]);
// }

// // === CHAT ===
// export async function chat(message, model = "llama2") {
//   const url = `${BASE_URL}/api/generate`;
//   const body = { model, prompt: message, stream: false };

//   try {
//     const res = await fetchWithTimeout(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(`Ollama HTTP ${res.status}: ${text}`);
//     }

//     const data = await res.json();
//     return data.response || "Pas de réponse";
//   } catch (err) {
//     console.warn("Ollama indisponible:", err.message);

//     const isLocal = BASE_URL.includes("172.23.1") || BASE_URL.includes("localhost");
//     let hint = isLocal
//       ? Platform.OS === "ios"
//         ? "Installe l’app Ollama depuis l’App Store et lance un modèle."
//         : "Assure-toi que Ollama est lancé sur cet appareil."
//       : "Vérifie que le serveur Ollama est accessible.";

//     return `Erreur de connexion à Ollama.\n${hint}\nDétail: ${err.message}`;
//   }
// }

// // === GENERATE RECIPES ===
// export async function generateFromOllama({
//   model = "llama2",
//   prompt = "",
//   max_tokens = 512,
//   temperature = 0.7,
// } = {}) {
//   const url = `${BASE_URL}/api/generate`;

//   try {
//     const res = await fetchWithTimeout(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ model, prompt, max_tokens, temperature, stream: false }),
//     });

//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const data = await res.json();
//     return data.response || MOCK_RECIPES;
//   } catch (err) {
//     console.warn("Ollama indisponible:", err.message);
//     return MOCK_RECIPES;
//   }
// }


// services/ollamaService.js  // Pour tester sur PC 

import { Platform } from "react-native";

// Pour tester sur PC local
const BASE_URL = "http://127.0.0.1:11434"; // Ollama sur ton PC

const MOCK_RECIPES = [
  { title: "Mock Recipe 1", description: "Delicious mock recipe 1" },
  { title: "Mock Recipe 2", description: "Delicious mock recipe 2" },
  { title: "Mock Recipe 3", description: "Delicious mock recipe 3" },
];

async function fetchWithTimeout(url, options = {}, timeout = 120000) { // 2 minutes
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Ollama ne répond pas (timeout)")), timeout)
    ),
  ]);
}

export async function chat(message, model = "llama2") {
  const url = `${BASE_URL}/api/generate`;
  const body = { model, prompt: message, stream: false };

  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.response || "Pas de réponse";
  } catch (err) {
    console.warn("Ollama indisponible:", err.message);
    return `Erreur de connexion à Ollama.\nAssure-toi que Ollama est lancé sur cet appareil.\nDétail: ${err.message}`;
  }
}

export async function generateFromOllama({
  model = "llama2",
  prompt = "",
  max_tokens = 512,
  temperature = 0.7,
} = {}) {
  const url = `${BASE_URL}/api/generate`;

  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, max_tokens, temperature, stream: false }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data.response || MOCK_RECIPES;
  } catch (err) {
    console.warn("Ollama indisponible:", err.message);
    return MOCK_RECIPES;
  }
}
