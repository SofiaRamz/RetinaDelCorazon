//Servidor corriendo en node 

// IMPORTACIÓN DE MÓDULOS

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

// CREACIÓN DE APLICACIÓN Y CONFIGURACIÓN DEL PUERTO

const app = express();
const PORT = 3000;

// CONFIGURACIÓN DE ALMACENAMIENTO DE IMÁGENES

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// MIDDLEWARE PARA ALMACENAR ARCHIVOS

const upload = multer({ storage });

// MIDDLEWARE DE EXPRESS

app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

// RUTA PARA REGISTRAR USUARIOS

app.post("/register", (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const userData = { username, password, email };
    fs.writeFileSync("user.json", JSON.stringify(userData, null, 2));
    res.json({ message: "Registro exitoso." });
});

// RUTA PARA INICIAR SESIÓN

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const storedUser = JSON.parse(fs.readFileSync("user.json", "utf-8"));
    if (storedUser && username === storedUser.username && password === storedUser.password) {
        res.json({ message: "Inicio de sesión exitoso." });
    } else {
        res.status(401).json({ message: "Usuario o contraseña incorrectos." });
    }
});

// RUTA SUBIR IMÉGENES

app.post("/upload", upload.single("image"), (req, res) => {
    const description = req.body.description;
    const imageData = {
        src: `/${req.file.filename}`,
        alt: description,
    };
    let images = [];
    if (fs.existsSync("images.json")) {
        images = JSON.parse(fs.readFileSync("images.json", "utf-8"));
    }
    images.push(imageData);
    fs.writeFileSync("images.json", JSON.stringify(images, null, 2));
    res.json(imageData);
});

// RUTA PARA OBTENER IMÁGENES ALMACENADAS

app.get("/images", (req, res) => {
    if (fs.existsSync("images.json")) {
        const images = JSON.parse(fs.readFileSync("images.json", "utf-8"));
        res.json(images);
    } else {
        res.json([]);
    }
});

// INICIAR EL SERVIDOR

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});