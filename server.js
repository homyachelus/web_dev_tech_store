import express from "express";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import cors from "cors";

// вызов экспресс
const app = express();
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://31.76.12.103:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// создание соединения с бд
const connection  = mysql.createConnection({
    host: "31.76.12.103",
    user: "isp-41_lipatova_yuv",
    database: "isp-41_lipatova_yuv_web_dev",
    password: "isp-41_lipatova_yuv"
}).promise();

// async function admin_reg(name, login, password) {
//     const [isOccupied] = await connection.query("SELECT id_Admin_Data FROM Admin_Data WHERE login = ?", [login])
//     if (isOccupied.length > 0) {
//         return  console.log("Этот login уже занят");
//     }

//     const hash = await bcrypt.hash(password, 12);

//     await connection.query("INSERT INTO Admin_Data (name, login, password_hash) VALUES (?, ?, ?);", [name, login, hash])
// }

// admin_reg("Apple", "apple_25091", "apple_uri9i92j3f");
// admin_reg("Samsung", "samsung_83056", "samsung_d9056mg72h0");
// admin_reg("Xiaomi", "xiaomi_89471", "xiaomi_25ef46fba82o5");
// admin_reg("Asus", "asus_12674", "asus_jmc84856hg72s");
// admin_reg("Lenovo", "lenovo_01834", "Lenovo_6eg5s2f7f48f");

app.get("/products/description/:id_Product", async (req, res) => {
    try {
        const id_Product = req.params.id_Product; 
        const [rows] = await connection.query("SELECT * FROM Product_Description WHERE id_Product = ?", [id_Product]);

        if (rows.length === 0) {
            return res.status(404).json({error: "Описание не найдено"});
        }
        res.json(rows[0]); 
    } catch (error) {
        console.log("Ошибка получения описания: ", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.post("/products/add", async (req, res) => {
    try {
        const {name, price, quantity, image_url, id_Category, id_Brand} = req.body;
        if (!name || !price || !quantity || !image_url || !id_Category || !id_Brand) {
            return res.status(400).send({error: "Заполните все поля"})
        }
        await connection.query("INSERT INTO Products (name, price, quantity, image_url, is_active, id_Category, id_Brand) VALUES (?, ?, ?, ?, true, ?, ?)", [name, price, quantity, image_url, id_Category, id_Brand])
        return res.status(201);
    } catch (error) {
        console.log("вход: ", error)
        res.status(500).send({error: "Ошибка сервера"})
    }
})

//функция входа в систему - админ
app.post("/login/admin", async (req, res) => {
    try {
        const {login, password} = req.body;
        if (!login || !password) {
            return res.status(400).send({error: "Заполните все поля"})
        }
        const [users] = await connection.query("SELECT * FROM Admin_Data WHERE login = ?", [login])
        if (users.length == 0) {
            return res.status(400).send({message: "Пользователя с такой почтой не существует"})
        }
        const user = users[0];
        const checkPass = await bcrypt.compare(password, user.password_hash)
        if (!checkPass) {
            res.status(400).send({message: "Неверный пароль"})
        }
        return res.json({name: user.name, login: user.login, id_Admin_Data: user.id_Admin_Data})
        
    } catch (error) {
        console.log("вход: ", error)
        res.status(500).send({error: "Ошибка сервера"})
    }
})

// функция регистрации пользователя
app.post("/register", async (req, res) => {
    try {
        const {email, password, name} = req.body;
        if (!email || !password || !name) {
            return res.status(400).send({error: "Заполните все поля"});
        }

        const [isOccupied] = await connection.query("SELECT id_User_Data FROM User_Data WHERE email = ?", [email])
        if (isOccupied.length > 0) {
            return res.status(400).send({error: "Этот email уже занят"});
        }

        const hash = await bcrypt.hash(password, 12);

        await connection.query("INSERT INTO User_Data (email, password_hash, name) VALUES (?, ?, ?)", [email, hash, name])

        res.status(201).send({message: "Успех"});
    } catch (error) {
        console.log("регистрация: ", error);
        res.status(500).send({error: "Ошибка сервера"});
    }
})

// функция входа в систему
app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).send({error: "Заполните все поля"})
        }
        const [users] = await connection.query("SELECT * FROM User_Data WHERE email = ?", [email])
        if (users.length == 0) {
            return res.status(400).send({message: "Пользователя с такой почтой не существует"})
        }
        const user = users[0];
        const checkPass = await bcrypt.compare(password, user.password_hash)
        if (!checkPass) {
            res.status(400).send({message: "Неверный пароль"})
        }
        return res.json({name: user.name, email: user.email, id_User_Data: user.id_User_Data})
        
    } catch (error) {
        console.log("вход: ", error)
        res.status(500).send({error: "Ошибка сервера"})
    }
})

