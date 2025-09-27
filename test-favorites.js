import fetch from "node-fetch"; // tu dois installer node-fetch

const data = {
  userId: "123",
  recipeId: 14,
  title: "chicken",
  image: "image.com",
  cookTime: "30mins",
  servings: "aa",
};

const testPost = async () => {
  try {
    const res = await fetch("http://localhost:5001/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log("✅ Réponse du serveur :", result);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
  }
};

testPost();
