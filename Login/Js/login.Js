document.addEventListener('DOMContentLoaded', function () {

    // ======================================================
    // 0. HELPER DE ALERTAS BOOTSTRAP (UX Mejorada)
    // ======================================================
    function mostrarAlerta(mensaje, tipo = 'danger', duracion = 4000) {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        // Construir alerta dinamica de Bootstrap con icono
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${tipo} alert-dismissible fade show rounded-4 shadow-sm" role="alert">`,
            `   <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>`,
            `   <span>${mensaje}</span>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        // Limpiar alertas previas y colocar la nueva
        alertContainer.innerHTML = '';
        alertContainer.append(wrapper);

        // Auto-cerrar despues del tiempo configurado
        if (duracion > 0) {
            setTimeout(() => {
                const alertElement = wrapper.querySelector('.alert');
                if (alertElement && typeof bootstrap !== 'undefined') {
                    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
                    bsAlert.close();
                }
            }, duracion);
        }
    }

    // ======================================================
    // 1. Mostrar / Ocultar Contraseña
    // ======================================================
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword?.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        togglePassword.innerHTML = isPassword
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16"><path d="M13.359 11.238C14.04 10.505 14.7 9.606 15.173 8.751a.5.5 0 0 0 0-.5C14.772 7.284 13.727 5.56 11.83 4.179A9.678 9.678 0 0 0 8 3.5c-1.544 0-2.99.323-4.23.86L5.027 5.62A2.5 2.5 0 0 1 8 5.5c1.105 0 2.042.72 2.378 1.713l2.981 2.024z"/><path d="M13.646 14.354a.5.5 0 0 0 .708-.708l-12-12a.5.5 0 1 0-.708.708l12 12zM4.504 7.856a3.5 3.5 0 0 1 4.64 4.64l-.441-.299a2.5 2.5 0 0 0-3.294-3.294l-.905-.905z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z"/><path d="M8 5.5A2.5 2.5 0 1 1 5.5 8 2.5 2.5 0 0 1 8 5.5z"/></svg>';
    });

    // ======================================================
    // 2. Proceso de Login
    // ======================================================
    const loginButton = document.getElementById("btnIngresar");

    if (loginButton) {
        loginButton.addEventListener("click", async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");

            const emailVal = emailInput.value.trim();
            const passwordVal = passwordInput.value.trim();

            // Validación básica del lado del cliente usando la alerta de Bootstrap
            if (!emailVal || !passwordVal) {
                mostrarAlerta("Por favor, ingrese su correo electrónico y contraseña.", "warning");
                return;
            }

            const dataRequest = {
                Email: emailVal,
                PasswordHash: passwordVal
            };

            const urlApi = "https://localhost:44378/api/usuarios/login";

            try {
                loginButton.disabled = true;
                loginButton.textContent = "Ingresando...";

                const response = await fetch(urlApi, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataRequest)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Credenciales inválidas. Verifique sus datos.');
                }

                const usuarioLogueado = await response.json();

                if (usuarioLogueado && usuarioLogueado.UsuarioID > 0) {
                    // --- LOGIN EXITOSO ---
                    mostrarAlerta(`¡Bienvenido ${usuarioLogueado.Nombre}! Redirigiendo...`, "success", 2000);

                    // Almacenamiento en SessionStorage
                    sessionStorage.setItem('usuarioID', usuarioLogueado.UsuarioID);
                    sessionStorage.setItem('userId', usuarioLogueado.UsuarioID);

                    sessionStorage.setItem('nombreUsuario', `${usuarioLogueado.Nombre} ${usuarioLogueado.Apellido}`);
                    sessionStorage.setItem('userFullName', `${usuarioLogueado.Nombre} ${usuarioLogueado.Apellido}`);

                    sessionStorage.setItem('rolUsuario', usuarioLogueado.NombreRol);
                    sessionStorage.setItem('userRoleName', usuarioLogueado.NombreRol);

                    // Esperamos 1.2s para que el usuario pueda ver el mensaje de éxito antes del cambio de página
                    setTimeout(() => {
                        if (usuarioLogueado.NombreRol === "Administrador") {
                            window.location.href = "../../Administrativo/admi.html";
                        } else if (usuarioLogueado.NombreRol === "Vendedor") {
                            window.location.href = "../Ventas/inicio.html";
                        } else {
                            window.location.href = "../publico/index.html";
                        }
                    }, 1200);

                } else {
                    mostrarAlerta("Credenciales inválidas. Verifique su correo y contraseña.", "danger");
                }

            } catch (error) {
                console.error("Hubo un problema con la operación fetch:", error);
                mostrarAlerta(error.message || "Error de conexión con el servidor.", "danger");
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = "Ingresar";
            }
        });
    }
});