app.post("/products/admin", async (req, res) => {
    try {
        const {id_Admin_Data} = req.body;
        const [prods] = await connection.query(`SELECT 
                p.id_Product, 
                p.name, 
                p.price, 
                p.quantity, 
                p.image_url,
                b.name AS brand_name,
                c.name AS category_name
            FROM Products p
            JOIN Brand b ON p.id_Brand = b.id_Brand
            JOIN Category AS c ON p.id_Category = c.id_Category
            JOIN Admin_Data a ON b.name = a.name
            WHERE a.id_Admin_Data = ?;`, [id_Admin_Data])
        
        return res.status(201).json(prods)
    } catch (error) {
        console.log("вход: ", error)
        res.status(500).send({error: "Ошибка сервера"})
    }
})

// фукнция получения товаров на сайт
app.get("/products", async(req, res) => {
    try {
        const result = await connection.query(`
            SELECT
                p.id_Product,
                p.name,
                p.price,
                p.quantity,
                p.image_url,
                p.is_active,
                b.name AS brand_name,
                c.name AS category_name
            FROM Products AS p
            JOIN Brand AS b
                ON p.id_Brand = b.id_Brand
            JOIN Category AS c
                ON p.id_Category = c.id_Category
        `);
        console.log(result);
        const products = result[0];
        res.json(products);
    } catch (error) {
        console.log("товары: ", error)
        res.status(500).send({error: "Ошибка сервера"})
    }
})

// фукнция добавления товара в корзину
app.post("/cart", async (req, res) => {
    try {
        const {id_User_Data, id_Product} = req.body;
        if (!id_User_Data || !id_Product) {
            return res.status(400).json({message: "Пользвоателя или товара не существвует"});
        }

        const [existing] = await connection.query(
            "SELECT id_Cart, quantity FROM Cart WHERE id_User_Data = ? AND id_Product = ?", 
            [id_User_Data, id_Product]
        );

        if (existing.length > 0) {
            await connection.query(
                "UPDATE Cart SET quantity = quantity + 1 WHERE id_Cart = ?", 
                [existing[0].id_Cart]
            );
        } else {
            await connection.query(
                "INSERT INTO Cart (id_User_Data, id_Product, quantity) VALUES (?, ?, 1)", 
                [id_User_Data, id_Product]
            );
        }
        console.log(existing);
        res.json(existing);
        return res.status(200).json({message: "Товар добавлен в корзину"});
    } catch (error) {
        console.log("корзина: ", error)
        res.status(500).send({error: "Ошибка сервера"})
    }
})

// фукнция вывода товаров из корзины
app.get("/cart/:userId", async(req, res) => {
    try {
        const id_User_Data = req.params.userId;
        const [result] = await connection.query(`
            SELECT 
                c.id_Cart,
                c.quantity,
                p.id_Product,
                p.name,
                p.price,
                p.image_url,
                b.name AS brand_name,
                cat.name AS category_name
            FROM Cart AS c
            JOIN Products AS p ON c.id_Product = p.id_Product
            LEFT JOIN Brand AS b ON p.id_Brand = b.id_Brand
            LEFT JOIN Category AS cat ON p.id_Category = cat.id_Category
            WHERE c.id_User_Data = ?
        `, [id_User_Data]);
        console.log(result);
        res.json(result);
    } catch (error) {
        console.log("корзина вывод: ", error)
        res.status(500).send({error: "Ошибка сервера"})
    }
})

