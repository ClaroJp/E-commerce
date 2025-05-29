document.addEventListener("DOMContentLoaded", () => {
  loadCartItems();

  // Checkout button listener
  const checkoutBtn = document.getElementById("checkoutBtn");
  checkoutBtn.addEventListener("click", () => {
    const selectedIds = [];

    document.querySelectorAll(".cart-checkbox:checked").forEach(checkbox => {
      const itemEl = checkbox.closest(".cart-item");
      selectedIds.push(itemEl.dataset.id);
    });

    if (selectedIds.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    // Redirect with selected items in URL
    const params = new URLSearchParams();
    params.set("items", selectedIds.join(","));
    window.location.href = `/checkout?${params.toString()}`;
  });
});

function loadCartItems() {
  fetch("/api/cart")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    })
    .then(data => {
      const container = document.getElementById("cart-items-container");
      const subtotalEl = document.getElementById("cart-subtotal");
      const headerEl = document.getElementById("cart-header");
      const checkoutBtn = document.getElementById("checkoutBtn");

      const cartItems = data.cartItems || [];
      headerEl.textContent = `ALL ITEMS (${cartItems.length})`;

      if (cartItems.length === 0) {
        container.innerHTML = `<p class="text-center text-muted">Your cart is empty.</p>`;
        subtotalEl.textContent = "₱0.00";
        checkoutBtn.disabled = true;
        return;
      }

      container.innerHTML = "";

      cartItems.forEach(item => {
        const imageUrl = item.image_url || '/FrontEnd/assets/placeholder.png';

        container.innerHTML += `
          <div class="cart-item d-flex justify-content-between align-items-center py-3 border-bottom" data-id="${item.cartItem_id}" data-price="${item.price}">
            <div class="d-flex align-items-center gap-3 flex-grow-1">
              <input type="checkbox" class="form-check-input cart-checkbox" />
              <img src="${imageUrl}" alt="Product" class="rounded" style="width: 80px; height: 80px; object-fit: cover;" />
              <div>
                <div class="fw-bold">${item.name}</div>
                <div class="text-muted">₱${Number(item.price).toFixed(2)}</div>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-secondary btn-sm qty-btn minus">−</button>
              <input type="number" class="form-control qty-input" value="${item.quantity}" min="1" style="width: 60px; text-align: center;" />
              <button class="btn btn-outline-secondary btn-sm qty-btn plus">+</button>
              <button class="btn btn-danger btn-sm ms-3 delete-btn">Delete</button>
            </div>
          </div>
        `;
      });

      attachCartEvents();
      updateSubtotal();
      toggleCheckoutButton();
    })
    .catch(err => {
      console.error("Error fetching cart data:", err);
    });
}

function attachCartEvents() {
  // Delete cart item
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const itemId = btn.closest(".cart-item").dataset.id;
      fetch(`/api/cart/${itemId}`, {
        method: "DELETE"
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to delete item");
          return res.json();
        })
        .then(() => loadCartItems())
        .catch(err => alert("Failed to delete item."));
    });
  });

  // Quantity buttons
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const itemEl = btn.closest(".cart-item");
      const qtyInput = itemEl.querySelector(".qty-input");
      let currentQty = parseInt(qtyInput.value);

      if (btn.classList.contains("minus")) {
        if (currentQty > 1) qtyInput.value = currentQty - 1;
      } else if (btn.classList.contains("plus")) {
        qtyInput.value = currentQty + 1;
      }

      qtyInput.dispatchEvent(new Event("change"));
    });
  });

  // Quantity input manual change
  document.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", () => {
      let newQty = parseInt(input.value);
      if (isNaN(newQty) || newQty < 1) {
        input.value = 1;
        newQty = 1;
      }

      const itemEl = input.closest(".cart-item");
      const cartItemId = itemEl.dataset.id;

      fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty })
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to update quantity");
          return res.json();
        })
        .then(() => {
          // Update data-qty attribute to keep subtotal calculation correct
          itemEl.dataset.qty = newQty;
          updateSubtotal();
        })
        .catch(() => {
          alert("Failed to update quantity");
          loadCartItems(); // revert to fresh state
        });
    });
  });

  // Checkbox listener for subtotal and checkout toggle
  document.querySelectorAll(".cart-checkbox").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateSubtotal();
      toggleCheckoutButton();
    });
  });
}

function updateSubtotal() {
  const checkboxes = document.querySelectorAll(".cart-checkbox");
  let subtotal = 0;

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const item = checkbox.closest(".cart-item");
      const price = parseFloat(item.dataset.price);
      const qtyInput = item.querySelector(".qty-input");
      const quantity = parseInt(qtyInput.value);
      subtotal += price * quantity;
    }
  });

  document.getElementById("cart-subtotal").textContent = `₱${subtotal.toFixed(2)}`;
}

function toggleCheckoutButton() {
  const anyChecked = Array.from(document.querySelectorAll(".cart-checkbox")).some(cb => cb.checked);
  document.getElementById("checkoutBtn").disabled = !anyChecked;
}
