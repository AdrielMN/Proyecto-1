document.addEventListener("DOMContentLoaded", function () {
    console.log("JS Cargado correctamente");

    let normativas = JSON.parse(localStorage.getItem("normativas")) || [
        { titulo: "Normativa 1", contenido: "<p>Esta es la información completa de la Normativa 1.</p>" },
        { titulo: "Normativa 2", contenido: "<p>Detalles importantes sobre la Normativa 2.</p>" },
        { titulo: "Normativa 3", contenido: "<p>Normativa 3 explicada en profundidad.</p>" }
    ];

    localStorage.setItem("normativas", JSON.stringify(normativas));

    // Elementos del DOM
    const normativasContainer = document.getElementById("normativas-container");
    const btnAgregarNormativa = document.getElementById("btn-agregar-normativa");
    const formNuevaNormativa = document.getElementById("form-agregar-normativa");
    const inputTitulo = document.getElementById("nueva-normativa-titulo");
    const inputContenido = document.getElementById("nueva-normativa-contenido");
    const configuracionBtn = document.getElementById("configuracion");
    const loginForm = document.getElementById("login-form");
    const loginDropdown = document.getElementById("loginDropdown");
    const dropdownMenu = document.getElementById("dropdown-menu");

    // Verificar sesión y activar modo admin
    function verificarSesion() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (isLoggedIn) {
            configuracionBtn.classList.remove("d-none");
            btnAgregarNormativa.classList.remove("d-none");
            loginDropdown.innerText = "Admin";
            dropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="#" id="configuracion">Configuración</a></li>
                <li><button id="logout-btn" class="dropdown-item text-danger">Cerrar Sesión</button></li>
            `;
            document.getElementById("logout-btn").addEventListener("click", function () {
                localStorage.removeItem("isLoggedIn");
                Swal.fire("Sesión cerrada", "Hasta la próxima", "info").then(() => location.reload());
            });
            document.getElementById("configuracion").addEventListener("click", cargarNormativasConfiguracion);
        } else {
            configuracionBtn.classList.add("d-none");
            btnAgregarNormativa.classList.add("d-none");
        }
    }

    // Cargar Normativas (Modo Normal)
    function cargarNormativas() {
        normativasContainer.innerHTML = '';

        normativas.forEach((normativa, index) => {
            const normativaHTML = `
                <div class="col-md-4">
                    <div class="card mb-3 normativa-card" data-index="${index}">
                        <div class="card-header text-center text-white bg-primary fw-bold">
                            ${normativa.titulo}
                        </div>
                        <div class="card-body text-center">
                            <button class="btn btn-info ver-normativa">Ver Normativa</button>
                        </div>
                    </div>
                </div>
            `;
            normativasContainer.innerHTML += normativaHTML;
        });

        document.querySelectorAll(".ver-normativa").forEach(button => {
            button.addEventListener("click", function () {
                const index = this.closest(".normativa-card").getAttribute("data-index");
                Swal.fire({
                    title: normativas[index].titulo,
                    html: normativas[index].contenido,
                    imageUrl: "https://placeholder.pics/svg/300x150",
                    imageHeight: 150,
                    imageAlt: "Normativa Detallada"
                });
            });
        });
    }

    // 🔹 Modo Configuración (Modo Admin)
    function cargarNormativasConfiguracion() {
        normativasContainer.innerHTML = '';

        normativas.forEach((normativa, index) => {
            const normativaHTML = `
                <div class="col-md-4">
                    <div class="card mb-3 normativa-card" data-index="${index}">
                        <div class="card-header text-center text-white bg-primary fw-bold">
                            ${normativa.titulo}
                        </div>
                        <div class="card-body text-center">
                            <button class="btn btn-warning edit-btn" data-index="${index}">Editar</button>
                            <button class="btn btn-danger delete-btn" data-index="${index}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            normativasContainer.innerHTML += normativaHTML;
        });

        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", function () {
                openEditModal(this.getAttribute("data-index"));
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                Swal.fire({
                    title: "¿Eliminar esta normativa?",
                    text: "No podrás revertir esta acción.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        normativas.splice(index, 1);
                        localStorage.setItem("normativas", JSON.stringify(normativas));
                        cargarNormativasConfiguracion();
                        cargarNormativas();
                        Swal.fire("Eliminado", "La normativa ha sido eliminada.", "success");
                    }
                });
            });
        });
    }

// Editar Normativa
function openEditModal(index) {
    Swal.fire({
        title: "Editar Normativa",
        html: `
            <input type="text" id="edit-titulo" class="swal2-input" value="${normativas[index].titulo}">
            <textarea id="edit-contenido" class="swal2-textarea">${normativas[index].contenido}</textarea>
        `,
        showCancelButton: true,
        confirmButtonText: "Guardar Cambios",
        didOpen: () => {
            document.getElementById("edit-titulo").focus();
        },
        preConfirm: () => {
            const popup = Swal.getPopup(); // Obtener el modal correctamente
            const nuevoTitulo = popup.querySelector("#edit-titulo").value.trim();
            const nuevoContenido = popup.querySelector("#edit-contenido").value.trim();

            if (!nuevoTitulo || !nuevoContenido) {
                Swal.showValidationMessage("Todos los campos son obligatorios");
                return false; // No permite continuar si hay campos vacíos
            }

            return { titulo: nuevoTitulo, contenido: nuevoContenido };
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            //Guardar cambios en la normativa
            normativas[index].titulo = result.value.titulo;
            normativas[index].contenido = result.value.contenido;

            //Guardar en localStorage
            localStorage.setItem("normativas", JSON.stringify(normativas));

            // Recargar la lista de normativas
            cargarNormativasConfiguracion();
            cargarNormativas();

            // Mostrar confirmación
            Swal.fire("Actualizado", "Normativa actualizada correctamente", "success");
        }
    });
}




    // Guardar Nueva Normativa
    formNuevaNormativa.addEventListener("submit", function (event) {
        event.preventDefault();

        const titulo = inputTitulo.value.trim();
        const contenido = inputContenido.value.trim();

        if (!titulo || !contenido) {
            Swal.fire("Error", "Todos los campos son obligatorios", "error");
            return;
        }

        normativas.push({ titulo, contenido });
        localStorage.setItem("normativas", JSON.stringify(normativas));

        Swal.fire("Guardado", "Nueva normativa agregada con éxito!", "success");
        formNuevaNormativa.reset();
        formNuevaNormativa.classList.add("d-none");
        btnAgregarNormativa.textContent = "Agregar Nueva Normativa";
        cargarNormativasConfiguracion();
        cargarNormativas();
    });

    btnAgregarNormativa.addEventListener("click", function () {
        formNuevaNormativa.classList.toggle("d-none");
        btnAgregarNormativa.textContent = formNuevaNormativa.classList.contains("d-none") ? "Agregar Nueva Normativa" : "Cancelar";
    });

    // Manejo del Login
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            if (username === "admin" && password === "1234") {
                localStorage.setItem("isLoggedIn", "true");
                Swal.fire("Inicio de sesión exitoso", "Bienvenido administrador", "success").then(() => {
                    verificarSesion();
                    cargarNormativas();
                });
            } else {
                Swal.fire("Error", "Usuario o contraseña incorrectos", "error");
            }
        });
    }

    verificarSesion();
    cargarNormativas();
});












