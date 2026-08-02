// 模擬商品資料庫（使用 Unsplash 免費高畫質商用圖片）
const products = [
    { 
        id: 1, 
        name: "極簡無線滑鼠", 
        price: 690, 
        imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 2, 
        name: "人體工學鍵盤", 
        price: 1890, 
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 3, 
        name: "多功能金屬支架", 
        price: 450, 
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 4, 
        name: "高解析度網路攝影機", 
        price: 1280, 
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80" 
    }
];

// 購物車狀態與目前登入會員
let cart = [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let currentSearchKeyword = "";

// DOM 元素載入完成後執行
document.addEventListener("DOMContentLoaded", () => {
    renderProducts(products);
    updateAuthUI();
    setupEventListeners();
});

// 渲染商品列表到網頁上
function renderProducts(itemsToRender) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    
    if (itemsToRender.length === 0) {
        productList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 3rem;">沒有找到符合的商品</div>`;
        return;
    }

    itemsToRender.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        
        card.innerHTML = `
            <div class="product-image" style="background-image: url('${product.imageUrl}');"></div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$ ${product.price}</div>
                <button class="btn-add" data-id="${product.id}">加入購物車</button>
            </div>
        `;
        
        productList.appendChild(card);
    });
}

// 設定事件傾聽器
function setupEventListeners() {
    const productList = document.getElementById("product-list");
    const cartToggleBtn = document.getElementById("cart-toggle-btn");
    const cartCloseBtn = document.getElementById("cart-close-btn");
    const cartOverlay = document.getElementById("cart-overlay");
    const checkoutBtn = document.getElementById("checkout-btn");
    const cartItemsList = document.getElementById("cart-items-list");
    const searchInput = document.getElementById("search-input");
    const navLinks = document.querySelectorAll(".nav-links a");

// 導覽列分類點擊切換
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            
            const categoryName = link.textContent;
            document.getElementById("page-main-title").textContent = categoryName;
            const productList = document.getElementById("product-list");

            // 根據點擊不同的分類顯示對應內容
            if (categoryName === "品牌故事") {
                productList.style.display = "block"; // 品牌故事改用單欄排版
                productList.innerHTML = `
                    <div style="background: #ffffff; padding: 2.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); line-height: 1.8; color: #475569;">
                        <h2 style="color: #2c3e50; margin-bottom: 1rem; font-size: 1.5rem;">關於 質感選物所</h2>
                        <p style="margin-bottom: 1rem;">我們深信，生活中的每個細節都值得被妥善對待。成立於 2026 年，「質感選物所」致力於發掘兼具美學與實用性的日常好物，為您的生活空間注入純粹與溫暖。</p>
                        <p style="margin-bottom: 1.5rem;">從桌面上的辦公配件到提升效率的小工具，我們嚴格把關每一項產品的設計與品質，只為陪您打造理想中的質感日常。</p>
                        <div style="width: 100%; height: 260px; background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; border-radius: 6px; margin-top: 1.5rem;"></div>
                    </div>
                `;
            } else {
                productList.style.display = "grid"; // 恢復商品網格
                if (categoryName === "新品上市") {
                    // 假設新品上市顯示前兩個商品
                    renderProducts(products.slice(0, 2));
                } else if (categoryName === "人氣特惠") {
                    // 假設人氣特惠顯示特定商品
                    renderProducts(products.slice(2, 4));
                } else {
                    // 熱門商品顯示全部
                    renderProducts(products);
                }
            }
        });
    });

    // 搜尋功能即時過濾
    searchInput.addEventListener("input", (e) => {
        currentSearchKeyword = e.target.value.trim().toLowerCase();
        const filteredProducts = products.filter(p => p.name.toLowerCase().includes(currentSearchKeyword));
        renderProducts(filteredProducts);
    });

    // 監聽加入購物車
    productList.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-add")) {
            const productId = parseInt(e.target.getAttribute("data-id"));
            addToCart(productId);
        }
    });

    // 切換購物車抽屜顯示
    cartToggleBtn.addEventListener("click", toggleCartDrawer);
    cartCloseBtn.addEventListener("click", toggleCartDrawer);
    cartOverlay.addEventListener("click", toggleCartDrawer);

    // 監聽購物車內品項的數量增減
    cartItemsList.addEventListener("click", (e) => {
        if (e.target.classList.contains("qty-btn")) {
            const productId = parseInt(e.target.getAttribute("data-id"));
            const action = e.target.getAttribute("data-action");
            updateItemQuantity(productId, action);
        }
    });

    // 結帳按鈕
    checkoutBtn.addEventListener("click", () => {
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cart.length === 0) {
            alert("目前購物車是空的喔！");
        } else if (!currentUser) {
            alert("請先登入會員才能進行結帳！");
            toggleAuthModal();
        } else {
            alert(`感謝 ${currentUser.name} 的購買！總金額為 $${totalAmount} 元`);
            cart = [];
            updateCartUI();
            toggleCartDrawer();
        }
    });

    // 會員 Modal 相關元素
    const openLoginBtn = document.getElementById("open-login-btn");
    const authModal = document.getElementById("auth-modal");
    const authOverlay = document.getElementById("auth-overlay");
    const authCloseBtn = document.getElementById("auth-close-btn");
    const toRegister = document.getElementById("to-register");
    const toLogin = document.getElementById("to-login");
    const loginFormContainer = document.getElementById("login-form-container");
    const registerFormContainer = document.getElementById("register-form-container");
    
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (openLoginBtn) {
        openLoginBtn.addEventListener("click", toggleAuthModal);
    }
    authCloseBtn.addEventListener("click", toggleAuthModal);
    authOverlay.addEventListener("click", toggleAuthModal);

    toRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginFormContainer.style.display = "none";
        registerFormContainer.style.display = "block";
    });

    toLogin.addEventListener("click", (e) => {
        e.preventDefault();
        registerFormContainer.style.display = "none";
        loginFormContainer.style.display = "block";
    });

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("register-name").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const existing = users.find(u => u.email === email);
        if (existing) {
            alert("此電子郵件已經註冊過了！");
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem("users", JSON.stringify(users));
        
        alert("註冊成功！請登入您的帳號。");
        registerForm.reset();
        registerFormContainer.style.display = "none";
        loginFormContainer.style.display = "block";
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            currentUser = { name: foundUser.name, email: foundUser.email };
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            alert(`歡迎回來，${currentUser.name}！`);
            loginForm.reset();
            toggleAuthModal();
            updateAuthUI();
        } else {
            alert("電子郵件或密碼錯誤！");
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "logout-btn") {
            currentUser = null;
            localStorage.removeItem("currentUser");
            updateAuthUI();
            alert("已成功登出。");
        }
    });
}

