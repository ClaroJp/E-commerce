document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchForm = document.getElementById("searchForm");
    const suggestions = document.getElementById("suggestions");

    const categoriesSection = document.getElementById("categories-container");
    const hotSalesSection = document.getElementById("hot-sales-container");
    const featuredSection = document.getElementById("products-container");

    const hotSales = document.getElementById("hot-sales");
    const featured = document.getElementById("featured");

    let fallbackContainer = null;
    if (!featuredSection) {
        fallbackContainer = document.createElement("div");
        fallbackContainer.className = "container mt-4";
        fallbackContainer.id = "search-results";
        document.body.appendChild(fallbackContainer);
    }

    let allProducts = [];

    async function fetchProducts() {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            allProducts = data;
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    }

    function renderResults(results) {
        const container = featuredSection || fallbackContainer;
        if (!container) return;

        container.innerHTML = "";

        if (results.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-danger">No products found.</div>`;
            return;
        }

        results.forEach(product => {
            const imageUrl = product.image_url || 'https://via.placeholder.com/150';

            let stockDisplay = "";
            let addToCartButton = `<a href="#" class="btn btn-sm btn-outline-primary w-100 add-to-cart-btn" data-id="${product.product_id}">Add to Cart</a>`;

            if (product.stock_quantity === 0) {
                stockDisplay = `<p class="text-danger fw-bold">Out of Stock</p>`;
                addToCartButton = `<button class="btn btn-sm btn-outline-secondary w-100" disabled>Add to Cart</button>`;
            } else {
                stockDisplay = `<p class="text-success">In Stock: ${product.stock_quantity}</p>`;
            }

            container.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">
                                <a href="/product?id=${product.product_id}" class="text-decoration-none">${product.name}</a>
                            </h5>
                            <p class="card-text small">${product.description}</p>
                            ${stockDisplay}
                            <div class="mt-auto">
                                <p class="fw-bold">₱${Number(product.price).toFixed(2)}</p>
                                ${addToCartButton}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        attachAddToCartListeners();
    }

    function handleSearch(keyword) {
        if (!keyword) return;

        const results = allProducts.filter(product =>
            product.name.toLowerCase().includes(keyword.toLowerCase())
        );

        if (categoriesSection) categoriesSection.style.display = "none";
        if (hotSalesSection) hotSalesSection.style.display = "none";
        if (hotSales) hotSales.style.display = "none";
        if (featured) featured.style.display = "none";

        renderResults(results);
        suggestions.innerHTML = "";
    }

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        suggestions.innerHTML = "";

        const container = featuredSection || fallbackContainer;

        if (!query) {
            if (categoriesSection) categoriesSection.style.display = "";
            if (hotSalesSection) hotSalesSection.style.display = "";
            if (hotSales) hotSales.style.display = "";
            if (featured) featured.style.display = "";

            if (container) {
                container.innerHTML = ""; // clear current content
                // Re-render all products or featured products only:
                renderResults(allProducts); // or filter featured if you have that data
            }
            return;
        }


        const matches = allProducts.filter(product =>
            product.name.toLowerCase().includes(query)
        );

        matches.slice(0, 5).forEach(match => {
            const item = document.createElement("button");
            item.className = "list-group-item list-group-item-action";
            item.textContent = match.name;
            item.type = "button";
            item.onclick = () => {
                searchInput.value = match.name;
                suggestions.innerHTML = "";
                handleSearch(match.name);
            };
            suggestions.appendChild(item);
        });
    });

    searchForm.addEventListener("submit", e => {
        e.preventDefault();
        handleSearch(searchInput.value.trim());
    });

    fetchProducts();

    function attachAddToCartListeners() {
        const container = featuredSection || fallbackContainer;
        if (!container) return;

        const addToCartButtons = container.querySelectorAll(".add-to-cart-btn");
        addToCartButtons.forEach(button => {
            button.addEventListener("click", async (e) => {
                e.preventDefault();
                const productId = button.getAttribute("data-id");
                button.disabled = true;
                button.textContent = "Adding...";
                try {
                    const res = await fetch("/api/cart/add", {
                        credentials: "include",
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ product_id: productId, quantity: 1 }),
                    });

                    if (res.status === 401) {
                        alert("You must be logged in to add items to the cart.");
                        window.location.href = "/login";
                        return;
                    }

                    if (!res.ok) throw new Error("Failed to add to cart");

                    alert("Added to cart!");
                } catch (err) {
                    alert("Error adding to cart");
                    console.error(err);
                } finally {
                    button.disabled = false;
                    button.textContent = "Add to Cart";
                }
            });
        });
    }
});
