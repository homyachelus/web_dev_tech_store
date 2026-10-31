const productsContainer = document.getElementById("products_container");
let allProducts = [];

async function renderProducts(productsToRender) {
    const id_User_Data = Number(sessionStorage.getItem("userId"));
    let cartItems = [];

    if (id_User_Data) {
        const cartRes = await fetch(`http://127.0.0.1:3000/cart/${id_User_Data}`);
        if (cartRes.ok) {
            cartItems = await cartRes.json();
        }
    }

    const html = productsToRender.map(product => {
        const inCart = cartItems.find(item => item.id_Product === product.id_Product);
        let btnHtml;
        if (inCart) {
            btnHtml = `
                <button class="addbtn active" data-action="add">Добавить ещё: ${inCart.quantity}</button>
                <button class="delbtn active" data-action="del">Удалить</button>
            `;
        } else {
            btnHtml = `<button class="addbtn active" data-action="add">В корзину</button>`;
        }
        return  `
        <div class="product-card" data-id="${product.id_Product}">
            <div style="background-color: #1c76283c; border-radius: 10px; padding: 6px">
                <img class="thumb" src="${product.image_url}" alt="${product.name}">
                <div style="text-align: center; background-color: #1c76283c; border-radius: 10px; margin: 9px 0; padding: 7px 0 10px 0;">
                    <h2>${product.name}</h2>
                    <h3>${product.price} ₽</h3>
                    <div class="description_container">
                        <p style="margin-right: 10px">${product.brand_name}</p>
                        <p>${product.category_name}</p>
                    </div>
                </div>
                <div class="btn-container" data-id="${product.id_Product}">
                    ${btnHtml} 
                </div>
            </div>
        </div>
    `}).join("");

    productsContainer.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const result = await fetch("http://127.0.0.1:3000/products");
        const products = await result.json();
        allProducts = products;
        await renderProducts(allProducts);
        
        sessionStorage.setItem("productsData", JSON.stringify(products));
    } catch (error) {
        console.log("фронт товары: ", error);
    }
});

const productModal = document.getElementById("productModal");
const modalClose = document.querySelector(".product-modal-close");
const modalImg = document.getElementById("modal_img");
const modalName = document.getElementById("modal_name");
const modalBrand = document.getElementById("modal_brand");
const modalPrice = document.getElementById("modal_price");
const modalDesc = document.getElementById("modal_desc");

productsContainer.addEventListener("click", async (event) => {
    const btn = event.target.closest(".addbtn, .delbtn");
    
    if (btn) {
        const isAdmin = sessionStorage.getItem("adminLogin"); 
        const btnContainer = btn.closest(".btn-container");
        const id_Product = Number(btnContainer.dataset.id);
        const id_User_Data = Number(sessionStorage.getItem("userId"));

        if (isAdmin) {
            return alert("Админ не может пользоваться корзиной");
        }

        if (!id_Product || !id_User_Data) {
            alert("Войдите в аккаунт");
            return;
        }

        try {
            const cartRes = await fetch(`http://127.0.0.1:3000/cart/${id_User_Data}`);
            const cartItems = await cartRes.json();
            
            const inCart = cartItems.find(item => item.id_Product === id_Product);
            const productData = allProducts.find(p => p.id_Product === id_Product);

            if (btn.classList.contains("delbtn")) {
                await fetch("http://127.0.0.1:3000/cart/decrement", {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({id_User_Data, id_Product})
                });
            } else if (btn.classList.contains("addbtn")) {
                if (inCart && inCart.quantity >= productData.quantity) {
                    return alert("Вы добавили максимальное количество");
                } 
                await fetch("http://127.0.0.1:3000/cart", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({id_User_Data, id_Product})
                });
            }

            const updatedCartRes = await fetch(`http://127.0.0.1:3000/cart/${id_User_Data}`);
            const updatedCartItems = await updatedCartRes.json();
            const updatedInCart = updatedCartItems.find(item => item.id_Product === id_Product);
            
            if (updatedInCart) {
                btnContainer.innerHTML = `
                    <button class="addbtn active" data-action="add">Добавить ещё: ${updatedInCart.quantity}</button>
                    <button class="delbtn active" data-action="del">Удалить</button>
                `;
            } else {
                btnContainer.innerHTML = `
                    <button class="addbtn active" data-action="add">В корзину</button>
                `;
            }
        } catch (error) {
            console.error("Ошибка корзины:", error);
            alert("Что-то пошло не так");
        }
        return; 
    }

    const card = event.target.closest(".product-card");
    if (!card) return;
    
    const id_Product = Number(card.dataset.id);
    const product = allProducts.find(p => p.id_Product === id_Product);
    
    if (!product) return;

    modalImg.src = product.image_url;
    modalName.textContent = product.name;
    modalBrand.textContent = `${product.brand_name} | ${product.category_name}`;
    modalPrice.textContent = `${product.price} ₽`;

    productModal.classList.add("open");

    try {
        const response = await fetch(`http://127.0.0.1:3000/products/description/${id_Product}`);
        if (response.ok) {
            const data = await response.json();
            modalDesc.textContent = data.description || "Описание отсутствует.";
        } else {
            modalDesc.textContent = "Подробное описание для этого товара пока не добавлено.";
        }
    } catch (error) {
        console.log("Ошибка загрузки описания:", error);
        modalDesc.textContent = "Ошибка загрузки.";
    }
});