function toggleAuthModal() {
    const modal = document.getElementById("auth-modal");
    const overlay = document.getElementById("auth-overlay");
    modal.classList.toggle("active");
    overlay.classList.toggle("active");
}

function updateAuthUI() {
    const container = document.getElementById("user-status-container");
    if (currentUser) {
        container.innerHTML = `
            <span class="user-welcome">Hi, ${currentUser.name}</span>
            <button class="btn-logout" id="logout-btn">登出</button>
        `;
    } else {
        container.innerHTML = `
            <button class="btn-auth-trigger" id="open-login-btn">登入 / 註冊</button>
        `;
        document.getElementById("open-login-btn").addEventListener("click", toggleAuthModal);
    }
}

function toggleCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    drawer.classList.toggle("active");
    overlay.classList.toggle("active");
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
}

function updateItemQuantity(productId, action) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        if (action === "increase") {
            cart[itemIndex].quantity += 1;
        } else if (action === "decrease") {
            cart[itemIndex].quantity -= 1;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const cartCountEl = document.getElementById("cart-count");
    const cartTotalEl = document.getElementById("cart-total");
    const drawerTotalEl = document.getElementById("drawer-total");
    const cartItemsList = document.getElementById("cart-items-list");

    let totalCount = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalCount += item.quantity;
        totalPrice += item.price * item.quantity;
    });

    cartCountEl.textContent = totalCount;
    cartTotalEl.textContent = totalPrice;
    drawerTotalEl.textContent = totalPrice;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `<div class="cart-empty-text">購物車目前是空的</div>`;
        return;
    }

    cartItemsList.innerHTML = "";
    cart.forEach(item => {
        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$ ${item.price} × ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
            </div>
        `;
        cartItemsList.appendChild(itemEl);
    });
}