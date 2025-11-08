import { Platform } from "react-native";

const DEFAULT_BASE = Platform.OS === "android" ? "http://10.0.2.2:11434" : "http://localhost:11434";

export async function generateFromOllama({ model = "orca-mini", prompt = "", max_tokens = 512, temperature = 0.2 } = {}) {
  const url = `${DEFAULT_BASE}/api/generate`;
  const body = { model, prompt, max_tokens, temperature, stream: false };

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Failed to fetch from Ollama: ${err.message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama API error ${res.status}: ${text}`);
  }

  const data = await res.json().catch(() => ({}));

  if (data && data.output && Array.isArray(data.output) && data.output.length > 0) {
    const first = data.output[0];
    if (first && typeof first === "object" && "content" in first) return first.content;
  }

  return JSON.stringify(data);
}