modalClose.addEventListener("click", () => productModal.classList.remove("open"));
productModal.addEventListener("click", (e) => {
    if (e.target === productModal) productModal.classList.remove("open");
});

const filter = document.getElementById("filter");
const modal = document.getElementById("modal");
const closeBtn = modal.querySelector(".close");

const type1 = document.getElementById("type_1");
const type2 = document.getElementById("type_2");
const type3 = document.getElementById("type_3");

const brand = document.getElementById("brand");

const filtBtn = document.getElementById("filt_btn");

filtBtn.addEventListener("click", () => {
    let newArray = [...allProducts];
    const checkedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(cb => cb.value);

    if (checkedTypes.length > 0) {
        newArray = newArray.filter(p => checkedTypes.includes(p.category_name));
    }
    
    const checkedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(cb => cb.value);
    if (checkedBrands.length > 0) {
        newArray = newArray.filter(p => checkedBrands.includes(p.brand_name));
    }

    const priceInput = document.getElementById("input_price").value;
    if (priceInput) {
        newArray = newArray.filter(p => p.price <= Number(priceInput));
    }

    renderProducts(newArray);
})

// открыть
filter.addEventListener("click", () => {
    modal.classList.add("open");
});

// закрыть по крестику
closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
});

// закрыть по клику на фон
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("open");
    }
});

// закрыть по еск
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.remove("open");
});


const searchInput = document.getElementById("serch_input"); 
const searchBtn = document.getElementById('save_search'); 

function doSearch() {
    const query = searchInput.value.trim().toLowerCase();
    let c = 0;

    if (!query) {
        renderProducts(allProducts);
        return;
    }

    const filteredProducts = allProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const brandMatch = product.brand_name.toLowerCase().includes(query);
        const categoryMatch = product.category_name.toLowerCase().includes(query);

        if (query == "ноуты" || query == "ноутбуки" || query == "компьютеры" || query == "компьютер" || query == "ноут" || query == "макбук") {
            if(product.category_name.toLowerCase() == "ноутбук"){
                console.log(product.brand_name.toLowerCase());
                return product;
            }
            c++;
        }
        if (query == "телефон" || query == "phone" || query == "мобила" || query == "звонилка" || query == "nttkajy") {
            if(product.category_name.toLowerCase() == "телефон"){
                console.log(product.brand_name.toLowerCase());
                return product;
            }
            c++;
        }
        if (query == "gkfyitn" || query == "планшеты" || query == "планшет") {
            if(product.category_name.toLowerCase() == "планшет"){
                console.log(product.brand_name.toLowerCase());
                return product;
            }
            c++;
        }


        if (query == "асус" || query == "fcec") {
            if(product.brand_name.toLowerCase() == "asus"){
                console.log(product.brand_name.toLowerCase());
                return product;
            }
            c++;
        }
        if (query == "леново" || query == "линово" || query == "ktyjdj") {
            if(product.brand_name.toLowerCase() == "lenovo"){
                console.log(product.brand_name.toLowerCase());
                return product;
            }
            c++;
        }
        if (query == "эпл" || query == "'gk" || query == "яблоко") {
            if(product.brand_name.toLowerCase() == "apple"){
                console.log(product.brand_name.toLowerCase());
                return product;
            }
        }
        if (query == "самсунг" || query == "cfvceyu" || query == "сумсунг") {
            if(product.brand_name.toLowerCase() == "samsung"){
                console.log(product.brand_name.toLowerCase());
                return product;
            }
            c++;
        }
        if (query == "rczjvb" || query == "ксяоми" || query == "сяоми" || query == "хяоми") {
            if(product.brand_name.toLowerCase() == "xiaomi"){
                console.log(product.brand_name.toLowerCase());
                return product;
            }
            c++;
        }

        console.log(c)

        return nameMatch || brandMatch || categoryMatch;
    });
    if (c == 0) {
        console.log(c)
        productsContainer.innerHTML = `
            <div class="empty-cart-container" style="grid-column: 1 / -1;">
                <img src="./image/cat.png" alt="Пусто" class="empty-cart-icon">
                <h2 style="font-weight: 400; color: rgba(147, 147, 147, 0.59);">Ничего не найдено :(</h2>
                <p style="font-weight: 400; color: rgba(151, 151, 151, 0.59);">по запросу ${query}</p>
            </div>
        `
        return;
    }

    renderProducts(filteredProducts);
}

// клик на кнопку поиска
searchBtn.addEventListener("click", doSearch);

// нажатие на энтер
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
});
