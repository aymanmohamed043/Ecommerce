const API_URL = "https://fakestoreapi.com/products";
const salePercentage = 10;

function renderProduct(product) {
    return `
        <div class="product-card">
            <span class="sale-persentage">${salePercentage}%</span>
            <span class="add-to-favorites">
                <i class="fa-regular fa-heart"></i>
            </span>
            <div class="product-img">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <h3 class="product-name"><a>${product.title}</a></h3>
            <div class="price">
                <span class="current-price">$${(product.price * (1 - salePercentage / 100)).toFixed(2)}</span>
                <span class="old-price">$${(product.price).toFixed(2)}</span>
            </div>
            <div class="card-icons">
                <span class="add-to-cart btn" data-id="${product.id}">
                    <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                </span>
            </div>
        </div>
    `;
}

async function loadHomeProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        const homeProducts = products.slice(0, 4);
        const productsContainer = document.getElementById("home-products");

        productsContainer.innerHTML = ""; // clear old
        homeProducts.forEach(product => {
            productsContainer.innerHTML += renderProduct(product);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

loadHomeProducts();
