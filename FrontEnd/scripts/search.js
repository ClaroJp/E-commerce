// search.js

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchForm = document.getElementById("searchForm");
    const suggestions = document.getElementById("suggestions");

    const categoriesSection = document.getElementById("categories-container");
    const hotSalesSection = document.getElementById("hot-sales-container");
    const featuredSection = document.getElementById("products-container");
    const hotSales = document.getElementById("hot-sales");
    const featured = document.getElementById("featured");
    let allProducts = [];

    // Fetch products from your API or use homePage.js global data
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
    featuredSection.innerHTML = "";

    if (results.length === 0) {
        featuredSection.innerHTML = `<div class="col-12 text-center text-danger">No products found.</div>`;
        return;
    }

    results.forEach(product => {
        const imageUrl = product.image_url || 'https://via.placeholder.com/150';

        // Determine stock display and button state
        let stockDisplay = "";
        let addToCartButton = `<a href="#" class="btn btn-sm btn-outline-primary w-100 add-to-cart-btn" data-id="${product.product_id}">Add to Cart</a>`;

        if (product.stock_quantity === 0) {
            stockDisplay = `<p class="text-danger fw-bold">Out of Stock</p>`;
            addToCartButton = `<button class="btn btn-sm btn-outline-secondary w-100" disabled>Add to Cart</button>`;
        } else {
            stockDisplay = `<p class="text-success">In Stock: ${product.stock_quantity}</p>`;
        }

        featuredSection.innerHTML += `
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
}

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();

        suggestions.innerHTML = "";

        if (!query) {
            categoriesSection.style.display = "";
            hotSalesSection.style.display = "";
            renderResults(allProducts);
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

    function handleSearch(keyword) {
        if (!keyword) return;

        const results = allProducts.filter(product =>
            product.name.toLowerCase().includes(keyword.toLowerCase())
        );

        // Hide other sections
        categoriesSection.style.display = "none";
        hotSalesSection.style.display = "none";
        hotSales.style.display = "none";
        featured.style.display = "none";
        // Render matching results
        renderResults(results);

        // Clear suggestions
        suggestions.innerHTML = "";
    }

    // Initial fetch
    fetchProducts().then(() => {
        renderResults(allProducts);
    });
});
