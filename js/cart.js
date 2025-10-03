const cart = document.querySelector(".cart");
const cartIcon = document.querySelector("#cart-icon");
const closeCart = document.querySelector(".close-cart");
const cartCount = document.querySelector(".cart-count");
const totalPriceElement = document.querySelector(".total-price");
const cartContainer = document.querySelector(".cart-items");
const cartIconCount = document.getElementById("cart-count");

// 🔹 Load cart from localStorage
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// Toggle cart
cartIcon.addEventListener("click", () => cart.classList.add("active"));
closeCart.addEventListener("click", () => cart.classList.remove("active"));

// 🔹 Save cart to localStorage
function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// 🔹 Render cart UI
function renderCart() {
    cartContainer.innerHTML = "";
    cartItems.forEach(item => {
        const cartItem = `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}">
                <div class="content">
                    <h4>${item.title}</h4>
                    <p class="price">$${item.price}</p>
                    <div class="quantity">
                        <button class="decrease">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="increase">+</button>
                    </div>
                </div>
                <button class="remove-cart-item"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        cartContainer.insertAdjacentHTML("beforeend", cartItem);
    });
    updateCart();
}

// Update totals
function updateCart() {
    let total = 0, count = 0;
    cartItems.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
    });

    totalPriceElement.textContent = total.toFixed(2);
    cartCount.textContent = count;
    cartIconCount.textContent = count;

    saveCart();
}

// Add product to cart
function addToCart(product) {
    const existing = cartItems.find(item => item.id == product.id);

    if (existing) {
        existing.quantity++;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }

    renderCart();
    saveCart();
}

// Event delegation for cart actions
cartContainer.addEventListener("click", (e) => {
    const itemElement = e.target.closest(".cart-item");
    if (!itemElement) return;
    const id = itemElement.dataset.id;
    const item = cartItems.find(i => i.id == id);

    if (e.target.classList.contains("increase")) {
        item.quantity++;
    }

    if (e.target.classList.contains("decrease")) {
        if (item.quantity > 1) {
            item.quantity--;
        }
    }

    if (e.target.closest(".remove-cart-item")) {
        cartItems = cartItems.filter(i => i.id != id);
    }

    renderCart();
    saveCart();
});

// Event delegation for "Add to Cart"
document.addEventListener("click", async (e) => {
    if (e.target.closest(".add-to-cart")) {
        const button = e.target.closest(".add-to-cart");
        const productId = button.dataset.id;

        try {
            const response = await fetch(`${API_URL}/${productId}`);
            const product = await response.json();

            addToCart(product);

            button.classList.add("active");
            button.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
            button.disabled = true;

        } catch (error) {
            console.error("Error fetching product:", error);
        }
    }
});

// 🔹 Initialize cart on page load
renderCart();
