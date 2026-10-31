const login = document.getElementById("login");
const reg = document.getElementById("reg");
const regContainer = document.getElementById("reg_container");

function setActiveTab(activeButton) {
    login.classList.remove("active");
    reg.classList.remove("active");

    activeButton.classList.add("active");
}

login.addEventListener('click', () => {
    setActiveTab(login);
    regContainer.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center;">
            <p>Вы админ? - </p> 
            <label class="opt-container" style="margin-left: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <input id="label_admin" type="checkbox" class="opt">
            </label>
        </div>

        <input id="log_input_email" placeholder="почта или логин"/>
        <input id="log_input_password" placeholder="пароль"/>
        <button id="log_btn">войти</button>
    `

    const logInputEmail = document.getElementById("log_input_email");
    const logInputPassword = document.getElementById("log_input_password");
    const logBtn = document.getElementById("log_btn");
    const labelAdmin = document.getElementById("label_admin");

    logBtn.addEventListener("click", async () => {
        const email = logInputEmail.value;
        const password = logInputPassword.value;
        if (!labelAdmin.checked) {
            if (!email.endsWith("@gmail.com") && !email.endsWith("@mail.com") && !email.endsWith("@yandex.ru") && !email.endsWith("@bk.ru") && !email.endsWith("@mail.ru") && !email.endsWith("@icloud.com") && !email.endsWith("@yahoo.com")) {
                return alert("Некорректная почта");
            }
            if (!email || !password) {
                alert("Заполните все поля");
                return;
            }
            try {
                const result = await fetch("http://127.0.0.1:3000/login", {
                    method: "POST",
                    body: JSON.stringify({email, password}),
                    headers: {"Content-Type": "application/json"} 
                })

                const data = await result.json();
                sessionStorage.setItem("userName", data.name);
                sessionStorage.setItem("userEmail", data.email);
                sessionStorage.setItem("userId", data.id_User_Data);

                if (!result.ok) {
                    alert("Что-то пошло не так, проверьте данные")
                    return;
                }
                window.location.href = "products_page.html";
                alert("Вы вошли в аккаунт")
            } catch (error) {
                console.log("фронт вход: ", error)
            }
        } else {
            const login = logInputEmail.value; 
            try {
                const result = await fetch("http://127.0.0.1:3000/login/admin", {
                    method: "POST",
                    body: JSON.stringify({login, password}),
                    headers: {"Content-Type": "application/json"} 
                })

                const data = await result.json();
                sessionStorage.setItem("adminName", data.name);
                sessionStorage.setItem("adminLogin", data.login);
                sessionStorage.setItem("adminId", data.id_Admin_Data);

                if (!result.ok) {
                    alert("Что-то пошло не так, проверьте данные")
                    return;
                }
                window.location.href = "products_page.html";
                alert("Вы вошли в аккаунт")
            } catch (error) {
                console.log("фронт админ вход: ", error)
            }
        }
    })
})

reg.addEventListener('click', () => {
    setActiveTab(reg);
    regContainer.innerHTML = `
        <input id="reg_input_name" placeholder="ваше имя"/>
        <input id="reg_input_email" placeholder="почта"/>
        <input id="reg_input_password" placeholder="пароль"/>
        <button id="reg_btn">зарегистрироваться</button>
    `

    const regInputName = document.getElementById("reg_input_name");
    const regBtn = document.getElementById("reg_btn");
    const regInputEmail = document.getElementById("reg_input_email");
    const regInputPassword = document.getElementById("reg_input_password");

    regBtn.addEventListener("click", async () => {
    const name = regInputName.value;
    const email = regInputEmail.value;
    if (!email.endsWith("@gmail.com") && !email.endsWith("@mail.com") && !email.endsWith("@yandex.ru") && !email.endsWith("@bk.ru") && !email.endsWith("@mail.ru") && !email.endsWith("@icloud.com") && !email.endsWith("@yahoo.com")) {
            return alert("Некорректная почта");
        }
    const password = regInputPassword.value;
    if (!email || !password || !name) {
        alert("Заполните все поля");
        return;
    }
    console.log("vserbdr");
    try {
        console.log("vserbdr");
        const result = await fetch("http://127.0.0.1:3000/register", {
            method: "POST",
            body: JSON.stringify({email, password, name}),
            headers: {"Content-Type": "application/json"}
        })
        console.log("vserbdr");

        if (!result.ok) {
            console.log("vserbdr");
            alert('Что-то пошло не так');
            return;
        }
        console.log("vserbdr");
        alert("Регистрация прошла успешно! Войдите в аккаунт")
        console.log("vserbdr");
    } catch (error) {
        console.log('фронт регистрация: ', error)
    }
})
})