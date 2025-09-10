// MartX E-commerce Application - Final Version with Image Fix
class MartXApp {
    constructor() {
        this.apiUrl = 'https://fakestoreapi.com';
        this.products = [];
        this.filteredProducts = [];
        this.cart = this.loadCartFromStorage();
        this.currentPage = 'home';
        this.currentProduct = null;
        this.searchQuery = '';
        this.selectedCategory = 'all';
        this.currentQuantity = 1;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing MartX App...');
        this.initTheme();
        this.bindEvents();
        this.updateCartBadge();
        this.loadProducts();
    }

    loadCartFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('martx-cart')) || [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    }

    // Theme Management
    initTheme() {
        const savedTheme = localStorage.getItem('martx-theme') || 'light';
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        this.updateThemeToggle(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('martx-theme', newTheme);
        this.updateThemeToggle(newTheme);
        
        this.showToast(`Switched to ${newTheme} mode`, 'success');
    }

    updateThemeToggle(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Event Binding
    bindEvents() {
        console.log('Binding events...');
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterProducts();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.filterProducts();
                }
            });
        }
        
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterProducts();
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.filterProducts();
            });
        }
        
        // Cart button
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('cart');
            });
        }
        
        // Navigation buttons
        const homeBreadcrumb = document.getElementById('homeBreadcrumb');
        if (homeBreadcrumb) {
            homeBreadcrumb.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
        }
        
        const continueShopping = document.getElementById('continueShopping');
        if (continueShopping) {
            continueShopping.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
        }
        
        const proceedToCheckout = document.getElementById('proceedToCheckout');
        if (proceedToCheckout) {
            proceedToCheckout.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('checkout');
            });
        }
        
        const backToHome = document.getElementById('backToHome');
        if (backToHome) {
            backToHome.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
        }
        
        // Checkout form
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
        }
        
        // Toast close
        const toastClose = document.getElementById('toastClose');
        if (toastClose) {
            toastClose.addEventListener('click', () => this.hideToast());
        }

        // Brand logo click
        const brandName = document.querySelector('.brand-name');
        if (brandName) {
            brandName.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
            brandName.style.cursor = 'pointer';
        }
        
        console.log('Events bound successfully');
    }

    // Image handling with fallbacks
    createImageWithFallback(src, alt, className = '') {
        return `<img src="${src}" alt="${alt}" class="${className}" loading="lazy" 
                onload="this.style.opacity='1'" 
                onerror="this.onerror=null; this.src='data:image/svg+xml;charset=utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%22100%22 y=%22100%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-family=%22Arial,sans-serif%22 font-size=%2214%22 fill=%22%23666%22%3E${alt.replace(/'/g, '&apos;')}%3C/text%3E%3C/svg%3E'; this.style.opacity='1';" 
                style="opacity:0; transition: opacity 0.3s ease;">`;
    }

    // API Calls with better error handling
    async loadProducts() {
        console.log('Loading products...');
        try {
            this.showLoading(true);
            this.hideError();
            
            const response = await fetch(`${this.apiUrl}/products`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            console.log('Products loaded:', this.products.length);
            this.renderProductGrid();
            this.hideError();
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to demo data if API fails
            this.loadDemoProducts();
        } finally {
            this.showLoading(false);
        }
    }

    // Enhanced demo data with working image URLs
    loadDemoProducts() {
        console.log('Loading demo products...');
        this.products = [
            {
                id: 1,
                title: "Premium Laptop Backpack",
                price: 89.95,
                description: "Durable laptop backpack perfect for work and travel with multiple compartments.",
                category: "electronics",
                image: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e3f2fd'/%3E%3Crect x='50' y='70' width='200' height='160' fill='%232196f3' rx='20'/%3E%3Ctext x='150' y='160' text-anchor='middle' dominant-baseline='middle' font-family='Arial,sans-serif' font-size='16' fill='white'%3EBackpack%3C/text%3E%3C/svg%3E",
                rating: { rate: 4.2, count: 89 }
            },
            {
                id: 2,
                title: "Wireless Bluetooth Headphones",
                price: 199.99,
                description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
                category: "electronics", 
                image: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3e5f5'/%3E%3Ccircle cx='100' cy='150' r='40' fill='%239c27b0'/%3E%3Ccircle cx='200' cy='150' r='40' fill='%239c27b0'/%3E%3Cpath d='M100 110 Q150 80 200 110' stroke='%239c27b0' stroke-width='8' fill='none'/%3E%3Ctext x='150' y='220' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' fill='%239c27b0'%3EHeadphones%3C/text%3E%3C/svg%3E",
                rating: { rate: 4.7, count: 156 }
            },
            {
                id: 3,
                title: "Classic Cotton T-Shirt",
                price: 24.99,
                description: "Comfortable 100% cotton t-shirt available in multiple colors and sizes.",
                category: "men's clothing",
                image: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e8f5e8'/%3E%3Cpath d='M80 100 L80 80 Q80 70 90 70 L210 70 Q220 70 220 80 L220 100 L250 130 L250 200 L220 200 L220 250 Q220 260 210 260 L90 260 Q80 260 80 250 L80 200 L50 200 L50 130 Z' fill='%234caf50'/%3E%3Ctext x='150' y='280' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' fill='%234caf50'%3ET-Shirt%3C/text%3E%3C/svg%3E",
                rating: { rate: 4.1, count: 203 }
            },
            {
                id: 4,
                title: "Elegant Silver Necklace",
                price: 149.50,
                description: "Beautiful sterling silver necklace with intricate pendant design.",
                category: "jewelery",
                image: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23fff3e0'/%3E%3Ccircle cx='150' cy='180' r='30' fill='none' stroke='%23ff9800' stroke-width='4'/%3E%3Cpath d='M80 80 Q150 120 220 80' stroke='%23ff9800' stroke-width='6' fill='none'/%3E%3Ctext x='150' y='250' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' fill='%23ff9800'%3ENecklace%3C/text%3E%3C/svg%3E",
                rating: { rate: 4.5, count: 78 }
            },
            {
                id: 5,
                title: "Women's Summer Dress",
                price: 79.99,
                description: "Elegant summer dress perfect for casual and semi-formal occasions.",
                category: "women's clothing",
                image: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23fce4ec'/%3E%3Cpath d='M100 80 L100 70 Q100 60 110 60 L190 60 Q200 60 200 70 L200 80 L220 100 L220 240 Q220 250 210 250 L90 250 Q80 250 80 240 L80 100 Z' fill='%23e91e63'/%3E%3Ctext x='150' y='280' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' fill='%23e91e63'%3EDress%3C/text%3E%3C/svg%3E",
                rating: { rate: 4.3, count: 124 }
            },
            {
                id: 6,
                title: "Gaming Mouse",
                price: 59.99,
                description: "High-precision gaming mouse with customizable RGB lighting and programmable buttons.",
                category: "electronics",
                image: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e1f5fe'/%3E%3Cpath d='M120 80 Q120 60 140 60 L160 60 Q180 60 180 80 L190 120 Q200 140 200 160 L200 200 Q200 220 180 220 L120 220 Q100 220 100 200 L100 160 Q100 140 110 120 Z' fill='%2300bcd4'/%3E%3Ctext x='150' y='250' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' fill='%2300bcd4'%3EMouse%3C/text%3E%3C/svg%3E",
                rating: { rate: 4.6, count: 92 }
            }
        ];
        this.filteredProducts = [...this.products];
        this.renderProductGrid();
        this.hideError();
        this.showToast('Demo products loaded', 'success');
    }

    async loadProduct(id) {
        console.log('Loading product:', id);
        try {
            this.showLoading(true);
            
            // First try to find in existing products
            const existingProduct = this.products.find(p => p.id === parseInt(id));
            if (existingProduct) {
                this.currentProduct = existingProduct;
                this.renderProductDetail();
                this.hideError();
                this.showLoading(false);
                return;
            }
            
            // If not found, fetch from API
            const response = await fetch(`${this.apiUrl}/products/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.currentProduct = await response.json();
            this.renderProductDetail();
            this.hideError();
        } catch (error) {
            console.error('Error loading product:', error);
            this.showError();
        } finally {
            this.showLoading(false);
        }
    }

    // Product Filtering
    filterProducts() {
        console.log('Filtering products...');
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = this.searchQuery === '' || 
                product.title.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery) ||
                product.category.toLowerCase().includes(this.searchQuery);
            const matchesCategory = this.selectedCategory === 'all' || 
                product.category === this.selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        this.renderProductGrid();
    }

    // Rendering Methods
    renderProductGrid() {
        console.log('Rendering product grid...');
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        
        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p style="color: var(--color-text-secondary); font-size: 1.1rem;">No products found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card fade-in" onclick="app.viewProduct(${product.id})" style="cursor: pointer;">
                ${this.createImageWithFallback(product.image, product.title, 'product-image')}
                <div class="product-info">
                    <h3 class="product-title">${this.truncateText(product.title, 60)}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-rating">
                        <div class="stars">${this.renderStars(product.rating.rate)}</div>
                        <span class="rating-count">(${product.rating.count})</span>
                    </div>
                    <span class="product-category">${product.category}</span>
                </div>
            </div>
        `).join('');
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    renderProductDetail() {
        if (!this.currentProduct) return;
        
        const container = document.getElementById('productDetail');
        const breadcrumb = document.getElementById('productBreadcrumb');
        
        if (breadcrumb) {
            breadcrumb.textContent = this.truncateText(this.currentProduct.title, 30);
        }
        
        if (container) {
            container.innerHTML = `
                ${this.createImageWithFallback(this.currentProduct.image, this.currentProduct.title, 'product-detail-image')}
                <div class="product-detail-info">
                    <h1>${this.currentProduct.title}</h1>
                    <div class="product-detail-price">$${this.currentProduct.price.toFixed(2)}</div>
                    <div class="product-detail-rating">
                        <div class="stars">${this.renderStars(this.currentProduct.rating.rate)}</div>
                        <span class="rating-count">(${this.currentProduct.rating.count} reviews)</span>
                    </div>
                    <span class="product-detail-category">${this.currentProduct.category}</span>
                    <p class="product-detail-description">${this.currentProduct.description}</p>
                    
                    <div class="quantity-selector">
                        <span>Quantity:</span>
                        <button class="quantity-btn" onclick="app.changeQuantity(-1)">-</button>
                        <span class="quantity-display" id="quantityDisplay">1</span>
                        <button class="quantity-btn" onclick="app.changeQuantity(1)">+</button>
                    </div>
                    
                    <button class="btn btn--primary btn--full-width" onclick="app.addToCart(${this.currentProduct.id})">
                        Add to Cart
                    </button>
                </div>
            `;
        }
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star">★</span>';
        }
        
        if (hasHalfStar) {
            stars += '<span class="star">☆</span>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star" style="color: var(--color-border);">★</span>';
        }
        
        return stars;
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const cartSummary = document.getElementById('cartSummary');
        
        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.classList.remove('hidden');
            if (cartItems) cartItems.classList.add('hidden');
            if (cartSummary) cartSummary.classList.add('hidden');
            return;
        }
        
        if (emptyCart) emptyCart.classList.add('hidden');
        if (cartItems) cartItems.classList.remove('hidden');
        if (cartSummary) cartSummary.classList.remove('hidden');
        
        if (cartItems) {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item slide-up">
                    ${this.createImageWithFallback(item.image, item.title, 'cart-item-image')}
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${this.truncateText(item.title, 50)}</h4>
                        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-btn" onclick="app.removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `).join('');
        }
        
        this.updateCartSummary();
    }

    renderCheckoutItems() {
        const checkoutItems = document.getElementById('checkoutItems');
        
        if (checkoutItems) {
            checkoutItems.innerHTML = this.cart.map(item => `
                <div class="checkout-item">
                    ${this.createImageWithFallback(item.image, item.title, 'checkout-item-image')}
                    <div class="checkout-item-info">
                        <div class="checkout-item-title">${this.truncateText(item.title, 30)}</div>
                        <div class="checkout-item-quantity">Qty: ${item.quantity}</div>
                    </div>
                    <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('');
        }
        
        this.updateCheckoutSummary();
    }

    // Cart Management
    addToCart(productId) {
        const product = this.currentProduct || this.products.find(p => p.id === productId);
        if (!product) {
            this.showToast('Product not found', 'error');
            return;
        }
        
        const quantityElement = document.getElementById('quantityDisplay');
        const quantity = quantityElement ? parseInt(quantityElement.textContent) : 1;
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartBadge();
        this.showToast(`${this.truncateText(product.title, 20)} added to cart!`, 'success');
        
        // Reset quantity to 1
        if (quantityElement) {
            quantityElement.textContent = '1';
        }
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartBadge();
            this.renderCartItems();
            this.showToast(`${this.truncateText(removedItem.title, 20)} removed from cart`, 'success');
        }
    }

    updateCartQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartBadge();
            this.renderCartItems();
        }
    }

    saveCart() {
        try {
            localStorage.setItem('martx-cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            
            if (totalItems > 0) {
                badge.textContent = totalItems;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateCartSummary() {
        const subtotal = this.getCartTotal();
        const shipping = 9.99;
        const total = subtotal + shipping;
        
        const subtotalElement = document.getElementById('cartSubtotal');
        const totalElement = document.getElementById('cartTotal');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }

    updateCheckoutSummary() {
        const subtotal = this.getCartTotal();
        const shipping = 9.99;
        const total = subtotal + shipping;
        
        const subtotalElement = document.getElementById('checkoutSubtotal');
        const totalElement = document.getElementById('checkoutTotal');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Navigation
    showPage(page) {
        console.log('Showing page:', page);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        
        // Show selected page
        const pageElement = document.getElementById(`${page}Page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
            this.currentPage = page;
            
            // Page-specific logic
            switch (page) {
                case 'cart':
                    this.renderCartItems();
                    break;
                case 'checkout':
                    if (this.cart.length === 0) {
                        this.showPage('cart');
                        return;
                    }
                    this.renderCheckoutItems();
                    break;
                case 'home':
                    if (this.products.length === 0) {
                        this.loadProducts();
                    }
                    break;
            }
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    viewProduct(productId) {
        this.loadProduct(productId);
        this.showPage('productDetail');
    }

    // Product Detail Quantity Management
    changeQuantity(delta) {
        const display = document.getElementById('quantityDisplay');
        if (display) {
            let quantity = parseInt(display.textContent) || 1;
            quantity = Math.max(1, quantity + delta);
            display.textContent = quantity;
        }
    }

    // Checkout Process
    handleCheckout(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderData = {
            personal: {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone')
            },
            shipping: {
                address: formData.get('address'),
                city: formData.get('city'),
                postalCode: formData.get('postalCode'),
                country: formData.get('country')
            },
            payment: formData.get('paymentMethod'),
            items: [...this.cart],
            total: this.getCartTotal() + 9.99
        };
        
        // Validate required fields
        const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
        const missingFields = requiredFields.filter(field => !formData.get(field));
        
        if (missingFields.length > 0 || !orderData.payment) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Simulate order processing
        this.processOrder(orderData);
    }

    processOrder(orderData) {
        // Generate order ID
        const orderId = 'MX' + Date.now().toString().slice(-6);
        
        // Store order details
        const orderIdElement = document.getElementById('orderId');
        const orderTotalElement = document.getElementById('orderTotal');
        
        if (orderIdElement) orderIdElement.textContent = orderId;
        if (orderTotalElement) orderTotalElement.textContent = `$${orderData.total.toFixed(2)}`;
        
        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartBadge();
        
        // Show success page
        this.showPage('success');
        
        this.showToast('Order placed successfully!', 'success');
    }

    // Utility Methods
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            if (show) {
                spinner.classList.remove('hidden');
            } else {
                spinner.classList.add('hidden');
            }
        }
    }

    showError() {
        const errorElement = document.getElementById('errorMessage');
        const homeElement = document.getElementById('homePage');
        
        if (errorElement) errorElement.classList.remove('hidden');
        if (homeElement) homeElement.classList.add('hidden');
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) errorElement.classList.add('hidden');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type === 'error' ? 'error' : ''}`;
            toast.classList.remove('hidden');
            
            // Auto-hide after 3 seconds
            setTimeout(() => this.hideToast(), 3000);
        }
    }

    hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('hidden');
        }
    }
}

// Initialize the application
let app;

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new MartXApp();
    });
} else {
    app = new MartXApp();
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && app) {
        app.hideToast();
        if (app.currentPage !== 'home') {
            app.showPage('home');
        }
    }
    
    if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (app) {
        app.showToast('Connection restored', 'success');
        if (app.products.length === 0) {
            app.loadProducts();
        }
    }
});

window.addEventListener('offline', () => {
    if (app) {
        app.showToast('Connection lost. Using cached data.', 'error');
    }
});