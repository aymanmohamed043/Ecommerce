// Favorites functionality
class FavoritesManager {
    constructor() {
        this.favorites = this.getFavoritesFromStorage();
        this.init();
    }

    // Initialize favorites functionality
    init() {
        this.updateFavoritesCount();
        this.setupFavoriteButtons();
        this.loadFavoritesPage();
    }

    // Get favorites from localStorage
    getFavoritesFromStorage() {
        return JSON.parse(localStorage.getItem('favorites')) || [];
    }

    // Save favorites to localStorage
    saveFavoritesToStorage() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    // Add product to favorites
    addToFavorites(product) {
        // Check if product already exists
        const existingIndex = this.favorites.findIndex(item => item.id === product.id);
        
        if (existingIndex === -1) {
            this.favorites.push(product);
            this.saveFavoritesToStorage();
            this.updateFavoritesCount();
            this.showNotification('Product added to favorites!');
            return true;
        }
        return false;
    }

    // Remove product from favorites
    removeFromFavorites(productId) {
        this.favorites = this.favorites.filter(item => item.id !== productId);
        this.saveFavoritesToStorage();
        this.updateFavoritesCount();
        
        // If on favorites page, reload the display
        if (window.location.pathname.includes('favorites.html')) {
            this.loadFavoritesPage();
        }
        
        this.showNotification('Product removed from favorites!');
    }

    // Check if product is in favorites
    isInFavorites(productId) {
        return this.favorites.some(item => item.id === productId);
    }

    // Update favorites count in header
    updateFavoritesCount() {
        const favoritesCountElements = document.querySelectorAll('.favorites-count');
        favoritesCountElements.forEach(element => {
            element.textContent = this.favorites.length;
        });
    }

    // Setup favorite buttons on product cards
    setupFavoriteButtons() {
        // Handle existing favorite buttons
        const favoriteButtons = document.querySelectorAll('.add-to-favorites');
        favoriteButtons.forEach(button => {
            const productCard = button.closest('.product-card');
            if (productCard) {
                const productId = productCard.dataset.id;
                
                // Set initial state
                if (this.isInFavorites(productId)) {
                    button.classList.add('active');
                    button.innerHTML = '<i class="fas fa-heart" style="color: #e51a1a;"></i>';
                }

                // Add click event
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const product = this.getProductData(productCard);
                    this.toggleFavorite(product, button);
                });
            }
        });

        // Handle dynamically added product cards
        this.setupMutationObserver();
    }

    // Get product data from card
    getProductData(productCard) {
        const productId = productCard.dataset.id;
        const productName = productCard.querySelector('.product-name a')?.textContent || 'Product';
        const currentPrice = productCard.querySelector('.current-price')?.textContent.replace('$', '') || '0';
        const oldPrice = productCard.querySelector('.old-price')?.textContent.replace('$', '') || '';
        const productImage = productCard.querySelector('.product-img img')?.src || '';
        
        return {
            id: productId,
            name: productName,
            price: parseFloat(currentPrice),
            oldPrice: oldPrice ? parseFloat(oldPrice) : null,
            image: productImage,
            dateAdded: new Date().toISOString()
        };
    }

    // Toggle favorite status
    toggleFavorite(product, button) {
        if (this.isInFavorites(product.id)) {
            this.removeFromFavorites(product.id);
            button.classList.remove('active');
            button.innerHTML = '<i class="far fa-heart"></i>';
        } else {
            if (this.addToFavorites(product)) {
                button.classList.add('active');
                button.innerHTML = '<i class="fas fa-heart" style="color: #e51a1a;"></i>';
            }
        }
    }

    // Setup mutation observer for dynamically added content
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const newFavoriteButtons = node.querySelectorAll ? node.querySelectorAll('.add-to-favorites') : [];
                        newFavoriteButtons.forEach(button => {
                            const productCard = button.closest('.product-card');
                            if (productCard) {
                                const productId = productCard.dataset.id;
                                
                                // Set initial state
                                if (this.isInFavorites(productId)) {
                                    button.classList.add('active');
                                    button.innerHTML = '<i class="fas fa-heart" style="color: #e51a1a;"></i>';
                                }

                                // Add click event
                                button.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    const product = this.getProductData(productCard);
                                    this.toggleFavorite(product, button);
                                });
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Load favorites page content
    loadFavoritesPage() {
        const favoritesContainer = document.getElementById('favorites-container');
        const emptyFavorites = document.getElementById('empty-favorites');
        
        if (!favoritesContainer) return;

        if (this.favorites.length === 0) {
            if (emptyFavorites) {
                emptyFavorites.style.display = 'block';
            }
            favoritesContainer.innerHTML = '';
            return;
        }

        if (emptyFavorites) {
            emptyFavorites.style.display = 'none';
        }

        favoritesContainer.innerHTML = this.favorites.map(product => `
            <div class="favorite-product-card" data-id="${product.id}">
                <div class="favorite-product-img">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\"fas fa-image\" style=\"font-size: 3rem; color: #ccc;\"></i>';" />` : 
                        '<i class="fas fa-image" style="font-size: 3rem; color: #ccc;"></i>'
                    }
                </div>
                <h3 class="favorite-product-name">${product.name}</h3>
                <div class="favorite-product-price">
                    <span class="favorite-current-price">$${product.price.toFixed(2)}</span>
                    ${product.oldPrice ? `<span class="favorite-old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
                    ${product.oldPrice ? 
                        `<span class="favorite-discount">${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</span>` : 
                        ''
                    }
                </div>
                <div class="favorite-actions">
                    <button class="remove-favorite-btn" onclick="favoritesManager.removeFromFavorites('${product.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                    <button class="add-to-cart-fav" onclick="addToCartFromFavorites('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Show notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Clear all favorites
    clearAllFavorites() {
        if (this.favorites.length > 0 && confirm('Are you sure you want to remove all items from favorites?')) {
            this.favorites = [];
            this.saveFavoritesToStorage();
            this.updateFavoritesCount();
            this.loadFavoritesPage();
            this.showNotification('All favorites cleared!');
        }
    }
}

// Initialize favorites manager
const favoritesManager = new FavoritesManager();

// Add to cart from favorites (you'll need to integrate this with your cart system)
function addToCartFromFavorites(productId) {
    const product = favoritesManager.favorites.find(item => item.id === productId);
    if (product) {
        // Here you would integrate with your existing cart system
        console.log('Adding to cart:', product);
        favoritesManager.showNotification('Product added to cart!');
        
        // Example cart integration (replace with your actual cart function)
        // addToCart(product);
    }
}

// Make favoritesManager available globally
window.favoritesManager = favoritesManager;