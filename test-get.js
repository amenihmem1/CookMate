import fetch from "node-fetch"; // npm install node-fetch

// le même userId que pour ton POST
const userId = "124";

const testGet = async () => {
  try {
    const res = await fetch(`http://localhost:5001/api/favorites/${userId}`);

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Favoris trouvés pour userId=${userId} :`, data);
    } else {
      console.error(`❌ Erreur GET : HTTP ${res.status}`);
      const text = await res.text();
      console.error("Détails :", text);
    }
  } catch (err) {
    console.error("❌ Erreur :", err.message);
  }
};

testGet();
