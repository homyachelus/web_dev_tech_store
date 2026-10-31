const userCard = document.getElementById("user_card");

document.addEventListener("DOMContentLoaded", async () => {
    const isAdmin = sessionStorage.getItem("adminLogin"); 
    if (!isAdmin) {
        const id_User_Data = Number(sessionStorage.getItem("userId"));
        console.log(id_User_Data)
        try {
            const result = await fetch(`http://127.0.0.1:3000/cart/${id_User_Data}`)
            const data = await result.json();
            if (!id_User_Data || !data[0]) {
            userCard.innerHTML = `
                <div class="empty-cart-container">
                    <img src="./image/cat.png" alt="Пустая корзина" class="empty-cart-icon">

                    <h2 style="font-weight: 400; color: rgba(147, 147, 147, 0.59);">В корзине пусто :(</h2>
                    <p style="font-weight: 400; color: rgba(151, 151, 151, 0.59);">Возможно вы не вошли в аккаунт<p>
                </div>
            `
            return;
        }
        } catch (error) {
            console.log("vsrjpv: ", error);
        }
        try {
            console.log(id_User_Data)
            const result = await fetch(`http://127.0.0.1:3000/cart/${id_User_Data}`)
            const data = await result.json();
            console.log(data)
            if (!result.ok) {
                console.log("Что-то пошло не так")
                throw new Error(data.error);   
            }
            sessionStorage.setItem("cartProducts", JSON.stringify(data));
            userCard.innerHTML = data.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image_url}" alt="${item.name}">
                        </div>

                        <div class="cart-item-info">
                            <h2>${item.name}</h2>
                            <p class="cart-item-meta">${item.brand_name} | ${item.category_name}</p>
                            <p class="cart-item-price">${item.price} ₽</p>
                        </div>

                        <div class="cart-item-quantity">
                            <button data-id="${item.id_Product}" class="quantity-value" data-action="add">добавить еще: ${item.quantity}</button>
                            <button style="margin-top: 10px" data-id="${item.id_Product}" class="quantity-value" data-action="delete">удалить из корзины</button>
                        </div>
                    </div>`).join("")

            userCard.addEventListener("click", async (event) => {
                const btn = event.target.closest(".quantity-value");
                if (!btn) return;

                const id_User_Data = Number(sessionStorage.getItem("userId"));
                const id_Product = Number(btn.dataset.id);
                const action = btn.dataset.action;
                const cartItemDiv = btn.closest(".cart-item");

                if (!id_Product || !id_User_Data) {
                    alert("Войдите в аккаунт");
                    return;
                }

                try {
                    const ProdRes = await fetch(`http://127.0.0.1:3000/cart/${id_User_Data}`);
                    const ProdItems = await ProdRes.json();
            
                    const inProd = ProdItems.find(item => item.id_Product === id_Product);

                    if (action === "delete") {
                        await fetch(`http://127.0.0.1:3000/cart/decrement`, {
                            method: "PUT",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({id_User_Data, id_Product})
                        });
                    } else if (action === "add") {
                        if (inProd.quantity != 10) {
                            await fetch(`http://127.0.0.1:3000/cart`, {
                                method: "POST",
                                headers: {"Content-Type": "application/json"},
                                body: JSON.stringify({id_User_Data, id_Product})
                            });
                        } else {
                            return alert("Вы добавили максимальное количество")
                        } 
                    }

                    const cartRes = await fetch(`http://127.0.0.1:3000/cart/${id_User_Data}`);
                    const cartItems = await cartRes.json();
                    
                    const inCart = cartItems.find(item => item.id_Product === id_Product);

                    if (inCart) {
                        console.log(inCart.quantity);
                        const addBtn = cartItemDiv.querySelector('[data-action="add"]');
                        if (addBtn) {
                            addBtn.textContent = `добавить еще: ${inCart.quantity}`;
                        }
                    } else {
                        cartItemDiv.remove();

                        if (cartItems.length === 0) {
                            userCard.innerHTML = `
                                <div class="empty-cart-container">
                                    <img src="./image/cat.png" alt="Пустая корзина" class="empty-cart-icon">
                                    <h2 style="font-weight: 400; color: rgba(147, 147, 147, 0.59);">В корзине пусто :(</h2>
                                </div>
                            `;
                        }
                    }

                } catch (error) {
                    console.log("Ошибка корзины: ", error);
                    alert("Ошибка при обновлении");
                }
            });
        } catch (error) {
            console.log("фронт корзина: ", error)
        }
        } else {
            const id_Admin_Data = sessionStorage.getItem("adminId");
            try {
                const result = await fetch(`http://127.0.0.1:3000/products/admin`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({id_Admin_Data})
                });
                const data = await result.json();
                
                userCard.innerHTML = data.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image_url}" alt="${item.name}">
                        </div>

                        <div class="cart-item-info">
                            <h2>${item.name}</h2>
                            <p class="cart-item-meta">${item.brand_name} | ${item.category_name}</p>
                            <p class="cart-item-price">${item.price} ₽</p>
                            <p class="cart-item-price">Всего на складе: ${item.quantity}</p>
                        </div>
                    </div>
                `).join("");

                userCard.innerHTML += `
                    <div style="text-align: center; margin-top: 30px;">
                        <button id="open_add_modal_btn" class="go-shopping-btn" style="cursor: pointer; border: none; padding: 12px 30px;">
                            Добавить новый товар
                        </button>
                    </div>
                `;

                const modal = document.getElementById("addProductModal");
                const openBtn = document.getElementById("open_add_modal_btn");
                const closeBtn = document.getElementById("close_add_modal");

                openBtn.addEventListener("click", () => modal.classList.add("open"));
                closeBtn.addEventListener("click", () => modal.classList.remove("open"));

                const submitBtn = document.getElementById("submit_add_product");
                
                submitBtn.addEventListener("click", async () => {
                    const name = document.getElementById("add_name").value.trim();
                    const price = Number(document.getElementById("add_price").value);
                    const quantity = Number(document.getElementById("add_quantity").value);
                    const image_url = document.getElementById("add_image").value.trim();
                    const id_Category = Number(document.getElementById("add_category").value);
                    const id_Brand = Number(document.getElementById("add_brand").value);

                    if (!name || !price || isNaN(quantity) || !image_url || !id_Category || !id_Brand) {
                        return alert("Заполните все поля правильно");
                    }

                    try {
                        const response = await fetch("http://127.0.0.1:3000/products/add", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                name, price, quantity, image_url, id_Category, id_Brand
                            })
                        });

                        if (!response.ok) throw new Error("Ошибка сервера");

                        alert("Товар успешно добавлен!");
                        window.location.reload(); 

                    } catch (error) {
                        console.log("Ошибка добавления: ", error);
                        alert("Не удалось добавить товар");
                    }
                });

            } catch (error) {
                console.log("фронт админ корзина:", error);
            }
        }
})


const doOrder = document.getElementById("do_order");
let isOrder = false;

if (doOrder) {
    const isAdmin = sessionStorage.getItem("adminLogin"); 
    if (isAdmin) {
        doOrder.style.display = "none";
    } else {
        doOrder.addEventListener("click", async () => {
            const id_User_Data = Number(sessionStorage.getItem("userId"));
            
            const result = await fetch(`http://127.0.0.1:3000/cart/${id_User_Data}`);
            const data = await result.json();

            if (data.length === 0) {
                alert("Корзина пуста");
                return;
            }

            userCard.innerHTML = data.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image_url}" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <h2>${item.name}</h2>
                        <p class="cart-item-meta">${item.brand_name} | ${item.category_name}</p>
                        <p class="cart-item-price">${item.price} ₽</p>
                    </div>
                    <div class="cart-item-quantity">
                        <label class="option" style="cursor: pointer; display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" class="order-checkbox" data-id="${item.id_Product}" checked>
                        </label>
                    </div>
                </div>
            `).join("");

            userCard.innerHTML += `
                <div>
                    <label class="option">
                        <input name="pay" type="radio" checked>
                        <span>Оплатить наличными</span>
                    </label>

                    <label class="option">
                        <input name="pay" type="radio">
                        <span>Оплатить с помощью СБП</span>
                    </label>
                        
                    <label class="option">
                        <input name="pay" type="radio">
                        <span>Оплатить картой</span>
                    </label>
                </div>
            `

            doOrder.textContent = "Подтвердить заказ";
            doOrder.style.backgroundColor = "rgba(63, 141, 88, 0.874)"; 
            
            const newOrderBtn = doOrder.cloneNode(true);
            doOrder.parentNode.replaceChild(newOrderBtn, doOrder);

            newOrderBtn.addEventListener("click", async () => {
                const checkedBoxes = document.querySelectorAll(".order-checkbox:checked");
                
                if (checkedBoxes.length === 0) {
                    alert("Выберите хотя бы один товар для заказа");
                    return;
                }

                try {
                    for (const box of checkedBoxes) {
                        const id_Product = Number(box.dataset.id);
                        
                        const productInCart = data.find(p => p.id_Product === id_Product);
                        
                        if (!productInCart) continue;

                        const quantity = productInCart.quantity;
                        const total_price = productInCart.price * quantity;

                        const response = await fetch("http://127.0.0.1:3000/order", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({id_User_Data, id_Product, quantity, total_price})
                        });

                        if (!response.ok) throw new Error("Ошибка сервера при создании заказа");

                        await fetch(`http://127.0.0.1:3000/cart/delete`, {
                            method: "DELETE",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({id_User_Data, id_Product})
                        });
                    }

                    alert("Заказ успешно оформлен");
                    window.location.href = "order_page.html";
                    
                } catch (error) {
                    console.log("Ошибка при заказе:", error);
                    alert("Не удалось оформить заказ");
                }
            });
        });
    }
}