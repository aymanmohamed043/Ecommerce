// ==========================
// FAVORITES (fixed, cart-style)
// ==========================

const favorites = document.querySelector(".favorites");
const favoritesIcon = document.querySelector("#favorites-icon");
const closeFavorites = document.querySelector(".close-favorites");
const favoritesCount = document.querySelector(".favorites-count");
const favoritesContainer = document.querySelector(".favorites-items");
const favoritesIconCount = document.getElementById("count-favorites"); // <- no '#'

// load from localStorage
let favoriteItems = JSON.parse(localStorage.getItem("favoriteItems")) || [];

// Toggle sidebar
favoritesIcon?.addEventListener("click", () =>
  favorites.classList.add("active")
);
closeFavorites?.addEventListener("click", () =>
  favorites.classList.remove("active")
);

// Save
function saveFavorites() {
  localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
}

// Render favorites sidebar
function renderFavorites() {
  favoritesContainer.innerHTML = "";

  if (!favoriteItems.length) {
    favoritesContainer.innerHTML = `<p style="text-align:center; color:var(--text-color);">No favorites added yet</p>`;
  } else {
    favoriteItems.forEach((item) => {
      const favHtml = `
        <div class="favorite-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.title}">
          <div class="content">
            <h4>${item.title}</h4>
            <p class="price">$${item.price}</p>
          </div>
          <button class="remove-favorite-item"><i class="fa-solid fa-trash-can"></i></button>
        </div>`;
      favoritesContainer.insertAdjacentHTML("beforeend", favHtml);
    });
  }

  updateFavorites(); // update counts + save
  updateHeartIcons(); // reflect hearts across page
}

// Update counter and persist
function updateFavorites() {
  const count = favoriteItems.length;
  if (favoritesCount) favoritesCount.textContent = count;
  if (favoritesIconCount) favoritesIconCount.textContent = count;
  saveFavorites();
}

// Add safely (requires valid id)
function addToFavorites(product) {
  if (!product || product.id == null) {
    console.error("Cannot add favorite: missing product id", product);
    return;
  }
  const idStr = String(product.id);
  const exists = favoriteItems.some((i) => String(i.id) === idStr);
  if (!exists) {
    favoriteItems.push({ ...product, id: idStr }); // store id as string consistently
    renderFavorites();
  }
}

// Remove
function removeFromFavorites(productId) {
  if (productId == null) return;
  const idStr = String(productId);
  favoriteItems = favoriteItems.filter((i) => String(i.id) !== idStr);
  renderFavorites();
}

// Update all heart buttons so only the matching ones become active
function updateHeartIcons() {
  const heartButtons = document.querySelectorAll(".add-to-favorites");

  heartButtons.forEach((btn) => {
    // Resolve id: prefer button's data-id, fallback to nearest .product-card data-id
    const btnId =
      btn.dataset.id ??
      btn.getAttribute("data-id") ??
      btn.closest(".product-card")?.dataset.id;
    const icon = btn.querySelector("i");

    if (!icon) return;

    if (!btnId) {
      // If this button has no id, ensure heart is not active
      icon.classList.remove("active-heart");
      return;
    }

    const isFav = favoriteItems.some(
      (item) => String(item.id) === String(btnId)
    );

    // set class explicitly instead of toggle-with-boolean to avoid accidental flips
    if (isFav) icon.classList.add("active-heart");
    else icon.classList.remove("active-heart");
  });
}

// Click handler for add/remove on product cards (delegation)
document.addEventListener("click", (e) => {
  const favBtn = e.target.closest(".add-to-favorites");
  if (!favBtn) return;

  // find product card (your HTML should have <div class="product-card" data-id="...">)
  const productCard = favBtn.closest(".product-card");
  const id = favBtn.dataset.id ?? productCard?.dataset.id;
  if (!id) {
    console.warn("Product has no data-id — cannot favorite");
    return;
  }

  // safe extraction of fields (tolerant to missing nodes)
  const image = productCard?.querySelector(".product-img img")?.src ?? "";
  const title =
    productCard?.querySelector(".product-name a")?.textContent?.trim() ??
    productCard?.querySelector(".product-name")?.textContent?.trim() ??
    "Untitled";
  const priceText =
    productCard?.querySelector(".current-price")?.textContent ?? "";
  const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;

  const isAlreadyFav = favoriteItems.some((i) => String(i.id) === String(id));
  if (isAlreadyFav) removeFromFavorites(id);
  else addToFavorites({ id: String(id), image, title, price });

  // update hearts immediately
  updateHeartIcons();
});

// Remove item from sidebar (delegated)
favoritesContainer.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-favorite-item");
  if (!removeBtn) return;

  const favItem = removeBtn.closest(".favorite-item");
  const id = favItem?.dataset.id;
  if (!id) return;
  removeFromFavorites(id);
});

// Initialize
renderFavorites();