// удаление товара из корзины
app.put("/cart/decrement", async(req, res) => {
    try {
        const {id_User_Data, id_Product} = req.body;
        const [result] = await connection.query("UPDATE Cart SET quantity = quantity - 1 WHERE id_User_Data = ? AND id_Product = ?", [id_User_Data, id_Product]);
        await connection.query("DELETE FROM Cart WHERE id_User_Data = ? AND id_Product = ? AND quantity <= 0", [id_User_Data, id_Product]);
        console.log(result);
        if (!result) {return res.send({message: "чото не то"})}
        res.json(result);
        res.status(201).send("Успешно доавблен один товар");
    } catch (error) {
        console.log("корзина -1: ", error)
        res.status(500).send({error: "Ошибка сервера"})
    }
})

// функция для изменения имени
app.put("/account/name", async(req, res) => {
    try {
        const {name, id_User_Data} = req.body;
        const [result] = await connection.query("UPDATE User_Data SET name = ? WHERE id_User_Data = ?", [name, id_User_Data])
        if (!result) {return res.send({message: "чото не то"})}
        res.json({name: name});
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({error: "Ошибка сервера "})
    }
})

// функция для изменения почты
app.put("/account/email", async(req, res) => {
    try {
        const {email, id_User_Data} = req.body;
        
        if (!email || !id_User_Data) {
            return res.status(400).json({ error: "Не передана почта или ID" });
        }

        const [result] = await connection.query(
            "UPDATE User_Data SET email = ? WHERE id_User_Data = ?", 
            [email, id_User_Data]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        
        res.status(200).json({message: "Почта обновлена", email: email});
    } catch (error) {
        console.log("СЕРВЕР ОШИБКА EMAIL: ", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Эта почта уже привязана к другому аккаунту" });
        }
        
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// заказ
app.post("/order", async(req, res) => {
    try {
        const {id_User_Data, id_Product, quantity, total_price} = req.body;
        const [result] = await connection.query("INSERT INTO Orders (id_User_Data, id_Product, quantity, status, total_price) VALUES (?, ?, ?, 'Сортировка', ?)", [id_User_Data, id_Product, quantity, total_price])
        if (!result) {return res.send({message: "чото не то"})}

        res.status(201).json(result);
    } catch (error) {
        res.status(500).send({error: "Ошибка сервера "})
    }
})

app.get("/order/:userId", async(req, res) => {
    try {
        const id_User_Data = req.params.userId;
        const [result] = await connection.query(`
            SELECT 
                o.id_Order,
                o.quantity,
                o.status,
                o.total_price,
                p.name AS product_name,
                p.image_url,
                b.name AS brand_name
            FROM Orders o
            JOIN Products p ON o.id_Product = p.id_Product
            LEFT JOIN Brand b ON p.id_Brand = b.id_Brand
            WHERE o.id_User_Data = ?
            ORDER BY o.id_Order DESC
        `, [id_User_Data]);

        res.json(result);
    } catch (error) {
        console.log("Ошибка сервера (заказы): ", error);
        res.status(500).json({error: "Ошибка сервера"});
    }
})

app.delete("/cart/delete", async(req, res) => {
    try {
        const {id_User_Data, id_Product} = req.body;
        const [result] = await connection.query("DELETE FROM Cart WHERE id_User_Data = ? AND id_Product = ?", [id_User_Data, id_Product])
        if (!result) {return res.send({message: "чото не то"})}

        res.status(200).json({message: "Удалено"})
    } catch (error) {
        res.status(500).send({error: "Ошибка сервера "})
    }
})

// прослушивание порта
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Запуск сервера с порта ${PORT}`)
})