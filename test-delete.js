import fetch from "node-fetch"; // npm install node-fetch

// On met les mêmes valeurs que pour le POST
const userId = "123";
const recipeId = 14;

const testDelete = async () => {
  try {
    const res = await fetch(
      `http://localhost:5001/api/favorites/${userId}/${recipeId}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      console.log(`✅ Favori supprimé : userId=${userId}, recipeId=${recipeId}`);
    } else {
      console.error(`❌ Erreur DELETE : HTTP ${res.status}`);
      const text = await res.text();
      console.error("Détails :", text);
    }
  } catch (err) {
    console.error("❌ Erreur :", err.message);
  }
};

testDelete();
