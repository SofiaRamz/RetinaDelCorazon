// script para todas las acciones dentro de la página

// CARGAR EL SCRIPT DE LA PÁGINA

document.addEventListener("DOMContentLoaded", () => {

    // SELECCIÓN DE ELEMENTOS DEL DOM

    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const registerDropdown = document.getElementById("registerDropdown");
    const loginDropdown = document.getElementById("loginDropdown");
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const registerMessage = document.getElementById("registerMessage");
    const loginMessage = document.getElementById("loginMessage");
    const logoutBtn = document.getElementById("logoutBtn");
    const uploadForm = document.getElementById("uploadForm");
    const gallery = document.getElementById("gallery");
    const sidebar = document.getElementById("sidebar");
    let selectedImage = null; // Variable para almacenar la imagen seleccionada

    // ALTERNAR VISIBILIDAD DE MENÚS DESPLEGABLES

    registerBtn?.addEventListener("click", () => {
        toggleDropdown(registerDropdown);
        loginDropdown.style.display = "none";
    });
    loginBtn?.addEventListener("click", () => {
        toggleDropdown(loginDropdown);
        registerDropdown.style.display = "none";
    });
    // Función de alternancia
    function toggleDropdown(dropdown) {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    }

    // REGISTRO DE USUARIOS

    registerForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        // Validación de datos
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const email = document.getElementById("email").value;
        // Verificación de usuario existentE
        if (username && password && email) {
            let users = JSON.parse(localStorage.getItem("users")) || [];
            const userExists = users.some(user => user.username === username);
            if (userExists) {
                registerMessage.textContent = "El usuario ya está registrado.";
                registerMessage.style.color = "red";
                return;
            }
            // Agregar el nuevo usuario
            users.push({ username, password, email });
            localStorage.setItem("users", JSON.stringify(users));

            registerMessage.textContent = "Registro exitoso.";
            registerMessage.style.color = "green";
            setTimeout(() => {
                window.location.href = "fotos.html";
            }, 2000);
        } else {
            registerMessage.textContent = "Todos los campos son obligatorios.";
            registerMessage.style.color = "red";
        }
    });

    // INICIO DE SESIÓN

    loginForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        let users = JSON.parse(localStorage.getItem("users")) || [];
        // Validación de usuario
        const userFound = users.find(user => user.username === username && user.password === password);
        // Autenticación correcta
        if (userFound) {
            localStorage.setItem("activeSession", JSON.stringify(userFound));
            loginMessage.textContent = "Inicio de sesión exitoso.";
            loginMessage.style.color = "green";
            setTimeout(() => {
                window.location.href = "fotos.html";
            }, 2000);
        } else {
            loginMessage.textContent = "Usuario o contraseña incorrectos.";
            loginMessage.style.color = "red";
        }
    });

    // CERRAR SESIÓN

    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("activeSession");
        window.location.href = "index.html";
    });

    // SUBIR FOTOS Y ALMACENARLAS EN LOCALSTORAGE

    uploadForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const fileInput = document.getElementById("imageUpload");
        const description = document.getElementById("description").value;
        const activeUser = JSON.parse(localStorage.getItem("activeSession"));
        if (fileInput.files.length > 0 && activeUser) {
            const reader = new FileReader();
            reader.onload = () => {
                // Guardar imagen
                const imgData = {
                    src: reader.result,
                    alt: description,
                    username: activeUser.username // Asociar imagen con usuario
                };
                let images = JSON.parse(localStorage.getItem("images")) || [];
                images.push(imgData);
                localStorage.setItem("images", JSON.stringify(images));
                displayImage(imgData);
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    });

    // CARGAR IMÁGENES ALMACENADAS

    function loadStoredImages() {
        const activeUser = JSON.parse(localStorage.getItem("activeSession"));
        if (!activeUser) return;
        let images = JSON.parse(localStorage.getItem("images")) || [];
        // Filtrar solo las imágenes del usuario activo
        const userImages = images.filter(img => img.username === activeUser.username);
        userImages.forEach(displayImage);
    }
    // Función para mostrar imagenes
    function displayImage(imgData) {
        const container = document.createElement("div");
        const img = document.createElement("img");
        const caption = document.createElement("p");
        img.src = imgData.src;
        img.alt = imgData.alt;
        caption.textContent = imgData.alt;
        img.addEventListener("click", () => {
            selectedImage = container;
            showImageControls(caption, container);
        });
        container.appendChild(img);
        container.appendChild(caption);
        gallery.appendChild(container);
    }

    // BOTONES PARA EDITAR/ELIMINAR

    function showImageControls(caption, container) {
        const controls = document.createElement("div");
        controls.id = "imageControls";
        // Editar descripción
        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar Descripción";
        editBtn.addEventListener("click", () => {
            const newDescription = prompt("Edita la descripción:", caption.textContent);
            if (newDescription !== null) {
                caption.textContent = newDescription; // Actualizar descripción
                
                let images = JSON.parse(localStorage.getItem("images")) || [];
                images = images.map(img => (img.src === container.querySelector("img").src ? { ...img, alt: newDescription } : img));
                localStorage.setItem("images", JSON.stringify(images));
            }
        });
        // Eliminar fotografía
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar Foto";
        deleteBtn.addEventListener("click", () => {
        const imgSrc = container.querySelector("img").src;
        const activeUser = JSON.parse(localStorage.getItem("activeSession"));
        if (!activeUser) return;
        gallery.removeChild(container);
        controls.remove();
        let images = JSON.parse(localStorage.getItem("images")) || [];
        // Eliminar solo la imagen del usuario activo
        images = images.filter(img => !(img.src === imgSrc && img.username === activeUser.username));
        localStorage.setItem("images", JSON.stringify(images));
    });
        // Limpiar controles previos si existen
        const existingControls = sidebar.querySelector("#imageControls");
        if (existingControls) {
            existingControls.remove();
        }
        // Agregar botones al contenedor de controles
        controls.appendChild(editBtn);
        controls.appendChild(deleteBtn);
        // Mostrar controles en la barra lateral
        sidebar.appendChild(controls);
    }
    loadStoredImages();

    // MOSTRAR VENTANA EMERGENTE

    document.getElementById("header-img").addEventListener("click", function() {
        document.getElementById("popup").style.display = "block";
        document.getElementById("popup-overlay").style.display = "block"; // Activa fondo oscuro
    });
    // Cerrar ventana emergente
    document.querySelector(".close-btn").addEventListener("click", function() {
        document.getElementById("popup").style.display = "none";
        document.getElementById("popup-overlay").style.display = "none"; // Oculta fondo
    });
});