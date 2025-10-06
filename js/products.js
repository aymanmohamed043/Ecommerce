const API_URL = "https://fakestoreapi.com/products";


function renderProduct(product, salePercentage) {
    return `
        <div class="product-card">
            <span class="sale-persentage">${salePercentage}%</span>
            <span class="add-to-favorites" data-id="${product.id}">
                <i class="fa-regular fa-heart"></i>
            </span>
            <div class="product-img">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <h3 class="product-name"><a>${product.title}</a></h3>
            <div class="price">
                <span class="current-price">$${(product.price * (1 -  salePercentage / 100)).toFixed(2)}</span>
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
const inp = document.getElementById("input-search");
const cat = document.getElementById("category");
const form = document.querySelector(".search-box");

form.addEventListener("submit" , (e) => {
    e.preventDefault()
    loadHomeProducts()

})

async function loadHomeProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        const homeProducts = products
        const productsContainer = document.getElementById("home-products");
       

        productsContainer.innerHTML = ""; // clear old

        console.log("hello" , cat.value);
        
        homeProducts.filter(item => item.title.toLowerCase().includes(inp.value.toLowerCase()) && (cat.value ? item.category.includes(cat.value) : true)
    ).forEach(product => {
            const salePercentage = parseInt(Math.random() * 20 + 5);
            productsContainer.innerHTML += renderProduct(product, salePercentage);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

loadHomeProducts();
