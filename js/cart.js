const cart = document.querySelector(".cart");
const cartIcon = document.querySelector("#cart-icon");
const closeCart = document.querySelector(".close-cart");
const cartCount = document.querySelector(".cart-count");
const totalPriceElement = document.querySelector(".total-price");
const cartContainer = document.querySelector(".cart-items");

// Toggle cart
cartIcon.addEventListener("click", () => cart.classList.add("active"));
closeCart.addEventListener("click", () => cart.classList.remove("active"));

// Update totals
function updateCart() {
    const items = document.querySelectorAll(".cart-item");
    let total = 0, count = 0;

    items.forEach(item => {
        const price = parseFloat(item.querySelector(".price").textContent.replace("$", ""));
        const quantity = parseInt(item.querySelector(".quantity-value").textContent);
        total += price * quantity;
        count += quantity;
    });

    totalPriceElement.textContent = total.toFixed(2);
    cartCount.textContent = count;
}

// Add product to cart
function addToCart(product) {
    const cartItem = `
        <div class="cart-item" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}">
            <div class="content">
                <h4>${product.title}</h4>
                <p class="price">$${product.price}</p>
                <div class="quantity">
                    <button class="decrease">-</button>
                    <span class="quantity-value">1</span>
                    <button class="increase">+</button>
                </div>
            </div>
            <button class="remove-cart-item"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;
    cartContainer.insertAdjacentHTML("beforeend", cartItem);
    updateCart();
}

// Event delegation for cart actions
cartContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("increase")) {
        const qty = e.target.previousElementSibling;
        qty.textContent = parseInt(qty.textContent) + 1;
    }

    if (e.target.classList.contains("decrease")) {
        const qty = e.target.nextElementSibling;
        if (parseInt(qty.textContent) > 1) {
            qty.textContent = parseInt(qty.textContent) - 1;
        }
    }

    if (e.target.closest(".remove-cart-item")) {
        e.target.closest(".cart-item").remove();
    }

    updateCart();
});

// Event delegation for "Add to Cart" (works even if products are loaded later)
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
