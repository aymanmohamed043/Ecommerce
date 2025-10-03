// Run this with Node.js (not browser JS)

const fs = require("fs");
const fetch = require("node-fetch"); // if Node < v18, install with npm install node-fetch

const API_URL = "https://fakestoreapi.com/products";

async function saveProducts() {
  try {
    const response = await fetch(API_URL);
    const products = await response.json();

    fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
    console.log("✅ products.json file created successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

saveProducts();
