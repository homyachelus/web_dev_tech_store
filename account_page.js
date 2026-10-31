const userName = document.getElementById("user_name");
userName.textContent = sessionStorage.getItem("userName") || sessionStorage.getItem("adminName") || "Гость";
    
const userEmail = document.getElementById("user_email");
userEmail.textContent = sessionStorage.getItem("userEmail") || sessionStorage.getItem("adminLogin");

console.log(sessionStorage.getItem("adminLogin"))

const email = sessionStorage.getItem("userEmail") || sessionStorage.getItem("adminLogin");
if (email) {
    userEmail.textContent = email;
} else {
    userEmail.innerHTML = `<button class="login_btn" onclick="window.location.href='register_page.html'">Войти</button>`;
}

const newNameInput = document.getElementById("new_name_input");
const saveNameBtn = document.getElementById("save_name_btn");

const newEmailInput = document.getElementById("new_email_input");
const saveEmailBtn = document.getElementById("save_email_btn");

const logoutBtn = document.getElementById("logout_btn");

const containerAccount = document.getElementById("container_account");
const containerMain = document.getElementById("container_main");
const orderBtn = document.getElementById("order_btn");
const order_cont = document.getElementById("order_cont");

document.addEventListener("DOMContentLoaded", () => {
    const user = sessionStorage.getItem("userName")
    const admin = sessionStorage.getItem("adminName")
    if (admin && orderBtn && order_cont) {
        orderBtn.style.display = "none";
        order_cont.style.display = "none";
    }
    if (!user && !admin) {
        containerAccount.textContent = '';
        containerMain.style.width = 'fit-content';
    }   
})

logoutBtn.addEventListener("click", () => {
    const isConfirm = confirm("Вы уверены, что хотите выйти?");
    if(isConfirm) {
        sessionStorage.clear();
        window.location.href = "register_page.html"; 
    }
})

saveEmailBtn.addEventListener("click", async () => {
    const newEmail = newEmailInput.value.trim();
    
    if (!newEmail) {
        return alert("Заполните поле");
    }
    console.log(newEmail)

    if (!newEmail.endsWith("@gmail.com") && !newEmail.endsWith("@mail.com") && !newEmail.endsWith("@yandex.ru") && !newEmail.endsWith("@bk.ru") && !newEmail.endsWith("@mail.ru") && !newEmail.endsWith("@icloud.com") && !newEmail.endsWith("@yahoo.com")) {
        return alert("Некорректная почта");
    }
    console.log(newEmail)

    const id_User_Data = Number(sessionStorage.getItem("userId"));
    
    try {
        console.log(newEmail)
        const result = await fetch("http://127.0.0.1:3000/account/email", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email: newEmail, id_User_Data})
        });

        if (result.ok) {
            userEmail.textContent = newEmail;
        sessionStorage.setItem("newEmail", newEmail);
        }
        
        alert("Почта успешно изменена");

    } catch (error) {
        console.log("фронт имя: ", error);
        alert(error.message);
    }
});

saveNameBtn.addEventListener("click", async () => {
    const newName = newNameInput.value.trim();
    
    if (!newName) {
        return alert("Заполните поле");
    }

    const id_User_Data = Number(sessionStorage.getItem("userId"));
    
    try {
        console.log(newName)
        const result = await fetch("http://127.0.0.1:3000/account/name", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name: newName, id_User_Data})
        });

        if (result.ok) {
            userName.textContent = newName;
        sessionStorage.setItem("userName", newName);
        }
        
        alert("Имя успешно изменено");

    } catch (error) {
        console.log("фронт имя: ", error);
        alert(error.message);
    }
});