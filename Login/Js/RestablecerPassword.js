document.addEventListener("DOMContentLoaded", () => {
    // 1. VALIDACIÓN DE SEGURIDAD Y ACCESO
    const recoveryUserId = sessionStorage.getItem("recoveryUserId");

    // Si el usuario no paso por la validacion de correo y cedula, no debe estar aqui
    if (!recoveryUserId) {
        window.location.href = "login.html";
        return;
    }

    const formReset = document.getElementById("formCambiarPassword");
    const txtNewPassword = document.getElementById("NuevoPassword");
    const txtConfirmPassword = document.getElementById("confirmarPassword");
    const btnSubmit = document.getElementById("btnSubmit");
    const alertContainer = document.getElementById("alertContainer");

    // 2. TOGGLE PARA MOSTRAR/OCULTAR CONTRASEÑA
    setupPasswordToggle("toggleNuevaPassword", "NuevoPassword");
    setupPasswordToggle("toggleConfirmarPassword", "confirmarPassword");

    // 3. EVENTO SUBMIT DEL FORMULARIO
    if (formReset) {
        formReset.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newPassword = txtNewPassword.value.trim();
            const confirmPassword = txtConfirmPassword.value.trim();

            // Validaciones básicas de cliente
            if (newPassword.length < 6) {
                mostrarAlerta("La contraseña debe tener al menos 6 caracteres.", "warning");
                return;
            }

            if (newPassword !== confirmPassword) {
                mostrarAlerta("Las contraseñas no coinciden. Verifícalas e intenta de nuevo.", "danger");
                return;
            }

            // Cambiar estado del botón a "Cargando"
            setLoadingState(true);

            // Estructura del DTO esperada por la API
            const requestPayload = {
                UsuarioID: parseInt(recoveryUserId, 10),
                NuevoPasswordHash: newPassword
            };

            try {
                // Petición al controlador de C#
                const response = await fetch("https://localhost:44378/api/usuarios/CambiarPassword", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestPayload)
                });

                const data = await response.json();

                if (response.ok) {
                    mostrarAlerta(data.mensaje || "Contraseña actualizada con éxito. Redirigiendo...", "success");

                    // Limpiar datos de recuperacion del navegador
                    sessionStorage.removeItem("recoveryUserId");
                    sessionStorage.removeItem("recoveryUserName");

                    // Redirigir al Login
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    mostrarAlerta(data.Message || data.mensaje || "No se pudo actualizar la contraseña.", "danger");
                    setLoadingState(false);
                }
            } catch (error) {
                console.error("Error al restablecer contraseña:", error);
                mostrarAlerta("Error de conexión con el servidor.", "danger");
                setLoadingState(false);
            }
        });
    }

    // --- FUNCIONES AUXILIARES ---

    function mostrarAlerta(mensaje, tipo) {
        if (!alertContainer) return;
        alertContainer.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    function setLoadingState(isLoading) {
        if (!btnSubmit) return;
        if (isLoading) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Guardando...`;
        } else {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `Guardar Contraseña <i class="bi bi-check-circle ms-1"></i>`;
        }
    }

    function setupPasswordToggle(buttonId, inputId) {
        const btn = document.getElementById(buttonId);
        const input = document.getElementById(inputId);

        if (btn && input) {
            btn.addEventListener("click", () => {
                const isPassword = input.getAttribute("type") === "password";
                input.setAttribute("type", isPassword ? "text" : "password");
                
                const icon = btn.querySelector("i");
                if (icon) {
                    icon.classList.toggle("bi-eye-fill", !isPassword);
                    icon.classList.toggle("bi-eye-slash-fill", isPassword);
                }
            });
        }
    }
});