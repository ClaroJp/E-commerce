async function loadOrders() {
  try {
    const response = await fetch("/api/my-purchases", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    if (!response.ok) throw new Error("Failed to load orders");

    const orders = await response.json();
    const container = document.getElementById("orders");
    container.innerHTML = "";

    if (orders.length === 0) {
      container.innerHTML = `<div class="alert alert-info">You have no purchases yet.</div>`;
      return;
    }

    orders.forEach(order => {
      const orderCard = document.createElement("div");
      orderCard.className = "col-12";

      orderCard.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white">
            <strong>Order #${order.order_id}</strong> 
            <span class="ms-3">Date: ${new Date(order.order_date).toLocaleDateString()}</span>
            <span class="float-end badge bg-warning text-dark">${order.status}</span>
          </div>
          <div class="card-body">
            ${order.items.map(item => `
              <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <img src="${item.image_url || '/assets/default-product.png'}" alt="${item.name}" class="me-3" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                <div class="flex-grow-1">
                  <h6 class="mb-0">${item.name}</h6>
                  <small>Quantity: ${item.quantity}</small><br>
                  <small>Price: $${item.price}</small>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;

      container.appendChild(orderCard);
    });
  } catch (err) {
    console.error(err);
    document.getElementById("orders").innerHTML = `<div class="alert alert-danger">Error loading orders.</div>`;
  }
}

loadOrders();
