const ordersContainer = document.getElementById("orders_container");

document.addEventListener("DOMContentLoaded", async () => {
    const id_User_Data = Number(sessionStorage.getItem("userId"));

    if (!id_User_Data) {
        ordersContainer.innerHTML = `<h2>Войдите в аккаунт, чтобы увидеть заказы</h2>`;
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/order/${id_User_Data}`);
        
        if (!response.ok) {
            throw new Error("Не удалось загрузить заказы");
        }

        const orders = await response.json();

        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-cart-container">
                    <img src="./image/cat.png" alt="Нет заказов" class="empty-cart-icon">
                    <h2 style="color: rgba(147, 147, 147, 0.59);">У вас пока нет заказов</h2>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${order.image_url}" alt="${order.product_name}">
                </div>
                
                <div class="order-item-info">
                    <h3>${order.product_name}</h3>
                    <p class="order-meta">Заказ №${order.id_Order} | ${order.brand_name}</p>
                    <p class="order-price">${order.total_price} ₽</p>
                </div>

                <div class="order-item-status">
                    <span class="order-qty">${order.quantity} шт.</span>
                    <span class="status-badge">${order.status}</span>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.log("Ошибка загрузки заказов: ", error);
        ordersContainer.innerHTML = `<h2 style="text-align: center; color: red;">Ошибка при загрузке заказов</h2>`;
    }
});