const API_URL = "https://fakestoreapi.com/products";
const salePercentage = 10;

function renderProduct(product) {
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
const inp = document.getElementById("input-search");
const form = document.querySelector(".search-box");

// form.addEventListener("submit" , (e) => {
//     e.preventDefault()
//     loadHomeProducts()

// })
async function loadHomeProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        const homeProducts = products.slice(0, 4);
        const productsContainer = document.getElementById("home-products");
        let val = ""
        const dd = location.href.split("?")[1]?.split("&")
        if (dd) {
            dd.forEach((ele) => {
                const ddd = ele.split("=")
                if(ddd[0] === "search") {
                    val = ddd[1]
                }
            })
        }
        console.log(val);
        
        productsContainer.innerHTML = ""; // clear old
        homeProducts.filter(item => item.title.toLowerCase().includes(val?.toLowerCase() || "")).forEach(product => {
            productsContainer.innerHTML += renderProduct(product);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

loadHomeProducts();
